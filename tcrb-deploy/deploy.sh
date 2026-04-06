#!/bin/bash
# TCRB Deploy Script — Adds "Join the Lab" to the live site
# Run from inside your tcrb-site repo directory:
#   cd ~/tcrb-site && bash ~/Downloads/tcrb-deploy/deploy.sh

set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_DIR="$(pwd)"

echo "═══ TCRB DEPLOY: Join the Lab ═══"
echo "Site directory: $SITE_DIR"
echo ""

# 1. Copy new files
echo "[1/3] Copying new files..."
cp "$SCRIPT_DIR/join-the-lab.html" "$SITE_DIR/"
cp "$SCRIPT_DIR/TCRB_Black_Shirt.png" "$SITE_DIR/"
cp "$SCRIPT_DIR/TCRB_Grey_Shirt.png" "$SITE_DIR/"
cp "$SCRIPT_DIR/TCRB_Tan_Shirt.png" "$SITE_DIR/"
cp "$SCRIPT_DIR/TCRB_White_Shirt.png" "$SITE_DIR/"
echo "  ✅ join-the-lab.html"
echo "  ✅ 4 shirt images"

# 2. Patch nav links on all existing pages
echo ""
echo "[2/3] Adding 'Join the Lab' nav link to all pages..."

# For pages with <a href="contact.html">Access</a> in nav
for f in index.html about.html reports.html insights.html; do
  if [ -f "$SITE_DIR/$f" ]; then
    if grep -q 'join-the-lab.html' "$SITE_DIR/$f"; then
      echo "  ⏭  $f (already patched)"
    elif grep -q '<li><a href="contact.html">Access</a></li>' "$SITE_DIR/$f"; then
      sed -i.bak 's|<li><a href="contact.html">Access</a></li>|<li><a href="join-the-lab.html">Join the Lab</a></li>\n    <li><a href="contact.html">Access</a></li>|' "$SITE_DIR/$f"
      rm -f "$SITE_DIR/$f.bak"
      echo "  ✅ $f"
    else
      echo "  ⚠️  $f (nav pattern not found, skipped)"
    fi
  fi
done

# contact.html — doesn't have Access in its own nav, add before </ul>
if [ -f "$SITE_DIR/contact.html" ]; then
  if grep -q 'join-the-lab.html' "$SITE_DIR/contact.html"; then
    echo "  ⏭  contact.html (already patched)"
  else
    sed -i.bak 's|</ul></nav>|<li><a href="join-the-lab.html">Join the Lab</a></li></ul></nav>|' "$SITE_DIR/contact.html"
    rm -f "$SITE_DIR/contact.html.bak"
    echo "  ✅ contact.html"
  fi
fi

# report.html — has #access link
if [ -f "$SITE_DIR/report.html" ]; then
  if grep -q 'join-the-lab.html' "$SITE_DIR/report.html"; then
    echo "  ⏭  report.html (already patched)"
  elif grep -q '<li><a href="index.html#access">Access</a></li>' "$SITE_DIR/report.html"; then
    sed -i.bak 's|<li><a href="index.html#access">Access</a></li>|<li><a href="join-the-lab.html">Join the Lab</a></li>\n    <li><a href="index.html#access">Access</a></li>|' "$SITE_DIR/report.html"
    rm -f "$SITE_DIR/report.html.bak"
    echo "  ✅ report.html"
  else
    echo "  ⚠️  report.html (nav pattern not found, skipped)"
  fi
fi

# 3. Git commit and push
echo ""
echo "[3/3] Deploying to GitHub..."
git add -A
git commit -m "Add Join the Lab page with merch vote, QR code, and shirt gallery

- join-the-lab.html: Community Data Lab merch vote page
- 4 shirt design images (Black, Tan, White, Grey)
- QR code linking to Google Forms vote
- Nav updated across all pages
- Voting open through June 7, 2026

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"

git push origin main

echo ""
echo "═══ DEPLOY COMPLETE ═══"
echo "Vercel will auto-deploy. Page will be live at:"
echo "  https://thevineyardfoundation.com/join-the-lab.html"
echo ""
