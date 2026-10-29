OFFLINE PDF NAVIGATOR - DRAFT 0.2

QUICK START
1. Extract the program ZIP. Open PDF Navigator.html in Edge or Chrome.
2. Choose your Excel index (.xlsx) and check the column choices.
3. Add the matching PDF files or their folder.
4. Upload your map picture and select a document group.
5. Drag a transparent button over that group's area on the image.
6. Click Create PDF, then Download linked folder (ZIP).
7. Extract that entire ZIP. Open the Master Index in your desktop PDF reader.

Everything runs locally. No account or internet connection is required.

HOW THE FILES WORK
The Master Index contains the cover, directory, maps, and group lists. Drawing
PDFs stay separate. They are never merged into or attached to the index.

The linked folder ZIP contains:
  Your title - Master Index.pdf
  Documents/  (your source folders and separate PDF files)
  OPEN THIS FIRST.txt

Keep the index beside Documents. Move or share the entire folder together.
Extract all files before opening the index; do not open it from inside the ZIP.
Renaming or moving a drawing without rebuilding the index can break its link.

Clicking a filename opens page 1 of the separate PDF using a PDF remote-go-to
action, with a request for a new reader window. Your PDF reader controls whether
it opens a window or tab and may ask before opening a local file. Browser PDF
viewers may not support local file links. The program cannot force every reader
to behave the same way. Test links using your normal desktop PDF reader.

The app preview is for layout and internal navigation. Test external file links
from the extracted folder in your PDF reader, rather than the browser preview.

IMPORT THE INDEX AND SOURCE FILES
Choose Excel file and select an .xlsx workbook. The earlier PDF Indexer workbook
is supported. Use Master Index so year tabs do not create duplicate records.
Check the heading row and choose the filename column. Project / group name makes
the initial document groups. Year, folder, type, ID, and area status are optional.
Old .xls files must first be saved as .xlsx in Excel.

Choose PDFs or Choose folder to add your source files. Subfolders are included.
Use Documents to find missing or ambiguous matches. When two files have the same
name, use Edit to select the correct one. The app will not guess between them.
All rows must have matched files to create the linked export. For an early
layout review, choose Layout draft; that option has no external file links.

Importing an Excel index again replaces the index and group setup. Save your
project first when needed.

EDIT GROUP LABELS AND NAMES
Select a group on the left. Under Group label, replace G1 with 1, A1, North, or
another short unique label. Change its name, subtitle, and notes as needed.
Click Save group details. Changes also save when you leave an edited field.

Use labels 1, 2, 3... renumbers all groups at once. Names, assigned documents,
map markers, and transparent buttons remain connected to the same groups.
Use Add group to make another group, then Documents > Edit to move records into
it. Empty groups can be deleted and are left out of the exported PDF.

ADD TRANSPARENT CLICKABLE BUTTONS
Upload a JPG, PNG, or WebP map picture. Select a document group. Choose Draw
transparent button under Map tool. Drag from one corner of the desired area to
the opposite corner. You can cover a label, number, building, or map region.
Each button opens the selected group's index page. A group can have several.

Move a button by dragging it. Resize it with its lower-right corner. Select a
button and use Delete selected button to remove it. Show editing outlines can
hide the guides while you work. The boxes, labels, and corner handles are editing
guides only; none are painted on the exported PDF. The map underneath stays clear.

Place numbered marker is an optional alternative for visible map labels. Remove
numbered marker leaves the group's transparent buttons intact. Groups without
map buttons remain reachable from the directory and PDF bookmarks.

The main image and buttons appear on the cover and continuation-directory maps.
Clicking a group's locator map returns to the main map. Add group map image
replaces that group's locator with another picture. Custom locator pictures are
separate from the main-map button editor.

Area status is a manual field; moving a button does not classify a boundary.

CREATE, REVIEW, AND SHARE
Enter a title and subtitle. Choose 17 x 11 or 11 x 8.5 inches, landscape.
Choose Index with separate PDF links, then Create PDF. Long directories and
document lists continue on additional pages, with room reserved for headings,
navigation buttons, and footers. Use Map, Previous, and Next to navigate.

Download linked folder (ZIP) is the recommended export. It includes the index
plus separate copies of the matched original PDFs in the folders used by the
links. The source files are unchanged. Conflicting exported file paths receive
unique names, and links use those names.

Download index PDF only is useful if you already have the corresponding
Documents folder. Saving only the index does not also save the drawings.

You can optionally attach the original Excel workbook. This includes the entire
original file, not just the chosen worksheet. App edits do not rewrite it. Clear
the checkbox if you do not want that attachment. Source PDFs are not attached.

SAVE AND CONTINUE LATER
Save project downloads a JSON file with the index, maps, groups, labels, buttons,
markers, and settings. Open project restores it. Re-add your source PDF folder
before another linked export. Source PDF contents are not stored in project JSON.
Use Attach Excel only to add the workbook without replacing saved groups.

Earlier draft 0.1 project files can be opened. Their groups and markers are kept,
and the old combined-PDF option becomes separate-file links. Save the restored
project in the new format. Previously exported PDFs do not change automatically;
create a new Master Index with this version.

NOTES
- The app organizes metadata and links. It does not run OCR, read engineering
  content, georeference maps, or determine geographic boundaries.
- Source PDFs must be readable and unlocked so page counts can be checked.
- Very large images are resized to at most 3,600 pixels on the longest side.
- Western-language text stays searchable. Other characters may be rendered
  through browser fonts and may not remain searchable.
- Limits: 20,000 index rows, 2,000 groups, 100 buttons per group. Browser memory
  also limits large ZIP exports.
- The example map and drawings are fictional. Use Example Linked PDFs.zip to
  test separate-file navigation after extracting it.

PACKAGE CONTENTS
PDF Navigator.html - offline program
Example Linked PDFs.zip - example index with separate drawing files
Example Navigator.pdf - index-only copy for layout review
README.txt - these instructions
source/ - editable program code and developer instructions
licenses/ - bundled library licenses
