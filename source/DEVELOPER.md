# Offline PDF Navigator draft 0.1

The delivered HTML is self-contained. Its bundled libraries make no network
requests. To edit the program, modify these source files and run:

```
node build.js "../PDF Navigator.html"
node test.js
```

No package installation is needed. `vendor/` contains pdf-lib 1.17.1 and JSZip
(see the bundled license files for their terms). The app uses standard browser
File APIs, DOMParser for .xlsx XML, Canvas for map pictures, and pdf-lib for PDF
assembly. It does not execute spreadsheet formulas or PDF scripts.

- `core.js`: workbook reader, mappings, groups, source matching, project validation.
- `pdf.js`: PDF layout, pagination, internal links, bookmarks, optional attachment.
- `app.js`: local editor, imports, source selection, map markers, saved projects.
- `demo.js`: clearly marked fictional map and drawing examples.
- `index.html`: interface and CSS.
- `README.txt` in the package root: user instructions embedded into the HTML.

The project JSON contains index metadata and JPEG data URLs, not source PDF bytes.
Manual source choices are keyed by path, file size, and modification timestamp;
if those change, the user must select the source again. Excel is read from the
selected worksheet only, including shared strings and inline strings. Formula
cells require their saved cached value; formulas are not evaluated. Unsupported
workbook or document-level PDF features should be handled explicitly rather than
silently approximated. Originals remain the source of record.

Draft scope: local, single-user workflow; no OCR, map georeferencing, automatic
boundary decisions, existing-PDF updates, or lossless preservation of PDF forms,
signatures, portfolios, and scripts. A shared source PDF returns to its first
referencing group's list. Page-level annotations are copied with source pages.

The map and group directory link to internal group-list pages. File links go to
the first copied page of the chosen PDF. Navigation strips are drawn in an added
crop-box margin, without moving or painting over the source content. Rotated
pages retain their rotation. Every group has a PDF bookmark.
