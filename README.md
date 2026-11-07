# BYOLFloor

A browser-based architectural form and floorplate experimentation tool. Built with React, TypeScript, Vite, Three.js and React Three Fiber.

## Run locally

Install Node.js 22 LTS (22.12 or later), then:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. To create and inspect a production build:

```sh
npm run build
npm run preview
```

The production output is `dist/`, suitable for a static web host. This repository does not change or manage the existing hosted site's deployment.

## Workspaces

- **Character Input:** upload images, remove simple backgrounds, paint foreground/background corrections, and generate closed vector contours.
- **Vector Editor:** create Exact, Unified and Expanded outlines; edit vertices; compare and export outlines.
- **04 Composition:** combine outlines from multiple characters, manipulate them with a gumball, apply 2D Boolean operations and curve interactions, adjust global rigidity/roundness, and save iterations.
- **05 Stacked:** assign saved iterations to five exploded axonometric underlay layers; adjust spacing, visibility and opacity.
- **Rhino 8 export:** download closed DXF polylines from selected objects, the full composition, or stacked floorplates. Calibrated exports use feet. Optional floor elevations use an explicit floor-to-floor height, independent of visual explosion spacing.

## Saving and scale

Workspace data, images, outlines and iterations are saved in IndexedDB in the current browser. They are not stored in GitHub or synced between devices. Clearing browser data removes these local saves; use the app's export controls for backups. Undo history does not persist across reloads.

Calibrate a selected shape's known horizontal width in feet before using square-footage or physical-clearance estimates. The width check samples opposing interior boundaries; it can miss curved or short pinch points. These tools are early design studies, not building-code or accessibility verification, and do not model walls, furniture or doors.

## Technical notes

- Browser Canvas processing and boundary tracing, with an 800-pixel maximum processing dimension.
- Clipper polygon offsets and 2D operations.
- Closed polygon outlines; rounded portions are sampled curves, not fitted NURBS.
- Five-layer SVG axonometric underlay projection; no floorplate extrusion.
- Google Fonts and the Three.js studio environment may require network access.

User-uploaded images and browser workspace contents are not included in this repository.
