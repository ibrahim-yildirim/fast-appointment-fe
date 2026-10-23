# Design: "Mahalle"

Warm, crafted, local: like a good neighborhood salon. Not a generic SaaS.

## Color (tokens in `src/index.css`)

| Token              | Light     | Dark      | Use                                   |
| ------------------ | --------- | --------- | ------------------------------------- |
| `background`       | `#faf7f2` | `#1a1714` | Warm paper, not pure white/black      |
| `foreground`       | `#2b2420` | `#f3ede4` | Espresso ink                          |
| `primary`          | `#b4532a` | `#dd7d50` | Henna accent: main action + selection |
| `muted-foreground` | `#6f6359` | `#b0a396` | Secondary text                        |
| `border`           | `#e4d9cb` | 10% ink   | Hairlines                             |

The accent has one job: the main action and the selected state. Everything else is neutral.
All text pairs pass WCAG AA (4.5:1) in both modes.

## Type

- Headings: **Fraunces** (`font-heading`), semibold, `tracking-tight`. Page titles `text-3xl sm:text-4xl`.
- UI and body: **Geist** (`font-sans`).
- Times, dates, prices: `tabular-nums`, heavier weight than the text around them.
- Prices drop `,00` when there are no kuruş (`formatMoney`).

## Shape

- Radius `0.5rem`. Flat surfaces with hairline dividers; no stacks of cards.
- Use a bordered surface only for real objects (calendar, booking summary).
- Customer main actions use `Button size="xl"` (44px).

## Patterns

- **Service list = salon price board**: name, dotted leader, price; the whole row is the link.
- **Booking steps**: `BookingSteps` (Hizmet → Saat → Onay).
- **Booking summary**: `BookingSummary` label/value rows; time and price emphasized.
- **Times**: one list per day, grouped Sabah / Öğleden sonra / Akşam. Days without openings are disabled.
- **Dates**: always through `formatDate` on wall-clock strings, so every page words them the same way.

## Don't

- Gradients, glows, emoji, an icon next to every label.
- Accent color on headings, borders or decoration.
- Pure gray (`#737373`-style) neutrals; keep them warm.
- Centered paragraphs and forms.
