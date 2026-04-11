# PaperX API Map

> Complete endpoint reference for the PaperX FastAPI backend.
> Auto-generated from `main.py` and `packages/` routers.

---

## System

  Health check and static file serving

  GET  /health
    Purpose : Lightweight health probe used by the Render load balancer
    Input   : None
    Returns : `{ status, timestamp }`

  MOUNT  /ui
    Purpose : Serves the frontend SPA static files
    Input   : None
    Returns : Static HTML/JS/CSS assets

  MOUNT  /assets
    Purpose : Serves uploaded assets (images, teacher ID cards, etc.)
    Input   : None
    Returns : Static files from `assets/` directory

---

## Authentication & Session

  User signup, login, token refresh, logout, and device management

  POST  /signup
    Purpose : Register a new user account (with Turnstile CAPTCHA verification)
    Input   : email, password, turnstile_token
    Returns : Auth session with access_token and refresh_token

  POST  /login
    Purpose : Authenticate an existing user (with Turnstile CAPTCHA verification)
    Input   : email, password, turnstile_token
    Returns : Auth session with access_token and refresh_token

  POST  /refresh
    Purpose : Refresh access token using a refresh token (HttpOnly cookie or body)
    Input   : refresh_token (optional body, prefers cookie)
    Returns : New access_token, rotated refresh_token, expires_in

  POST  /logout
    Purpose : Invalidate auth cookies and revoke refresh token family
    Input   : None (uses cookies)
    Returns : `{ message: "Logged out" }` + cleared cookies

  POST  /api/signup/full
    Purpose : Full user signup with academic profile creation
    Input   : Full signup payload (name, email, password, college, dept, etc.)
    Returns : Auth session + created profile

  GET  /api/me
    Purpose : Get current authenticated user's basic info
    Input   : Bearer token
    Returns : User profile data

  GET  /api/me/devices
    Purpose : List active logged-in devices for the current user
    Input   : Bearer token
    Returns : List of devices with user_agent, IP, last_seen

  POST  /api/me/devices/signout
    Purpose : Sign out current device or all other devices
    Input   : device_id or mode ("current" / "others")
    Returns : Confirmation message

---

## Public Config

  Public configuration endpoints that do not require authentication

  GET  /api/public/supabase
    Purpose : Get public Supabase client config for frontend initialization
    Input   : None
    Returns : `{ url, anonKey }`

  GET  /api/public/turnstile
    Purpose : Get Cloudflare Turnstile site key for CAPTCHA widget
    Input   : None
    Returns : `{ siteKey }`

  GET  /api/public/academic-meta
    Purpose : Get colleges, degrees, departments for signup dropdowns (no auth)
    Input   : None
    Returns : `{ colleges[], degrees[], departments[] }`

---

## User Profile

  Extended user profile management, avatar, and resume upload

  GET  /api/profile/me
    Purpose : Get current user's extended profile (education, skills, etc.)
    Input   : Bearer token
    Returns : Full profile object

  PUT  /api/profile/me
    Purpose : Update current user's profile fields
    Input   : Profile fields to update (name, bio, links, etc.)
    Returns : Updated profile

  POST  /api/profile/upload
    Purpose : Upload profile image or resume and save URL
    Input   : File upload (multipart)
    Returns : `{ url }` of uploaded file

---

## College & Academic Hierarchy Management

  CRUD for colleges, degrees, departments, batches, and academic structure

  POST  /api/colleges
    Purpose : Create or update a college with departments and batches
    Input   : College name, departments[], batches[]
    Returns : Full college object with nested departments & batches

  GET  /api/colleges
    Purpose : List all colleges (id & name)
    Input   : None
    Returns : List of `{ id, name }`

  GET  /api/colleges/{college_id}
    Purpose : Get a college with full department and batch tree
    Input   : college_id in path
    Returns : CollegeFullOut with departments & batches

  POST  /api/colleges/{college_id}/logo
    Purpose : Upload or replace college logo image
    Input   : File upload (multipart), college_id
    Returns : `{ logo_url }`

  GET  /api/colleges/{college_id}/logo/debug
    Purpose : Debug: list stored logo objects for a college in GCS
    Input   : college_id
    Returns : List of GCS object paths

  GET  /api/colleges/{college_id}/departments
    Purpose : List department names for a college
    Input   : college_id
    Returns : List of department name strings

  GET  /api/colleges/{college_id}/departments/{dept_id}
    Purpose : Get department details
    Input   : college_id, dept_id
    Returns : Department object

  POST  /api/colleges/{college_id}/departments
    Purpose : Create a department under a college
    Input   : Department name, college_id
    Returns : Created department

  PUT  /api/colleges/{college_id}/departments/{dept_id}
    Purpose : Update a department
    Input   : Updated department fields
    Returns : Updated department

  DELETE  /api/colleges/{college_id}/departments/{dept_id}
    Purpose : Delete a department
    Input   : college_id, dept_id
    Returns : Confirmation

  POST  /api/colleges/{college_id}/departments/{dept_id}/degrees
    Purpose : Create a degree under a department
    Input   : Degree name
    Returns : Created degree

  PUT  /api/colleges/{college_id}/departments/{dept_id}/degrees/{degree_id}
    Purpose : Update a degree
    Input   : Updated fields
    Returns : Updated degree

  DELETE  /api/colleges/{college_id}/departments/{dept_id}/degrees/{degree_id}
    Purpose : Delete a degree
    Input   : degree_id
    Returns : Confirmation

  PUT  /api/colleges/{college_id}/departments/{dept_id}/batches/{batch_id}
    Purpose : Update a batch
    Input   : Updated batch fields
    Returns : Updated batch

  DELETE  /api/colleges/{college_id}/departments/{dept_id}/batches/{batch_id}
    Purpose : Delete a batch
    Input   : batch_id
    Returns : Confirmation

  POST  /api/batches/resolve
    Purpose : Resolve or create a batch ID for a college + dept + year range
    Input   : college_id, dept_name, from_year, to_year
    Returns : BatchWithIdOut

  GET  /api/colleges/{college_id}/departments/{dept_id}/subjects
    Purpose : List subjects for a department
    Input   : college_id, dept_id
    Returns : List of subjects

  POST  /api/colleges/{college_id}/departments/{dept_id}/subjects
    Purpose : Create a subject
    Input   : Subject name, semester, etc.
    Returns : Created subject

  PUT  /api/colleges/{college_id}/departments/{dept_id}/subjects/{subject_id}
    Purpose : Update a subject
    Input   : Updated fields
    Returns : Updated subject

  DELETE  /api/colleges/{college_id}/departments/{dept_id}/subjects/{subject_id}
    Purpose : Delete a subject
    Input   : subject_id
    Returns : Confirmation

---

## Syllabus Management

  Syllabus upload, parsing, and structured course/unit/topic CRUD

  POST  /api/parse/syllabus-text
    Purpose : Parse raw syllabus text into structured units/topics using AI
    Input   : Raw text content
    Returns : ParsedSyllabusOut (units with topics)

  POST  /api/syllabus/upload
    Purpose : Upload a syllabus PDF, parse with AI, and store units/topics
    Input   : PDF file upload (multipart)
    Returns : SyllabusCourseOut (created course with units)

  POST  /api/syllabus/upload-bulk
    Purpose : Upload a semester PDF containing multiple subjects; parse and store all
    Input   : PDF file, college_id, dept, semester
    Returns : List of created courses

  GET  /api/syllabus/upload
    Purpose : Info endpoint — explains how to use the syllabus upload API
    Input   : None
    Returns : Usage instructions

  POST  /api/syllabus/courses
    Purpose : Upsert syllabus course with units & topics
    Input   : Course details with nested units/topics
    Returns : SyllabusCourseOut

  PUT  /api/syllabus/courses/{course_id}
    Purpose : Update a syllabus course
    Input   : Updated course fields
    Returns : Updated course

  GET  /api/syllabus/courses
    Purpose : List syllabus courses with filters
    Input   : college_id, department, semester (optional filters)
    Returns : List of courses

  GET  /api/syllabus/courses/{course_id}
    Purpose : Get a single syllabus course with units and topics
    Input   : course_id
    Returns : Full course object

  PUT  /api/syllabus/courses/{course_id}/units/{unit_id}
    Purpose : Update a syllabus unit
    Input   : Updated unit fields
    Returns : Updated unit

  DELETE  /api/syllabus/courses/{course_id}/units/{unit_id}
    Purpose : Delete a syllabus unit
    Input   : unit_id
    Returns : Confirmation

  POST  /api/syllabus/courses/{course_id}/units
    Purpose : Create a new unit under a course
    Input   : Unit title, order
    Returns : Created unit

  POST  /api/syllabus/courses/{course_id}/units/{unit_id}/topics
    Purpose : Create a topic under a unit
    Input   : Topic title, order
    Returns : Created topic

  PUT  /api/syllabus/courses/{course_id}/units/{unit_id}/topics/{topic_id}
    Purpose : Update a syllabus topic
    Input   : Updated topic fields
    Returns : Updated topic

  DELETE  /api/syllabus/courses/{course_id}/units/{unit_id}/topics/{topic_id}
    Purpose : Delete a syllabus topic
    Input   : topic_id
    Returns : Confirmation

  PUT  /api/syllabus/topics/{topic_id}/rating
    Purpose : Update topic rating/difficulty
    Input   : rating value
    Returns : Updated topic

  DELETE  /api/syllabus/topics/{topic_id}/rating
    Purpose : Clear topic rating
    Input   : topic_id
    Returns : Confirmation

  PUT  /api/syllabus/topics/ratings/batch
    Purpose : Batch update topic ratings
    Input   : List of { topic_id, rating }
    Returns : Updated ratings

  DELETE  /api/syllabus/topics/ratings/batch
    Purpose : Batch clear topic ratings
    Input   : List of topic_ids
    Returns : Confirmation

  GET  /api/syllabus/topics/ratings/batch
    Purpose : Batch get topic ratings
    Input   : topic_ids[] (query param)
    Returns : Map of topic_id → rating

