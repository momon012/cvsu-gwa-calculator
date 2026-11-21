<!-- Generated with GitHub Copilot CLI, reviewed by [member name] -->

# CvSU GWA & Grade Calculator

## Project state and commands

- This is a class-project, plain HTML/CSS/JavaScript website. It currently has no framework, package manifest, build step, test runner, or linter.
- There are no existing build, test, or lint commands. Do not add npm tooling or dependencies unless the project requirements change.
- Preview the site by opening an HTML page directly in a browser or by serving the project directory with a local static-file server.
- No automated test command or single-test command exists yet.

## Architecture

- Build a multi-page site where Calculator, Target Planner, History, Honors, and About are separate HTML pages or sections linked by the same navigation menu.
- Use `css/style.css` as the only external stylesheet.
- Put JavaScript modules or scripts in `js/` and load them with external `<script>` tags. Share the same menu markup and page shell patterns across pages.
- Keep state in browser `localStorage` under the key `gwaData`.
- The stored shape is:

  ```javascript
  {
    semesters: [
      {
        id,
        name,
        subjects: [
          {
            name,
            units,
            grade,
            countsTowardGWA
          }
        ]
      }
    ]
  }
  ```

- Calculate GWA as `sum(grade * units) / sum(units)` only for subjects where `countsTowardGWA` is true. The scale uses `1.00` as best and `5.00` as worst; `3.00` is the lowest passing grade.
- Keep data parsing and GWA calculations separate from DOM rendering. Read and write `gwaData` through small, consistent JavaScript helpers rather than duplicating storage logic in each page.

## Required implementation conventions

- Use plain HTML, CSS, and JavaScript only. No frameworks or libraries, CDNs, Bootstrap, Tailwind, jQuery, Chart.js, or icon libraries.
- At the top of every generated file, use the appropriate comment form:
  - HTML and Markdown: `<!-- Generated with GitHub Copilot CLI, reviewed by [member name] -->`
  - CSS: `/* Generated with GitHub Copilot CLI, reviewed by [member name] */`
  - JavaScript: `// Generated with GitHub Copilot CLI, reviewed by [member name]`
- Never use inline styles, `<style>` tags, `element.style`, inline `onclick` attributes, or JavaScript `innerHTML`.
- Toggle state with `classList`; use `textContent` or `createElement` for user-typed text.
- Use `addEventListener` for interactions.
- Make the layout mobile-first and usable at 360px wide and on desktop.
- Images must include meaningful `alt` text.
- Use the system font stack as one font family. Do not add external fonts.

## Visual conventions

- Define these colors in `:root` and reuse the variables:

  ```css
  --green: #1F3D2B;
  --sand: #E8DCC4;
  --purple: #8B5CF6;
  --surface: #F3ECDC;
  ```

- Use sand text on the green header and footer. Use sand as the body background and green as the body text.
- Cards use `--surface`, a 1px green border, and no shadows.
- Primary buttons use green with sand text.
- Use purple only for focus outlines, the active menu item, and large result numbers. Do not use purple for small text.
- Use flat colors only. Do not use gradients, glass effects, shadows, emojis, icon libraries, animations, or transitions.
- Keep a visible keyboard focus outline.
- Use only these spacing variables:

  ```css
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  ```
