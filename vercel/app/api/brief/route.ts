import { type NextRequest, NextResponse } from "next/server"

// Rate limiting with in-memory store (simple, for low-traffic)
const rateLimit = new Map<string, { count: number; timestamp: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 3 // 3 requests per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = rateLimit.get(ip)

  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimit.set(ip, { count: 1, timestamp: now })
    return true
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false
  }

  record.count++
  return true
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, record] of rateLimit.entries()) {
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimit.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

interface BriefRequest {
  name: string
  email: string
  organization?: string
  context: string
  constraints?: string
  goal: string
  timeline?: string
  honeypot?: string // Should be empty
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitize(str: string): string {
  return str.replace(/[<>]/g, "").trim().slice(0, 2000)
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "unknown"

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ ok: false, error: "Too many requests. Please try again later." }, { status: 429 })
    }

    // Parse body
    const body: BriefRequest = await request.json()

    // Honeypot check - if filled, silently accept but don't process
    if (body.honeypot) {
      // Return success to not tip off bots
      return NextResponse.json({ ok: true })
    }

    // Validate required fields
    if (!body.name?.trim()) {
      return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 })
    }

    if (!body.email?.trim() || !validateEmail(body.email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 })
    }

    if (!body.context?.trim()) {
      return NextResponse.json({ ok: false, error: "Context is required" }, { status: 400 })
    }

    if (!body.goal?.trim()) {
      return NextResponse.json({ ok: false, error: "Goal is required" }, { status: 400 })
    }

    // Sanitize all inputs
    const sanitizedData = {
      name: sanitize(body.name),
      email: sanitize(body.email),
      organization: body.organization ? sanitize(body.organization) : "",
      context: sanitize(body.context),
      constraints: body.constraints ? sanitize(body.constraints) : "",
      goal: sanitize(body.goal),
      timeline: body.timeline ? sanitize(body.timeline) : "",
    }

    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey) {
      // Send email via Resend
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Bluehand <briefs@bluehand.solutions>",
          to: ["hello@bluehand.solutions"],
          reply_to: sanitizedData.email,
          subject: `Sovereignty Audit Request - ${sanitizedData.organization || sanitizedData.name}`,
          text: `
New Sovereignty Audit Request

Name: ${sanitizedData.name}
Email: ${sanitizedData.email}
Organization: ${sanitizedData.organization || "Not specified"}

Context:
${sanitizedData.context}

Constraints:
${sanitizedData.constraints || "None specified"}

Goal:
${sanitizedData.goal}

Timeline:
${sanitizedData.timeline || "Not specified"}

---
Submitted from bluehand.solutions
IP: ${ip}
          `.trim(),
        }),
      })

      if (!emailResponse.ok) {
        console.error("[v0] Resend error:", await emailResponse.text())
        return NextResponse.json(
          { ok: false, error: "Failed to send. Please email us directly at hello@bluehand.solutions" },
          { status: 500 },
        )
      }

      return NextResponse.json({ ok: true })
    } else {
      // No Resend configured - log for now (in production, you'd want an alternative)
      console.log("[v0] Brief submission (no email provider configured):", sanitizedData)

      // Return success but indicate fallback needed
      return NextResponse.json({
        ok: true,
        fallback: true,
        message: "Received. Email provider not configured - please also email hello@bluehand.solutions",
      })
    }
  } catch (error) {
    console.error("[v0] Brief API error:", error)
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please email us directly at hello@bluehand.solutions" },
      { status: 500 },
    )
  }
}

// Reject other methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 })
}