---

## PYQ (Previous Year Questions)

  Upload and manage previous year question papers

  GET  /api/pyq
    Purpose : List PYQ records with optional filters
    Input   : college_id, department, semester, subject (optional)
    Returns : List of PYQ records

  GET  /api/pyq/{record_id}
    Purpose : Get a single PYQ record by ID
    Input   : record_id
    Returns : PYQ record object

  POST  /api/pyq
    Purpose : Create PYQ metadata record
    Input   : subject, year, semester, file_url, etc.
    Returns : Created record

  POST  /api/pyq/upload
    Purpose : Upload PYQ file to Google bucket and create record
    Input   : File upload + metadata (multipart)
    Returns : Created record with file URL

  PUT  /api/pyq/{record_id}
    Purpose : Update PYQ record metadata
    Input   : Updated fields
    Returns : Updated record

  DELETE  /api/pyq/{record_id}
    Purpose : Delete a PYQ record (and optionally its file)
    Input   : record_id
    Returns : Confirmation

---

## Progress & Streaks

  Track topic completion, wishlists, history, and login streaks

  GET  /api/progress/topics
    Purpose : Get completed topic IDs for the current user
    Input   : Bearer token
    Returns : List of topic IDs

  POST  /api/progress/toggle
    Purpose : Mark or unmark a topic as completed
    Input   : topic_id
    Returns : Updated completion state

  GET  /api/progress/summary
    Purpose : Progress summary per course and unit for the current user
    Input   : Bearer token
    Returns : Progress percentages per course/unit

  GET  /api/wishlist
    Purpose : Get user's wishlisted topics
    Input   : Bearer token
    Returns : List of wishlisted topics

  POST  /api/wishlist/toggle
    Purpose : Add or remove a topic from wishlist
    Input   : topic_id
    Returns : Updated wishlist state

  DELETE  /api/wishlist/{topic_id}
    Purpose : Remove a specific topic from wishlist
    Input   : topic_id
    Returns : Confirmation

  GET  /api/wishlist/check/{topic_id}
    Purpose : Check if a topic is in the user's wishlist
    Input   : topic_id
    Returns : `{ wishlisted: true/false }`

  GET  /api/history
    Purpose : Get user's recently viewed topics
    Input   : Bearer token
    Returns : List of recently viewed topics with timestamps

  POST  /api/history/record
    Purpose : Record a topic view in user history
    Input   : topic_id
    Returns : Confirmation

  DELETE  /api/history/clear
    Purpose : Clear user's entire view history
    Input   : Bearer token
    Returns : Confirmation

  GET  /api/streak
    Purpose : Get user streak data (current streak, longest streak, etc.)
    Input   : Bearer token
    Returns : StreakResponse with current/longest streak, calendar

  POST  /api/streak/ping
    Purpose : Record user activity to maintain streak
    Input   : Bearer token
    Returns : Updated streak info

  GET  /api/leaderboard
    Purpose : Public leaderboard — top users by streak
    Input   : limit (optional)
    Returns : List of users with streak counts

---

## Admin — User & Security Management

  Admin-only endpoints for user management, roles, security, and access control

  GET  /api/admin/users
    Purpose : List user profiles with filters and pagination
    Input   : search, role, college_id, limit, offset
    Returns : Paginated list of user profiles

  POST  /api/admin/users/{auth_user_id}/academic
    Purpose : Update a user's academic/education details
    Input   : college_id, department_id, semester, section, batch_id
    Returns : Updated education record

  POST  /api/admin/users/{auth_user_id}/role
    Purpose : Update a user's role (student, teacher, admin, etc.)
    Input   : role string
    Returns : Updated role assignment

  DELETE  /api/admin/users/{auth_user_id}
    Purpose : Delete a user (profile + role)
    Input   : auth_user_id
    Returns : Confirmation

  GET  /api/admin/branch-hierarchy
    Purpose : Branch hierarchy with student counts per department/batch
    Input   : None
    Returns : Tree of colleges → departments → batches with counts

  GET  /api/admin/self-check
    Purpose : Verify current token has admin privileges
    Input   : Bearer token
    Returns : Admin status and role info

  GET  /api/admin/security/events
    Purpose : List persisted security telemetry events
    Input   : limit, offset, event_type, severity, search (optional filters)
    Returns : Paginated security events

  GET  /api/admin/security/incidents
    Purpose : List security incidents
    Input   : limit, offset, filters
    Returns : Paginated incidents

  PATCH  /api/admin/security/incidents/{incident_id}
    Purpose : Update incident state (acknowledge, resolve, etc.)
    Input   : new state/notes
    Returns : Updated incident

  GET  /api/admin/security/metrics
    Purpose : Security KPI metrics dashboard data
    Input   : None
    Returns : Metrics (event counts, abuse stats, etc.)

  GET  /api/admin/security/abuse/blocked
    Purpose : List blocked abuse-score IPs and reasons
    Input   : None
    Returns : List of blocked IPs with scores and reasons

  POST  /api/admin/security/abuse/ip-action
    Purpose : Allow, unallow, or unblock an abuse-scored IP
    Input   : ip, action ("allow" / "unallow" / "unblock")
    Returns : Confirmation

---

## Admin — Subscription Plans & Access Control

  Manage subscription plans, usage limits, and manual access overrides

  GET  /api/admin/plans
    Purpose : List subscription plans
    Input   : None
    Returns : List of plans

  POST  /api/admin/plans
    Purpose : Create a new subscription plan
    Input   : Plan name, features, limits, price
    Returns : Created plan

  PUT  /api/admin/plans/{plan_id}
    Purpose : Update a subscription plan
    Input   : Updated plan fields
    Returns : Updated plan

  POST  /api/admin/plans/{plan_id}/duplicate
    Purpose : Duplicate an existing plan as a new draft
    Input   : plan_id
    Returns : New duplicated plan

  POST  /api/admin/plans/{plan_id}/disable
    Purpose : Enable or disable a plan
    Input   : enabled (bool)
    Returns : Updated plan status

  POST  /api/admin/plans/{plan_id}/rest
    Purpose : Reset today's usage for all active users of a plan
    Input   : plan_id
    Returns : Count of reset users

  DELETE  /api/admin/plans/{plan_id}
    Purpose : Delete a plan
    Input   : plan_id
    Returns : Confirmation

  GET  /api/admin/usage-limits
    Purpose : List usage limit rules
    Input   : None
    Returns : List of rules

  POST  /api/admin/usage-limits
    Purpose : Create a usage limit rule
    Input   : Rule definition (feature, max count, window)
    Returns : Created rule

  PUT  /api/admin/usage-limits/{rule_id}
    Purpose : Update a usage limit rule
    Input   : Updated fields
    Returns : Updated rule

  DELETE  /api/admin/usage-limits/{rule_id}
    Purpose : Delete a usage limit rule
    Input   : rule_id
    Returns : Confirmation

  GET  /api/admin/manual-access/search
    Purpose : Search users for manual access management
    Input   : search query (email/name)
    Returns : Matching user list

  GET  /api/admin/manual-access/{auth_user_id}
    Purpose : Get manual access state for a user
    Input   : auth_user_id
    Returns : Current access overrides and plan info

  POST  /api/admin/manual-access/{auth_user_id}/action
    Purpose : Execute manual access action (grant, revoke, override)
    Input   : action type, parameters
    Returns : Updated access state

  POST  /api/access/check-and-consume
    Purpose : Server-side access decision — check permission and consume usage
    Input   : feature key
    Returns : `{ allowed, remaining, reason }`

  GET  /api/access/summary
    Purpose : Get effective access summary for the current user
    Input   : Bearer token
    Returns : Plan details, feature limits, current usage

---

