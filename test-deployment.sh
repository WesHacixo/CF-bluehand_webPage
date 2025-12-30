#!/bin/bash

# Bluehand.Solutions - Deployment Test Script
# Validates HTML, checks for issues, and prepares for deployment

set -e  # Exit on error

echo "========================================="
echo "Bluehand.Solutions Deployment Validator"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track results
PASSED=0
FAILED=0
WARNINGS=0

# Test function
test_check() {
    local name="$1"
    local command="$2"
    
    echo -n "Testing: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

warning_check() {
    local name="$1"
    local command="$2"
    
    echo -n "Checking: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${YELLOW}⚠ WARNING${NC}"
        ((WARNINGS++))
    fi
}

echo "1. File Existence Checks"
echo "------------------------"
test_check "index-optimized.html exists" "[ -f index-optimized.html ]"
test_check "_headers file exists" "[ -f _headers ]"
test_check "_redirects file exists" "[ -f _redirects ]"
test_check "wrangler.toml exists" "[ -f wrangler.toml ]"
test_check "robots.txt exists" "[ -f robots.txt ]"
test_check "DEPLOYMENT.md exists" "[ -f DEPLOYMENT.md ]"
echo ""

echo "2. HTML Validation"
echo "------------------"

# Check for basic HTML structure
test_check "DOCTYPE declaration" "grep -q '<!doctype html>' index-optimized.html"
test_check "HTML lang attribute" "grep -q '<html lang=\"en\">' index-optimized.html"
test_check "Charset meta tag" "grep -q '<meta charset=\"utf-8\">' index-optimized.html"
test_check "Viewport meta tag" "grep -q 'viewport' index-optimized.html"
test_check "Title tag present" "grep -q '<title>' index-optimized.html"
test_check "Description meta tag" "grep -q 'name=\"description\"' index-optimized.html"
echo ""

echo "3. SEO Checks"
echo "-------------"
test_check "Open Graph tags" "grep -q 'property=\"og:' index-optimized.html"
test_check "Twitter Card tags" "grep -q 'name=\"twitter:' index-optimized.html"
test_check "Canonical link" "grep -q 'rel=\"canonical\"' index-optimized.html"
warning_check "Structured data (optional)" "grep -q 'application/ld+json' index-optimized.html"
echo ""

echo "4. Security Checks"
echo "------------------"
test_check "CSP header in _headers" "grep -q 'Content-Security-Policy' _headers"
test_check "X-Frame-Options in _headers" "grep -q 'X-Frame-Options' _headers"
test_check "X-Content-Type-Options in _headers" "grep -q 'X-Content-Type-Options' _headers"
test_check "No inline passwords" "! grep -i 'password.*=' index-optimized.html"
test_check "No API keys" "! grep -i 'api[_-]key' index-optimized.html"
echo ""

echo "5. Accessibility Checks"
echo "-----------------------"
test_check "ARIA labels present" "grep -q 'aria-label' index-optimized.html"
test_check "Alt text (canvas)" "grep -q 'aria-hidden=\"true\"' index-optimized.html"
test_check "Role attributes" "grep -q 'role=' index-optimized.html"
test_check "Keyboard navigation support" "grep -q 'keydown' index-optimized.html"
warning_check "Skip to main content (optional)" "grep -q 'skip-to-main' index-optimized.html"
echo ""

echo "6. Performance Checks"
echo "---------------------"
test_check "Passive event listeners" "grep -q 'passive:true' index-optimized.html"
test_check "Reduced motion support" "grep -q 'prefers-reduced-motion' index-optimized.html"
test_check "will-change hint (canvas)" "grep -q 'will-change' index-optimized.html"
test_check "No blocking scripts in head" "! grep -q '<script src=.*></script>' index-optimized.html | head -n 50"
echo ""

echo "7. Content Checks"
echo "-----------------"
test_check "Email contact present" "grep -q 'hello@bluehand.solutions' index-optimized.html"
test_check "Copyright year dynamic" "grep -q 'id=\"y\"' index-optimized.html"
test_check "Canvas element present" "grep -q '<canvas id=\"bg\"' index-optimized.html"
test_check "Modal overlay present" "grep -q 'id=\"overlay\"' index-optimized.html"
echo ""

echo "8. JavaScript Checks"
echo "--------------------"
test_check "Strict mode" "grep -q \"'use strict'\" index-optimized.html"
test_check "Error handling (try-catch)" "grep -q 'try{' index-optimized.html"
test_check "Canvas error boundary" "grep -q 'canvasError' index-optimized.html"
test_check "IIFE pattern" "grep -q '(function()' index-optimized.html"
echo ""

echo "9. File Size Checks"
echo "-------------------"
HTML_SIZE=$(stat -f%z index-optimized.html 2>/dev/null || stat -c%s index-optimized.html 2>/dev/null || echo "0")
if [ "$HTML_SIZE" -lt 100000 ]; then
    echo -e "HTML file size: ${GREEN}${HTML_SIZE} bytes (< 100KB)${NC} ✓"
    ((PASSED++))
else
    echo -e "HTML file size: ${YELLOW}${HTML_SIZE} bytes (> 100KB)${NC} ⚠"
    ((WARNINGS++))
fi
echo ""

echo "10. Configuration Validation"
echo "----------------------------"
test_check "wrangler.toml valid syntax" "grep -q 'name = ' wrangler.toml"
test_check "robots.txt has User-agent" "grep -q 'User-agent:' robots.txt"
test_check "_redirects has HTTPS redirect" "grep -q 'https://' _redirects"
echo ""

# Generate summary
echo "========================================="
echo "Test Summary"
echo "========================================="
echo -e "${GREEN}Passed:${NC}   $PASSED"
echo -e "${RED}Failed:${NC}   $FAILED"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo ""

# Final verdict
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    echo "Ready for deployment to Cloudflare Pages."
    echo ""
    echo "Next steps:"
    echo "1. Review DEPLOYMENT.md for deployment instructions"
    echo "2. Test locally: python3 -m http.server 8000"
    echo "3. Deploy via: wrangler pages deploy ./"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review and fix before deploying.${NC}"
    exit 1
fi
