# Notes Marketplace (New Feature)

This release adds a basic Notes Marketplace under the `paper` app:

Features:

- Upload & share notes (PDF / MD / image) – free or paid (mock payment; records purchase only)
- Listing with filters (search text, subject, exam type, price range)
- Per-note detail page with download or purchase button
- Ratings & Reviews (1 per user, editable)
- Simple aggregate rating (stored on note row)

API Endpoints (prefix `/api/marketplace`):

- `POST /notes` multipart form (auth required)
- `GET /notes` list with optional filters (q, subject, exam_type, min_price, max_price)
- `GET /notes/{id}` detail (includes reviews, has_access flag)
  - Detail response now (Oct 2025) enriches academic metadata when foreign keys are present, adding:
    - `college_name`, `degree_name`, `department_name`, `batch_range` (e.g. "2023-2027")
    - `semester` (already part of base row if stored)
      These fields are optional and only appear if the related ids exist on the note.
- `GET /notes/{id}/download` (requires access)
- `POST /notes/{id}/purchase` (mock purchase, creates record for non-free note)
- `POST /notes/{id}/review` (rating/comment add or update)
- `DELETE /notes/{id}` owner delete

Database (conceptual schema added in `db.sql`):

- `marketplace_notes` – core metadata & aggregates
- `marketplace_purchases` – one row per buyer per note
- `marketplace_reviews` – rating/comment per user per note

Storage:

- Files saved under `paper/assets/notes_marketplace/` with randomized prefix.

UI Pages (`paper/ui`):

- `notes_marketplace.html` – browse & filter
- `upload_note.html` – uploader form
- `note_detail.html` – detail + download/purchase + reviews
- Added nav links into `notes_generator.html` header

Auth:

- Uses existing Supabase bearer token (expects stored in localStorage as `sb-access-token`).

Future Enhancements (suggested):

- Full-text search via PostgreSQL or external index
- Tag auto-complete & facets
- Pagination / infinite scroll
- File preview (render first page of PDF)
- Earnings dashboard + real payment integration
- Admin moderation / report abuse
- Caching layer for list queries

# PaperX - Advanced Academic Research & Collaboration Platform

## ⚠️ PROPRIETARY SOFTWARE - STRICTLY CONFIDENTIAL

**COPYRIGHT NOTICE**: This software and all associated documentation are proprietary and confidential. All rights reserved. No part of this software may be reproduced, distributed, or transmitted in any form or by any means without the express written permission of the copyright holder.

**UNAUTHORIZED ACCESS, USE, OR DISTRIBUTION IS STRICTLY PROHIBITED AND MAY RESULT IN SEVERE CIVIL AND CRIMINAL PENALTIES.**

---

## 🎯 Project Overview

PaperX is a comprehensive, enterprise-grade academic research and collaboration platform built with cutting-edge AI technologies. It serves as a unified solution for educational institutions, researchers, and students to manage academic content, generate intelligent study notes, facilitate project collaboration, and track academic progress.

### 🚀 Core Mission

Transform the academic experience through AI-powered note generation, intelligent collaboration matching, and comprehensive academic management systems.

## 🏗️ System Architecture

### Technology Stack

- **Backend Framework**: FastAPI (Python 3.8+)
- **Database**: Supabase (PostgreSQL with real-time capabilities)
- **AI/ML Integration**:
  - OpenAI GPT-4o-mini
  - DeepSeek R1 (via OpenRouter)
  - Google Gemini 2.5 Flash
  - AutoGen Multi-Agent Framework
- **Web Scraping**: SerpAPI, BeautifulSoup4
- **Authentication**: Supabase Auth with JWT tokens
- **File Storage**: Supabase Storage
- **PDF Generation**: Playwright (headless Chrome), xhtml2pdf
- **Frontend**: Vanilla JavaScript with modern ES6+ features
- **Deployment**: Cloud-ready with Docker support

### 🧠 AI-Powered Features

#### Intelligent Notes Generation System

- **Multi-Source Content Aggregation**: Crawls and extracts content from trusted educational domains
- **AI-Powered Synthesis**: Uses advanced language models to create comprehensive study materials
- **Real-Time Streaming**: Server-sent events for live progress updates
- **Content Filtering**: Domain whitelist ensures academic quality
- **Semantic Search**: Fuzzy matching and semantic similarity for note discovery
- **Multi-Format Export**: Markdown, PDF (with KaTeX math rendering)

