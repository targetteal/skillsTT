---
version: alpha
name: Target Teal
description: Editorial, irreverent and high-contrast visual system built around teal, oversized caps and hand-drawn interventions.
colors:
  primary: "#256675"
  secondary: "#4B8C99"
  tertiary: "#7AB5BC"
  neutral: "#F2EFEB"
  surface: "#F2EFEB"
  on-primary: "#F2EFEB"
  ink: "#1E1E1E"
  pink: "#F0A8D0"
  magenta: "#D366AF"
  purple: "#9172CE"
  orange: "#ED6337"
  yellow: "#F2B53B"
  lime: "#D1DA59"
typography:
  display:
    fontFamily: Anton
    fontSize: 4.5rem
    fontWeight: 400
    letterSpacing: "0"
    textTransform: uppercase
  h1:
    fontFamily: Anton
    fontSize: 2.75rem
    fontWeight: 400
    letterSpacing: "0"
    textTransform: uppercase
  h2:
    fontFamily: Anton
    fontSize: 1.75rem
    fontWeight: 400
    letterSpacing: "0"
    textTransform: uppercase
  body:
    fontFamily: Roboto
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: Roboto
    fontSize: 0.75rem
    fontWeight: 700
    letterSpacing: "0.04em"
    textTransform: uppercase
  note:
    fontFamily: Soda Cream
    fontSize: 0.7rem
    fontWeight: 400
    letterSpacing: "0.02em"
    textTransform: uppercase
rounded:
  sm: 0px
  md: 0px
  lg: 0px
spacing:
  xs: 8px
  sm: 16px
  md: 32px
  lg: 64px
  xl: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px 20px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 24px
  highlight:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: 0 4px
    fontFamily: Anton
---

## Overview

Target Teal is a warm editorial system with a clear point of view: teal is the visual focus, offwhite gives the work breathing room, and black ink supplies contrast. The tone is intelligent, human and slightly irreverent. Compose with strong hierarchy, short statements and occasional visual interruptions rather than a dense corporate UI.

This file translates the Target Teal 2024 visual identity guide into implementation tokens for websites, product interfaces, presentations and social assets.

## Colors

### Core palette

- **Teal dark (`#256675`)**: primary brand field, headings on light backgrounds and high-emphasis actions.
- **Teal medium (`#4B8C99`)**: supporting surfaces and large color fields.
- **Teal light (`#7AB5BC`)**: highlights, marker effects and low-emphasis accents.
- **Ink (`#1E1E1E`)**: text, icons and graphic elements. Prefer it over pure black.
- **Offwhite (`#F2EFEB`)**: default page surface and the main contrast partner.

### Product accents

Use the secondary colors only to distinguish products, themes or content categories: pink (`#F0A8D0`), magenta (`#D366AF`), purple (`#9172CE`), orange (`#ED6337`), yellow (`#F2B53B`) and lime (`#D1DA59`). Balance these colors with offwhite; never let an accent compete with the main message.

### Contrast rules

- Teal dark and teal medium pair with offwhite text.
- Teal light pairs with ink text.
- On colored backgrounds, use the logo in ink or offwhite.
- On an ink background, prefer the logo in teal light.
- Avoid ink backgrounds with offwhite body copy as a default pattern; use teal or a teal tint for filled backgrounds instead.
- Never use the full secondary palette at once unless the composition is explicitly a product map or category system.

## Typography

- **Anton** is the expressive display face. Use for titles, short statements, navigation labels and highlighted words. Prefer uppercase. It should feel compact, bold and poster-like.
- **Roboto** is the functional face. Use for paragraphs, captions, metadata, controls and longer labels. Keep line lengths moderate and align text to the left by default.
- **Soda Cream** is a controlled accent. Use sparingly, in uppercase and small sizes for short annotations only.

Do not use Soda Cream for paragraphs. Do not use Roboto for oversized editorial headlines when Anton is available.

## Logo and brand mark

The Target Teal logo has a primary and secondary lockup. Preserve its proportions and clear space; never redraw, stretch, rotate or add effects. The logo's geometric form can also appear as a large cropped frame or outline that visibly “leaks” beyond the composition edge. Use that form as a structural graphic, not as decoration behind every element.

## Graphic language

### Shapes

Use the logo-derived geometric form to frame a topic, create a cropped edge or establish depth in a sparse composition. Keep the rest of the layout quiet so the shape retains its force.

### Icons

Icons are simple, filled silhouettes in ink. Avoid outline-only icons and avoid filling icons with arbitrary colors. Use one visual weight across an icon set.

### Illustrations

Illustrations are manual, expressive and a little surreal. Exaggerated proportions are welcome when they clarify an idea. Keep color fills limited to small details and avoid generic, emotionless characters.

### Highlights and interventions

Use the teal-light “marker” highlight only with Anton, behind a word or short phrase. With Roboto, use a thin freehand line to call out a short excerpt or annotation. Interventions should be punctual; never underline an entire paragraph.

### Newspaper treatment

Short newspaper-like crops can create emphasis. Use Anton for the headline fragment, keep the crop brief and ensure it cannot be mistaken for the primary message or for a long article excerpt.

## Layout and composition

- Prefer left alignment and a clear reading order.
- Build a visible hierarchy: one display statement, one supporting explanation, then metadata or action.
- Use narrow text columns for reading comfort; avoid very long lines.
- Start from an offwhite surface, then introduce a teal field or a single product accent where it helps the story.
- Keep important content inside a safe margin of at least `100px` on a `1920 x 1080` artboard (scale proportionally for other sizes).
- For social slides, keep the logo outside the 1:1 crop when possible so it appears in full-screen viewing without competing with the message.
- Footer metadata may contain a topic or handle plus page number. Keep it small and consistent.

## Components

### Actions

Primary actions use teal dark with offwhite text. Keep buttons rectangular or nearly square, with no decorative gradients, pills or shadows. Use product accents for categorization, not for every action.

### Cards and panels

Cards are flat offwhite surfaces with ink text and generous padding. Prefer composition, type and spacing over borders and elevation. If a card needs distinction, use a teal tint or a thin ink rule.

### Quotes and testimonials

Use a strong Anton heading such as “O QUE DIZEM SOBRE A GENTE”, then arrange short quotes in quiet columns. Keep names and metadata functional in Roboto.

## Do's and Don'ts

- **Do** let teal be the focus of the composition without requiring it to fill every surface.
- **Do** use offwhite as the breathing space around a strong statement.
- **Do** combine bold Anton headlines with readable Roboto detail.
- **Do** allow a geometric mark or hand-drawn line to cross the edge of the layout.
- **Don't** use gradients, glossy effects, excessive rounded corners or generic stock-illustration language.
- **Don't** use the secondary colors as a rainbow decoration.
- **Don't** use outline-only icons or long handwritten annotations.
- **Don't** sacrifice legibility for the editorial treatment: check contrast, crop safety and responsive wrapping at every breakpoint.

## Implementation notes

Load Anton, Roboto and Soda Cream from licensed/local sources when available; provide a sans-serif fallback stack. Keep color values as tokens so product accents can be swapped without changing the core identity. When a medium or light teal is used as a surface, test ink text at the actual rendered size and maintain WCAG AA contrast for body copy and controls.
