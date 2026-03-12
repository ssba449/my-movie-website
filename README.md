# StreamVault - Linux Ready Monorepo

This repository contains the complete, restructured codebase for StreamVault, optimized for deployment on Linux (PM2), Vercel (Frontend), and Render (Backend).

## Repository Structure

- **`/frontend`**: The Next.js 15 application. This is your primary user interface.
- **`/backend/stream-server`**: High-performance Node.js stream server for Cloudflare bypassing and extraction.
- **`/backend/showbox-febbox-api-master`**: Internal API for fetching content details from Showbox/FebBox.
- **`ecosystem.config.js`**: PM2 configuration file for managing all services on Linux.
- **`package.json`**: Root configuration for local development and monorepo management.

## Deployment Instructions

### 1. Frontend (Vercel)
- Connect this repository to Vercel.
- **Root Directory**: Set this to `frontend`.
- Vercel will automatically detect the Next.js project and handle the build.

### 2. Backend (Render / Oracle Linux)
- For **Render**:
    - Build a Web Service pointing to `backend/stream-server`.
    - Build a Web Service pointing to `backend/showbox-febbox-api-master/showbox-febbox-api-master/api`.
- For **Oracle Linux (Production)**:
    - Follow the steps in [DEPLOYMENT.md](file:///c:/Users/sbapc/Desktop/my-movie-website-main/backend/DEPLOYMENT.md).
    - Run `npm run start` from the root to launch everything via PM2.

## Local Development

From the root directory, run:
```bash
npm install
npm run dev:all
```
This will launch the frontend and both backend services concurrently.

---
**Note:** All `.env` files and sensitive secrets have been excluded from this repository. Ensure you provide your own environment variables in your deployment platform settings.