## Teacher Management

  Teacher signup, applications, profiles, connections, and messaging

  POST  /api/teacher/signup
    Purpose : Teacher signup with ID card images (multipart form)
    Input   : Name, email, password, college_id, dept_id, ID card files
    Returns : Application created confirmation

  GET  /api/teacher/applications
    Purpose : Admin/Employee: list teacher applications
    Input   : status filter (optional)
    Returns : List of teacher applications

  POST  /api/teacher/applications/{application_id}/review
    Purpose : Admin/Employee: approve or reject a teacher application
    Input   : application_id, action ("approve"/"reject"), notes
    Returns : Updated application

  GET  /api/teacher/me/status
    Purpose : Teacher applicant: check own application status
    Input   : Bearer token
    Returns : Application status (pending/approved/rejected)

  GET  /api/teachers
    Purpose : List approved teachers with optional filters
    Input   : college_id, dept_id (optional)
    Returns : List of approved teacher profiles

  GET  /api/teacher/profile/{user_id}
    Purpose : Get teacher profile (public view)
    Input   : user_id
    Returns : Teacher profile with subjects, bio, avatar

  PUT  /api/teacher/profile/me
    Purpose : Upsert current teacher's extended profile
    Input   : Bio, subjects, qualifications, etc.
    Returns : Updated profile

  POST  /api/teacher/profile/avatar
    Purpose : Upload or replace teacher profile avatar
    Input   : Image file (multipart)
    Returns : `{ avatar_url }`

  POST  /api/teacher/profile/me/avatar
    Purpose : Upload or replace my teacher profile avatar (alt path)
    Input   : Image file (multipart)
    Returns : `{ avatar_url }`

  GET  /api/teacher/academics/mine
    Purpose : Return teacher's academic linkage and available departments + batches
    Input   : Bearer token
    Returns : Linked college, departments, batches

  POST  /api/teacher/connect/{other_user_id}
    Purpose : Create or fetch a teacher connection (peer networking)
    Input   : other_user_id
    Returns : Connection object

  GET  /api/teacher/connections
    Purpose : List my teacher connections
    Input   : Bearer token
    Returns : List of connections with latest message

  POST  /api/teacher/connections/{connection_id}/messages
    Purpose : Send a message on a teacher connection
    Input   : connection_id, message body
    Returns : Created message

  GET  /api/teacher/connections/{connection_id}/messages
    Purpose : List messages in a teacher connection
    Input   : connection_id, pagination
    Returns : List of messages

  GET  /api/teacher/notes/upload-meta
    Purpose : Dynamic academic dropdown metadata for teacher notes upload
    Input   : Bearer token
    Returns : Available colleges, departments, subjects

  GET  /api/teacher/notes/mine
    Purpose : List notes uploaded by the current teacher
    Input   : Bearer token
    Returns : List of notes with marketplace info

---

## Teacher — Class & Timetable Management

  Teacher class CRUD, student rosters, and timetable operations

  GET  /api/teacher/classes/mine
    Purpose : List my teacher classes
    Input   : Bearer token
    Returns : List of TeacherClassOut

  POST  /api/teacher/classes
    Purpose : Create a new teacher class
    Input   : subject_id, batch_id, section, semester
    Returns : TeacherClassOut

  GET  /api/teacher/classes/{class_id}
    Purpose : Get a specific teacher class
    Input   : class_id
    Returns : TeacherClassOut

  PUT  /api/teacher/classes/{class_id}
    Purpose : Update a teacher class
    Input   : Updated class fields
    Returns : TeacherClassOut

  DELETE  /api/teacher/classes/{class_id}
    Purpose : Delete a teacher class
    Input   : class_id
    Returns : Confirmation

  GET  /api/teacher/classes/{class_id}/students
    Purpose : Get student roster for a class
    Input   : class_id
    Returns : List of enrolled students

  PUT  /api/teacher/classes/{class_id}/timetable
    Purpose : Update timetable for a class
    Input   : Timetable schedule data
    Returns : Updated timetable

  DELETE  /api/teacher/classes/{class_id}/timetable
    Purpose : Clear timetable for a class
    Input   : class_id
    Returns : Confirmation

  GET  /api/teacher/timetable/mine
    Purpose : Get consolidated timetable for the teacher
    Input   : Bearer token
    Returns : Weekly timetable across all classes

  GET  /api/teacher/timetable/batch
    Purpose : Get timetable for a specific batch
    Input   : batch_id, dept_id
    Returns : Batch timetable

---

## Teacher — Tests & Assessment

  Create MCQ tests, AI question generation, track attempts, and view results

  POST  /api/teacher/tests/ai
    Purpose : Generate MCQ questions using AI for a given topic
    Input   : topic, subject, count, difficulty
    Returns : List of generated MCQ questions

  POST  /api/teacher/tests
    Purpose : Create a test (MCQ) with questions
    Input   : title, class_id, questions[], duration, etc.
    Returns : Created test object

  GET  /api/teacher/tests
    Purpose : List my tests (as teacher)
    Input   : Bearer token
    Returns : List of tests with metadata

  GET  /api/teacher/tests/{test_id}/attempts
    Purpose : View attempts and scores for a test
    Input   : test_id
    Returns : List of student attempts with scores

  GET  /api/teacher/tests/{test_id}/results
    Purpose : Detailed results and participation stats
    Input   : test_id
    Returns : Results with per-question analytics

  POST  /api/teacher/tests/{test_id}/ai-insights
    Purpose : Generate AI insights for a test report
    Input   : test_id
    Returns : AI-generated analysis of test performance

  PUT  /api/teacher/tests/{test_id}
    Purpose : Update a test
    Input   : Updated test fields
    Returns : Updated test

  DELETE  /api/teacher/tests/{test_id}
    Purpose : Delete a test
    Input   : test_id
    Returns : Confirmation

  PATCH  /api/teacher/tests/{test_id}/accepting
    Purpose : Toggle whether a test is accepting submissions
    Input   : accepting (bool)
    Returns : Updated test status

  GET  /api/tests/{test_id}
    Purpose : Fetch a test for taking (student view)
    Input   : test_id
    Returns : Test with questions (answers hidden)

  POST  /api/tests/{test_id}/start
    Purpose : Start a test attempt (one per student)
    Input   : test_id
    Returns : Attempt object with start time

  POST  /api/tests/{test_id}/submit
    Purpose : Submit a test attempt and auto-score
    Input   : test_id, answers[]
    Returns : Score and results

  GET  /api/tests/{test_id}/my-result
    Purpose : Get current user's submitted result for a test
    Input   : test_id
    Returns : Result with score and answers

---

## Teacher — Admin Profile Management

  Admin tools for teacher profile diagnostics and backfill

  POST  /api/admin/teacher/profile/resync/{user_id}
    Purpose : Force resync teacher profile from application data
    Input   : user_id
    Returns : Resynced profile

  GET  /api/admin/teacher-profiles/{user_id}
    Purpose : Fetch raw teacher_profiles row
    Input   : user_id
    Returns : Raw profile data

  POST  /api/admin/teacher-profiles/backfill
    Purpose : Backfill all approved teacher applications into teacher_profiles
    Input   : None
    Returns : Backfill results count

  GET  /api/admin/teacher-profiles/diagnostics
    Purpose : Diagnostics counts for teacher profiles vs applications
    Input   : None
    Returns : Counts and mismatches

  GET  /api/debug/teacher-routes
    Purpose : Debug: list registered teacher routes
    Input   : None
    Returns : List of route paths

  GET  /api/debug/teacher-avatar-route
    Purpose : Debug: confirm avatar route is registered
    Input   : None
    Returns : Route presence confirmation

---

## HOD (Head of Department)

  HOD-specific functionality for department oversight

  POST  /api/hod/signup
    Purpose : HOD signup (creates teacher + HOD role applications)
    Input   : Name, email, password, college_id, dept_id, credentials
    Returns : Application confirmation

  GET  /api/admin/hod-applications
    Purpose : Admin: list HOD role applications
    Input   : status filter (optional)
    Returns : List of HOD applications

  POST  /api/admin/hod-applications/{application_id}/review
    Purpose : Admin: approve or reject a HOD role application
    Input   : application_id, action, notes
    Returns : Updated application

  GET  /api/hod/me
    Purpose : Get current HOD scope and departments
    Input   : Bearer token
    Returns : HOD profile with department list

  POST  /api/hod/change-password
    Purpose : HOD: change account password
    Input   : current_password, new_password
    Returns : Confirmation

  GET  /api/hod/classes
    Purpose : List classes in HOD's departments
    Input   : Bearer token
    Returns : List of classes with teachers

  GET  /api/hod/batches
    Purpose : List batches in HOD's departments
    Input   : Bearer token
    Returns : List of batches

  GET  /api/hod/batch-management
    Purpose : Get batch management selections for HOD
    Input   : Bearer token
    Returns : Current batch selections

  POST  /api/hod/batch-management
    Purpose : Update batch management selections
    Input   : Selected batch IDs
    Returns : Updated selections

  GET  /api/hod/staff
    Purpose : List staff (teachers) in HOD's departments
    Input   : Bearer token
    Returns : List of teachers with class assignments

  POST  /api/hod/staff/remove
    Purpose : Remove a staff member from a department and unassign their classes
    Input   : user_id, department_id
    Returns : Confirmation

  POST  /api/hod/classes/{class_id}/reassign
    Purpose : Reassign a class to another teacher
    Input   : class_id, new_teacher_id
    Returns : Updated class

  GET  /api/hod/applications
    Purpose : List teacher applications in HOD's departments
    Input   : Bearer token
    Returns : List of applications

  POST  /api/hod/applications/{application_id}/review
    Purpose : Save a recommendation note for an application
    Input   : application_id, recommendation note
    Returns : Updated application

  POST  /api/hod/classes/assign
    Purpose : Assign a staff member to an unassigned/virtual subject
    Input   : class details, teacher_id
    Returns : Created/updated class

  POST  /api/hod/ai/meeting-agenda
    Purpose : AI: generate a meeting agenda for the department
    Input   : Context, topics (optional)
    Returns : AI-generated agenda

  POST  /api/hod/ai/risk-flags
    Purpose : AI: generate risk flags and recommendations for the department
    Input   : Department context data
    Returns : AI-generated risk analysis

