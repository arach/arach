# Engineering / Blueprint Design Language

A reusable "engineering drawing" aesthetic — architectural blueprint + industrial spec-sheet
(dot grids, dimension ticks, mono labels, part numbers). Distilled from **hudsonkit.com** and
mapped onto the `BrandSpec` knobs of the Arc diagram component (`@arach/arc`, `src/utils/themes.ts`).

- **Source:** hudsonkit.com (fetched 2026-07-01) — an HP pen-plotter / CAD spec-sheet interface.
- **Use for:** the Arc `engineering` theme + any surrounding "spec-sheet" chrome (captions, legends, callouts).
- **Vibe:** dark, cool, near-monochrome with one teal-cyan accent; HP plotter / CAD / analog engineering specs.

---

## A. Palette — *theme-level (Arc `themes.ts`), not BrandSpec*

hudson is dark, cool, near-monochrome with a single teal-cyan accent:

| Role     | hudson (oklch)      | ≈ hex                 | Arc mapping                    |
|----------|---------------------|-----------------------|--------------------------------|
| Base bg  | `0.20 0.02 240`     | `≈#11151c`            | dark floor / canvas            |
| Panel bg | `0.24–0.28 0.02 240`| `≈#1a2029`            | node background                |
| Ink      | `0.94 0.005 240`    | `≈#ecedf0`            | node name / primary text       |
| Accent   | `0.62 0.16 162`     | `≈#1fae86` teal-cyan  | connector / highlight stroke   |
| Lines    | `0.40–0.62 0.012 240`| `≈#3a4048 → #6b7681` | borders, grid, muted labels    |

## B. Diagram look — *drop-in `BrandSpec` for the engineering theme's `brand`*

```ts
brand: {
  fontFamily: '"Space Grotesk", system-ui, sans-serif',      // node names (already loaded)
  monoFamily: '"JetBrains Mono", ui-monospace, monospace',   // subtitles + connector labels
  gridType: 'dots',        // the engineering dot grid ('crosshair' for a coordinate-layer feel)
  frame: 'ticks',          // dimension ticks at the boundary ('cropmarks' / 'brackets' = corner-mark variants)
  upperLabels: true,       // SHEET / STATUS uppercase + letter-spaced labels
  arrowhead: 'chevron',    // technical directionality (hudson's "↳" indicators)
  nodeRadius: '2px',       // near-square CAD tiles
  nodeBorderWidth: '1.5px' // matches hudson's 1.5px hairlines
}
```

No `fontImport` needed — Space Grotesk + JetBrains Mono already ship via Arc's `arc-ds.head.css`.
(hudson's *display* face is Cormorant serif; Arc's is Fraunces — a headings choice, not a diagram-node one.)

## C. The spec-sheet layer — *host chrome built around `<ArcDiagram>`*

`BrandSpec` can't emit dimension text; hudson's measurement personality lives in labels *around* the
drawing. Map each motif to Arc primitives + `--arc-*` brand tokens:

| hudson motif                              | Build with                                                             |
|-------------------------------------------|------------------------------------------------------------------------|
| `SHEET 01 / 08`, `SCALE 1:1`              | the `<ArcDiagram label="…">` prop + a mono caption row                  |
| Dimension callouts `122 mm`, `200pt LEAD` | mono, uppercase, hairline-underlined tags on the diagram frame          |
| Figure callouts `FIG. 01-A` + subtitle    | a caption block above/below each diagram card                          |
| Numbered part list `01–05`                | a mono numbered legend beside the diagram                              |
| `DRAWN TO SPEC` specimen frame            | a hairline wrapper with `frame: 'brackets'` inside + corner marks outside |

## Fastest path

`gridType: 'dots'` + `frame: 'ticks'` + `upperLabels: true` gets ~80% of the vibe on the diagram
itself; the rest is the mono/uppercase caption chrome in section C.

## Arc reference

- `BrandSpec` type + per-theme `brand` blocks: `arc` repo → `src/utils/themes.ts`
- Public diagram props (`theme`, `frame`, `label`, `showControls`, `showMinimap`, …): `src/components/ArcDiagram.tsx`
- Logical node colors: `violet · emerald · blue · amber · zinc · sky · rose · orange`
