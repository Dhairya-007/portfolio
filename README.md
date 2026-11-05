# Portfolio — Dhairya Oza

My personal site, built as a Formula 1 pit wall: live telemetry panels either side, and a
Formula 1 car in the middle that you can drag to rotate.

**Live:** [dhairyaoza007.netlify.app](https://dhairyaoza007.netlify.app)

Angular 20 · Three.js · zoneless change detection · server-side rendering · Netlify

---

## What's in it

A single page, seven sections: hero, about and education, work experience, projects, skills,
achievements and contact. Projects carry live demo and source links, and filter by category.

### The car

The centrepiece is a Formula 1 car built entirely from Three.js primitives — no model file, no
loader, nothing to download. The body is an `ExtrudeGeometry` built from a side-profile
silhouette, with sidepods, bargeboards, a diffuser, suspension wishbones and a canvas-texture
ground shadow layered on top. The livery is RB9-inspired: navy-purple tub, yellow nose and
airbox, red accents, white-walled tyres.

It sits on its own canvas inside the hero stage rather than a page-wide one, so it never bleeds
behind the rest of the page, and `OrbitControls` can actually receive pointer events. Drag to
rotate; auto-rotate yields while you drag and picks back up after a pause.

### Performance and lifecycle

The 3D work is written to stay out of the way:

- Two canvases — background particles (fullscreen, `pointer-events: none`) and the car (hero
  stage, interactive) — driven from one `requestAnimationFrame` loop.
- `devicePixelRatio` capped at 2, and the particle count drops on small screens.
- The loop stops when the tab is hidden; the car stops rendering when the hero scrolls away.
- `prefers-reduced-motion` turns off auto-rotate, wheel spin and particle drift.
- WebGL context loss is handled, and a static fallback renders when WebGL is unavailable.
- Scenes, geometries, materials, renderers, listeners, timers and observers are all disposed
  on destroy.

### Zoneless

The app runs on `provideZonelessChangeDetection()`, so anything mutated outside a template
event — the telemetry timer, the `IntersectionObserver` that tracks the active nav link, the
project filter — is held in a **signal**. Plain fields silently never re-render under zoneless
change detection, which is worth knowing before adding state here.

### Rendering

SSR with prerendering, so the page is readable before any JavaScript runs and before WebGL is
touched. All Three.js work is guarded behind `isPlatformBrowser`.

---

## Running it

```bash
npm install
npm start          # dev server on http://localhost:4200
```

```bash
npm run build      # production build + prerender into dist/
npm test           # Karma unit tests
```

The build emits both a prerendered static browser bundle and an SSR server bundle. To preview
the static output the way Netlify serves it, or to run the Express server:

```bash
npx http-server dist/portfolio-dhairya/browser -p 4321   # static, as deployed
npm run serve:ssr:portfolio-dhairya                      # SSR server
```

Requires Node `^20.19`, `^22.12` or `>=24`.

---

## Layout

```
src/
├── app/
│   ├── portfolio/
│   │   ├── portfolio.component.ts     # content data, Three.js scene, car model, lifecycle
│   │   ├── portfolio.component.html   # all seven sections
│   │   └── portfolio.component.css    # F1 theme, responsive rules
│   ├── app.config.ts                  # zoneless change detection, hydration
│   └── app.routes.server.ts           # prerender config
├── index.html                         # title, meta, Open Graph, favicons
└── styles.css                         # global resets
public/
├── assets/Dhairya-Oza-Resume.pdf
├── favicon.svg
└── favicon.ico
```

Everything lives in one component. It's a single page — splitting it across a dozen files would
cost more than it saves.

### Editing content

Projects, skills, experience tech tags and achievements are plain arrays at the top of
`portfolio.component.ts`. Add a project by pushing one object onto `projects`:

```ts
{
  name: 'project-name',
  category: 'ai',            // 'ai' | 'fullstack' | 'games' | 'systems'
  categoryLabel: 'AI & Agents',
  blurb: 'What it is and why it exists.',
  stack: ['TypeScript', 'NestJS'],
  metric: '39 tests',        // optional
  code: 'https://github.com/...',
  live: 'https://...',       // optional
  featured: true,            // optional
}
```

The category must match one of the keys in `projectFilters`, or the card won't appear under any
filter but "All".

---

## Deployment

Netlify builds from `main` using `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist/portfolio-dhairya/browser"

[[plugins]]
  package = "@netlify/angular-runtime"
```

---

## Contact

[ozadhairya73@gmail.com](mailto:ozadhairya73@gmail.com) ·
[LinkedIn](https://www.linkedin.com/in/dhairya-oza-7723b2200/) ·
[GitHub](https://github.com/Dhairya-007)