#### Supported Educational Domains

```python
ALLOWED_DOMAINS = [
    "geeksforgeeks.org",
    "tutorialspoint.com",
    "scaler.com",
    "byjus.com",
    "wikipedia.org",
    "tpointtech.com"
]
```

## 🏢 Core Platform Modules

### 1. Academic Management System

Comprehensive academic data management with hierarchical organization:

#### Database Schema Overview

```sql
-- Academic Hierarchy
colleges → departments → batches → users
         ↓
syllabus_courses → syllabus_units → syllabus_topics
                                  ↓
                               user_topic_progress
```

#### Key Features

- **College Management**: Multi-institutional support with department hierarchies
- **Batch System**: Year-based student grouping with semester tracking
- **Syllabus Management**: Structured course content with units and topics
- **Progress Tracking**: Individual topic completion monitoring
- **Automated Parsing**: AI-powered syllabus text extraction and structuring

### 2. Project Collaboration Platform

#### Project Management

- **Rich Project Profiles**: Comprehensive project metadata including:
  - Technical specifications and tech stack
  - Funding information and budget tracking
  - Team structure and hiring requirements
  - Timeline and milestone management
  - Media gallery and documentation links

#### Collaboration Features

- **Application System**: Structured project application workflow
- **Real-time Messaging**: In-platform communication for accepted collaborators
- **File Management**: Project assets and media storage
- **Status Tracking**: Application lifecycle management (pending/accepted/rejected)

### 3. Skill Verification & Testing System

#### Adaptive Testing Engine

- **Dynamic Question Generation**: AI-generated questions based on skill domain
- **Multi-Format Support**:
  - Multiple choice questions
  - Coding challenges
  - Reflective assessments
- **Automatic Grading**: Keyword-based and pattern matching evaluation
- **Verification Scoring**: Comprehensive skill verification with scoring algorithms
- **Profile Integration**: Verification scores integrated into user profiles

#### Supported Programming Languages

- Python, JavaScript, Java, C++, SQL
- Extensible framework for additional languages

### 4. User Profile & Authentication

#### Comprehensive User Management

- **Multi-Provider Authentication**: Supabase Auth with OAuth support
- **Rich Profile System**: Extended user profiles with:
  - Academic information (college, department, batch, semester)
  - Professional details (LinkedIn, GitHub, portfolio)
  - Skills and certifications tracking
  - Project portfolio integration
  - Verification scoring system

#### Privacy & Security

- **JWT Token-based Authentication**: Secure session management
- **Row-Level Security**: Database-level access control
- **Profile Privacy Controls**: Public/private profile visibility
- **Secure File Upload**: Validated file types and secure storage

## 📁 Project Structure

```
paper/
├── main.py                 # Main application entry point (3,932 lines)
├── requirements.txt        # Python dependencies
├── db.sql                 # Complete database schema
├── notes/                 # Generated study notes storage
│   ├── *.md              # Individual topic notes
│   └── ...
└── ui/                    # Frontend interface files
    ├── index.html         # Main dashboard
    ├── notes_generator.html # Notes generation interface
    ├── profile.html       # User profile management
    ├── project.html       # Project collaboration
    ├── skill-test.html    # Skill assessment interface
    ├── academicas.html    # Academic management
    ├── config.js          # Frontend configuration
    └── ...
```

## 🚀 Installation & Setup

### Prerequisites

- Python 3.8+ with pip
- Node.js (for Playwright browser automation)
- Supabase project with configured database
- API keys for external services

### Environment Configuration

Create a `.env` file with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_BUCKET=your_storage_bucket_name

# AI/ML API Keys
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_google_ai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# Search API
SERPAPI_API_KEY=your_serpapi_key

# Application Settings
PORT=8000
OPENAI_MODEL=gpt-4o-mini
```

### Installation Steps

1. **Clone and Setup Environment**

   ```bash
   cd paper/
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   playwright install chromium  # For PDF generation
   ```

3. **Database Setup**

   ```bash
   # Import the database schema to your Supabase project
   # Run the SQL commands from db.sql in your Supabase SQL editor
   ```

4. **Launch Application**

   ```bash
   python main.py
   # Or using uvicorn directly:
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

5. **Access Application**
   - API Documentation: `http://localhost:8000/docs`
   - Main Interface: `http://localhost:8000/ui/index.html`
   - Notes Generator: `http://localhost:8000/ui/notes_generator.html`

