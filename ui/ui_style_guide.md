Below is a **practical UI/UX style guide** distilled from the provided screen, written so an **agentic coder (or design-to-code system)** can reliably reproduce and extend the interface.

---

# Hive Admin Dashboard – UI Style Guide

## 1. Design Principles

* **Clarity first**: Information hierarchy is obvious at a glance
* **Soft enterprise aesthetic**: Friendly but professional
* **Low cognitive load**: Minimal colors, generous spacing
* **Consistency over creativity**: Predictable layouts and components

---

## 2. Layout System

### Overall Structure

* **Two-column layout**

  * **Left sidebar**: Fixed navigation
  * **Main content area**: Scrollable, card-based

### Grid & Spacing

* Base spacing unit: **8px**
* Common paddings:

  * Page padding: `24–32px`
  * Card padding: `20–24px`
  * Section gaps: `24–32px`
* Max content width: ~`1200–1280px`

---

## 3. Color System

### Primary Palette

| Purpose              | Color (Approx)       |
| -------------------- | -------------------- |
| Primary Action (CTA) | Deep Blue `#1F4FD8`  |
| Primary Accent       | Hive Blue `#2F6BFF`  |
| Background           | Off-white `#F8FAFC`  |
| Surface / Cards      | White `#FFFFFF`      |
| Border / Divider     | Light Gray `#E5E7EB` |

### Semantic Colors

| Meaning    | Color           |
| ---------- | --------------- |
| Success    | Green `#22C55E` |
| Warning    | Amber `#F59E0B` |
| Info       | Blue `#3B82F6`  |
| Muted Text | Gray `#6B7280`  |

### Usage Rules

* **Never mix more than 1 semantic color per card**
* Colored numbers/icons > colored backgrounds
* Background tints at ~5–10% opacity only

---

## 4. Typography

### Font

* **Primary**: Inter / SF Pro / system-ui
* Sans-serif only

### Type Scale

| Element       | Size    | Weight |
| ------------- | ------- | ------ |
| Page Title    | 24–28px | 600    |
| Section Title | 18–20px | 600    |
| Card Label    | 14px    | 500    |
| Body Text     | 14–15px | 400    |
| Meta / Helper | 12–13px | 400    |

### Text Rules

* Titles: Sentence case
* Labels: Title Case
* No ALL CAPS
* Line height: `1.4–1.6`

---

## 5. Navigation (Sidebar)

### Sidebar Specs

* Width: `240–260px`
* Background: White
* Active item:

  * Light blue background
  * Left icon + label highlighted

### Navigation Items

* Icon + text
* Icons: Outline style, 20–24px
* Vertical spacing: `12–16px`

### Logout

* Visually separated
* Red accent for icon/text only

---

## 6. Components

### Buttons

#### Primary Button

* Background: Primary Blue
* Text: White
* Radius: `8px`
* Height: `40–44px`
* Used for: **Launch Poll**, major actions

#### Secondary Button

* Light gray / blue-tinted background
* Blue text
* Used for: **Preview**, **Copy**

#### States

* Hover: Slight darken (`+5%`)
* Disabled: Opacity `0.5`, no shadow

---

### Cards

* Background: White
* Border: `1px solid #E5E7EB`
* Radius: `12px`
* Shadow: Very subtle or none

#### Metric Cards (Stats)

* Large number (24–28px)
* Label below number
* Colored border or icon (not full background)

---

### Input / URL Fields

* Height: `40–44px`
* Border: Light gray
* Radius: `8px`
* Read-only fields look identical but non-editable

---

### Badges

* Rounded pill
* Small text (12px)
* Light background tint
* Example: **“Under Construction”** (amber)

---

## 7. Icons

* Outline icons only
* Consistent stroke width
* Size: `20–24px`
* Icons never dominate text

---

## 8. Page-Specific Patterns

### Header Area

* Page title on left
* Primary/secondary actions on right
* Inline metadata (dates) below header

### Overview Metrics

* Horizontally aligned stat cards
* Equal width
* Responsive stacking on small screens

### URL Sections

* Each URL in its own card
* Clear label + helper text
* Copy button aligned right

---

## 9. Interaction & State Logic

### Editable Fields

* Pencil icon indicates editability
* Inline edit preferred over modals

### Status Indicators

* Shown as badges near titles
* Never rely on color alone—always text

---

## 10. Accessibility Guidelines

* Minimum contrast: WCAG AA
* Click targets ≥ 40px height
* Keyboard navigable
* Clear focus states (outline or glow)

---

## 11. Agentic Coding Rules (Important)

An agentic coder should:

1. **Reuse components** before creating new ones
2. **Infer variants** (primary, secondary, success) from context
3. **Preserve spacing rhythm** (8px system)
4. **Avoid visual novelty** unless explicitly requested
5. **Default to cards** for grouped content
6. **Prefer composition over customization**

---

If you want, I can:

* Convert this into **design tokens (JSON / Tailwind / CSS vars)**
* Generate a **component library spec (React / Vue)**
* Create **prompt instructions specifically for an autonomous UI agent**
