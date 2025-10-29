# Troubleshooting Guide

## Issue: Tailwind CSS PostCSS Error

If you see this error:
```
Error: It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin...
```

### Solution: Clear All Caches

Run these commands on your Mac:

```bash
cd /Users/mac/Desktop/workStuff/vide-code-exchange-app/client

# 1. Stop the dev server (Ctrl+C)

# 2. Remove Next.js cache
rm -rf .next

# 3. Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# 4. Verify Tailwind version (should be 3.x)
npm list tailwindcss

# 5. Start dev server
npm run dev
```

If the issue persists, try:

```bash
# Clear npm cache
npm cache clean --force

# Reinstall everything
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

## Alternative: Disable Turbopack

If caching issues continue, you can disable Turbopack temporarily:

Edit `client/package.json` and change:
```json
"dev": "next dev"
```

Instead of using Turbopack (which may have aggressive caching).

## Verify Installation

Run this to check your setup:
```bash
cd client
npm list tailwindcss postcss autoprefixer
```

Should show:
- tailwindcss@3.4.x
- postcss@8.x
- autoprefixer@10.x