## 🔧 API Reference

### Core Endpoints Structure

#### Authentication & User Management

```
POST   /signup                    # Basic user registration
POST   /login                     # User authentication
POST   /api/signup/full           # Complete profile registration
GET    /api/me                    # Current user profile
GET    /api/profile/me            # Extended profile data
PUT    /api/profile/me            # Update profile information
POST   /api/profile/upload        # Upload profile assets
```

#### Notes Generation & Management

```
POST   /api/notes/generate        # Generate notes for topic
GET    /api/notes/generate/stream # Real-time notes generation
GET    /api/notes                 # List all notes
POST   /api/notes                 # Create custom note
GET    /api/notes/{id}            # Retrieve specific note
PUT    /api/notes/{id}            # Update note content
GET    /api/notes/{id}/download   # Download as Markdown
GET    /api/notes/{id}/pdf        # Export as PDF
POST   /api/notes/transform       # AI-powered note transformation
```

#### Project Collaboration

```
POST   /api/projects              # Create new project
GET    /api/projects              # List all projects
GET    /api/projects/{id}         # Get project details
POST   /api/projects/{id}/apply   # Apply to project
GET    /api/projects/{id}/applications # List applications (owner)
POST   /api/projects/{id}/upload  # Upload project media
```

#### Academic Management

```
POST   /api/colleges              # Create/update college
GET    /api/colleges              # List colleges
POST   /api/syllabus/courses      # Manage course content
GET    /api/progress/summary      # Academic progress tracking
POST   /api/progress/toggle       # Mark topics complete
```

#### Skill Assessment

```
POST   /api/skills/tests/start    # Begin skill assessment
POST   /api/skills/tests/{id}/submit # Submit test answers
GET    /api/skills/verifications  # View skill verifications
```

## 🎨 User Interface Components & Detailed Page Descriptions

### Dashboard Features

- **Responsive Design**: Mobile-first responsive layout with Tailwind CSS
- **Real-time Updates**: Live progress indicators and notifications
- **Rich Media Support**: Image galleries, video embeds, document previews
- **Interactive Elements**: Drag-and-drop interfaces, modal dialogs
- **Accessibility**: WCAG compliant with screen reader support
- **Dark Mode Support**: System-preference aware theme switching
- **Glass Morphism**: Modern UI with backdrop blur effects and translucent elements

### 📄 Comprehensive UI Pages Overview

#### 1. **Main Dashboard** (`index.html`)

**Primary Function**: Central command center and landing page for authenticated users
**Key Features**:

- **Agentic AI Learning Hub**: Tagline emphasizes "Agentic AI Learning for Indian College Syllabus"
- **Multi-Module Navigation**: Quick access to all platform modules
- **Project Portal Dropdown**: Material Symbols integration for navigation icons
- **Responsive Grid Layout**: Adaptive layout with glass morphism design
- **Brand Integration**: Consistent Pa[p]er X branding with color scheme
- **Real-time Notifications**: Live updates on projects, notes, and collaboration
- **Quick Actions Panel**: Fast access to generate notes, create projects, view progress
- **Dashboard Analytics**: Overview cards showing user activity and progress metrics

#### 2. **Notes Generator** (`notes_generator.html`)

**Primary Function**: AI-powered intelligent study material creation interface
**Key Features**:

- **Material Design Aesthetics**: Clean, modern interface with Material-style components
- **Topic Input System**: Smart search with autocomplete and suggestions
- **Real-time Generation**: Server-sent events for live progress tracking
- **Multi-format Export**: Instant conversion to Markdown, PDF with KaTeX math rendering
- **Source Attribution**: Automatic citation tracking from trusted educational domains
- **Content Transformation**: AI-powered summarization, expansion, and simplification tools
- **Mermaid Diagram Support**: Automatic diagram generation for complex concepts
- **Notes Library**: Organized storage and retrieval of generated content
- **Semantic Search**: Fuzzy matching for finding related existing notes
- **Progress Visualization**: Real-time feedback during content generation process

#### 3. **Profile Management** (`profile.html`)

**Primary Function**: Comprehensive user profile viewing and social networking
**Key Features**:

