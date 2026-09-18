# 🤖 Tailwind Workspace Styles

Tailwind is configured at the workspace root through `.postcssrc.json`, so any app
that runs PostCSS from this repo can use Tailwind v4.

For CSS-based app entrypoints, import the shared stylesheet:

```css
@import '../../styles/tailwind.css';
```

Adjust the relative path from the app stylesheet to `styles/tailwind.css`.

For Angular apps that use SCSS, add the shared Tailwind CSS file to the app's
global `styles` array before the app stylesheet:

```json
{
  "styles": ["styles/tailwind.css", "apps/my-app/src/styles.scss"]
}
```

Do not import `tailwindcss` directly from an SCSS file. Sass can resolve the
package import as `tailwind.css`, which breaks the Angular Sass pipeline.
