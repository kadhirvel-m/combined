# PaperX - Comprehensive Technical Documentation

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Backend API](#backend-api)
6. [Database Schema](#database-schema)
7. [Frontend Pages](#frontend-pages)
8. [Helper Modules](#helper-modules)
9. [Features](#features)
10. [Environment Configuration](#environment-configuration)
11. [Installation & Setup](#installation--setup)
12. [API Endpoints Reference](#api-endpoints-reference)

---

## Overview

**PaperX** is a comprehensive educational platform built with FastAPI that provides:
- **AI-Powered Notes Generation**: Automatically generate study notes from topics using Gemini AI and web scraping
- **YouTube Transcript Services**: Extract and transform YouTube video transcripts into structured study notes
- **Academic Management**: Complete college, degree, department, batch, and syllabus management
- **Marketplace**: Buy and sell educational notes
- **Project Collaboration**: Post projects, find collaborators, and manage applications
- **Print Services**: Connect students with local print shops for document printing
- **Teacher Platform**: Teacher profiles, classes, and connectivity features
- **Flashcard Generation**: AI-powered flashcards from notes
- **User Profiles**: Comprehensive student/professional profiles with education, experience, certifications

---

## Architecture

PaperX follows a **single-file consolidated FastAPI application** architecture:

```
┌─────────────────────────────────────────────────────────┐
│                   FastAPI Application                    │
│                      (main.py)                           │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Routers    │  │  AI Agents   │  │  Supabase    │  │
│  │              │  │              │  │   Client     │  │
│  │ - Notes      │  │ - OpenAI     │  │              │  │
│  │ - Projects   │  │ - Gemini     │  │ - Auth       │  │
│  │ - Print      │  │ - DeepSeek   │  │ - Storage    │  │
│  │ - Academic   │  │ - AutoGen    │  │ - Database   │  │
│  │ - Marketplace│  │              │  │              │  │
│  │ - Teachers   │  │              │  │              │  │
│  │ - YouTube    │  │              │  │              │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
           ▼                    ▼                  ▼
    ┌─────────────┐      ┌──────────┐      ┌─────────────┐
    │  Frontend   │      │ External │      │  Database   │
    │  (HTML/JS)  │      │   APIs   │      │ (Supabase)  │
    │             │      │          │      │             │
    │ - 66 Pages  │      │- SerpAPI │      │- PostgreSQL │
    └─────────────┘      │- YouTube │      └─────────────┘
                         └──────────┘
```

### Key Architectural Patterns

1. **Single File Consolidation**: All backend logic in `main.py` (~12,343 lines)
2. **Router-Based Modularization**: Logical separation using FastAPI routers
3. **AI Model Integration**: Multiple LLM providers (OpenAI, Gemini, DeepSeek)
4. **Supabase Backend**: Authentication, storage, and PostgreSQL database
5. **Static File Serving**: UI directory mounted for frontend assets
6. **CORS-Enabled**: Full cross-origin support with credentials
7. **Streaming Responses**: Server-Sent Events (SSE) for real-time AI generation

---

## Technology Stack

### Backend
- **Framework**: FastAPI 
- **Language**: Python 3.10+
- **ASGI Server**: Uvicorn
- **Database**: Supabase (PostgreSQL)
- **AI/LLM**:
  - OpenAI GPT-4o-mini
  - Google Gemini 2.5 Flash
  - DeepSeek R1
  - AutoGen Agent Framework
- **PDF Generation**: 
  - xhtml2pdf
  - Playwright (headless Chrome)
  - PyMuPDF (fitz)
- **Web Scraping**: 
  - BeautifulSoup4
  - Requests
  - SerpAPI
- **YouTube**: 
  - youtube-transcript-api
  - yt-dlp

### Frontend
- **UI Framework**: Tailwind CSS
- **Template Engine**: Plain HTML with vanilla JavaScript
- **Build Tools**: 
  - PostCSS
  - Tailwind CLI
- **Pages**: 66 HTML pages
- **Assets**: Images, videos, CSS

### Dependencies (requirements.txt)
```
fastapi
uvicorn
requests
beautifulsoup4
serpapi
markdownify
rapidfuzz
python-dotenv
autogen-agentchat
openai>=1.0.0
google-search-results
autogen-ext
tiktoken
markdown
xhtml2pdf
playwright
supabase
pydantic[email]
google-generativeai
python-multipart
pymupdf
youtube-transcript-api
yt-dlp
```

---

## Project Structure

```
paper/
│
├── main.py                    # Main FastAPI application (12,343 lines)
│   ├── FastAPI app creation
│   ├── CORS middleware
│   ├── Routers (notes, projects, print, academics, etc.)
│   ├── Supabase client helpers
│   ├── AI model clients (OpenAI, Gemini, DeepSeek)
│   ├── Notes generation logic
│   ├── YouTube transcript services
│   ├── PDF rendering utilities
│   ├── Database helpers
│   └── API endpoints
│
├── packages/                  # Python helper modules
│   ├── youtube_video.py       # YouTube search & metadata
│   └── yt_transcript.py       # Transcript extraction
│
├── ui/                        # Frontend assets (66 HTML pages)
│   ├── index.html             # Landing page
│   ├── about.html
│   ├── contact.html
│   ├── login.html
│   ├── signup.html
│   ├── profile.html
│   ├── profile_edit.html
│   │
│   ├── academicas.html        # Academic dashboard
│   ├── clg.html               # College selection
│   ├── notes_generator.html   # AI notes generation UI
│   ├── flashcards.html        # Flashcard viewer
│   ├── youtube-transcript.html
│   ├── youtube-notes.html
│   ├── youtube_videos.html
│   │
│   ├── collage/               # Academic management
│   │   ├── clg_info.html
│   │   ├── degrees.html
│   │   ├── departments.html
│   │   ├── batches.html
│   │   ├── subjects.html
│   │   ├── syllabus.html
│   │   └── upload_syllabus.html
│   │
│   ├── matketplace/           # Notes marketplace
│   │   └── notes/
│   │       ├── notes_marketplace.html
│   │       ├── note_detail.html
│   │       └── upload_note.html
│   │
│   ├── projects/              # Project collaboration
│   │   ├── postings.html
│   │   ├── project.html
│   │   ├── project_post.html
│   │   ├── project_applicants.html
│   │   ├── incoming_requests.html
│   │   ├── my_applications.html
│   │   ├── public_profile.html
│   │   └── skill-test.html
│   │
│   ├── print/                 # Print services
│   │   ├── index.html
│   │   ├── admin_print.html
│   │   ├── admin_print_shop.html
│   │   ├── printers/
│   │   │   ├── configure.html
│   │   │   ├── shops.html
│   │   │   ├── review.html
│   │   │   └── success.html
│   │   └── shop/
│   │       ├── login.html
│   │       ├── signup.html
│   │       ├── dashboard.html
│   │       ├── jobs.html
│   │       ├── profile.html
│   │       └── payments.html
│   │
│   ├── teachers/              # Teacher platform
│   │   ├── teacher_login.html
│   │   ├── teacher_signup.html
│   │   ├── teacher_class.html
│   │   ├── teacher_notes.html
│   │   ├── teacher_connect.html
│   │   └── notes/
│   │       ├── manage_notes.html
│   │       └── notes_marketplace.html
│   │
│   ├── orders/                # Order management
│   │   ├── index.html
│   │   └── detail.html
│   │
│   ├── tales/                 # Additional features
│   │   └── romantasy.html
│   │
│   ├── assets/                # Static assets
│   │   ├── css/
│   │   │   └── tailwind.css
│   │   ├── img/
│   │   ├── video/
│   │   └── teacher_ids/       # Uploaded teacher IDs
│   │
│   ├── src/                   # Source CSS
│   │   └── input.css
│   │
│   ├── config.js              # Frontend config
│   ├── auth.js                # Authentication helpers
│   ├── tailwind.config.js     # Tailwind configuration
│   ├── postcss.config.js      # PostCSS configuration
│   ├── build-tailwind.js      # Build script
│   └── node_modules/          # NPM dependencies
│
├── notes/                     # Generated notes storage (file-based)
│
├── assets/                    # Server-side assets
│   └── teacher_ids/           # Teacher ID verification uploads
│
├── db.sql                     # Database schema (PostgreSQL)
├── .env                       # Environment variables (API keys)
├── requirements.txt           # Python dependencies
├── index.html                 # Root redirect/landing
└── README.md                  # This file
```

---

## Backend API

The main application (`main.py`) is organized into several sections. For full details on all API functions, routes, and helpers, see the comprehensive sections below.

### Core Components

1. **Supabase Integration**: Client setup for authentication and database
2. **AI Model Clients**: OpenAI, Gemini, DeepSeek configurations
3. **Notes Generation**: Web scraping, content extraction, AI synthesis
4. **PDF Rendering**: xhtml2pdf and Playwright implementations
5. **Flashcard Generation**: Gemini-powered flashcard creation
6. **YouTube Services**: Transcript extraction and note conversion
7. **Database Helpers**: CRUD operations for all tables

---

## Database Schema

PaperX uses **Supabase (PostgreSQL)** with comprehensive tables. The full schema is in `db.sql`.

### Major Table Categories

#### 1. **Academic Management**
- `colleges` → `degrees` → `departments` → `batches`
- `syllabus_courses` → `syllabus_units` → `syllabus_topics`

#### 2. **User System**
- `user_profiles` with extended fields
- `user_education`, `user_experiences`, `user_certifications`
- `user_portfolio_projects`, `user_publications`

#### 3. **AI Notes**
- `ai_notes` (detailed variant)
- `ai_notes_cheatsheet` (concise)
- `ai_notes_simple` (easy to understand)
- `ai_notes_user_edits` (per-user customization)
- `degree_allowed_domains` (whitelist management)

#### 4. **Projects & Collaboration**
- `projects`
- `project_applications`
- `project_collab_messages`
- `skill_tests`, `skill_verifications`

#### 5. **Marketplace**
- `marketplace_notes`
- `marketplace_purchases`
- `marketplace_reviews`

#### 6. **Print Services**
- `print_shops`
- `print_printers`
- `print_jobs`
- `print_job_events`

#### 7. **Teacher Platform**
- `teacher_profiles`
- `teacher_applications`
- `teacher_classes`
- `teacher_connections`
- `teacher_messages`

#### 8. **YouTube**
- `youtube_ai_notes`

---

## Frontend Pages

**Total: 66 HTML Pages**

### Organized by Feature:

1. **Core** (9 pages): index, login, signup, profile, etc.
2. **Academic** (10 pages): academicas, college management, syllabus
3. **Notes & Learning** (5 pages): notes generator, flashcards, YouTube
4. **Marketplace** (3 pages): browse, detail, upload
5. **Projects** (8 pages): postings, applications, skill tests
6. **Print Services** (13 pages): shops, orders, admin
7. **Teachers** (9 pages): profiles, classes, connections
8. **Orders** (2 pages): list, detail
9. **Misc** (1 page): tales/romantasy

For detailed page descriptions, see the [Frontend Pages](#frontend-pages) section in the full README.

---

## Helper Modules

### 1. `packages/youtube_video.py`
- YouTube video search via SerpAPI
- Channel metadata and logo extraction
- View count and duration formatting

### 2. `packages/yt_transcript.py`
- Multi-source transcript extraction (API → yt-dlp → Whisper)
- Text cleaning and deduplication
- VTT parsing
- FastAPI router for REST API

---

## Features

### 1. AI-Powered Notes Generation
- 3 variants: detailed, cheatsheet, simple
- Domain filtering by degree
- Streaming generation with SSE
- Caching and per-user edits
- Citations and Mermaid diagrams

### 2. Flashcard Generation
- Gemini AI structured output
- Fallback regex parser
- 4-8 cards per note
- Futuristic emoji icons

### 3. YouTube Services
- Transcript extraction
- Structured note conversion
- Video search
- Metadata fetching (yt-dlp)

### 4. Project Collaboration
- Project posting and discovery
- Application management
- Skill verification tests
- Real-time messaging

### 5. Marketplace
- Buy/sell notes
- Academic filtering
- Reviews and ratings
- File management

### 6. Print Services
- Geolocation-based shop finder
- OTP verification
- Status tracking
- Shop management

### 7. Teacher Platform
- Teacher profiles and applications
- Class management
- Teacher connections
- Note sharing

### 8. Academic Management
- College → Degree → Department → Batch hierarchy
- Syllabus upload and parsing
- Topic completion tracking

---

## Environment Configuration

Create a `.env` file with:

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-...
LLM_MODEL=gpt-4o-mini

# Google Gemini
GEMINI_API_KEY=AIzaSy...
GEMINI_NOTES_MODEL=gemini-2.5-flash

# OpenRouter (DeepSeek)
OPENROUTER_API_KEY=sk-or-v1-...

# SerpAPI
SERPAPI_API_KEY=...

# Supabase
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
SUPABASE_ANON_KEY=...
SUPABASE_BUCKET=profile

# YouTube (optional)
YT_API_KEY=...
```

---

## Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+ (for Tailwind)
- Playwright browsers (optional, for PDF)

### Steps

1. **Clone and Setup**
   ```bash
   cd paper/
   python -m venv venv
   source venv/bin/activate
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   playwright install chromium  # Optional
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run Server**
   ```bash
   python main.py
   # or: uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Access**
   - API: http://localhost:8000
   - UI: http://localhost:8000/ui/index.html

---

## API Endpoints Reference

### Notes API
- `POST /api/notes/generate` - Generate notes
- `GET /api/notes/generate/stream` - Streaming generation
- `GET /api/notes` - List notes
- `GET /api/notes/{id}` - Get note
- `GET /api/notes/{id}/pdf` - Export PDF
- `POST /api/notes/{id}/flashcards` - Generate flashcards

### YouTube API
- `POST /api/transcripts/paragraph` - Get transcript
- `POST /api/transcripts/notes` - Convert to notes
- `GET /api/youtube/search` - Search videos

### Projects API
- `GET /api/projects` - List projects
- `POST /api/projects` - Create project
- `POST /api/projects/{id}/apply` - Apply

### Marketplace API
- `GET /api/marketplace/notes` - Browse
- `POST /api/marketplace/notes` - Upload
- `POST /api/marketplace/notes/{id}/purchase` - Purchase

### Print API
- `GET /api/print/shops` - List shops
- `POST /api/print/jobs` - Submit job

### Teacher API
- `POST /api/teachers/apply` - Apply
- `GET /api/teachers/profile` - Get profile
- `POST /api/teachers/connect` - Connect

### Academic API
- `GET /api/colleges` - List colleges
- `POST /api/syllabus/upload` - Upload syllabus

For a complete list, see the main.py source code.

---

## Security

- **JWT Authentication**: Supabase Auth
- **Row Level Security**: Database policies
- **Input Validation**: Pydantic models
- **Content Safety**: Gemini safety settings
- **File Upload Limits**: Size and type restrictions

---

## Performance

- **Caching**: LRU caches for clients and metadata
- **Database Indexes**: On foreign keys and text columns
- **Retry Logic**: Exponential backoff for transient errors
- **Concurrency**: ThreadPoolExecutor for parallel tasks

---

## Future Enhancements

1. Real-time collaboration (WebSockets)
2. Advanced search (Elasticsearch)
3. ML recommendations
4. Mobile apps
5. Payment integration (Stripe/Razorpay)
6. Video conferencing
7. Gamification
8. Offline PWA
9. Split main.py into modules
10. Comprehensive test suite

---

## Contributing

1. Create feature branch
2. Implement with tests
3. Update README if API changes
4. Submit PR

---

## License

[Specify License]

---

## Support

For issues or questions:
- GitHub Issues: [Repository]
- Email: [Contact Email]

---

**Last Updated**: 2025-11-05  
**Version**: 1.0.0  
**Maintained By**: PaperX Team