- **TuNeX-Style Layout**: Modern card-based profile presentation
- **Multi-section Profile**: Academic info, skills, projects, achievements, social links
- **Media Integration**: Profile images, project galleries, and document attachments
- **Verification Badges**: Skill verification indicators and scoring display
- **Social Connectivity**: LinkedIn, GitHub, Portfolio, and other professional links
- **Academic Tracking**: College, department, batch, semester information
- **Project Portfolio**: Showcase of collaborative projects and contributions
- **Skill Matrix**: Visual representation of verified technical competencies
- **Activity Timeline**: Recent activities, notes generated, projects joined
- **Privacy Controls**: Granular visibility settings for profile elements

#### 4. **Profile Editor** (`profile_edit.html`)

**Primary Function**: Advanced profile editing with comprehensive field management
**Key Features**:

- **Multi-step Form**: Progressive disclosure for complex profile data
- **Media Upload**: Drag-and-drop profile pictures and resume uploads
- **Academic Integration**: College/department/batch selection with validation
- **Professional Details**: Comprehensive career and education information
- **Social Media Links**: Integration with professional and social platforms
- **Skills Management**: Add, remove, and organize technical skills
- **Project Information**: Detailed project descriptions and links
- **Real-time Validation**: Instant feedback on form inputs and file uploads
- **Auto-save Functionality**: Periodic saving of form progress
- **Preview Mode**: Live preview of profile changes before saving

#### 5. **Project Collaboration Hub** (`project.html`)

**Primary Function**: Detailed project exploration and collaboration interface
**Key Features**:

- **Rich Project Display**: Comprehensive project metadata and visual elements
- **Team Structure Visualization**: Current team members and open positions
- **Funding Information**: Budget tracking and funding stage indicators
- **Technical Stack Display**: Technology requirements and specifications
- **Application Interface**: Streamlined project application workflow
- **Milestone Tracking**: Project timeline and deliverable management
- **Media Gallery**: Project screenshots, demos, and documentation
- **Real-time Chat**: In-platform messaging for team coordination
- **Skill Matching**: Intelligent recommendations based on user skills
- **Application Status**: Clear visibility into application lifecycle

#### 6. **Project Postings** (`postings.html`)

**Primary Function**: Project discovery and browsing marketplace
**Key Features**:

- **Grid-based Layout**: Card-style project presentation with filtering
- **Advanced Search**: Multi-criteria search with domain, technology, and skill filters
- **Real-time Updates**: Live project feed with new postings and updates
- **Quick Preview**: Project summary cards with key information
- **Category Filtering**: Organization by domains, technologies, and project types
- **Sorting Options**: By date, funding, team size, and popularity
- **Application Tracking**: Status indicators for applied projects
- **Bookmark System**: Save interesting projects for later review
- **Trending Projects**: Highlight popular and actively recruiting projects
- **Recommendation Engine**: AI-powered project suggestions based on profile

#### 7. **Skill Assessment Center** (`skill-test.html`)

**Primary Function**: AI-powered skill verification and testing platform
**Key Features**:

- **Adaptive Testing Engine**: Dynamic question generation based on skill level
- **Multi-format Questions**: Multiple choice, coding challenges, and essay responses
- **Code Editor Integration**: In-browser coding environment with syntax highlighting
- **Proctoring Features**: Optional webcam monitoring for test integrity
- **Real-time Scoring**: Instant feedback and detailed performance analytics
- **Skill Certification**: Verified badges and certificates upon completion
- **Progress Tracking**: Historical test performance and skill development
- **Language Support**: Multi-programming language assessment capabilities
- **Time Management**: Configurable test duration with progress indicators
- **Results Dashboard**: Comprehensive breakdown of strengths and improvement areas

#### 8. **Academic Management Portal** (`academicas.html`)

**Primary Function**: Academic content organization and progress tracking
**Key Features**:

- **Syllabus Hierarchy**: College → Department → Batch → Course → Unit → Topic structure
- **Progress Visualization**: Interactive progress bars and completion indicators
- **Content Management**: Upload and organize syllabus documents
- **AI-powered Parsing**: Automatic extraction of course structure from text
- **Topic Completion**: Mark topics as completed with progress tracking
- **Academic Calendar**: Semester-based organization and scheduling
- **Performance Analytics**: Detailed insights into learning progress
- **Content Search**: Find specific topics and units across all courses
- **Export Functionality**: Generate progress reports and academic transcripts
- **Faculty Integration**: Tools for educators to manage student progress

#### 9. **Authentication Pages** (`login.html`, `signup.html`)

