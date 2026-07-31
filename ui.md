# Follow-up Prompt: Restyle UI to a Notion-like Look

Paste this into your agent as a follow-up. All backend logic, database schema, routes, and data fetching are already built and working — **do not touch functionality, only presentation**. This is a CSS/layout/typography pass, not a feature pass.

---

## What's wrong with the current UI
It reads as generic "AI-generated dashboard" — glassmorphism, glowing accent colors, heavy shadows, gradients, oversized stat cards. It needs to feel calm, minimal, and text-first instead, like a workspace tool, not a marketing landing page.

## Target aesthetic: Notion-like
Not a literal clone — take the *principles*, not the exact UI:
- **Light, neutral canvas.** Off-white background (`#ffffff` or `#fbfbfa`), not dark-mode-first. Text in near-black (`#37352f`-style dark gray, not pure black).
- **Flat, not layered.** Remove glassmorphism, drop shadows, gradients, glow effects. Use thin 1px borders (`border-gray-200`) to separate sections instead of shadows.
- **Typography does the work.** A clean system sans-serif stack (`-apple-system, "Segoe UI", Inter, sans-serif`). Rely on font-weight and size hierarchy, not color, to show importance. Numbers don't need a special monospace/display font — keep them in the same family as body text, just bolder.
- **Restrained color.** One quiet accent color used sparingly (status/confidence indicators only) — small colored dots or subtle background tints, not full-saturation buttons and gradients everywhere. Grayscale should carry most of the UI.
- **Left sidebar navigation**, Notion-style: subject list as a collapsible tree (Dashboard / Syllabus / Analytics, then subjects nested under Syllabus), persistent, narrow, with hover states rather than active glowing pills.
- **Content as a document, not cards-everywhere.** Where the current build uses big padded stat cards for everything, prefer simpler inline layouts — a topic row should look like a database row (Notion table view): compact, left-aligned, hover-to-reveal actions, no card border/shadow per row.
- **Checkboxes and status should look like real checkboxes/tags**, not gradient pills — small rounded status tags with muted background tints (e.g. gray for not started, soft blue for in progress, soft green for done).
- **Minimal, purposeful motion.** Keep only subtle transitions (fade/slide 150-200ms) on state changes. Remove any bouncy/springy or attention-grabbing animation.
- **Tables for MCQ logs and topic lists** should look like Notion database views: clean grid, subtle row dividers, hover row highlight, no zebra striping, no heavy borders.
- **Generous whitespace and line-height**, but not oversized empty stat cards — density should feel like a productivity tool you'd use daily, not a showcase dashboard.

## Specifically change
1. Replace the dashboard's big glowing stat cards with a simpler stat row — plain numbers with small labels, separated by thin dividers, no card backgrounds.
2. Replace the accent gradient/glow color scheme with a single muted accent (pick one quiet color — e.g. a soft indigo or slate blue) used only for the current active nav item and status tags.
3. Rebuild the syllabus tracker as a table/list view (like a Notion database) instead of accordion cards with heavy padding and shadows.
4. Simplify the confidence rating UI — small filled/unfilled dots instead of star icons or colored bars.
5. Move subject navigation into a persistent left sidebar instead of top-level accordions on the page itself.
6. Strip all box-shadows except where truly needed for a dropdown/modal, and even those should be subtle (`shadow-sm`, not `shadow-xl` or `shadow-2xl`).
7. Reduce border-radius across the board — Notion uses small radii (~4-6px), not heavily rounded (`rounded-2xl`/`rounded-3xl`) cards.

## What to leave alone
- All data fetching, Supabase queries, and mutations
- Routing structure
- Component logic/state management
- The chart data itself (only restyle chart colors/lines to match the new muted palette, don't change what's plotted)

Go through page by page — Dashboard, Syllabus Tracker, Topic Detail, Analytics — and restyle each without changing what data is shown or how it behaves.