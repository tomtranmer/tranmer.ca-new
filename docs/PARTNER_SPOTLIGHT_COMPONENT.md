# PartnerSpotlight Component Documentation

The `PartnerSpotlight` component is a reusable, customizable partner/advertiser banner that can be used across the website for featuring partners, sponsors, or featured advertisers.

## Features

- ✅ Fully customizable color schemes
- ✅ Two layout modes: top icon or left icon
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Hover animations and transitions
- ✅ Configurable badges and labels
- ✅ External link handling with icons
- ✅ TypeScript support with full type safety

## Basic Usage

```tsx
import { PartnerSpotlight } from "@/components/PartnerSpotlight";

export function YourPage() {
  return (
    <PartnerSpotlight
      icon="🎨"
      name="Bradshaw Design"
      description="Premium web design and branding services"
      ctaUrl="https://bradshawdesign.ca"
    />
  );
}
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `name` | `string` | Partner/advertiser name |
| `description` | `string` | Brief description of services/products |
| `ctaUrl` | `string` | URL for the call-to-action button |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode \| string` | `undefined` | Emoji, SVG, or React component for partner icon |
| `ctaText` | `string` | `"Learn more"` | Text for the CTA button |
| `badge` | `string` | `"Partner Spotlight"` | Label above partner name |
| `subtitle` | `string` | `undefined` | Optional subtitle under partner name |
| `iconPosition` | `"top" \| "left"` | `"top"` | Position of icon relative to content |
| `openInNewTab` | `boolean` | `true` | Open CTA link in new tab |
| `colorScheme` | `ColorSchemeObject` | Blue theme | Custom color configuration |
| `className` | `string` | `""` | Additional CSS classes for the container |

### Color Scheme Object

```typescript
interface ColorScheme {
  light: string;        // e.g., "bg-blue-50"
  dark: string;         // e.g., "dark:bg-blue-950"
  border: string;       // e.g., "border-blue-200"
  darkBorder: string;   // e.g., "dark:border-blue-800"
  accent: string;       // e.g., "text-blue-600"
  darkAccent: string;   // e.g., "dark:text-blue-400"
}
```

## Examples

### Example 1: Bradshaw Design (Current Implementation)

```tsx
<PartnerSpotlight
  icon="🎨"
  name="Bradshaw Design"
  subtitle="Premium Web Design & Branding"
  description="Premium web design and branding services to complement your hosting. Build a beautiful online presence."
  ctaText="Visit Bradshaw Design"
  ctaUrl="https://bradshawdesign.ca"
  badge="Featured Partner"
  colorScheme={{
    light: "bg-gradient-to-br from-purple-50 to-indigo-50",
    dark: "dark:bg-gradient-to-br dark:from-purple-950 dark:to-indigo-950",
    border: "border-purple-200",
    darkBorder: "dark:border-purple-800",
    accent: "text-purple-600",
    darkAccent: "dark:text-purple-400",
  }}
/>
```

### Example 2: Payment Processor (Stripe)

```tsx
<PartnerSpotlight
  icon="💳"
  name="Stripe"
  description="Secure payment processing and invoicing solutions for your business."
  ctaText="Learn About Stripe Integration"
  ctaUrl="https://stripe.com"
  badge="Payment Partner"
  iconPosition="left"
  colorScheme={{
    light: "bg-gradient-to-br from-blue-50 to-cyan-50",
    dark: "dark:bg-gradient-to-br dark:from-blue-950 dark:to-cyan-950",
    border: "border-blue-200",
    darkBorder: "dark:border-blue-800",
    accent: "text-blue-600",
    darkAccent: "dark:text-blue-400",
  }}
/>
```

### Example 3: Analytics Tool (Mixpanel)

```tsx
<PartnerSpotlight
  icon="📊"
  name="Mixpanel"
  subtitle="Customer Analytics"
  description="Understand user behavior with advanced analytics and insights."
  ctaText="Explore Mixpanel"
  ctaUrl="https://mixpanel.com"
  badge="Analytics Partner"
  colorScheme={{
    light: "bg-gradient-to-br from-amber-50 to-orange-50",
    dark: "dark:bg-gradient-to-br dark:from-amber-950 dark:to-orange-950",
    border: "border-amber-200",
    darkBorder: "dark:border-amber-800",
    accent: "text-amber-600",
    darkAccent: "dark:text-amber-400",
  }}
/>
```