**Primary Function**: Secure user authentication and onboarding
**Key Features**:

- **Modern Auth Design**: Glass morphism effects with brand consistency
- **Multi-provider Support**: Email/password and OAuth integration
- **Progressive Registration**: Multi-step signup with academic information collection
- **Form Validation**: Real-time input validation and error handling
- **Security Features**: Password strength indicators and secure token management
- **Academic Integration**: College and department selection during signup
- **Responsive Design**: Mobile-optimized authentication flows
- **Error Handling**: User-friendly error messages and recovery options
- **Auto-login**: Remember user preferences and session management
- **Social Registration**: Integration with Google, GitHub, and other providers

#### 10. **Collaboration Management** (`collab.html`, `incoming_requests.html`, `my_applications.html`)

**Primary Function**: Application lifecycle and team collaboration management
**Key Features**:

- **Application Dashboard**: Centralized view of all application statuses
- **Real-time Messaging**: In-platform communication between team members
- **Request Management**: Handle incoming project applications efficiently
- **Status Tracking**: Visual indicators for application progress
- **Team Coordination**: Tools for project team management and communication
- **Notification System**: Real-time alerts for new messages and status changes
- **File Sharing**: Document and asset sharing within project teams
- **Meeting Scheduling**: Integration with calendar systems for team meetings
- **Task Assignment**: Project task distribution and progress monitoring
- **Feedback System**: Performance ratings and project reviews

#### 11. **Project Management Tools** (`project_post.html`, `project_applicants.html`)

**Primary Function**: Project creation and applicant management
**Key Features**:

- **Project Builder**: Step-by-step project creation with rich media support
- **Applicant Review**: Comprehensive candidate evaluation interface
- **Team Assembly**: Tools for building balanced project teams
- **Requirements Definition**: Detailed skill and experience requirement specification
- **Application Analytics**: Insights into application patterns and candidate quality
- **Communication Tools**: Direct messaging with potential team members
- **Decision Tracking**: Record and track hiring decisions with rationale
- **Onboarding Workflow**: Streamlined process for accepting new team members
- **Project Templates**: Pre-configured project types for common scenarios
- **Success Metrics**: KPIs and success criteria definition and tracking

#### 12. **Public Profiles** (`public_profile.html`)

**Primary Function**: Public-facing user profiles for networking and discovery
**Key Features**:

- **Professional Showcase**: Clean, LinkedIn-style professional presentation
- **Skills Verification Display**: Public visibility of verified technical competencies
- **Project Portfolio**: Showcase of completed and ongoing projects
- **Achievement Highlights**: Academic and professional accomplishments
- **Contact Integration**: Professional contact information and social links
- **Privacy Controls**: User-controlled visibility of profile elements
- **SEO Optimization**: Search engine friendly profile URLs and metadata
- **Print Support**: Professional PDF export for offline sharing
- **QR Code Generation**: Easy sharing via QR codes for networking events
- **Analytics Dashboard**: Profile view statistics and engagement metrics

#### 13. **Administrative Tools** (`add_syllabus.html`, `public_add_syllabus.html`, `clg.html`)

**Primary Function**: Content management and institutional administration
**Key Features**:

- **Bulk Syllabus Upload**: Efficient processing of academic content
- **Institution Management**: College and department administration tools
- **Content Validation**: AI-powered quality checks for uploaded syllabi
- **Batch Processing**: Handle multiple syllabi and course structures simultaneously
- **Integration APIs**: Connect with existing academic management systems
- **Audit Trails**: Comprehensive logging of administrative actions
- **User Role Management**: Granular permissions for different user types
- **Content Moderation**: Review and approve user-generated academic content
- **Data Export**: Bulk export capabilities for institutional reporting
- **System Monitoring**: Health checks and performance monitoring tools

### 🎨 UI Design Principles

#### Visual Design Language

- **Glass Morphism**: Modern translucent design with backdrop blur effects
- **Brand Color System**: Consistent brand palette with night mode variants
- **Typography**: Inter font family for optimal readability
- **Responsive Grid**: CSS Grid and Flexbox for adaptive layouts
- **Material Icons**: Google Material Symbols for consistent iconography

#### User Experience Features

- **Progressive Disclosure**: Complex information revealed gradually
- **Contextual Help**: Inline tooltips and guidance throughout the interface
- **Keyboard Navigation**: Full keyboard accessibility support
- **Loading States**: Skeleton screens and progress indicators
- **Error Boundaries**: Graceful error handling with recovery options
- **Offline Support**: Service worker integration for offline functionality

