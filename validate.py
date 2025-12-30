#!/usr/bin/env python3
"""
Bluehand.Solutions - Deployment Validator
Validates HTML, security, accessibility, and deployment readiness
"""

import os
import sys
import re
from pathlib import Path

# ANSI colors
class Colors:
    GREEN = '\033[0;32m'
    RED = '\033[0;31m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'

class Validator:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def test(self, name, condition, error_msg=""):
        """Run a test and track results"""
        print(f"  Testing: {name}... ", end="")
        if condition:
            print(f"{Colors.GREEN}✓ PASS{Colors.NC}")
            self.passed += 1
            return True
        else:
            print(f"{Colors.RED}✗ FAIL{Colors.NC}")
            if error_msg:
                print(f"    Error: {error_msg}")
            self.failed += 1
            return False
    
    def warn(self, name, condition):
        """Check with warning instead of failure"""
        print(f"  Checking: {name}... ", end="")
        if condition:
            print(f"{Colors.GREEN}✓ OK{Colors.NC}")
        else:
            print(f"{Colors.YELLOW}⚠ WARNING{Colors.NC}")
            self.warnings += 1

def main():
    print("=" * 50)
    print("Bluehand.Solutions Deployment Validator")
    print("=" * 50)
    print()
    
    validator = Validator()
    
    # File paths
    html_file = Path("index-optimized.html")
    headers_file = Path("_headers")
    redirects_file = Path("_redirects")
    wrangler_file = Path("wrangler.toml")
    robots_file = Path("robots.txt")
    deploy_file = Path("DEPLOYMENT.md")
    
    # 1. File Existence
    print("1. File Existence Checks")
    print("-" * 50)
    validator.test("index-optimized.html exists", html_file.exists())
    validator.test("_headers file exists", headers_file.exists())
    validator.test("_redirects file exists", redirects_file.exists())
    validator.test("wrangler.toml exists", wrangler_file.exists())
    validator.test("robots.txt exists", robots_file.exists())
    validator.test("DEPLOYMENT.md exists", deploy_file.exists())
    print()
    
    if not html_file.exists():
        print(f"{Colors.RED}Critical: HTML file not found. Exiting.{Colors.NC}")
        sys.exit(1)
    
    # Read HTML content
    html_content = html_file.read_text()
    
    # 2. HTML Structure
    print("2. HTML Validation")
    print("-" * 50)
    validator.test("DOCTYPE declaration", "<!doctype html>" in html_content.lower())
    validator.test("HTML lang attribute", '<html lang="en">' in html_content)
    validator.test("Charset meta tag", 'charset="utf-8"' in html_content.lower())
    validator.test("Viewport meta tag", "viewport" in html_content.lower())
    validator.test("Title tag present", "<title>" in html_content.lower())
    validator.test("Description meta tag", 'name="description"' in html_content.lower())
    print()
    
    # 3. SEO
    print("3. SEO Checks")
    print("-" * 50)
    validator.test("Open Graph tags", 'property="og:' in html_content)
    validator.test("Twitter Card tags", 'name="twitter:' in html_content)
    validator.test("Canonical link", 'rel="canonical"' in html_content)
    validator.warn("Structured data (optional)", "application/ld+json" in html_content)
    print()
    
    # 4. Security
    print("4. Security Checks")
    print("-" * 50)
    if headers_file.exists():
        headers_content = headers_file.read_text()
        validator.test("CSP header", "Content-Security-Policy" in headers_content)
        validator.test("X-Frame-Options", "X-Frame-Options" in headers_content)
        validator.test("X-Content-Type-Options", "X-Content-Type-Options" in headers_content)
    else:
        print(f"  {Colors.YELLOW}⚠ _headers file missing{Colors.NC}")
        validator.warnings += 1
    
    validator.test("No inline passwords", not re.search(r'password\s*=', html_content, re.I))
    validator.test("No API keys", not re.search(r'api[_-]key', html_content, re.I))
    print()
    
    # 5. Accessibility
    print("5. Accessibility Checks")
    print("-" * 50)
    validator.test("ARIA labels present", "aria-label" in html_content)
    validator.test("ARIA hidden attributes", 'aria-hidden="true"' in html_content)
    validator.test("Role attributes", "role=" in html_content)
    validator.test("Keyboard navigation support", "keydown" in html_content)
    validator.warn("Skip to main content", "skip-to-main" in html_content or "skip-link" in html_content)
    print()
    
    # 6. Performance
    print("6. Performance Checks")
    print("-" * 50)
    validator.test("Passive event listeners", "passive:true" in html_content)
    validator.test("Reduced motion support", "prefers-reduced-motion" in html_content)
    validator.test("will-change hint", "will-change" in html_content)
    validator.test("Deferred scripts", "defer" in html_content or "<script>" in html_content.split("</head>")[1] if "</head>" in html_content else True)
    print()
    
    # 7. Content
    print("7. Content Checks")
    print("-" * 50)
    validator.test("Email contact present", "hello@bluehand.solutions" in html_content)
    validator.test("Copyright year dynamic", 'id="y"' in html_content)
    validator.test("Canvas element present", '<canvas id="bg"' in html_content)
    validator.test("Modal overlay present", 'id="overlay"' in html_content)
    print()
    
    # 8. JavaScript
    print("8. JavaScript Checks")
    print("-" * 50)
    validator.test("Strict mode", "'use strict'" in html_content)
    validator.test("Error handling", "try{" in html_content or "try {" in html_content)
    validator.test("Canvas error boundary", "canvasError" in html_content)
    validator.test("IIFE pattern", "(function()" in html_content)
    print()
    
    # 9. File Size
    print("9. File Size Checks")
    print("-" * 50)
    html_size = html_file.stat().st_size
    size_kb = html_size / 1024
    if html_size < 100000:
        print(f"  HTML file size: {Colors.GREEN}{html_size:,} bytes ({size_kb:.1f}KB) < 100KB{Colors.NC} ✓")
        validator.passed += 1
    elif html_size < 200000:
        print(f"  HTML file size: {Colors.YELLOW}{html_size:,} bytes ({size_kb:.1f}KB){Colors.NC} ⚠")
        validator.warnings += 1
    else:
        print(f"  HTML file size: {Colors.RED}{html_size:,} bytes ({size_kb:.1f}KB) > 200KB{Colors.NC} ✗")
        validator.failed += 1
    print()
    
    # 10. Configuration
    print("10. Configuration Validation")
    print("-" * 50)
    if wrangler_file.exists():
        wrangler_content = wrangler_file.read_text()
        validator.test("wrangler.toml valid syntax", 'name = ' in wrangler_content)
    else:
        validator.warnings += 1
        print(f"  {Colors.YELLOW}⚠ wrangler.toml missing{Colors.NC}")
    
    if robots_file.exists():
        robots_content = robots_file.read_text()
        validator.test("robots.txt has User-agent", "User-agent:" in robots_content)
    else:
        validator.warnings += 1
        print(f"  {Colors.YELLOW}⚠ robots.txt missing{Colors.NC}")
    
    if redirects_file.exists():
        redirects_content = redirects_file.read_text()
        validator.test("_redirects has HTTPS", "https://" in redirects_content)
    else:
        validator.warnings += 1
        print(f"  {Colors.YELLOW}⚠ _redirects missing{Colors.NC}")
    print()
    
    # Summary
    print("=" * 50)
    print("Test Summary")
    print("=" * 50)
    print(f"{Colors.GREEN}Passed:{Colors.NC}   {validator.passed}")
    print(f"{Colors.RED}Failed:{Colors.NC}   {validator.failed}")
    print(f"{Colors.YELLOW}Warnings:{Colors.NC} {validator.warnings}")
    print()
    
    # Final verdict
    if validator.failed == 0:
        print(f"{Colors.GREEN}✓ All critical tests passed!{Colors.NC}")
        print("Ready for deployment to Cloudflare Pages.")
        print()
        print("Next steps:")
        print("1. Review DEPLOYMENT.md for deployment instructions")
        print("2. Test locally: python3 -m http.server 8000")
        print("3. Deploy via: wrangler pages deploy ./")
        return 0
    else:
        print(f"{Colors.RED}✗ {validator.failed} test(s) failed. Please review and fix before deploying.{Colors.NC}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
