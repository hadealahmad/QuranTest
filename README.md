# Quran Quiz for Children (PWA)

A fun, interactive, and bilingual (English/Arabic) Progressive Web Application (PWA) designed to test children's knowledge of the Quran. Built with performance and user experience in mind, ensuring a premium feel on all devices.

## Overview

This project is a lightweight, serverless web application that runs entirely in the browser. It features a modern, animated user interface and works offline.

**Original Content Credit**: The questions and core concept are inspired by [Noor Academy's Quran Quiz](https://nooracademy.com/quran-quiz-for-children/).  
**Modifications**:
- **Format**: All open-ended questions were converted to a Multiple Choice (MCQ) format to suit an interactive digital quiz.
- **Consistency**: Edited and filtered questions to ensure 100% parity between the English and Arabic versions. Non-applicable or culturally specific questions that didn't translate well to a universal MCQ format were omitted.

## Technical Architecture

The application focuses on simplicity and standard web technologies, avoiding heavy build steps while maintaining a modern development experience (Vanilla JS + Tailwind via CDN).

### Technology Stack
- **Core**: Semantic HTML5, Vanilla JavaScript (ES6+).
- **Styling**: Tailwind CSS (CDN) with custom Shadcn-like design tokens (CSS Variables) for consistent theming.
- **Icons**: Lucide Icons.
- **Animations**: CSS Keyframes + Canvas Confetti for rewards.
- **PWA**: `manifest.json` and a Service Worker (`sw.js`) for offline caching and installation.

### Key Features
1.  **State Management**: Simple, in-memory state object (`CONFIG`) tracks language, progress, and score.
2.  **Bilingual Support**: Instant toggling between English (LTR) and Arabic (RTL). The app updates the `dir` attribute and swaps font families (`Inter` vs `Amiri`) dynamically.
3.  **Canvas Image Generation**: The "Share Result" feature uses the HTML5 Canvas API to programmatically draw a shareable image of the user's score, matching the app's aesthetic.
4.  **No Build Step**: The project is ready to run. No `npm install` or `build` scripts required.

## File Structure
- `index.html`: Entry point, UI skeleton, and style definitions.
- `app.js`: Application logic (Routing, Quiz Engine, DOM Manipulation).
- `data.js`: The question bank (EN/AR).
- `sw.js`: Service Worker for offline capabilities.
- `manifest.json`: Web App Manifest for installation.

## Running Locally
Simply open `index.html` in your browser. For the Service Worker to function correctly, serve the directory via HTTP (e.g., `python3 -m http.server`).

---
*Developed with ❤️ to make learning the Quran fun and accessible.*
