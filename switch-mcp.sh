#!/bin/bash

case "$1" in
  "minimal"|"min"|"")
    echo "Switching to minimal MCP configuration (no Playwright)..."
    cp .mcp-minimal.json .mcp.json
    echo "✓ Using minimal config - reduced token usage"
    ;;
  "full"|"playwright"|"browser")
    echo "Switching to full MCP configuration (with Playwright)..."
    cp .mcp-with-playwright.json .mcp.json
    echo "✓ Using full config - includes browser automation"
    ;;
  *)
    echo "Usage: ./switch-mcp.sh [minimal|full]"
    echo "  minimal: Archon + Firecrawl + Gemini + Figma (low tokens)"
    echo "  full:    All tools + Playwright (high tokens)"
    ;;
esac