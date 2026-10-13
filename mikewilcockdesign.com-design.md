---
version: alpha
name: Mike Wilcock Design
description: A stark, motion-forward portfolio system with oversized editorial typography and a cool electric accent.
colors:
  primary: "#7fa8ff"
  secondary: "#edeae4"
  tertiary: "#8b8b8b"
  neutral: "#111010"
  surface: "#1a1919"
  on-surface: "#edeae4"
  muted: "#9a968f"
  border: "#374151"
  accent: "#7fa8ff"
  error: "#ff6b6b"
typography:
  headline-display:
    fontFamily: Archivo
    fontSize: 96px
    fontWeight: 400
    lineHeight: 0.92
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Archivo
    fontSize: 72px
    fontWeight: 400
    lineHeight: 0.94
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Archivo
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Archivo
    fontSize: 20px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  body-lg:
    fontFamily: Archivo
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.8
    letterSpacing: 0px
  body-md:
    fontFamily: Archivo
    fontSize: 16px
    fontWeight: 400
    lineHeight: 30.8px
    letterSpacing: 0px
  body-sm:
    fontFamily: Archivo
    fontSize: 12px
    fontWeight: 400
    lineHeight: 18px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Geist Mono
    fontSize: 19px
    fontWeight: 400
    lineHeight: 23px
    letterSpacing: 0.72px
  label-md:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Geist Mono
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.1em
  nav-link:
    fontFamily: Archivo
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.08em
  caption:
    fontFamily: Geist Mono
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.12em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 28px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 40px
  lg: 54px
  xl: 152px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 10px 16px
    height: 54px
    width: 151px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: 10px 16px
    height: 54px
    width: 151px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.none}"
    padding: 0px
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 12px 16px
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: 6px 12px
---
# Mike Wilcock Design

## Overview
This system feels like an immersive, high-contrast portfolio built for a creative developer who wants the work to feel bold, modern, and slightly rebellious. The tone is professional but expressive: minimal UI chrome, huge editorial headlines, and a restrained palette keep attention on motion, typography, and craft. Spacing is generous and deliberate, with a sense of theatrical scale rather than dense information architecture.

## Colors
- **Primary (#7fa8ff):** A cool electric blue used for the main CTA, tiny cursor-like accents, and moments that need immediate visual pull.
- **Secondary (#edeae4):** A warm off-white used for the main text and oversized hero type, giving the dark interface a soft but luminous contrast.
- **Tertiary (#8b8b8b):** A muted mid-gray for subtle metadata, timestamps, and supporting navigation details.
- **Neutral (#111010):** The near-black foundation of the interface; it creates the cinematic, studio-like backdrop.
- **Surface (#1a1919):** A slightly lifted charcoal surface for layered UI states or panels when needed.
- **On-surface (#edeae4):** The primary text color on dark surfaces, keeping legibility high without harsh pure white.
- **Border (#374151):** A restrained border tone for outlined controls and card edges, intentionally understated.
- **Muted (#9a968f):** An optional softer gray for captions, helper text, or de-emphasized labels.
- **Error (#ff6b6b):** A clear alert color reserved for destructive states or validation, and kept visually separate from the core brand accent.

## Typography
Archivo is the main voice for the site: clean, confident, and flexible enough for both body copy and large editorial headlines. Geist Mono provides the system-like, technical layer used for navigation, metadata, and button labels; its spacing and measured rhythm reinforce the design’s contemporary developer aesthetic. Uppercase treatment and wider letter spacing are common in small labels, nav items, and timestamps, which helps them sit quietly on the page while still feeling precise.

Use the largest headline styles for hero statements and section openers, with strong negative tracking for a compact, poster-like presence. Body text stays comfortable and readable, with a generous line height that suits long-form intro copy and case-study summaries. Labels should remain small, crisp, and often mono-based to preserve the site’s disciplined, utilitarian accent.

## Layout
The layout is expansive and presentation-first, with large empty fields of dark space surrounding the content. The hero composition is anchored by oversized type and small utility text aligned to the top edges, creating a strong grid contrast between micro and macro elements. Spacing follows a loose but consistent rhythm based on 8px increments, then quickly steps up into larger structural gaps for major sections and hero breathing room.

Sections should favor wide margins, ample vertical separation, and asymmetrical placement that feels intentional rather than centered. Cards and smaller content blocks should stay compact, with 16px internal padding and rounded geometry, while whole-page composition should remain fluid and spacious. The system reads best when content is allowed to spread horizontally and vertically instead of stacking too tightly.

## Elevation & Depth
The interface is intentionally flat. There are no meaningful shadows; hierarchy comes from contrast, scale, spacing, and subtle border delineation instead of depth effects. This makes the typography and motion feel more prominent and keeps the page visually clean.

Use tonal layering sparingly through slightly lighter surfaces or thin borders when a container needs separation. The dark background, off-white text, and blue accent already provide enough separation for most states without needing extra elevation.

## Shapes
The shape language is minimal and controlled, with a strong preference for pills on actions and restrained rounding on containers. Primary and secondary buttons use fully rounded ends for a soft counterpoint to the otherwise sharp, editorial composition. Cards use a modest 8px radius to stay quiet and geometric.

Overall, the feel is architectural but approachable: crisp edges, smooth buttons, and no decorative curvature beyond what is needed for usability. Avoid ornate or highly expressive corner treatments.

## Components
Buttons are the clearest interactive element in the system. `button-primary` is the main call to action: blue background, dark text, mono label styling, pill shape, and a 54px height that gives it presence without bulk. `button-secondary` should stay transparent with a subtle border and the same sizing as primary, so it reads as a quieter alternative rather than a different hierarchy. `button-tertiary` should be text-only, compact, and used for inline actions or links where a button box would feel too heavy.

Buttons should feel precise and stable: no shadows, no dramatic hover motion, and only subtle contrast shifts or border changes on interaction. Keep padding compact but balanced so labels stay centered and the control retains its pill silhouette.

Cards are understated containers with a dark surface, thin border, 8px radius, and 16px padding. They should support content rather than compete with it, so keep internal hierarchy simple and avoid decorative headers or loud backgrounds. Inputs should follow the same quiet logic: dark surface, clear text, moderate rounding, and enough padding to feel touch-friendly.

Chips and small tags should be mono-based, uppercase-leaning, and compact, with full rounding to echo the button language at a smaller scale. Links in the navigation and body can be bare or lightly underlined, but they should remain visually subordinate to the hero and CTA. Any list or utility label should prefer the muted gray and mono styling so it blends into the system’s technical, editorial tone.

## Do's and Don'ts
- Do keep hero typography oversized and high-contrast.
- Do use Archivo for expressive content and Geist Mono for utility, nav, and labels.
- Do preserve the flat, shadowless look; rely on scale and spacing for emphasis.
- Do use the blue accent sparingly so it stays special.
- Don't introduce heavy shadows, gradients, or glossy effects.
- Don't crowd the layout with dense panels or tight text blocks.
- Don't replace pill buttons with square corners for primary actions.
- Don't use bright colors outside the established accent and error roles.