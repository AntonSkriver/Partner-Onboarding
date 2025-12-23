# Logo Processing SOP for Partner Ribbons

## Overview
When adding partner logos to colored ribbon banners, follow this process to ensure logos display correctly.

## Process

### 1. Get the actual logo from user
- Don't try to recreate logos manually with SVG
- Use the real logo image provided by the user

### 2. Remove background (if needed)
If the logo has a white/colored background, use Python/Pillow to make it transparent:

```bash
pip3 install pillow

python3 << 'EOF'
from PIL import Image

# Load the image
img = Image.open("input-logo.jpg").convert("RGBA")
data = img.getdata()

# Remove white/light background (make transparent)
new_data = []
for item in data:
    # If pixel is whitish (R, G, B all > 235), make it transparent
    if item[0] > 235 and item[1] > 235 and item[2] > 235:
        new_data.append((255, 255, 255, 0))
    else:
        new_data.append(item)

img.putdata(new_data)
img.save("output-logo.png", "PNG")
EOF
```

### 3. Save to public folder
Save the processed PNG to `/public/partners/` with a descriptive name:
- `save-the-children-logo.png`
- `unicef-emblem.svg`

### 4. Apply CSS filter for colored ribbons
Use `brightness-0 invert` to turn colored logos white for display on colored ribbon backgrounds:

```tsx
<Image
  src="/partners/logo.png"
  alt="Partner"
  width={24}
  height={24}
  className="drop-shadow-sm brightness-0 invert"
/>
```

## Current Partner Logos

| Partner | File | Filter |
|---------|------|--------|
| UNICEF | `/partners/unicef-logo.png` | `brightness-0 invert` |
| Save the Children | `/partners/save-the-children-logo.png` | `brightness-0 invert` |

## Ribbon Colors

| Partner | Gradient | Shadow Color |
|---------|----------|--------------|
| UNICEF | `from-[#00AEEF] via-[#29B6F6] to-[#00AEEF]` | `#0277BD` |
| Save the Children | `from-[#E31B23] via-[#FF3B3B] to-[#E31B23]` | `#B71C1C` |
