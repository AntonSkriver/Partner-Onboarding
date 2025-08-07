# Partner-Onboarding-1

A Next.js application for Class2Class partner onboarding platform.

## 🎨 Design System Quick Reference

### Brand Colors
- **Primary Purple**: `#7F56D9`
- **Background Purple**: `#DFCFFF`
- **Text Primary**: `#111827` (gray-900)
- **Text Secondary**: `#6B7280` (gray-600)

### Logo
- **File**: `/public/isotipo.png`
- **Header Size**: 40x40px (`w-10 h-10`)
- **Footer Size**: 32x32px (`w-8 h-8`)

### Button Styles
```tsx
// Primary Button
className="bg-[#7F56D9] hover:bg-purple-700 text-white"

// Outline Button  
className="border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50"

// Blue Button (Partners)
className="border-blue-600 text-blue-600 hover:bg-blue-50"
```

### Background Gradients
```tsx
// Hero Section
className="bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF]"

// Call to Action
className="bg-gradient-to-r from-[#7F56D9] to-indigo-600"
```

### Card Styles
```tsx
// Feature Cards
className="text-center hover:shadow-lg transition-shadow border-0 shadow-md"

// Icon Background
className="bg-[#7F56D9] rounded-full flex items-center justify-center"
```

## 📁 Project Structure

```
Partner-Onboarding-1/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── partners/          # Partners page
│   ├── sign-in/           # Sign in page
│   ├── school/            # School onboarding
│   └── partner/           # Partner onboarding
├── components/            # Reusable components
├── lib/                   # Utilities and design system
│   └── design-system.ts   # Complete design tokens
└── public/               # Static assets
    └── isotipo.png       # Class2Class logo
```

## 🚀 Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Key Features

- **Consistent Branding**: All pages use the same colors, logo, and styling
- **Responsive Design**: Works on all device sizes
- **Modern UI**: Clean, professional interface
- **Type Safety**: Full TypeScript support

## 📝 Design System

For complete design tokens and styling guidelines, see `lib/design-system.ts`.

## 🤝 Contributing

When adding new pages or components:
1. Use the design system tokens from `lib/design-system.ts`
2. Maintain consistent branding and colors
3. Follow the established layout patterns