---

## Projects & Collaboration

  Student project marketplace, applications, collaboration messaging, and skills

  POST  /api/projects
    Purpose : Create a new project listing
    Input   : title, description, skills_required, etc.
    Returns : ProjectOut

  GET  /api/projects
    Purpose : List all projects with filters
    Input   : search, skills, status (optional filters)
    Returns : List of ProjectOut

  GET  /api/projects/{project_id}
    Purpose : Get a single project by ID
    Input   : project_id
    Returns : ProjectOut

  POST  /api/projects/{project_id}/upload
    Purpose : Upload project attachment/documentation
    Input   : project_id, file (multipart)
    Returns : File URL

  POST  /api/projects/{project_id}/apply
    Purpose : Apply to join a project
    Input   : project_id, cover_letter, skills
    Returns : Application confirmation

  GET  /api/projects/{project_id}/applications
    Purpose : List applications for a project (owner view)
    Input   : project_id
    Returns : List of ProjectApplicationOut

  GET  /api/projects/{project_id}/applications/me
    Purpose : Check my application status for a project
    Input   : project_id
    Returns : My application or 404

  GET  /api/projects/{project_id}/applications/{application_id}
    Purpose : Get a specific application
    Input   : project_id, application_id
    Returns : ProjectApplicationOut

  PATCH  /api/projects/{project_id}/applications/{application_id}
    Purpose : Update application status (accept/reject)
    Input   : status update
    Returns : Updated application

  GET  /api/applications/incoming
    Purpose : List applications received for my projects
    Input   : Bearer token
    Returns : List of incoming applications

  GET  /api/applications/mine
    Purpose : List my outgoing applications
    Input   : Bearer token
    Returns : List of my applications

  GET  /api/applications/{application_id}
    Purpose : Get a single application by ID
    Input   : application_id
    Returns : Application detail

  GET  /api/collab/{application_id}/messages
    Purpose : Get collaboration messages for an accepted application
    Input   : application_id
    Returns : List of messages

  POST  /api/collab/{application_id}/messages
    Purpose : Send a collaboration message
    Input   : application_id, message body
    Returns : Created message

  GET  /api/public/profiles/{user_id}
    Purpose : Get public user profile (for project listings)
    Input   : user_id
    Returns : Public profile info

  GET  /api/profile
    Purpose : Get current user's profile
    Input   : Bearer token
    Returns : User profile

  POST  /api/profile
    Purpose : Create or update current user's profile
    Input   : Profile fields
    Returns : Updated profile

---

## Skills & Verification

  Skill tests and verification badges

  GET  /api/public/skills/verifications/{user_id}
    Purpose : Get skill verifications for a user (public)
    Input   : user_id
    Returns : List of SkillVerificationOut

  GET  /api/skills/verifications
    Purpose : Get my skill verifications
    Input   : Bearer token
    Returns : List of SkillVerificationOut

  POST  /api/skills/tests/start
    Purpose : Start a skill verification test session
    Input   : skill name/category
    Returns : SkillTestStartOut (session_id, questions)

  POST  /api/skills/tests/{session_id}/submit
    Purpose : Submit answers for a skill test
    Input   : session_id, answers[]
    Returns : Score and verification result

---

## AI Notes Generation

  Generate, manage, and interact with AI-powered study notes

  POST  /api/notes/generate
    Purpose : Generate AI notes for a topic (Gemini-powered)
    Input   : topic, subject, variant (optional)
    Returns : Generated note content (HTML/Markdown)

  GET  /api/notes/generate/stream
    Purpose : Stream AI notes generation (SSE)
    Input   : topic, subject, variant (query params)
    Returns : Server-Sent Events with note chunks

  POST  /api/physics-notes/generate
    Purpose : Generate Physics-specific notes (physics-optimized prompt)
    Input   : topic
    Returns : Generated physics notes

  GET  /api/physics-notes/generate/stream
    Purpose : Stream Physics notes generation (SSE)
    Input   : topic (query param)
    Returns : Server-Sent Events

  POST  /api/maths-notes/generate
    Purpose : Generate Engineering Mathematics notes (Gemini 3 Pro)
    Input   : topic
    Returns : Generated math notes with LaTeX

  GET  /api/maths-notes/generate/stream
    Purpose : Stream Engineering Mathematics notes (SSE)
    Input   : topic (query param)
    Returns : Server-Sent Events

  POST  /api/maths-notes/solve
    Purpose : Solve a math practice problem step-by-step
    Input   : problem text
    Returns : Step-by-step solution

  POST  /api/notes/transform
    Purpose : Transform/reformat existing notes content
    Input   : note content, transformation type
    Returns : Transformed content

  POST  /api/notes/snippet-assist
    Purpose : AI snippet assistant — explain, expand, or simplify a text selection
    Input   : selected_text, action ("explain"/"expand"/"simplify")
    Returns : AI-generated clarification

  POST  /api/notes/verify
    Purpose : Teacher/HOD: verify (approve) a note
    Input   : note_id, verification status
    Returns : Updated verification state

  POST  /api/notes/caseflow
    Purpose : Generate or retrieve CaseFlow scenario question for a topic
    Input   : topic, subject
    Returns : Case scenario with decision points

  POST  /api/notes/caseflow/evaluate
    Purpose : Evaluate CaseFlow learner answer with Gemini
    Input   : scenario_id, learner answer
    Returns : AI evaluation with feedback

  POST  /api/notes/viva/respond
    Purpose : Viva simulator: AI examiner responds to student answer
    Input   : topic, question, student_answer
    Returns : Examiner follow-up or evaluation

  POST  /api/notes/clinical-decision-tree
    Purpose : Generate clinical decision trees for a medical topic
    Input   : topic
    Returns : Decision tree structure

  POST  /api/notes/match-following
    Purpose : Generate or retrieve "Match the Following" pairs for a topic
    Input   : topic
    Returns : Matching pairs with answers

---

## Notes CRUD

  Standard CRUD operations for saved notes

  GET  /api/notes
    Purpose : List saved notes for the current user
    Input   : Bearer token, search (optional)
    Returns : List of notes

  POST  /api/notes
    Purpose : Create/save a new note
    Input   : title, content, topic, etc.
    Returns : Created note

  GET  /api/notes/{note_id}
    Purpose : Get a specific note by ID
    Input   : note_id
    Returns : Full note object

  PUT  /api/notes/{note_id}
    Purpose : Update a note
    Input   : Updated fields
    Returns : Updated note

  GET  /api/notes/{note_id}/download
    Purpose : Download a note as a file
    Input   : note_id
    Returns : File download

  GET  /api/notes/{note_id}/pdf
    Purpose : Get note as PDF
    Input   : note_id
    Returns : PDF file

  POST  /api/notes/{note_id}/flashcards
    Purpose : Generate AI flashcards from a note
    Input   : note_id, count (optional)
    Returns : List of flashcard objects

  POST  /api/notes/{note_id}/mcq
    Purpose : Generate MCQ quiz questions from a note
    Input   : note_id, count (optional)
    Returns : List of MCQ questions

  GET  /api/notes/topics/search
    Purpose : Search AI notes topics for autocomplete
    Input   : query string
    Returns : Matching topic suggestions

  GET  /api/notes/resolve
    Purpose : Resolve AI note by exact title + variant
    Input   : title, variant
    Returns : Note object or 404

  GET  /api/notes/ppt-link
    Purpose : Get PPT link for a topic from ai_notes
    Input   : topic title
    Returns : `{ ppt_link }`

  GET  /api/notes/edited/check
    Purpose : Check if user has edited notes
    Input   : Bearer token
    Returns : `{ has_edited: bool }`

  GET  /api/notes/edited
    Purpose : Get user's edited notes
    Input   : Bearer token
    Returns : List of edited notes

  POST  /api/notes/edited
    Purpose : Save an edited note
    Input   : note_id, edited content
    Returns : Saved edited note

  POST  /api/pdf
    Purpose : Generate a PDF from content
    Input   : HTML/Markdown content
    Returns : PDF file download

---

