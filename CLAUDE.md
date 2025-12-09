# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev      # Start development server (http://localhost:3000)
bun build    # Build for production
bun start    # Start production server
bun lint     # Run ESLint
```

## Architecture

This is a Next.js 16 application using the App Router with React 19. The project uses bun as the package manager.

### Tech Stack
- **Framework**: Next.js 16 with App Router (React Server Components enabled)
- **Styling**: Tailwind CSS 4 with CSS variables for theming
- **UI Components**: shadcn/ui (new-york style) with lucide-react icons
- **Type System**: TypeScript with strict mode

### Path Aliases
- `@/*` maps to project root (e.g., `@/lib/utils`, `@/components/ui`)

### shadcn/ui Configuration
- Components go in `@/components/ui`
- Utility functions in `@/lib/utils` (includes `cn()` for class merging)
- Hooks in `@/hooks`
- Uses CSS variables for theming with dark mode support (`dark` class on parent)

### Styling
- Global styles in `app/globals.css` with Tailwind v4 syntax
- Theme colors defined as CSS custom properties in `:root` and `.dark`
- Uses oklch color space for design tokens
