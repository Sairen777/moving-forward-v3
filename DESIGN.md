---
name: moving forward
description: A personal field journal rendered as the calm printout of its own generator; an animated ASCII wheat field under a spare monospace manifest.
colors:
  paper: "#ffffff"
  ink: "#3a342b"
  ink-strong: "#27221b"
  ink-muted: "#6b6253"
  hairline: "#2a221629"
  wheat-deep: "#4a2c16"
  wheat-gold: "#d8a848"
  wheat-straw: "#f4da92"
  sky-haze: "#bcc9c8"
typography:
  display:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "clamp(25px, 3.4vw, 36px)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "clamp(16px, 2vw, 19px)"
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: "-0.008em"
  body:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.62
    letterSpacing: "normal"
  prose:
    fontFamily: "'Iowan Old Style', 'Palatino Linotype', Palatino, Charter, Georgia, Cambria, serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.7
    letterSpacing: "normal"
  label:
    fontFamily: "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.22em"
rounded:
  none: "0px"
spacing:
  gap: "16px"
  row: "15px"
  block: "46px"
  column: "720px"
components:
  site-header:
    backgroundColor: "{colors.paper}"
    padding: "12px 24px"
  nav-link:
    textColor: "{colors.ink-muted}"
  post-row:
    textColor: "{colors.ink}"
    padding: "15px 2px"
  post-title:
    textColor: "{colors.ink-strong}"
    typography: "{typography.headline}"
  section-label:
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
---

# Design System: moving forward

## 1. Overview

**Creative North Star: "The Quiet Field"**

moving forward is a personal field journal, and the design treats the page as the calm printout of the same generator that draws its background. A generated ASCII wheat field animates along the bottom of every screen, swaying like wind, and the writing sits above it as a spare monospace manifest: a section label with a dotted leader, then aligned rows of date, title, tag, and a reading-length meter drawn from the field's own glyph ramp. The masthead is modest, not a billboard, so the index of posts comes up almost immediately. The mood is calm, considered, and quiet, with the clear sense that one person built every part of this on purpose.

The "generated" character is carried honestly: a `#`-comment provenance line near the masthead and a footer build stamp both print the field's real parameters (grid size, color count, date) injected at build time. Structure reads as program output: routes in the nav (`/writing`), dotted plotter rules instead of solid borders, a translucent paper wash so the field keeps breathing in the margins. Density stays low; type is one weight, color is soft, motion is ambient.

This system rejects the busy SaaS landing page (hero-metric blocks, dense card grids, stacked calls to action), the generic dev-blog template (default sans, boxed cards, sidebar clutter), loud marketing motion, and corporate gloss. If it could have come from a theme, it has failed. The bespoke animated field plus the manifest framing are what make it unmistakably hand-built.

**Key Characteristics:**
- Animated ASCII wheat field as the only ornament, fixed behind a translucent reading sheet that lets it show through the margins.
- The post index is a generated manifest: aligned `date / title / tag / read` columns, the read column a meter built from the field's glyph ramp.
- Honest provenance: masthead `#`-comment and footer build stamp print real, generator-injected values.
- One monospace family; hierarchy from size and a 400/500 split, never bold. Modest masthead.
- Dotted hairline rules (the plotter/printout texture); zero shadows, zero corner radius.

## 2. Colors

A warm wheat gradient set against near-white paper, with soft warm-charcoal text. Color belongs to the field; the interface chrome stays neutral.

