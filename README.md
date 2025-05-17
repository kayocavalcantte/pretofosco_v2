# Preto Fosco Hair Studio

A stylish, alternative hair studio website with a Brazilian favela-inspired aesthetic and underground hip-hop attitude. Built with React, Vite, and Bootstrap 5.

## Features

- Striking black and white design with neon lime accent
- Typography-focused layout using Bitsumishi Bold and Inter fonts
- Blurred cat-grid background with subtle grain overlay
- Interactive appointment scheduler with day picker
- Custom form controls and hover/focus states
- Fully responsive across all device sizes

## Tech Stack

- React 18
- Vite
- Bootstrap 5 / React-Bootstrap
- React Day Picker
- SCSS for styling
- Lucide React for icons

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

## Design Notes

The design features a typography-first approach with:
- Bitsumishi Bold for logo and headings
- Inter Regular/Medium for body text and UI
- Subtle grain overlay for texture
- Soft-blurred cat-photo grid background
- Spray-paint edge effects on cards

## Accessibility

- Proper semantic HTML structure
- Sufficient color contrast for text readability
- Keyboard navigation supported
- Focus states clearly visible

## Directory Structure

```
src/
├── assets/
│   └── fonts/
│       └── bitsumishi.woff2
├── components/
│   ├── BackgroundGrid.tsx
│   ├── Footer.tsx
│   ├── GrainOverlay.tsx
│   ├── Header.tsx
│   └── Hero.tsx
├── styles/
│   ├── BackgroundGrid.scss
│   ├── Footer.scss
│   ├── GrainOverlay.scss
│   ├── Header.scss
│   ├── Hero.scss
│   └── index.scss
├── App.tsx
└── main.tsx
```