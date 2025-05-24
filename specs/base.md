# Base instructions

Follow these guidelines for all tasks.

- Do not include any comments in the code unless the code itself is not self-explanatory
- Keep code DRY. For example, if the same or similar code is repeated, extract that code into a separate function and call it .
- Do not use "magic numbers" or text. Instead assign to a meaningfully named variable and use that.
- Avoid use of type assertions. If a type assertion is necessary, add a comment explaining why.
- When adding buttons, ensure that the tailwind style "cursor-pointer" is included.
- Add unit tests for new functionality and test using vitest.
- When importing react, you can import without a default alis, ie "import React from "react";
- To run both the dev server and the unit test runner, use the command "npm run dev"
