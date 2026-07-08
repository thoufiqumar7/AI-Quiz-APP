# Deployment Guide

## Vercel (Frontend)
1. Import the repository into Vercel.
2. Set the framework preset to `Vite`.
3. Vercel will automatically use the `vercel.json` for routing.

## Render (Backend)
1. Create a new Web Service in Render.
2. Connect the GitHub repository.
3. Render will automatically detect the `render.yaml` configuration.
4. Set required Environment Variables securely in the Render dashboard.

## Docker Deployment
Run `docker-compose up -d --build` on your production VPS.
