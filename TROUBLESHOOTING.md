# CSS Theme Troubleshooting

## Issue: Styles not showing up

If you're seeing no styles at all, follow these steps:

### 1. Restart the Development Server
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Clear Browser Cache
- Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows/Linux)
- Or use an incognito/private window

### 3. Verify CSS File is Loading
1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Look for `globals.css` - it should load with status 200

### 4. Check for Console Errors
- Open browser DevTools Console
- Look for any CSS or build errors

### 5. Verify PostCSS is Processing
The CSS uses Tailwind v4 syntax. Make sure:
- `@tailwindcss/postcss` is installed
- `postcss.config.mjs` is configured correctly
- The CSS file starts with `@import "tailwindcss";`

### 6. Force Rebuild
```bash
# Delete .next folder and rebuild
rm -rf .next
npm run dev
```

## What Should Be Visible

After fixing, you should see:
- ✅ Light gray/beige gradient background
- ✅ Blue gradient header (#0078D4 to #005A9E)
- ✅ White cards with shadows
- ✅ Microsoft Segoe UI font
- ✅ Proper spacing and colors throughout

## If Still Not Working

Check that:
1. `src/app/globals.css` exists and contains the styles
2. `src/app/layout.tsx` imports `./globals.css`
3. No syntax errors in the CSS file
4. Tailwind CSS v4 is properly installed