#### Performance Optimizations

- **Lazy Loading**: On-demand content loading for improved performance
- **Image Optimization**: Automatic image compression and format selection
- **Code Splitting**: Modular JavaScript loading for faster page loads
- **CDN Integration**: Static asset delivery optimization
- **Caching Strategy**: Intelligent browser caching for repeat visits

## 📊 Database Schema Deep Dive

### Core Tables Overview

#### User Management

- `user_profiles`: Extended user information beyond basic auth
- `colleges`, `departments`, `batches`: Academic institution hierarchy
- `user_topic_progress`: Individual learning progress tracking

#### Content Management

- `syllabus_courses`, `syllabus_units`, `syllabus_topics`: Structured academic content
- `projects`: Rich project metadata and collaboration details
- `project_applications`: Application workflow management
- `project_collab_messages`: In-platform communication

#### Assessment System

- `skill_tests`: Test sessions and question storage
- `skill_verifications`: Skill validation and scoring results

### Advanced Features

- **UUID Primary Keys**: Secure, non-sequential identifiers
- **JSONB Fields**: Flexible schema for complex data structures
- **Foreign Key Constraints**: Data integrity and referential consistency
- **Check Constraints**: Business rule enforcement at database level
- **Timestamp Tracking**: Comprehensive audit trails

## 🔒 Security & Compliance

### Data Protection

- **Encryption at Rest**: All sensitive data encrypted in database
- **Secure Transmission**: HTTPS/TLS for all API communications
- **Input Validation**: Comprehensive sanitization and validation
- **SQL Injection Prevention**: Parameterized queries and ORM protection
- **XSS Protection**: Output encoding and CSP headers

### Access Control

- **Role-Based Access**: Hierarchical permission system
- **Row-Level Security**: Database-level access control policies
- **Token-Based Auth**: Stateless JWT authentication
- **API Rate Limiting**: Request throttling and abuse prevention
- **Audit Logging**: Comprehensive activity tracking

### Compliance Features

- **GDPR Compliance**: Data privacy and user rights protection
- **Academic Privacy**: FERPA-compliant student data handling
- **Secure File Handling**: Malware scanning and type validation

## 🚀 Performance & Scalability

### Optimization Features

- **Caching Strategy**: Multi-level caching with Redis support
- **Database Indexing**: Optimized query performance
- **Async Processing**: Non-blocking I/O for high concurrency
- **CDN Integration**: Static asset optimization
- **Connection Pooling**: Efficient database resource management

### Monitoring & Analytics

- **Performance Metrics**: Response time and throughput monitoring
- **Error Tracking**: Comprehensive error logging and alerting
- **Usage Analytics**: User behavior and feature adoption tracking
- **Health Checks**: System status monitoring and reporting

## 🔧 Advanced Configuration

### AI Model Configuration

```python
# Multiple AI providers for redundancy and optimization
openai_model_client = OpenAIChatCompletionClient(model="gpt-4o-mini")
deepseek_model_client = OpenAIChatCompletionClient(
    base_url="https://openrouter.ai/api/v1",
    model="deepseek/deepseek-r1-0528:free"
)
gemini_model_client = OpenAIChatCompletionClient(model="gemini-2.5-flash")
```

### Content Filtering & Quality Control

```python
# Educational domain whitelist for content quality
ALLOWED_DOMAINS = [
    "geeksforgeeks.org", "tutorialspoint.com", "scaler.com",
    "byjus.com", "wikipedia.org", "tpointtech.com"
]

# Content extraction and quality scoring
def extract_sections_from_html(url, html):
    # Advanced HTML parsing with noise reduction
    # Content quality scoring and relevance filtering
    # Citation and reference extraction
```

## 📈 Analytics & Insights

### User Analytics

- **Learning Progress**: Topic completion rates and learning velocity
- **Engagement Metrics**: Session duration and feature utilization
- **Collaboration Patterns**: Project participation and team formation
- **Skill Development**: Assessment scores and verification progress

### System Analytics

- **Performance Monitoring**: API response times and error rates
- **Resource Utilization**: Database performance and storage usage
- **Feature Adoption**: New feature usage and user feedback
- **Content Quality**: AI-generated content accuracy and user satisfaction