### Example 4: Using with Custom SVG Logo

```tsx
<PartnerSpotlight
  icon={<YourSVGLogo className="w-12 h-12" />}
  name="Partner Company"
  description="Partner company description here"
  ctaUrl="https://partner.com"
  iconPosition="left"
  colorScheme={{
    light: "bg-gray-50",
    dark: "dark:bg-gray-900",
    border: "border-gray-200",
    darkBorder: "dark:border-gray-700",
    accent: "text-gray-700",
    darkAccent: "dark:text-gray-300",
  }}
/>
```

## Color Scheme Presets

### Blue Theme (Default)
```tsx
{
  light: "bg-blue-50",
  dark: "dark:bg-blue-950",
  border: "border-blue-200",
  darkBorder: "dark:border-blue-800",
  accent: "text-blue-600",
  darkAccent: "dark:text-blue-400",
}
```

### Purple Theme
```tsx
{
  light: "bg-purple-50",
  dark: "dark:bg-purple-950",
  border: "border-purple-200",
  darkBorder: "dark:border-purple-800",
  accent: "text-purple-600",
  darkAccent: "dark:text-purple-400",
}
```

### Green Theme
```tsx
{
  light: "bg-green-50",
  dark: "dark:bg-green-950",
  border: "border-green-200",
  darkBorder: "dark:border-green-800",
  accent: "text-green-600",
  darkAccent: "dark:text-green-400",
}
```

### Emerald Theme
```tsx
{
  light: "bg-emerald-50",
  dark: "dark:bg-emerald-950",
  border: "border-emerald-200",
  darkBorder: "dark:border-emerald-800",
  accent: "text-emerald-600",
  darkAccent: "dark:text-emerald-400",
}
```

### Indigo Theme
```tsx
{
  light: "bg-indigo-50",
  dark: "dark:bg-indigo-950",
  border: "border-indigo-200",
  darkBorder: "dark:border-indigo-800",
  accent: "text-indigo-600",
  darkAccent: "dark:text-indigo-400",
}
```

## Layout Options

### Top Icon Layout (Default)
Best for emoji icons or small visual elements. Icon appears above the partner name.

```tsx
<PartnerSpotlight
  icon="🎨"
  iconPosition="top"  // or omit, as this is default
  name="Partner Name"
  description="..."
  ctaUrl="..."
/>
```

### Left Icon Layout
Best for logos or larger visual elements. Icon appears on the left side.

```tsx
<PartnerSpotlight
  icon={<PartnerLogo />}
  iconPosition="left"
  name="Partner Name"
  description="..."
  ctaUrl="..."
/>
```

## Styling Notes

- Component includes responsive padding and text sizes
- Supports Tailwind dark mode automatically
- Hover effects include:
  - Shadow elevation on container
  - Arrow icon animation on CTA button
- Uses smooth transitions (200-300ms) for all interactive elements
- Badge text is uppercase with letter spacing for visual impact

## Adding Gradient Backgrounds

For more visual interest, use Tailwind gradient utilities in the color scheme:

```tsx
colorScheme={{
  light: "bg-gradient-to-br from-purple-50 to-indigo-50",
  dark: "dark:bg-gradient-to-br dark:from-purple-950 dark:to-indigo-950",
  border: "border-purple-200",
  darkBorder: "dark:border-purple-800",
  accent: "text-purple-600",
  darkAccent: "dark:text-purple-400",
}}
```

## Accessibility

- Uses semantic `<a>` tags for links
- Proper color contrast ratios for both light and dark modes
- Icon button includes `ExternalLink` icon from lucide-react for visual clarity
- `rel="noopener noreferrer"` for external links when opening in new tab

## Future Enhancements

Potential features for future versions:
- [ ] Image logo support with fallback
- [ ] Animation variants (fade-in, slide-in options)
- [ ] Multiple CTA buttons
- [ ] Rating/review display
- [ ] Video background option
- [ ] Click analytics tracking
