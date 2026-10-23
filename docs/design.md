# Design: "Ink & champagne"

Premium and calm, like a good salon: ivory paper, deep ink, a touch of champagne gold. Not a generic SaaS.

## Color (tokens in `src/index.css`)

| Token              | Light     | Dark      | Use                                             |
| ------------------ | --------- | --------- | ----------------------------------------------- |
| `background`       | `#f6f2ea` | `#121110` | Ivory / rich charcoal, not pure white/black     |
| `foreground`       | `#161412` | `#f2ede4` | Deep ink                                        |
| `primary`          | `#161412` | `#f2ede4` | Main buttons: ink (ivory in dark mode)          |
| `gold`             | `#86662f` | `#d2b27a` | Selected day/time, today, current step, details |
| `muted-foreground` | `#6b6358` | `#a79e92` | Secondary text                                  |
| `border`           | `#e2dacb` | 9% ivory  | Hairlines                                       |

Gold is a detail color, never a large surface or body text. Light-mode gold is a deeper champagne
(`#86662f`) because `#9a7642` fails AA. All text pairs pass WCAG AA (4.5:1) in both modes.

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
- **Times**: 30-minute steps, one list per day, grouped Sabah / Öğleden sonra / Akşam. Taken times stay
  visible but disabled: "Dolu" (crossed out) or "Randevunuz var". Days without openings are disabled.
- **Dates**: always through `formatDate` on wall-clock strings, so every page words them the same way.

## Don't

- Gradients, glows, emoji, an icon next to every label.
- Gold on headings, large areas or long text.
- Pure gray (`#737373`-style) neutrals; keep them warm.
- Centered paragraphs and forms.