## 🛠️ Development Guidelines

### Code Standards

- **PEP 8 Compliance**: Python coding standards adherence
- **Type Hints**: Comprehensive type annotations for maintainability
- **Documentation**: Detailed docstrings and inline comments
- **Testing**: Unit tests and integration test coverage
- **Version Control**: Git workflow with feature branches

### API Design Principles

- **RESTful Architecture**: Consistent endpoint design and HTTP methods
- **OpenAPI Specification**: Comprehensive API documentation
- **Error Handling**: Standardized error responses and codes
- **Versioning Strategy**: Backward compatibility maintenance
- **Rate Limiting**: Fair usage policies and abuse prevention

## 🔮 Future Roadmap

### Planned Enhancements

1. **Advanced AI Features**

   - Multi-modal content generation (text, images, diagrams)
   - Personalized learning path recommendations
   - Intelligent tutoring system integration
   - Voice-powered note generation

2. **Collaboration Improvements**

   - Real-time collaborative editing
   - Video conferencing integration
   - Advanced project matching algorithms
   - Peer review and feedback systems

3. **Mobile Applications**

   - Native iOS and Android apps
   - Offline content synchronization
   - Push notifications for collaboration
   - Mobile-optimized assessment interface

4. **Enterprise Features**
   - Multi-tenant architecture
   - Advanced reporting and analytics
   - LDAP/SSO integration
   - Institutional branding and customization

## 📞 Support & Maintenance

### Technical Support

- **Issue Tracking**: Comprehensive bug reporting and resolution
- **Performance Monitoring**: 24/7 system health monitoring
- **Security Updates**: Regular security patches and updates
- **Backup & Recovery**: Automated data backup and disaster recovery

### Maintenance Schedule

- **Regular Updates**: Monthly feature releases and improvements
- **Security Patches**: Weekly security updates and monitoring
- **Database Maintenance**: Automated optimization and cleanup
- **Performance Tuning**: Continuous performance monitoring and optimization

---

## ⚡ Quick Start Commands

```bash
# Development server
python main.py

# Production deployment
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Database migration
# Run SQL commands from db.sql in Supabase

# Install browser for PDF generation
playwright install chromium

# Environment setup
cp .env.example .env  # Configure your API keys
```

## 📋 System Requirements

### Minimum Requirements

- Python 3.8+ with pip
- 4GB RAM minimum (8GB recommended)
- 10GB available storage
- PostgreSQL 12+ (or Supabase)
- Internet connectivity for AI services

### Recommended Production Setup

- Python 3.10+ with virtual environment
- 16GB RAM for optimal performance
- 100GB+ SSD storage
- Load balancer for high availability
- Redis for caching
- CDN for static assets

---

**© 2024 PaperX. All Rights Reserved. Proprietary and Confidential.**

**This software contains trade secrets and proprietary information. Unauthorized reproduction or distribution is strictly prohibited.**

---

## 👩‍🏫 Teacher Module (Added Oct 2025)

Moderated teacher onboarding & collaboration:

Workflow:
1. Application: `POST /api/teacher/signup` inserts row in `teacher_applications` (status `pending`).
2. Admin Review: list via `GET /api/teacher/applications`, approve/reject with `POST /api/teacher/applications/{id}/review`.
3. Approval: grants `teacher` role (upsert into `admin_roles`).
4. Client Poll: `GET /api/teacher/me/status` until approved & role becomes teacher.
5. Directory: `GET /api/teachers` (public) lists approved teachers.
6. Connections: `POST /api/teacher/connect/{other_user_id}` creates canonical pair in `teacher_connections`.
7. Messaging: Poll endpoints `GET/POST /api/teacher/connections/{connection_id}/messages`.
8. Notes Upload: reuse `/api/marketplace/notes/upload`; dynamic metadata via `GET /api/teacher/notes/upload-meta`; list own via `GET /api/teacher/notes/mine`.

Database Additions:
- `teacher_applications`
- `teacher_connections`
- `teacher_messages`

Frontend Pages (`ui/teachers/`):
- `teacher_signup.html`, `teacher_login.html`, `teacher_connect.html`, `teacher_notes.html`.

Security:
- `_require_teacher()` + `_require_admin()` gating.
- Membership verification for connection/message routes.

Planned Enhancements:
- WebSocket real-time chat; teacher profile enrichment; message moderation & reporting; pagination & search filters.
