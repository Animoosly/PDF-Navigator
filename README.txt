OFFLINE PDF NAVIGATOR
Draft 0.1 - a template for review

WHAT THIS PROGRAM DOES

This program turns an Excel document index, your PDF files, and your map pictures
into one clickable PDF. Everything runs on your computer. There is no account,
internet connection, or upload service.

The first PDF page shows a map and a list of document groups. Each group has a
document list page with a locator map, following the style of the example layout.
Click a map marker or a group name to open that group's list. Click a file name
to open its drawing. The Map and Return to list buttons help you move around.

The template is used for the index pages. Your original drawing pages keep their
own layout. The original files on your computer are not changed.

START HERE

1. Extract the downloaded ZIP to a folder on your computer.
2. Open "PDF Navigator.html" in Microsoft Edge or Google Chrome.
3. To review the draft immediately, click "Try the example project".
4. Click "Create PDF", review the preview, then click "Download PDF".

The example map and drawings are fictional. They are clearly marked EXAMPLE.
Start a new project before adding your real files.

MAKE A PDF FROM YOUR OWN FILES

STEP 1 - CHOOSE YOUR EXCEL INDEX

Click "Choose Excel file" and select your .xlsx workbook.

In the column selection window:
- Choose the worksheet containing the full index, usually "Master Index".
- Check the row number containing the column headings.
- Choose the column containing the PDF filenames. This is required.
- Choose Project / group name to group related documents together.
- Choose any other columns you want to use, then click "Import index".

The program supports the workbook made by PDF Indexer. A normal Excel workbook
with a filename column can also be used. Old .xls files must first be saved as
.xlsx in Excel. Only the selected worksheet is imported. This avoids importing
the same records from both the master index and the year tabs.

Optional columns include a map/group code, year, folder, document type, document
ID, and area status. If no group column is selected, the files go into an
Unassigned documents group. Missing years stay undated. A year range stays a range.

Area status is optional. It can be Inside area, Needs review, Outside area, or
Not set. It is never calculated from marker positions. Do not use a filename
classification such as Dated or Miscellaneous as an area-status column.

STEP 2 - ADD THE SOURCE PDF FILES

Click "Choose folder" and select the folder containing your PDFs. Subfolders
are included. You can also choose individual PDFs or drop files/folders onto
the Add the PDF documents card.

The program matches the filenames in Excel with the PDF files you selected.
Folder information helps distinguish files with the same name. If a filename
exists in more than one folder, the program will not guess which one is correct.

Open the Documents tab to see the matches. Filter to Missing / ambiguous files
to find entries needing attention. Click Edit to correct a document's group,
year, document type, area status, or source-file selection. For a manual file
choice, turn off automatic matching and select a source PDF from the list.

A combined PDF can be made only when every index row has a matched source PDF.
For an early layout review, select Index-only draft under Output. That option
creates the map and document lists without including or linking to drawings.

STEP 3 - ADD MAP PICTURES AND PLACE THE GROUPS

In Map & groups, click "Upload map image". Use a JPG, PNG, or WebP picture.
This can be a map export, an aerial image, a scanned map, or a simple diagram.
Use an image you are allowed to include in your document.

Select a group in the list on the left. Click on the map where you want its
marker to appear. Drag the marker if you want to move it. Each marker is a
clickable link in the exported PDF.

You can change a group's map code, name, subtitle, and notes. Click "Save group
details" after editing. Map codes should be short and unique, for example A1.

By default, each document list page uses the main map as its locator and
highlights that group's marker. To use a different picture for one group,
select the group and click "Add group map image". That picture replaces its
locator image. A custom image has no automatic geographic marker; include any
needed location markings in the image itself. Click "Use main map instead" to
remove the custom picture.

Groups without markers remain available in the cover's group directory and
PDF bookmarks. General documents do not need an invented map location.

To add a group, click "+ Add group". Then use Documents > Edit to move documents
into it. An empty group can be deleted. Empty groups are omitted from the PDF.

STEP 4 - CREATE AND DOWNLOAD YOUR PDF

Enter a document title and subtitle. Choose a landscape page size:
- 17 x 11 inches gives more room for maps and long filenames.
- 11 x 8.5 inches creates a smaller index page with smaller text.

