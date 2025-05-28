# ft_transcendence - Person 1 Frontend

A TypeScript SPA (Single Page Application) for the ft_transcendence project, built with Vite and TypeScript.

## Features

- Pure TypeScript implementation (no React)
- SPA routing with browser history support
- Home, Register, and Tournament pages
- Form validation
- Loading/error states
- Responsive design

## Project Structure

```
ft_transcendence/
├── src/
│   ├── main.ts       # Main application entry point
│   └── style.css     # Global styles
├── index.html        # HTML entry point
├── vite.config.ts    # Vite configuration
├── tsconfig.json     # TypeScript configuration
└── package.json      # Project dependencies
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Requirements Met

This project fulfills the requirements for Person 1 as specified in the ft_transcendence checklist:
- Setup Vite + TypeScript SPA, project layout
- Home and Register pages (UI only)
- Form validation (alias, match)
- SPA routing (Back/Forward support)
- Tournament page layout
- Fake fetch logic with hardcoded JSON
- Loading/error states

## Notes

This implementation uses pure TypeScript without any frontend frameworks like React, adhering strictly to the TypeScript requirement.