## Notes — Domain Configuration

  Configure allowed academic domains for AI note generation

  GET  /api/notes/allowed-domains
    Purpose : Get allowed domains for a degree
    Input   : degree_id
    Returns : DegreeDomainsOut

  POST  /api/notes/allowed-domains
    Purpose : Replace allowed domains for a degree
    Input   : degree_id, domains[]
    Returns : DegreeDomainsOut

  DELETE  /api/notes/allowed-domains
    Purpose : Delete a single domain from a degree
    Input   : degree_id, domain
    Returns : Confirmation

  GET  /api/notes/degrees
    Purpose : List degrees with configured domains
    Input   : None
    Returns : List of DegreeDomainsOut

  POST  /api/notes/feedback
    Purpose : Submit feedback about generated notes quality
    Input   : note_id, rating, comment
    Returns : Confirmation

  GET  /api/admin/notes-feedback
    Purpose : Admin: list notes feedback entries
    Input   : limit, offset, filters
    Returns : Paginated feedback list

  GET  /api/admin/notes-feedback/{feedback_id}
    Purpose : Admin: get a single feedback item
    Input   : feedback_id
    Returns : Feedback detail

  PATCH  /api/admin/notes-feedback/{feedback_id}
    Purpose : Admin: update feedback status/notes
    Input   : status, admin_notes
    Returns : Updated feedback

---

## Marketplace (Notes Trading)

  Upload, browse, purchase, and review shared study notes

  POST  /api/marketplace/notes
    Purpose : Upload a note to the marketplace
    Input   : File + metadata (title, price, subject, etc.)
    Returns : Created marketplace note

  GET  /api/marketplace/notes
    Purpose : List marketplace notes with filters
    Input   : subject, college, price range, sort (optional)
    Returns : Paginated list of notes

  POST  /api/marketplace/subjects/teacher-notes/batch
    Purpose : Batch list teacher marketplace notes for multiple subjects
    Input   : subject_ids[]
    Returns : Map of subject_id → notes[]

  GET  /api/marketplace/subjects/{subject_id}/teacher-notes
    Purpose : List teacher marketplace notes for a specific subject
    Input   : subject_id
    Returns : List of teacher notes

  GET  /api/marketplace/notes/meta
    Purpose : Distinct filter metadata (subjects, colleges, price ranges)
    Input   : None
    Returns : Available filter values

  GET  /api/marketplace/notes/{note_id}
    Purpose : Get marketplace note detail
    Input   : note_id
    Returns : Full note object with reviews

  GET  /api/marketplace/notes/{note_id}/download
    Purpose : Download a marketplace note file
    Input   : note_id
    Returns : File download (if purchased/free)

  GET  /api/marketplace/notes/{note_id}/preview
    Purpose : Inline preview for PDF or image notes
    Input   : note_id
    Returns : Preview content

  GET  /api/marketplace/notes/{note_id}/cover
    Purpose : Get cover image for a marketplace note
    Input   : note_id
    Returns : Cover image

  POST  /api/marketplace/notes/{note_id}/purchase
    Purpose : Purchase a paid note (mock payment)
    Input   : note_id
    Returns : Purchase confirmation

  POST  /api/marketplace/notes/{note_id}/review
    Purpose : Add or update a review for a note
    Input   : note_id, rating, comment
    Returns : Created/updated review

  PUT  /api/marketplace/notes/{note_id}
    Purpose : Update own note metadata
    Input   : Updated fields
    Returns : Updated note

  POST  /api/marketplace/notes/{note_id}/replace-file
    Purpose : Replace stored file for own note
    Input   : New file (multipart)
    Returns : Updated file URL

  DELETE  /api/marketplace/notes/{note_id}
    Purpose : Delete own marketplace note
    Input   : note_id
    Returns : Confirmation

---

## Print Shop

  Student print job ordering, shop management, and admin settlement

  POST  /api/shop/signup
    Purpose : Create a print shop owned by the current user
    Input   : Shop name, location, pricing info
    Returns : Created shop profile

  GET  /api/shop/me
    Purpose : Get my shop profile
    Input   : Bearer token
    Returns : Shop profile

  PATCH  /api/shop/me
    Purpose : Update my shop profile (name, pricing, hours, etc.)
    Input   : Updated fields
    Returns : Updated shop

  POST  /api/shop/logo
    Purpose : Upload or replace shop logo
    Input   : Image file (multipart)
    Returns : `{ logo_url }`

  GET  /api/print/shops
    Purpose : List print shops with filters
    Input   : location, name search (optional)
    Returns : List of shops

  POST  /api/print/jobs
    Purpose : Create a print job (submit file for printing)
    Input   : shop_id, file, copies, color, binding
    Returns : Created job with OTP

  GET  /api/orders
    Purpose : List my print jobs (as student)
    Input   : Bearer token
    Returns : List of print orders

  GET  /api/orders/{job_id}
    Purpose : Get job details
    Input   : job_id
    Returns : Job object with status

  POST  /api/orders/{job_id}/cancel
    Purpose : Cancel a job (if not yet accepted)
    Input   : job_id
    Returns : Confirmation

  POST  /api/orders/{job_id}/resend-otp
    Purpose : Regenerate pickup OTP
    Input   : job_id
    Returns : New OTP

  GET  /api/shop/jobs
    Purpose : List jobs for my shop (shop owner view)
    Input   : Bearer token, status filter
    Returns : List of jobs

  POST  /api/shop/jobs/{job_id}/accept
    Purpose : Accept a print job
    Input   : job_id
    Returns : Updated job

  POST  /api/shop/jobs/{job_id}/reject
    Purpose : Reject a print job
    Input   : job_id
    Returns : Updated job

  POST  /api/shop/jobs/{job_id}/printing
    Purpose : Mark a job as currently printing
    Input   : job_id
    Returns : Updated job

  POST  /api/shop/jobs/{job_id}/ready
    Purpose : Mark a job as ready for pickup
    Input   : job_id
    Returns : Updated job

  POST  /api/shop/jobs/{job_id}/release
    Purpose : Release a job (verify OTP and complete)
    Input   : job_id, otp
    Returns : Completed job

  GET  /api/admin/roles/me
    Purpose : Return current user's admin role
    Input   : Bearer token
    Returns : Role info

  GET  /api/admin/print/shops
    Purpose : Admin: list all print shops
    Input   : None
    Returns : All shops

  GET  /api/admin/print/shops/{shop_id}/jobs
    Purpose : Admin: list jobs for a specific shop
    Input   : shop_id
    Returns : List of jobs

  POST  /api/admin/print/shops/{shop_id}/settle
    Purpose : Admin: settle all completed jobs → settled status
    Input   : shop_id
    Returns : AdminSettleOut (count, amount)

  POST  /api/admin/print/shops/{shop_id}/jobs/{job_id}/close
    Purpose : Admin: close a job for a shop (admin override)
    Input   : shop_id, job_id
    Returns : Closed job

---

## GARLIC Study Planner

  AI-powered adaptive study plan generation, tracking, and execution

  POST  /api/garlic/study-plan/generate
    Purpose : Generate or fetch a GARLIC study plan for a student
    Input   : student_id, subject context
    Returns : Study plan with prioritized topics

  POST  /api/garlic/generate
    Purpose : Generate GARLIC plan if missing, else return saved plan
    Input   : student_id
    Returns : Study plan

  POST  /api/garlic/regenerate
    Purpose : Explicitly regenerate the GARLIC plan from scratch
    Input   : student_id
    Returns : Fresh study plan

  GET  /api/garlic/study-plan/{student_id}
    Purpose : Get the latest GARLIC study plan
    Input   : student_id
    Returns : Study plan object

  GET  /api/garlic/plan/{student_id}
    Purpose : Load persisted GARLIC plan
    Input   : student_id
    Returns : Persisted plan

  PATCH  /api/garlic/study-plan/items/{item_id}
    Purpose : Update a GARLIC plan item (mark done, reschedule, etc.)
    Input   : item_id, updated fields
    Returns : Updated item

  POST  /api/garlic/study-plan/interaction
    Purpose : Track a GARLIC topic interaction (opened, completed, skipped)
    Input   : student_id, topic_id, interaction_type
    Returns : Confirmation

---

## GARLIC Runtime

  Real-time GARLIC execution session tracking and confidence updates

  POST  /api/garlic/runtime/session/start
    Purpose : Start or resume a GARLIC execution session
    Input   : student_id
    Returns : Session ID and state

  POST  /api/garlic/runtime/session/end
    Purpose : End a GARLIC execution session
    Input   : session_id
    Returns : Session summary

  POST  /api/garlic/runtime/session/track
    Purpose : Track live GARLIC execution behavior (time-on-task, interactions)
    Input   : session_id, event data
    Returns : Confirmation

  POST  /api/garlic/runtime/topic/complete
    Purpose : Complete a GARLIC topic execution with outcome data
    Input   : session_id, topic_id, outcome metrics
    Returns : Updated topic state

  POST  /api/garlic/runtime/confidence/update
    Purpose : Update GARLIC topic confidence from runtime behavior
    Input   : session_id, topic_id, confidence score
    Returns : Updated confidence

---

