# Site Stack Setup

This document defines the technical stack and integration pattern for building a site with the same toolset used here. It intentionally does not define colors, visual style, layout design, typography choices, spacing, or CSS theme rules.

## Core Model

- Static HTML pages served as files.
- Shared site shell loaded on every page.
- CSS files linked per site section or feature.
- JavaScript loaded as plain browser scripts or ES modules.
- No required bundler.
- No required framework.
- No required server runtime.
- Vercel-compatible static deployment.
- Clean URL support through Vercel routing or file/folder structure.

## Hosting

- Vercel static hosting.
- GitHub main branch as deploy source.
- Root-relative asset paths.
- Static files can live in folders such as:
  - `/sitefable/`
  - `/sitefable/work/`
  - `/assets/`
  - `/foliotest/assets/`
  - `/navtest/`
  - `/funneltest/`

## Required Browser Platform

- HTML5.
- CSS3.
- Vanilla JavaScript.
- DOM APIs.
- `requestAnimationFrame`.
- `IntersectionObserver`.
- `matchMedia`.
- `URLSearchParams`.
- `history.replaceState`.
- `localStorage`.
- `sessionStorage`, with URL fallback for transitions where needed.
- Pointer events.
- Keyboard events.
- Native lazy-loading where useful.

## Shared Site Shell

Use a shared header and footer system.

Recommended files:

```text
/site-shell.css
/site-shell.js
/header.html
/footer.html
```

Current site pattern:

```html
<div data-site-header></div>
<main></main>
<div data-site-footer></div>
<script src="/site-shell.js" defer></script>
```

Shell responsibilities:

- Inject or render persistent header.
- Inject or render persistent footer.
- Maintain nav open or closed state when appropriate.
- Maintain light and dark theme preference.
- Store theme in `localStorage`.
- Store short-lived navigation state in `sessionStorage`.
- Avoid page-specific design decisions inside the shell.

## HTML Page Template

Use standard HTML documents.

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Page Title</title>
  <meta name="description" content="Page description">
  <link rel="canonical" href="https://example.com/page">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Page description">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:image" content="https://example.com/path/to/social-image.jpg">
  <link rel="stylesheet" href="/site-shell.css">
  <link rel="stylesheet" href="/page.css">
</head>
<body>
  <div data-site-header></div>
  <main></main>
  <div data-site-footer></div>
  <script src="/site-shell.js" defer></script>
  <script src="/page.js" defer></script>
</body>
</html>
```

## Animation Libraries

### GSAP

Use GSAP for timeline-based UI motion, page transitions, card motion, overlay motion, and scroll-enhanced animations.

CDN script:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
```

Alternative CDN used elsewhere:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
```

Optional ScrollTrigger:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
```

Implementation requirements:

- Always provide native Web Animations API fallback where animation is critical.
- Respect `prefers-reduced-motion`.
- Avoid depending on GSAP for navigation or core content access.

## Three.js

Use Three.js for WebGL scenes, particle fields, shader-driven visuals, image planes, scroll-reactive 3D effects, and motion overlays.

Global build:

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
```

Module build:

```html
<script type="module">
  import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
</script>
```

Import map pattern:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js"
  }
}
</script>
<script type="module" src="/scene.js"></script>
```

Three.js responsibilities:

- Create `THREE.WebGLRenderer`.
- Bind renderer to a page canvas.
- Use `THREE.Scene`.
- Use `THREE.PerspectiveCamera` or `THREE.OrthographicCamera`.
- Use `THREE.BufferGeometry` for particle systems.
- Use `THREE.PointsMaterial`, `THREE.MeshBasicMaterial`, or `THREE.ShaderMaterial`.
- Use `THREE.TextureLoader` for image-driven planes.
- Dispose renderers, geometries, materials, and textures when overlays are removed.

## Raw WebGL

Use raw WebGL when direct shader control or custom image-plane rendering is needed without the Three.js abstraction.

Required APIs:

```js
const gl = canvas.getContext("webgl", {
  alpha: true,
  antialias: true,
  premultipliedAlpha: false,
  preserveDrawingBuffer: true
});
```

Raw WebGL responsibilities:

- Compile vertex shaders.
- Compile fragment shaders.
- Link shader programs.
- Create buffers.
- Upload textures.
- Maintain viewport sizing.
- Render on `requestAnimationFrame`.
- Handle DPR scaling.
- Degrade gracefully if `webgl` context is unavailable.

## Canvas 2D

Use Canvas 2D for lightweight particle fields, ambient overlays, text sampling, procedural sprites, and lower-cost motion layers.

Required APIs:

```js
const ctx = canvas.getContext("2d");
```

Canvas 2D responsibilities:

- Scale canvas by device pixel ratio.
- Resize on viewport change.
- Render through `requestAnimationFrame`.
- Keep animation optional under `prefers-reduced-motion`.
- Use `pointermove` when interactive motion is needed.

## Page Transition System

Use overlay-based transitions for static page handoffs.

Forward transition pattern:

- Clone the clicked image or visual element.
- Position clone over the original element using `getBoundingClientRect`.
- Animate clone to the target page hero area.
- Store handoff state in `sessionStorage`.
- Also add a URL marker fallback such as `?from=work`.
- On destination page, create arrival overlay immediately after `<body>` opens.
- Remove or fade arrival overlay after destination page paints.
- Clean URL marker with `history.replaceState`.

Reverse transition pattern:

- Add a back control on case study pages.
- Clone the hero image or fallback hero rect.
- Animate clone toward the origin page panel shape.
- Store return state in `sessionStorage`.
- Also add a URL marker fallback such as `?from=traveler`.
- On origin page, create return overlay immediately after `<body>` opens.
- Scroll or position origin page under the overlay.
- Collapse held image into the target card or panel.
- Remove overlay after completion.

Required APIs:

- `getBoundingClientRect`.
- `document.createElement`.
- `sessionStorage`.
- `URLSearchParams`.
- `history.replaceState`.
- Web Animations API.
- GSAP when available.
- Three.js or Canvas layer when enhanced transition effects are desired.

## Portfolio Wall System

Use a manifest-driven wall for large galleries and portfolio grids.

Recommended files:

```text
/work/cd-manifest.js
/work/cdw.js
/work/cdw.css
/work/flipbook.js
```

Portfolio wall responsibilities:

- Read project/image data from a manifest.
- Build tiles dynamically.
- Lazy-load images with `IntersectionObserver`.
- Support click-to-expand lightbox.
- Support keyboard escape close.
- Freeze wall during modal states.
- Preserve image aspect ratio.
- Avoid stretching or distorting art.

## Flipbook Module

Use a standalone flipbook module when a portfolio item needs paged interaction.

Recommended global:

```js
window.Flipbook = { init };
```

Flipbook responsibilities:

- Initialize only when matching DOM exists.
- Own its modal or interaction surface.
- Provide close behavior.
- Avoid blocking the rest of the portfolio page if missing.

## Horizontal Scroll Case Study System

Use vertical scroll to drive horizontal motion when needed.

Core technique:

- Body height represents the scroll timeline.
- Fixed viewport contains a horizontal track.
- Scroll position maps to `translate3d(x, 0, 0)`.
- `requestAnimationFrame` smooths the motion.
- A status control can scrub scroll progress.

Required APIs:

- `window.scrollY`.
- `window.scrollTo`.
- `scrollHeight`.
- `requestAnimationFrame`.
- Pointer drag events.
- CSS transforms.

## Navigation System

Use a shared navigation component with:

- Persistent shell rendering.
- Click-to-open behavior.
- Hover or pointer leave close behavior where appropriate.
- `sessionStorage` for short-lived nav state.
- Pointer events.
- Keyboard escape close.
- Optional Web Audio tones.
- SVG icon states.
- URL query state for test pages when needed.

Optional audio API:

```js
const audioContext = new AudioContext();
```

Audio requirements:

- Must be user-gesture initiated.
- Hover sound may be browser-restricted until interaction occurs.
- Never make audio required for navigation.

## Motion Preferences

Every motion system must check:

```js
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```

When reduced motion is enabled:

- Skip WebGL animation loops.
- Skip page transition morphs.
- Keep navigation and content fully accessible.
- Use immediate state changes.

## Data And State

Use:

- `localStorage` for long-lived preferences.
- `sessionStorage` for short-lived page handoff state.
- URL query markers as fallback state for page transitions.
- Inline JSON script tags for project data where useful.

Inline JSON pattern:

```html
<script type="application/json" data-project-json>
{
  "title": "Project title",
  "image": "/assets/project.jpg",
  "href": "/work/project/"
}
</script>
```

## Assets

Supported asset types:

- SVG.
- PNG.
- JPG.
- WebP.
- MP4.
- JSON.

Asset rules:

- Use root-relative paths.
- Keep source art undistorted.
- Preserve image aspect ratios.
- Use `object-fit` intentionally.
- Use transparent SVG or PNG for navigation/icon art.
- Use compressed WebP/JPG for large imagery where appropriate.
- Use MP4 for video textures or HTML video surfaces.

## SEO And Metadata

Each page should include:

- Unique title.
- Unique meta description.
- Canonical URL.
- Open Graph type.
- Open Graph title.
- Open Graph description.
- Open Graph URL.
- Open Graph image.
- Robots directive appropriate to environment.
- Semantic HTML structure.
- Image alt text.
- Optional structured data where relevant.

## Accessibility Baseline

Required:

- Semantic landmarks.
- Accessible names for buttons and links.
- `aria-hidden="true"` for decorative canvases.
- Keyboard close for overlays.
- Focus-visible states.
- Escape key handling for modals.
- No content hidden exclusively behind animation.
- Reduced-motion support.

## Recommended File Structure

```text
/index.html
/site-shell.css
/site-shell.js
/assets/
/work/
  index.html
  traveler.html
  cd-manifest.js
  cdw.css
  cdw.js
  flipbook.js
/js/
  motion.js
  webgl.js
  canvas-field.js
/docs/
```

## Script Loading Order

Typical page:

```html
<script src="/site-shell.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="/feature-manifest.js" defer></script>
<script src="/feature.js" defer></script>
```

Module page:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js"
  }
}
</script>
<script type="module" src="/scene.js"></script>
```

## Build And Run

No build step is required.

Local preview:

```bash
python3 -m http.server 4175
```

Open:

```text
http://127.0.0.1:4175/
```

Deploy:

- Commit to Git.
- Push to main.
- Vercel deploys the static site.

## Verification Checklist

- HTML page loads without console errors.
- Shared header and footer load.
- Theme preference works.
- Navigation opens and closes.
- Page has no horizontal overflow.
- Images do not stretch.
- WebGL initializes where supported.
- Canvas fallback or no-motion fallback works where unsupported.
- GSAP animation works when CDN loads.
- Native animation fallback works when GSAP does not load.
- Page transitions work forward and backward.
- Clean URLs resolve on Vercel.
- URL fallback markers clean themselves after transition.
- Reduced-motion users can access all content.
- Mobile viewport works.
- Desktop viewport works.
- SEO metadata is present per page.

