# Offline PDF Navigator draft 0.2

The HTML contains its PDF and ZIP libraries and makes no network requests.
Edit these sources and run `node build.js "../PDF Navigator.html"` to rebuild.
Run `node test.js` for the dependency-free core tests.

- `core.js`: .xlsx XML import, group mapping, source matching, project validation,
  legacy-project migration, and safe, unique relative output paths.
- `pdf.js`: index layout, height-based directory pagination, group-list pagination,
  bookmarks, transparent hotspot annotations, and separate-file PDF links.
- `app.js`: local editor, transparent button drawing/moving/resizing, labels,
  file selection, project save/restore, PDF preview and linked-folder ZIP export.
- `demo.js`: clearly marked fictional maps and separate sample drawing files.
- `index.html`: UI and CSS. Editor outlines are not painted into the output PDF.
- `vendor/`: bundled pdf-lib and JSZip. Licenses are in the package root.

Project schema version 2 adds normalized rectangles to `group.hotspots`:
`{id, x, y, w, h}` with coordinates relative to the image and origin at its top
left. The main PDF map fits the image without stretching, then transforms these
coordinates into PDF annotation rectangles. Each hotspot is a borderless `/Link`
with an internal destination and no appearance stream. Group codes are display
labels; stable group IDs retain document and hotspot assignments after renaming.

Version 1 projects migrate to version 2 without changing saved groups, images,
or marker positions. The old `combined` output mode migrates to `linked`.
There is no source-page copying or PDF attachment in the index builder. Only
the optional original Excel workbook may be attached.

Source PDFs are read for validation and page counts. External links use `/GoToR`,
a relative file specification with `/F` and Unicode `/UF`, `/D [0 /Fit]`, and
`/NewWindow true`, following ISO 32000-1 section 12.6.4.3. Actual opening behavior
depends on the viewer. No viewer-independent window guarantee is possible.

`linkTargets` assigns safe, case-insensitively unique output paths under
`Documents/`. The same targets are used for the PDF and ZIP. ZIP source entries
contain the original file bytes. A standalone downloaded index requires the same
folder structure; the linked ZIP assembles it automatically. File links must be
tested after extraction in a desktop PDF reader, not against a blob preview URL.

Directory rows are wrapped and measured. Every continuation page uses the content
interval from y=92 through y=pageHeight-112. Navigation sits below that interval
and above the footer. Group-file tables have separate bounded pagination.

Project JSON holds metadata and map images, never source PDF bytes. Manual source
choices use path, size, and timestamp keys; users reselect changed files. Excel
formulas are not evaluated; a formula column needs its saved cached values.