## GARLIC v3 — Exam Mode & Diagnostics

  Advanced GARLIC features: exam mode, diagnostics, predictions, and adaptive replanning

  POST  /api/garlic/v3/exam-mode/activate
    Purpose : Activate GARLIC Exam Mode (focused study for upcoming exam)
    Input   : student_id, exam details (date, subjects)
    Returns : Activated exam plan

  GET  /api/garlic/v3/exam-mode/status
    Purpose : Get current exam mode status
    Input   : student_id
    Returns : Exam mode state

  POST  /api/garlic/v3/exam-mode/deactivate
    Purpose : Deactivate exam mode
    Input   : student_id
    Returns : Confirmation

  POST  /api/garlic/v3/diagnostic/start
    Purpose : Start a diagnostic session (knowledge assessment)
    Input   : student_id, subject
    Returns : Diagnostic session with initial questions

  POST  /api/garlic/v3/diagnostic/answer
    Purpose : Submit a diagnostic answer
    Input   : session_id, question_id, answer
    Returns : Next question or completion

  GET  /api/garlic/v3/diagnostic/results/{session_id}
    Purpose : Get diagnostic results and knowledge gaps
    Input   : session_id
    Returns : Results with topic mastery levels

  POST  /api/garlic/v3/diagnostic/micro
    Purpose : Generate a micro-diagnostic question (quick pulse check)
    Input   : student_id, topic_id
    Returns : Single diagnostic question

  GET  /api/garlic/v3/outcomes/{student_id}
    Purpose : Get outcome predictions (predicted scores, pass probability)
    Input   : student_id
    Returns : Prediction data

  GET  /api/garlic/v3/outcomes/history/{student_id}
    Purpose : Get prediction history (track improvement over time)
    Input   : student_id
    Returns : List of historical predictions

  POST  /api/garlic/v3/replan
    Purpose : Trigger adaptive replan based on new performance data
    Input   : student_id
    Returns : Updated study plan

  POST  /api/garlic/v3/confidence-decay
    Purpose : Apply confidence decay to un-revised topics
    Input   : student_id
    Returns : Decayed confidence values

  POST  /api/garlic/v3/deviation/log
    Purpose : Log a study plan deviation (student went off-plan)
    Input   : student_id, deviation details
    Returns : Logged deviation

  GET  /api/garlic/v3/daily-target/{student_id}
    Purpose : Get today's target and progress
    Input   : student_id
    Returns : Daily target count, completed count

  GET  /api/garlic/v3/exam-insights/{student_id}
    Purpose : Get actionable exam insights
    Input   : student_id
    Returns : Priority topics, weak areas, recommendations

  POST  /api/garlic/v3/session/auto-close
    Purpose : Auto-close a GARLIC session on page exit
    Input   : session_id
    Returns : Confirmation

  GET  /api/garlic/v3/velocity/{student_id}
    Purpose : Get learning velocity metrics (topics/day, time trends)
    Input   : student_id
    Returns : Velocity data

---

## Learning Tracks

  Structured learning paths with AI practice, mock tests, and code execution

  GET  /api/learning-tracks/config
    Purpose : Get learning tracks configuration (available tracks)
    Input   : None
    Returns : Track list with metadata

  GET  /api/learning-tracks/plan/latest
    Purpose : Get user's latest learning plan
    Input   : Bearer token
    Returns : Current plan with progress

  POST  /api/learning-tracks/path
    Purpose : Create or update a learning path
    Input   : track selection, preferences
    Returns : Personalized learning path

  POST  /api/learning-tracks/topic/practice
    Purpose : Generate AI practice exercises for a topic
    Input   : topic, difficulty
    Returns : Practice exercises

  POST  /api/learning-tracks/mock
    Purpose : Generate a mock test for a learning track topic
    Input   : topic, question count
    Returns : Mock test questions

  POST  /api/learning-tracks/analytics
    Purpose : Get learning track analytics for the user
    Input   : track info
    Returns : Performance analytics

  POST  /api/learning-tracks/faculty-brief
    Purpose : Generate a faculty brief/summary for a topic
    Input   : topic
    Returns : Concise faculty-oriented summary

  POST  /api/learning-tracks/code/execute
    Purpose : Execute code in a learning track context
    Input   : code, language
    Returns : Execution output

  POST  /api/learning-tracks/code/explain
    Purpose : AI: explain code in a learning context
    Input   : code snippet
    Returns : AI explanation

  POST  /api/learning-tracks/progress
    Purpose : Update learning track progress
    Input   : topic_id, completion status
    Returns : Updated progress

---

## YouTube Transcripts

  Fetch and process YouTube video transcripts with note generation

  GET  /transcript.txt
    Purpose : Get plain-text transcript of a YouTube video
    Input   : url, lang, fallback_ytdlp, use_whisper, clean (query params)
    Returns : Plain text transcript

  POST  /api/transcripts/paragraph
    Purpose : Get YouTube transcript formatted as paragraphs
    Input   : video URL
    Returns : YouTubeTranscriptResponse

  POST  /api/transcripts/meta
    Purpose : Get YouTube video metadata (title, channel, duration)
    Input   : video URL
    Returns : YouTubeMetaResponse

  POST  /api/transcripts/notes
    Purpose : Generate AI notes from a YouTube transcript
    Input   : video URL
    Returns : YouTubeTranscriptNotesResponse

  GET  /api/transcripts/saved/{video_id}
    Purpose : Get previously saved transcript notes for a video
    Input   : video_id
    Returns : Saved notes or 404

---

## YouTube Search

  Search YouTube videos and fetch channel logos

  GET  /api/youtube/search
    Purpose : Search YouTube for videos
    Input   : query, max_results (optional)
    Returns : Search results with thumbnails

  GET  /api/youtube/channel-logo
    Purpose : Get channel logo/avatar URL
    Input   : channel_id or channel URL
    Returns : Logo URL

---

## Analytics

  User session tracking, event logging, and admin analytics dashboard

  POST  /analytics/session/start
    Purpose : Start a new analytics session
    Input   : user_id (optional), user_agent
    Returns : `{ session_id }`

  POST  /analytics/session/heartbeat
    Purpose : Keep analytics session alive
    Input   : session_id
    Returns : `{ status: "ok" }`

  POST  /analytics/event
    Purpose : Track an analytics event
    Input   : session_id, event_type, event_data, user_id (optional)
    Returns : `{ status: "ok" }`

  POST  /analytics/feedback/topic
    Purpose : Submit topic helpfulness feedback
    Input   : user_id, topic_id, is_helpful, comment (optional)
    Returns : `{ status: "ok" }`

  GET  /analytics/dashboard
    Purpose : Admin: analytics dashboard summary data
    Input   : Bearer token (admin only)
    Returns : Dashboard metrics (sessions, events, feedback counts)

  GET  /analytics/active-users
    Purpose : Admin: active users in last 24 hours
    Input   : limit (optional)
    Returns : `{ count_24h, users[] }` with activity timestamps

  GET  /analytics/engineer-profile
    Purpose : Admin: deep profile analytics by email
    Input   : email (query), Bearer token
    Returns : Detailed user profile with activity, sessions, events

---

## TuneX (packages/tunex_router.py)

  Interactive coding topic content generation and delivery

  GET  /api/tunex/topics/{topic_id}/full
    Purpose : Get topic metadata and all chapters with full content
    Input   : topic_id
    Returns : Topic with chapters (concept, quiz, walkthrough, interview, etc.)

  POST  /api/tunex/topics/{topic_id}/ai/ensure
    Purpose : Ensure AI-generated content exists for a topic (generate if missing)
    Input   : topic_id
    Returns : Full topic with AI-generated chapters

---

## TuneX Compiler

  Code execution endpoints for interactive coding exercises

  POST  /api/tunex/compiler/run
    Purpose : Execute Python code (sandboxed via compiler worker)
    Input   : code (string), Bearer token
    Returns : `{ output, error, status }`

  POST  /api/tunex/compiler/java/run
    Purpose : Compile and run Java code (sandboxed via compiler worker)
    Input   : code (string), Bearer token
    Returns : `{ output, error, status }`

---

## Problems Solver (packages/problems_api.py)

  LeetCode-style problem definitions and test runner

  GET  /api/tunex/problems/{id}
    Purpose : Get a coding problem definition
    Input   : problem id
    Returns : Problem with description, boilerplate, examples, constraints

  POST  /api/tunex/problems/{id}/run
    Purpose : Run user code against test cases for a problem
    Input   : id, code (body)
    Returns : `{ status, total_tests, passed_tests, results[] }`

---

