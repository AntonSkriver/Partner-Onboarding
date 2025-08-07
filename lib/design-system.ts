/**
 * Class2Class Design System
 * 
 * This file contains all the design tokens, colors, and styling guidelines
 * for the Class2Class platform to ensure consistency across all pages.
 */

// ============================================================================
// BRAND COLORS
// ============================================================================

export const colors = {
  // Primary Brand Color
  primary: '#7F56D9', // Main purple color used throughout the platform
  
  // Background Colors
  background: {
    primary: '#FFFFFF', // Main white background
    secondary: '#DFCFFF', // Light purple background for gradients
    gradient: 'from-[#DFCFFF] via-white to-[#DFCFFF]', // Hero section gradient
  },
  
  // Text Colors
  text: {
    primary: '#111827', // Main text color (gray-900)
    secondary: '#6B7280', // Secondary text color (gray-600)
    white: '#FFFFFF', // White text
  },
  
  // Button Colors
  button: {
    primary: '#7F56D9', // Primary button background
    primaryHover: '#7C3AED', // Primary button hover (purple-700)
    outline: '#7F56D9', // Outline button border and text
    outlineHover: '#F3F4F6', // Outline button hover background (gray-50)
    blue: '#2563EB', // Blue for Partners button (blue-600)
    blueHover: '#DBEAFE', // Blue button hover (blue-50)
  },
  
  // Card Colors
  card: {
    background: '#FFFFFF',
    border: 'transparent', // No border, using shadow instead
    shadow: 'shadow-md', // Medium shadow for cards
  },
  
  // Icon Colors
  icon: {
    primary: '#7F56D9', // Purple icons
    white: '#FFFFFF', // White icons on purple backgrounds
    secondary: '#6B7280', // Gray icons
  }
} as const;

// ============================================================================
// LOGO & BRANDING
// ============================================================================

export const logo = {
  // Logo file path
  src: '/isotipo.png',
  alt: 'Class2Class Logo',
  
  // Logo sizes
  sizes: {
    header: { width: 40, height: 40, className: 'w-10 h-10' },
    footer: { width: 32, height: 32, className: 'w-8 h-8' },
  },
  
  // Logo description
  description: 'Square logo with two stylized "C" shapes connected by a diamond, on purple background'
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Headings
  h1: 'text-4xl md:text-6xl font-bold',
  h2: 'text-3xl md:text-4xl font-bold',
  h3: 'text-xl font-semibold',
  
  // Body text
  body: {
    large: 'text-xl md:text-2xl',
    medium: 'text-lg md:text-xl',
    small: 'text-sm',
  },
  
  // Colors
  colors: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    white: 'text-white',
    purple: 'text-[#7F56D9]',
  }
} as const;

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttons = {
  // Primary button (Sign up, Become a Partner, etc.)
  primary: {
    base: 'bg-[#7F56D9] hover:bg-purple-700 text-white',
    large: 'bg-[#7F56D9] hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold',
  },
  
  // Outline button (Log in, Learn more, etc.)
  outline: {
    base: 'border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50',
    large: 'border-[#7F56D9] text-[#7F56D9] hover:bg-purple-50 px-8 py-3 text-lg font-semibold',
  },
  
  // Blue button (Partners)
  blue: {
    base: 'border-blue-600 text-blue-600 hover:bg-blue-50',
  },
  
  // Ghost button (navigation items)
  ghost: {
    base: 'text-gray-700 hover:text-gray-900',
  }
} as const;

// ============================================================================
// LAYOUT & SPACING
// ============================================================================

export const layout = {
  // Container
  container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  
  // Section padding
  section: 'py-20',
  
  // Header
  header: {
    background: 'bg-white',
    border: 'border-b border-gray-200',
    padding: 'py-4',
  },
  
  // Navigation
  nav: {
    spacing: 'space-x-8',
    buttonSpacing: 'space-x-4',
  }
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const cards = {
  // Feature cards
  feature: {
    base: 'text-center hover:shadow-lg transition-shadow border-0 shadow-md',
    icon: {
      background: 'bg-[#7F56D9]',
      size: 'w-16 h-16',
      iconColor: 'text-white',
    }
  },
  
  // Content cards
  content: {
    base: 'hover:shadow-lg transition-shadow border-0 shadow-md',
  }
} as const;

// ============================================================================
// GRADIENTS
// ============================================================================

export const gradients = {
  // Hero section gradient
  hero: 'bg-gradient-to-br from-[#DFCFFF] via-white to-[#DFCFFF]',
  
  // Call to action gradient
  cta: 'bg-gradient-to-r from-[#7F56D9] to-indigo-600',
} as const;

// ============================================================================
// ICONS
// ============================================================================

export const icons = {
  // Icon sizes
  sizes: {
    small: 'h-4 w-4',
    medium: 'h-6 w-6',
    large: 'h-8 w-8',
  },
  
  // Icon colors
  colors: {
    primary: 'text-[#7F56D9]',
    white: 'text-white',
    gray: 'text-gray-600',
  }
} as const;

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
Example usage in components:

import { colors, logo, buttons, layout } from '@/lib/design-system'

// Using colors
<div className={`bg-[${colors.primary}]`}>

// Using logo
<Image 
  src={logo.src} 
  alt={logo.alt} 
  width={logo.sizes.header.width} 
  height={logo.sizes.header.height}
  className={logo.sizes.header.className}
/>

// Using buttons
<Button className={buttons.primary.large}>
  Sign up for free
</Button>

// Using layout
<div className={layout.container}>
  <section className={layout.section}>
    ...
  </section>
</div>
*/ 