### Primary
- **Dry Wheat** (ramp #4a2c16 deep roast to #f4da92 pale straw, gold midpoint #d8a848): the ten-step warm gradient that paints the ASCII wheat, and the source of the per-row reading meter glyphs. It appears only in the backdrop and the meter, never as a chrome fill.

### Secondary
- **Overcast Haze** (#bcc9c8, family #c4cbc7 to #b6c4c7): the cool gray-teal sky behind the wheat, lifted close to paper so it reads as faint atmosphere.

### Neutral
- **Paper** (#ffffff): body background; the reading sheet is paper at 90% opacity so the field ghosts through.
- **Ink** (#3a342b): body text, a soft warm charcoal, never pure black.
- **Ink Strong** (#27221b): headings, post titles, hovered links.
- **Ink Muted** (#6b6253): dates, tags, labels, the meter, nav. Passes AA (~6:1) on paper.
- **Hairline** (#2a221629, ink at 16% alpha): every dotted rule on the page.

### Named Rules
**The Field-Not-Fill Rule.** Wheat color lives in the backdrop field and the reading meter only. Never use a wheat tone as a chrome accent, fill, or text color.
**The Soft-Ink Rule.** Body is #3a342b, headings are #27221b, secondary text is #6b6253 (AA, not the old near-illegible gray). Pure black (#000) is prohibited.

## 3. Typography

**Chrome / Manifest Font:** one monospace family (ui-monospace / SF Mono system stack) carries all chrome, labels, the manifest, the masthead, and every article heading. **Reading Font:** long-form article body copy is set in a warm old-style serif (Iowan Old Style / Palatino / Charter / Georgia stack) for reading comfort. Monospace stays the voice; the serif is reading-only.

**Character:** a single monospace voice that reads as hand-kept and technical without trying. Hierarchy comes from size and a narrow weight range (400 for nearly everything, 500 for small labels), never from a bold display weight. The masthead is deliberately modest so the manifest leads.

### Hierarchy
- **Display** (400, clamp(25px, 3.4vw, 36px), tracking -0.01em): the hero masthead line, Ink Strong. Intentionally small for a personal blog.
- **Headline** (400, clamp(16px, 2vw, 19px), tracking -0.008em): post titles in the manifest. Underline plus a `>` prompt appear on hover and keyboard focus.
- **Body** (400, 15px, line-height 1.62): the lede and About prose; lines cap near 56 to 60ch.
- **Prose / Reading** (serif, 18px, line-height 1.7): long-form article body copy only; lines cap near 65 to 70ch. Section headings inside the article stay monospace, prefixed with a `## ` source kicker.
- **Label** (500, 11px, tracking 0.22em, uppercase): section headings (`<h2>`) and the column header. Meta (dates 13px, tags 11px, meter 13px) sits in Ink Muted.
- **Meter** (13px, Ink Muted, glyphs from the wheat ramp ` .,:;~=+*`): a per-post reading-length signal; decorative, hidden from screen readers.

### Named Rules
**The Mono-Chrome, Serif-Reading Rule.** Monospace is the system's voice: it carries all chrome, labels, the manifest, the masthead, and every article heading. The only second typeface is the reading serif, in exactly one place: long-form article body copy, where monospace fatigues the eye. Contrast in mono is size plus the 400/500 split, never bold; the serif is for reading, never for display.
**The Reading-Width Rule.** Monospace prose (the lede, About) caps near 56 to 60ch; the serif article body caps near 65 to 70ch (a ~40rem column). The manifest table runs wider inside the 720px column because tabular rows need the room.

## 4. Elevation

The system is flat: no drop shadows, no corner radius. Depth is layering. The fixed wheat field sits at the back; a translucent paper wash floats the reading content over it so the field still breathes in the margins. The wash is not a hard rectangle: it feathers into the field at its left and right edges (a soft horizontal gradient, the same idiom as the top veil) so the field is concealed for reading without a visible cut. Opacity scales with reading intensity: about 90% on the field-forward index, near 96% on an article reading view, where the field also holds still. **Dotted** hairlines (not solid) separate rows and sections, reading as a plotter proof or printout. The header is the one element that lifts, with a backdrop blur over half-opaque paper, not a shadow.

### Named Rules
**The No-Shadow Rule.** Box-shadows are prohibited as decoration. The only lift is the header's backdrop blur.
**The Flat-Edge Rule.** Corner radius is 0 everywhere. No rounded cards, no pills, no softened inputs.
**The Dotted-Rule Rule.** Structural rules are 1px dotted at Ink/16%, never solid. The dotted texture is the printout signature; use it for section leaders, the column underline, row separators, and the footer rule.
**The Paper-Wash Rule.** Wherever sustained reading sits over the field, conceal the field with a soft white wash, never a hard-edged panel. The wash feathers into the field at its margins (a horizontal white-to-transparent gradient, the veil rotated), and on an article reading view the field stops animating so nothing moves in the reader's periphery. A gradient that reveals the background is atmosphere, not elevation; it does not violate the No-Shadow or Flat-Edge rules.

## 5. Components

A reading surface: no buttons, inputs, or cards. The components are the manifest chrome plus the field.

### Navigation
- Fixed top bar; brand `moving forward` (weight 500, Ink Strong) with a small blinking cursor as a quiet live cue (aria-hidden, off under reduced motion). Routes on the right: `/writing`, `/notes`, `/about`, Ink Muted, shifting to Ink Strong on hover and keyboard focus. Dotted bottom rule over a blurred half-opaque paper.

### Manifest post-row (signature)
- A `<ul>` of rows. Each row is a grid: ISO date, title, tag, and the reading meter, with a dotted top rule. No card, no shadow, no stripe.
- Title is Headline weight 400; on hover or focus a hairline underline and a `> ` prompt appear (the prompt space is reserved, so there is no layout shift). Keyboard focus also draws a dotted outline.
- A column header (`date / title / tag / read`) sits above, aria-hidden because the rows are self-describing.

### Section header
- A dotted-leader rule: the section name as an `<h2>` on the left, a dotted leader filling the middle, a small count on the right (`writing ........ 06 entries`). The `<h2>` is styled to match the label role.

### Field-note row
- A denser `<ul>` of date-plus-line rows for short logs; same dotted rule, no tag or meter.

### Footer build stamp
- A quiet line printing real generator output: `regenerated <date> · <cols>x<rows> · <n> colors`, injected at build time. Dotted top rule, transparent so the field shows beneath.

### The Wheat Field (signature)
- A fixed, full-viewport ASCII rendering of a wheat photo, generated by `tools/asciify.py` into a compact byte field and animated in the browser. It sways with a traveling, vertically-sheared horizontal wave; the vertical component is coupled to the bend (a dip proportional to bend squared), so the motion reads as directional wind on an arc, never a circular orbit. Seam-matched so it tiles across any width; the sky stays static, only the wheat moves. It animates on the index, the lively front door; on an article reading view it renders a single static frame so motion never competes with the text. Honors prefers-reduced-motion with the same static frame.

### The Article Reading View (signature)
- A single post on its own page (`post.html`, generated from `tools/post_template.html`). A centered ~40rem column: a monospace masthead (a `/writing / slug` breadcrumb, an ISO-date plus tag plus read-time meta line, the title, a short lede) sits over the field, then the body opens on the feathered paper-wash halo.
- Body copy is the reading serif; section headings are monospace with a `## ` source kicker; block quotes hang a monospace `>`; lists hang a monospace `-`; code sits in a faintly tinted monospace block bounded by dotted top and bottom rules (no card). A dotted-rule footer carries a back link to the index.
- The field holds still here. The point of the view is unhurried reading, so the chrome recedes and only the words ask for attention.

### Named Rules
**The Quiet-and-Hand-Built Rule.** Chrome should feel quiet and hand-built. If a piece draws attention to itself, it is wrong; the writing and the field are the subjects.
**The Generated-Provenance Rule.** Provenance and build stamps print the field's real parameters injected at build time, never hardcoded or invented. The "generated" feel must be honest.
**The Manifest-Index Rule.** Post lists render as aligned generated indices keyed on the ISO date column. Never reintroduce `01 / 02 / 03` numbered section markers; the date is the key.

## 6. Do's and Don'ts

### Do:
- **Do** keep body in Ink (#3a342b), headings in Ink Strong (#27221b), secondary in Ink Muted (#6b6253, AA); bump toward Ink Strong if contrast is ever in doubt.
- **Do** use dotted hairlines (#2a221629) for every rule, and nothing heavier or solid.
- **Do** set chrome, labels, the manifest, and article headings in the one monospace family at weight 400 (500 for small uppercase labels), and keep the masthead modest; reserve the reading serif for long-form article body copy.
- **Do** render post lists as aligned manifests keyed on the ISO date, in semantic `<ul>` lists with `<h2>` section headings.
- **Do** keep the reading sheet translucent and feather its edges, so the field breathes in the margins instead of meeting a hard cut.
- **Do** keep decorative glyphs (the meter, the cursor, the stamps) `aria-hidden`, and give every interactive row a visible `:focus-visible` state matching hover.
- **Do** print real generator values in the provenance and build stamps.
- **Do** honor prefers-reduced-motion with the static field frame.
- **Do** edit `tools/page_template.html` and rebuild with the generator; never hand-edit the generated `index.html`.
- **Do** set long-form article body copy in the reading serif (Iowan Old Style / Palatino / Charter / Georgia), and freeze the field on an article reading view so nothing moves while reading.

### Don't:
- **Don't** build busy SaaS landing pages: no hero-metric template, no dense card grids, no stacked calls to action.
- **Don't** fall into the generic dev-blog template look (the Medium / Dev.to sameness): no default sans, no boxed cards, no sidebar clutter.
- **Don't** add loud, attention-grabbing motion: no scroll-jacking, no parallax spectacle, no entrance animation on every element, no circular/orbiting field motion.
- **Don't** reach for corporate or enterprise gloss: no navy-and-gradient sterility, no stock polish.
- **Don't** ship anything that reads as AI-generated or templated. The site must read as hand-built.
- **Don't** use pure black (#000), drop shadows, corner radius, solid heavy borders, or a bold display weight. The reading serif is the only permitted second typeface, and only in long-form article body copy.
- **Don't** use a wheat tone as a chrome accent or text color (the field and the meter own those), and don't reintroduce `01 / 02 / 03` numbered markers.
- **Don't** set article headings, the title, or the masthead in serif, and never add an italic display serif or drop caps: that tips the page into the saturated editorial-typographic lane. Monospace headings over serif body is the rule; the reading serif stays body-only.
