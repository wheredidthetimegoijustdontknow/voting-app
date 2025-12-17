This image contains several monochromatic and analogous gradients that are excellent for UI design. 

The color themes should integrate into our already existing color scheme. Each individual poll should be assigned a random color from the color theme, depending on if the user has light or dark theme currently enabled. Each color should contain a reference ID, i.e. l_01, l_02, d_01, d_02, etc. that way the poll colors can consistently and seamless change back and forth between light and dark themes. 

To ensure a cohesive look, the **Dark Theme** focuses on deep saturations and high-contrast accents, while the **Light Theme** uses softer tints and airy backgrounds.

---

## 🌑 Dark Theme (Midnight & Neon)

This theme uses the deepest shades from the image as backgrounds, with the brightest "top" colors as vibrant accents.

| Element | Hex Code | Description |
| --- | --- | --- |
| **Background (Deep)** | `#1A1B2E` | Deep Navy/Violet (from the 2nd & 6th pillars) |
| **Surface (Low)** | `#242842` | Slightly lighter for cards/sections |
| **Primary Accent** | `#00F5D4` | Bright Teal (from the 7th pillar) |
| **Secondary Accent** | `#9B5DE5` | Electric Purple (from the 2nd pillar) |
| **Success** | `#00BB7E` | Deep Emerald (bottom of 7th pillar) |
| **Warning** | `#F15BB5` | Hot Pink (from the 4th pillar) |
| **Error** | `#9B1B30` | Deep Crimson (bottom of 9th pillar) |
| **Text (Primary)** | `#E0E1DD` | Soft White |
| **Text (Secondary)** | `#94A3B8` | Muted Blue-Grey |
| **Border/Divider** | `#334155` | Subtle separation |

---

## ☀️ Light Theme (Pastel & Professional)

This theme flips the hierarchy, using the light "top" circles for soft backgrounds and the dark "bottom" circles for crisp typography and buttons.

| Element | Hex Code | Description |
| --- | --- | --- |
| **Background (Main)** | `#F8FAFC` | Near-white with a hint of cool blue |
| **Surface (Paper)** | `#FFFFFF` | Pure white for cards |
| **Primary Accent** | `#0077B6` | Classic Blue (bottom of 6th pillar) |
| **Secondary Accent** | `#FF9E00` | Warm Orange (top of 9th pillar) |
| **Success** | `#C7F9CC` | Light Mint (top of 7th pillar) |
| **Warning** | `#FEE440` | Soft Yellow/Gold |
| **Error** | `#F08080` | Light Coral (top of 8th pillar) |
| **Text (Primary)** | `#0F172A` | Deep Slate (bottom of 5th pillar) |
| **Text (Secondary)** | `#64748B` | Medium Grey |
| **Border/Divider** | `#E2E8F0` | Light grey stroke |

---

### Implementation Tips

* **Contrast Ratios:** For accessibility, always use the **Primary Text** colors from each table against their respective **Backgrounds**.
* **Gradients:** You can recreate the look of the image by using CSS linear gradients. For example, a button could go from the "Top" color of a pillar to the "Bottom" color.
* **Shadows:** In the Dark Theme, use shadows with a slight tint of the Primary Accent (`#00F5D4`) at very low opacity (5-10%) to create a "glow" effect.

Would you like me to generate a CSS stylesheet or a React component using these specific color variables?