Choose "PDF with documents" to make a self-contained file. Each matched source
PDF is included once, even if several Excel rows refer to it. Source PDF files
can have multiple pages. Long document lists automatically continue onto more
pages. Large group directories also continue automatically.

"Add a return-to-list strip" adds a small navigation margin outside each
included drawing. It does not cover the original drawing. A rotated drawing
may show this strip along a side. Clear the checkbox to keep the original PDF
page boxes unchanged; use the PDF bookmarks to return to the group lists.

If the original Excel workbook is available, it can be included as an attachment.
In Adobe Acrobat Reader, use the Attachments panel to find it. Some browser PDF
viewers do not expose attachments. The file is the original workbook you chose;
edits made inside this app do not rewrite that Excel attachment.

Click "Create PDF". Wait for the preview, then click "Download PDF". Creating
the preview does not automatically save the PDF to your computer.

The links are inside the PDF and do not require the original source folders.
Use a PDF reader that supports internal links and bookmarks. Adobe Acrobat
Reader and Bluebeam are useful for reviewing document navigation offline.
The preview depends on your browser's built-in PDF viewer; the PDF can always
be downloaded for review in another reader.

SAVE YOUR WORK FOR LATER

Click "Save project" to download a project JSON file. It contains the index,
group names, map images, marker positions, and your settings.

To continue later, open the app and click "Open project". Choose that JSON file,
then re-add your source PDF folder. Source PDF contents are not stored in the
project JSON. Keep your original PDF files in a safe place.

If you want the original Excel workbook attached after reopening a project,
use "Attach Excel only". This keeps the saved groups and marker positions.
Importing the Excel index again replaces the index and group setup, so save
your project before doing that.

Changing the Excel file on disk does not automatically update an open project
or an already exported PDF. Import the updated index and create a new PDF.
The exported PDF is interactive navigation, not a live database or editable app.

HELP WITH COMMON PROBLEMS

"Missing" source file:
Check that the filename in Excel matches the actual PDF. Choose the correct
source folder. Use Edit to select a different source file if necessary.

"Choose file" / ambiguous match:
Two or more selected PDFs have the same filename. Use Documents > Edit to
choose the correct file, or include the correct folder in your Excel index.

No useful groups appeared:
Use Change columns and select the project or group-name column. Alternatively,
add groups and reassign documents with Edit.

A PDF cannot be opened:
Check that it opens normally in a PDF reader and is not password protected.
Use an unlocked, valid copy of the PDF.

The map looks blurry:
Choose a clearer source image. Images are fitted without stretching, and very
large images are resized to a maximum of 3,600 pixels on the longest side.

Long filenames or many documents:
The filename column wraps and lists continue to additional pages. The app's
Documents tab displays at most 250 matching rows at once; search to find others.
All index rows are included in the PDF, not just the visible preview rows.

The PDF is large or takes time to create:
The combined PDF includes the full source documents. Large archives need more
browser memory. Review a smaller project first if your computer struggles.
Index-only draft creates a small review file without the source drawings.

DRAFT LIMITS AND NOTES

- This is draft 0.1 for reviewing the workflow and page design.
- It reads Excel filenames and metadata; it does not classify drawing content,
  read map coordinates, run OCR, or determine district boundaries.
- Source PDF page rendering and existing page annotations are copied, but this
  is not a preservation tool for digital signatures, forms, PDF portfolios,
  scripts, or other document-level features. Keep the original source files.
- Standard Western-language text remains searchable. Other characters are
  rendered using the browser's fonts and may not be searchable in the PDF.
- The original Excel attachment may contain data beyond the chosen worksheet.
  Clear its checkbox if you do not want to include the entire original file.
- This draft supports up to 20,000 index rows and 2,000 saved groups. Large
  projects are also limited by available computer memory.

FILES IN THE PACKAGE

PDF Navigator.html - the offline program; double-click to open it.
Example Navigator.pdf - a clickable sample with fictional drawings.
README.txt - these instructions.
source/ - editable source code and build instructions for a developer.
licenses/ - licenses for the bundled open-source PDF and ZIP libraries.

No installation is required for normal use.
