# Overview

Update the /docs/new form to also allow for adding documents either by adding local files or via URLs. Allow for this by having two tabs, one with a Files form, the other with a URLs form.

## Spec

- Add a tab-based UI to this page, with two tabs: A "Files" tab (default), and a "Via URL" tabl
- The "Files" should contain the current form.
- The "Via URL" tab should contain a new form that allows for adding comma-separated URLs. URLs should be added in a texarea, so that multiple lines of URLs can be visible.
- On submit of a form. use a "intent" value to allow for determining which form was submitted on the server. Intent values should be "files" and "urls". Set these using PARAMS in /shared/params.
- On submit of the URL form, just console out the submitted URLs for now using console.info

## Additional Instructions

See ./base.md
