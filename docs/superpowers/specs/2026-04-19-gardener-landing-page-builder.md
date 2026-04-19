# Gardener Landing Page Builder - Design Spec

**Date:** 2026-04-19

## Project Overview

- **Project name:** Gardener Landing Page Builder
- **Type:** Self-service web application
- **Core functionality:** Form-filling tool that generates landing pages for gardeners
- **Target users:** gardening business owners (landscapers, lawn care, tree services)

## Features

### Form Input Fields
- Business name
- Contact info (phone, email, address)
- Service area (zip codes/cities served)
- Services offered (lawn care, landscaping, tree trimming, irrigation, etc.)
- Years of experience
- Certifications/licenses
- Photo uploads (portfolio of work)
- Customer testimonials (text + optional name)

### Styling Options
- **Pre-built themes:**
  - Classic Green
  - Modern Minimal
  - Earthy Natural
- **Full customization:**
  - Primary/secondary colors
  - Font selection
  - Header/footer customization

### Output Formats
- Static HTML file (downloadable)
- Shareable public URL (platform hosting)
- PDF download

### Hosting Options
- Self-host: download HTML and host anywhere
- Platform hosting: username.landingpagebuilder.app

### Account Tiers
- **Free tier:**
  - Generate landing page
  - Download HTML
  - Platform URL (with branding)
  - 1 page
- **Paid tier:**
  - Custom domain hosting
  - Remove branding
  - PDF download
  - Multiple pages
  - Analytics

## Architecture

### Frontend
- Single-page application (React or vanilla JS)
- Form wizard with live preview
- Theme selector with customization options

### Backend
- REST API for form submission
- User authentication (tiered accounts)
- File storage for uploads and generated pages
- PDF generation service

### Tech Stack (Recommended)
- Frontend: React + Vite
- Backend: Node.js/Express
- Database: PostgreSQL (user data, tiers)
- Storage: S3 or local file storage
- PDF: Puppeteer or similar

## Data Flow

1. User creates account / logs in
2. User fills out business form
3. User selects theme or customizes styling
4. Live preview shows generated page
5. User exports: HTML download / gets URL / PDF
6. (Platform hosting) Page served at username.app

## Acceptance Criteria

- [ ] User can create account and log in
- [ ] User can fill out all form fields
- [ ] User can upload photos and see them in preview
- [ ] User can select from pre-built themes
- [ ] User can customize colors/fonts
- [ ] Live preview updates as form is filled
- [ ] User can download generated HTML
- [ ] User can get shareable platform URL
- [ ] User can download PDF
- [ ] Paid users can use custom domain
- [ ] Paid users have no branding