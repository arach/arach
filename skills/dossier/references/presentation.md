# Presentation

Arach asked for an aerospace/NASA-like dossier presentation in the context of
ARC. The available ARC reference supplied engineering-sheet and mission-console
primitives, not a verified theme named NASA. This package's light technical-report
style is an interpretation of that direction. If a more specific reference is
provided, inspect it and adapt the presentation rather than claiming an exact match.

Use a white report sheet, cool paper background, dark ink, navy links and table
rules, and a restrained red title accent. Give the document a clear title block,
research cutoff and actual source-record count. Section numbers serve navigation
and should match the document index. Keep body text in a readable sans serif;
reserve monospace for dates, labels and other document metadata.

The style borrows engineering-document discipline. Do not add NASA logos,
classified stamps, fake report numbers, invented telemetry or decorative confidence
ratings. Preserve the underlying prose, evidence labels and citations. Readability
and factual status matter more than atmosphere.

## Render a report

For a fresh report, the `assets/` directory also contains `dossier-template.md`,
`sources-template.csv` and `timeline-template.csv`. These are starters, not
research results. Copy them into the report folder, rename them without the
`-template` suffix, and replace every template field before delivering the report.

The bundled `scripts/render_report.py` takes an authored Markdown dossier and
generates a standalone HTML report with embedded styling. It requires Python 3.9+
and the Python `Markdown` package in the selected environment. It does not fetch
sources, execute research, install dependencies or validate claims.

From the skill directory:

```bash
python3 scripts/render_report.py /path/to/dossier.md \
  --output /path/to/dossier.html \
  --date 2026-10-28 \
  --sources /path/to/sources.csv
```

Replace the example date with the actual research cutoff. `--sources` is optional;
when supplied, its CSV row count is labeled source records, not independent
corroborations. `--deck` optionally links an existing deck. `--author` defaults
to Arach. Keep the linked Markdown and CSV with the HTML when sharing the package.

Use the first Markdown H1 for the report title and H2 headings for major sections.
The renderer creates the index, mobile contents, keyboard-accessible table scroll
regions and a print layout. Render only authored report content, never unreviewed
third-party HTML. No network fonts, JavaScript libraries or images are required.

Inspect the title block, longest table, historical timeline and early-customer
section at desktop and mobile sizes. Verify navigation, source links, print control,
focus and reduced-motion behavior. Check that rendering preserved the report's
facts. Other formats may reuse the palette and hierarchy while following their
own layout and export requirements.

For a Scout deck, `assets/aerospace-deck.css` supplies an optional companion skin.
Pass its contents to the deck kit’s `Deck.css()` method before `finish()`. It
preserves slide geometry and changes the palette, rules and emphasis. Keep a copy
with a portable deck source, then visually review every rendered slide.