## LCoding (Structured Coding Curriculum)

  Hierarchical coding curriculum management: Languages → Levels → Sections → Topics

  GET  /api/lcoding/languages
    Purpose : List all programming languages
    Input   : None
    Returns : List of LcodingLanguage

  POST  /api/lcoding/languages
    Purpose : Create a new language entry
    Input   : name, icon, description
    Returns : LcodingLanguage

  GET  /api/lcoding/languages/{lang_id}
    Purpose : Get a single language
    Input   : lang_id
    Returns : LcodingLanguage

  PUT  /api/lcoding/languages/{lang_id}
    Purpose : Update a language
    Input   : Updated fields
    Returns : LcodingLanguage

  GET  /api/lcoding/languages/{lang_id}/levels
    Purpose : List levels for a language
    Input   : lang_id
    Returns : List of LcodingLevel

  POST  /api/lcoding/languages/{lang_id}/levels
    Purpose : Create a level under a language
    Input   : title, order
    Returns : LcodingLevel

  GET  /api/lcoding/levels/{level_id}
    Purpose : Get a single level
    Input   : level_id
    Returns : LcodingLevel

  PUT  /api/lcoding/levels/{level_id}
    Purpose : Update a level
    Input   : Updated fields
    Returns : LcodingLevel

  DELETE  /api/lcoding/levels/{level_id}
    Purpose : Delete a level
    Input   : level_id
    Returns : Confirmation

  GET  /api/lcoding/levels/{level_id}/sections
    Purpose : List sections for a level
    Input   : level_id
    Returns : List of LcodingSection

  POST  /api/lcoding/levels/{level_id}/sections
    Purpose : Create a section under a level
    Input   : title, order
    Returns : LcodingSection

  GET  /api/lcoding/sections/{section_id}
    Purpose : Get a single section
    Input   : section_id
    Returns : LcodingSection

  GET  /api/lcoding/sections/{section_id}/topics
    Purpose : List topics in a section
    Input   : section_id
    Returns : List of LcodingTopic

  POST  /api/lcoding/sections/{section_id}/topics
    Purpose : Create a topic in a section
    Input   : title, order
    Returns : LcodingTopic

  GET  /api/lcoding/topics/{topic_id}
    Purpose : Get a single topic
    Input   : topic_id
    Returns : LcodingTopic

  PATCH  /api/lcoding/topics/{topic_id}
    Purpose : Update a topic
    Input   : Updated fields
    Returns : LcodingTopic

  DELETE  /api/lcoding/topics/{topic_id}
    Purpose : Delete a topic
    Input   : topic_id
    Returns : Confirmation

---

## Blink (AI Image Generation)

  AI-generated illustration images for notes topics

  GET  /api/blink/links
    Purpose : Get blink image links for topics
    Input   : topic names or IDs (query)
    Returns : Map of topic → image URL

  POST  /api/blink/generate
    Purpose : Generate a blink image for a topic using AI
    Input   : topic, note_content (optional)
    Returns : Generated image URL

  POST  /api/blink/generate-selected
    Purpose : Generate an AI image for selected text within notes
    Input   : selected_text, topic (optional)
    Returns : Generated image URL

  POST  /api/blink/selected-images
    Purpose : Store a generated selected-text image
    Input   : topic, image_url, selected_text
    Returns : Stored image record

  GET  /api/blink/selected-images
    Purpose : Get stored selected-text images for a topic
    Input   : topic (query)
    Returns : List of images

  POST  /api/blink/link
    Purpose : Update or set blink link for a topic
    Input   : topic_id or topic name, blink_link URL
    Returns : Updated link

  POST  /api/blink/remove
    Purpose : Remove blink link for a topic
    Input   : topic_id or topic name
    Returns : Confirmation

---

## Assignments

  Teacher assignment creation, student submission, grading, and plagiarism detection

  POST  /api/assignments
    Purpose : Create a new assignment
    Input   : title, description, class_id, due_date, max_score
    Returns : Created assignment

  GET  /api/assignments
    Purpose : List assignments (teacher view)
    Input   : Bearer token, class_id (optional)
    Returns : List of assignments

  GET  /api/assignments/{assignment_id}
    Purpose : Get assignment details
    Input   : assignment_id
    Returns : Assignment object

  PUT  /api/assignments/{assignment_id}
    Purpose : Update an assignment
    Input   : Updated fields
    Returns : Updated assignment

  DELETE  /api/assignments/{assignment_id}
    Purpose : Delete an assignment
    Input   : assignment_id
    Returns : Confirmation

  POST  /api/assignments/{assignment_id}/publish
    Purpose : Publish an assignment (make visible to students)
    Input   : assignment_id
    Returns : Published assignment

  POST  /api/assignments/{assignment_id}/close
    Purpose : Close an assignment (no more submissions)
    Input   : assignment_id
    Returns : Closed assignment

  GET  /api/assignments/{assignment_id}/submissions
    Purpose : List submissions for an assignment (teacher view)
    Input   : assignment_id
    Returns : List of submissions

  GET  /api/assignments/{assignment_id}/duplicates
    Purpose : Detect duplicate/plagiarized submissions
    Input   : assignment_id
    Returns : Duplicate clusters with similarity scores

  PUT  /api/assignments/{assignment_id}/submissions/{submission_id}/grade
    Purpose : Grade a submission
    Input   : submission_id, score, feedback
    Returns : Graded submission

  GET  /api/student/assignments
    Purpose : List assignments for the current student
    Input   : Bearer token
    Returns : List of assignments with submission status

  GET  /api/student/assignments/{assignment_id}
    Purpose : Get assignment detail (student view)
    Input   : assignment_id
    Returns : Assignment with my submission

  POST  /api/student/assignments/{assignment_id}/submit
    Purpose : Submit an assignment
    Input   : assignment_id, file upload or text
    Returns : Submission confirmation

  POST  /api/assignments/upload
    Purpose : Upload assignment attachment
    Input   : File (multipart)
    Returns : File URL

  POST  /api/student/assignments/{assignment_id}/request-extension
    Purpose : Request a deadline extension
    Input   : assignment_id, reason
    Returns : Extension request

  GET  /api/assignments/{assignment_id}/extensions
    Purpose : List extension requests for an assignment
    Input   : assignment_id
    Returns : List of extension requests

  PUT  /api/assignments/extensions/{extension_id}
    Purpose : Approve or deny an extension request
    Input   : extension_id, decision
    Returns : Updated extension

  GET  /api/assignments/{assignment_id}/comments
    Purpose : List comments on an assignment
    Input   : assignment_id
    Returns : List of comments

  POST  /api/assignments/{assignment_id}/comments
    Purpose : Add a comment to an assignment
    Input   : assignment_id, comment text
    Returns : Created comment

  GET  /api/assignments/{assignment_id}/analytics
    Purpose : Get analytics for an assignment (scores, participation)
    Input   : assignment_id
    Returns : Analytics data

  GET  /api/assignment-templates
    Purpose : List assignment templates
    Input   : None
    Returns : List of templates

  POST  /api/assignment-templates
    Purpose : Create an assignment template
    Input   : Template fields
    Returns : Created template

  DELETE  /api/assignment-templates/{template_id}
    Purpose : Delete an assignment template
    Input   : template_id
    Returns : Confirmation

---

## Feedback Forms

  AI-powered feedback form generation, distribution, and analytics

  POST  /api/feedback/generate-questions
    Purpose : AI: generate feedback questions for a topic/course
    Input   : context, question count
    Returns : List of generated questions

  GET  /api/feedback/forms
    Purpose : List feedback forms (teacher view)
    Input   : Bearer token
    Returns : List of forms

  POST  /api/feedback/forms
    Purpose : Create a feedback form
    Input   : title, questions[], target (class_id, etc.)
    Returns : Created form with share_code

  GET  /api/feedback/forms/{form_id}
    Purpose : Get feedback form details
    Input   : form_id
    Returns : Form with questions

  PUT  /api/feedback/forms/{form_id}
    Purpose : Update a feedback form
    Input   : Updated questions/settings
    Returns : Updated form

  DELETE  /api/feedback/forms/{form_id}
    Purpose : Delete a feedback form
    Input   : form_id
    Returns : Confirmation

  POST  /api/feedback/forms/{form_id}/publish
    Purpose : Publish a feedback form (make live)
    Input   : form_id
    Returns : Published form

  POST  /api/feedback/forms/{form_id}/close
    Purpose : Close a feedback form (stop accepting responses)
    Input   : form_id
    Returns : Closed form

  GET  /api/feedback/f/{share_code}
    Purpose : Get feedback form by share code (public student link)
    Input   : share_code
    Returns : Form with questions (no auth required)

  POST  /api/feedback/f/{share_code}/submit
    Purpose : Submit feedback response via share code
    Input   : share_code, answers[]
    Returns : Confirmation

  GET  /api/feedback/forms/{form_id}/responses
    Purpose : List responses for a feedback form (teacher view)
    Input   : form_id
    Returns : List of responses

  GET  /api/feedback/forms/{form_id}/analytics
    Purpose : Get analytics for a feedback form (averages, distributions)
    Input   : form_id
    Returns : Analytics data with visualizations

---

## XO Game (Tic-Tac-Toe)

  Multiplayer Tic-Tac-Toe with stats and leaderboard

  POST  /api/xo/game
    Purpose : Create a new XO game room
    Input   : player info
    Returns : `{ game_id }` and initial state

  GET  /api/xo/game/{game_id}
    Purpose : Get current game state
    Input   : game_id
    Returns : Board state, turn, winner

  POST  /api/xo/game/{game_id}/move
    Purpose : Make a move in a game
    Input   : game_id, position, player
    Returns : Updated game state

  GET  /api/xo/stats
    Purpose : Get current user's XO game stats
    Input   : Bearer token
    Returns : Wins, losses, draws

  GET  /api/xo/leaderboard
    Purpose : Get XO game leaderboard
    Input   : limit (optional)
    Returns : Top players by wins

---

