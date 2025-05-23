# ft_transcendence - Person 1 Frontend Implementation

This repository contains the implementation of the frontend UI + SPA for the first 25% of the ft_transcendence project, as outlined in the provided checklist.

## Project Structure

```
ft_transcendence_new/
├── src/
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── TournamentPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── App.tsx           # Main application component
│   ├── App.css           # Application styles
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── public/               # Public assets
├── index.html            # HTML template
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── package.json          # Project dependencies and scripts
└── Dockerfile            # Docker configuration
```

## Features Implemented

1. **Project Setup**
   - Vite + TypeScript SPA configuration
   - Project structure and organization
   - TypeScript settings

2. **UI Pages**
   - Home page with navigation
   - Register page with form validation
   - Tournament page with dummy data
   - 404 Not Found page

3. **Core Functionality**
   - SPA routing with browser Back/Forward support
   - Form validation for player aliases
   - Loading and error states
   - Fake fetch logic with hardcoded JSON

4. **Technical Requirements**
   - Single-page application architecture
   - Browser history support
   - Error handling
   - Docker configuration

## Running the Project

1. Install dependencies:
   ```
   npm install
   ```

2. Start development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

4. Preview production build:
   ```
   npm run preview
   ```

## Docker Support

The project includes a Dockerfile for containerization. To build and run the container:

```
docker build -t ft_transcendence .
docker run -p 5173:5173 ft_transcendence
```

## Next Steps

- Integrate with backend API when available
- Implement actual game functionality