## Math Tower Defense

  Gamified math learning: answer math questions to deploy defenses

  GET  /api/math-td/config
    Purpose : Get Math TD game configuration
    Input   : None
    Returns : Game config (difficulty levels, tower types)

  POST  /api/math-td/session/new
    Purpose : Start a new Math TD session
    Input   : difficulty, topic (optional)
    Returns : Session with initial state

  GET  /api/math-td/session/{session_id}
    Purpose : Get current session state
    Input   : session_id
    Returns : Session state

  POST  /api/math-td/question/generate
    Purpose : Generate a math question for the current wave
    Input   : session_id, difficulty
    Returns : Math question

  POST  /api/math-td/question/answer
    Purpose : Submit answer to a math question
    Input   : session_id, question_id, answer
    Returns : Correct/incorrect + reward

  POST  /api/math-td/deploy
    Purpose : Deploy a defense tower (earned by correct answers)
    Input   : session_id, tower_type, position
    Returns : Updated game state

  POST  /api/math-td/tick
    Purpose : Advance game simulation by one tick
    Input   : session_id
    Returns : Updated game state

  GET  /api/math-td/sessions/{session_id}/history
    Purpose : Get session history (questions, answers, score)
    Input   : session_id
    Returns : Full session history

---

## InnovateX (AI Project Generator)

  AI-powered project idea generation, mentoring, and evaluation

  POST  /api/innovatex/generate-ideas
    Purpose : Generate project ideas based on skills and interests
    Input   : skills, domain, difficulty
    Returns : List of project ideas

  POST  /api/innovatex/claim-project
    Purpose : Claim a generated project idea
    Input   : project details
    Returns : Claimed project

  GET  /api/innovatex/my-projects
    Purpose : List my claimed InnovateX projects
    Input   : Bearer token
    Returns : List of projects

  GET  /api/innovatex/my-project/{project_id}
    Purpose : Get a specific claimed project with full details
    Input   : project_id
    Returns : Full project object

  POST  /api/innovatex/refine
    Purpose : Refine a project idea with AI suggestions
    Input   : project_id, refinement prompt
    Returns : Refined project details

  GET  /api/innovatex/refine/{project_id}/state
    Purpose : Get the current refinement state of a project
    Input   : project_id
    Returns : Refinement state

  POST  /api/innovatex/refine-bulk
    Purpose : Bulk refine multiple aspects of a project
    Input   : project_id, aspects[]
    Returns : Bulk refinement results

  POST  /api/innovatex/make-unique
    Purpose : AI: make a project idea more unique/differentiated
    Input   : project_id
    Returns : Uniqueness suggestions

  POST  /api/innovatex/eval-metrics
    Purpose : AI: evaluate project metrics (feasibility, innovation, impact)
    Input   : project_id
    Returns : Evaluation scores and feedback

  POST  /api/innovatex/viva-sim
    Purpose : AI: simulate a viva/presentation Q&A session
    Input   : project_id, question context
    Returns : Generated viva questions and model answers

  POST  /api/innovatex/explore-features
    Purpose : AI: explore additional features for a project
    Input   : project_id
    Returns : Feature suggestions

  POST  /api/innovatex/add-features
    Purpose : Add explored features to a project
    Input   : project_id, features[]
    Returns : Updated project

  POST  /api/innovatex/mentor-chat
    Purpose : AI mentor chat for a project
    Input   : project_id, message
    Returns : AI mentor response

  GET  /api/innovatex/mentor-chat/{project_id}
    Purpose : Get mentor chat history for a project
    Input   : project_id
    Returns : Chat message history

---

## PPT Generation

  AI-powered presentation slide generation

  POST  /api/ppt/generate-outline
    Purpose : Generate a presentation outline for a topic
    Input   : topic, slide_count (optional)
    Returns : Outline with slide titles and bullet points

  POST  /api/ppt/refine-outline
    Purpose : Refine a generated outline with user feedback
    Input   : outline, feedback/prompts
    Returns : Refined outline

  POST  /api/ppt/generate-slide
    Purpose : Generate detailed content for a single slide
    Input   : slide title, context, style
    Returns : Slide content (text, bullet points, speaker notes)

---

## LabX (Interactive Explanations)

  AI-generated explorable/interactive explanations for topics

  POST  /api/labx/generate
    Purpose : Generate an explorable explanation for a topic
    Input   : topic
    Returns : Interactive explanation content

  POST  /api/labx/regenerate
    Purpose : Force regenerate an explanation (bypass cache)
    Input   : topic
    Returns : Fresh explanation

  GET  /api/labx/list
    Purpose : List all cached explanations
    Input   : None
    Returns : List of cached topics

  GET  /api/labx/check-batch
    Purpose : Check multiple topics for cached explanations at once
    Input   : topics[] (query)
    Returns : Map of topic → cached (bool)

  GET  /api/labx/check/{topic}
    Purpose : Check if a topic has a cached explanation
    Input   : topic
    Returns : `{ cached: bool }`

  GET  /api/labx/get/{topic}
    Purpose : Get cached explanation without regenerating
    Input   : topic
    Returns : Cached explanation or 404

  DELETE  /api/labx/{topic}
    Purpose : Delete a cached explanation
    Input   : topic
    Returns : Confirmation

  POST  /api/labx/generate-stream
    Purpose : Generate explanation with streaming (SSE)
    Input   : topic
    Returns : Server-Sent Events with content chunks

---

## StudyAI Chatbot

  AI-powered study assistant with conversation management and sharing

  POST  /api/studyai/conversations
    Purpose : Create a new chat conversation
    Input   : title (optional), topic context
    Returns : Created conversation

  GET  /api/studyai/conversations
    Purpose : List user's conversations
    Input   : Bearer token
    Returns : List of conversations

  GET  /api/studyai/conversations/{conversation_id}
    Purpose : Get a conversation with messages
    Input   : conversation_id
    Returns : Conversation with message history

  PATCH  /api/studyai/conversations/{conversation_id}
    Purpose : Update conversation (rename, archive)
    Input   : Updated fields
    Returns : Updated conversation

  DELETE  /api/studyai/conversations/{conversation_id}
    Purpose : Delete a conversation
    Input   : conversation_id
    Returns : Confirmation

  POST  /api/studyai/conversations/{conversation_id}/messages
    Purpose : Send a message and get AI response
    Input   : conversation_id, message text
    Returns : AI response message

  POST  /api/studyai/conversations/{conversation_id}/share
    Purpose : Generate a share link for a conversation
    Input   : conversation_id
    Returns : `{ share_code, share_url }`

  GET  /api/studyai/shared/{share_code}
    Purpose : View a shared conversation (public, no auth)
    Input   : share_code
    Returns : Conversation with messages (read-only)

  PATCH  /api/studyai/messages/{message_id}/bookmark
    Purpose : Bookmark or unbookmark a message
    Input   : message_id, bookmarked (bool)
    Returns : Updated message

  GET  /api/studyai/conversations/{conversation_id}/export/md
    Purpose : Export a conversation as Markdown
    Input   : conversation_id
    Returns : Markdown text

---

## Group Chat & WebRTC

  Real-time group chat rooms with WebSocket and WebRTC video config

  POST  /api/group-chat/create
    Purpose : Create a new group chat room
    Input   : room name, participants
    Returns : `{ room_id }`

  POST  /api/group-chat/end
    Purpose : End a group chat room
    Input   : room_id
    Returns : Confirmation

  GET  /api/group-chat/history
    Purpose : Get chat history for a room
    Input   : room_id (query)
    Returns : List of messages

  GET  /api/group-chat/{room_id}
    Purpose : Get room details and participant list
    Input   : room_id
    Returns : Room info

  GET  /api/rtc-config
    Purpose : Get WebRTC TURN/STUN server configuration
    Input   : None
    Returns : ICE server config

  WS  /ws/group-chat/{room_id}
    Purpose : WebSocket for real-time group chat messaging
    Input   : room_id, auth token
    Returns : Bidirectional message stream

---

## MedixRAG (Medical AI Assistant)

  RAG-powered medical study assistant with source document management

  GET  /api/medix/rag/sources
    Purpose : List uploaded RAG source documents
    Input   : Bearer token
    Returns : List of sources

  DELETE  /api/medix/rag/sources/{source_id}
    Purpose : Delete a RAG source document
    Input   : source_id
    Returns : Confirmation

  POST  /api/medix/rag/upload
    Purpose : Upload a single document as RAG source
    Input   : File (PDF/text) multipart
    Returns : Created source with chunk count

  POST  /api/medix/rag/upload/bulk
    Purpose : Upload multiple documents as RAG sources
    Input   : Multiple files (multipart)
    Returns : List of created sources

  POST  /api/medix/rag/chat
    Purpose : Chat with the RAG-powered medical assistant
    Input   : message, session_id (optional), source filters
    Returns : MedixRagChatResponse (answer with citations)

  GET  /api/medix/rag/sessions/{session_id}/messages
    Purpose : Get chat message history for a RAG session
    Input   : session_id
    Returns : List of messages with sources

---

> **Note:** All authenticated endpoints require a Bearer token in the `Authorization` header.
> Tokens are also transported via HttpOnly cookies for browser-based clients.
> Admin endpoints require the `admin` role. HOD endpoints require `hod` role.
> Teacher endpoints require `teacher` role (approved application).
> Rate limiting and CSRF protection are enforced globally via middleware.
