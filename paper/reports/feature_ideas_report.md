# Feature Ideas & Improvements Report

## 1. Architectural & Engineering Improvements (Enterprise Grade)
- **Microservices / Modularization**: Split the 36k-line `main.py` into separate bounded contexts (Auth, AI Notes, Marketplace, Projects, etc.) using clean architecture.
- **Dependency Injection**: Use FastAPI's dependency injection for database connections and external API clients.
- **Role-Based Access Control (RBAC)**: Implement proper RBAC using Supabase RLS (Row-Level Security) with user tokens instead of the service role key.
- **Testing Suite**: Implement `pytest` with unit tests for business logic, integration tests for API endpoints, and e2e tests for frontend functionality.
- **CI/CD Pipeline**: Add GitHub Actions or GitLab CI to automate testing, linting (Ruff/Black/MyPy), and deployment.
- **Observability**: Add Prometheus/Grafana metrics, OpenTelemetry tracing, and centralized logging (e.g., ELK stack).
- **Asynchronous Execution**: Convert blocking synchronous network calls (like `requests` and external API fetches) into asynchronous calls (using `httpx` or `aiohttp`).

## 2. Feature Improvements
- **Real-Time WebSockets**: Introduce WebSockets for real-time collaboration on projects, live teacher classes, and multiplayer Math Tower Defense.
- **Advanced Search & Filtering**: Replace basic SQL `ILIKE` with vector search via `pgvector` in PostgreSQL to enable semantic search on notes and projects.
- **Offline Capabilities (PWA)**: Convert the UI into a Progressive Web App so users can access cached notes offline.
- **Payment Gateway Integration**: Integrate Stripe or Razorpay properly instead of mock flows, handling webhooks, subscriptions, and payouts for the marketplace and print services.

## 3. Security Enhancements
- **Rate Limiting**: Add Redis-based rate limiting to prevent abuse of the AI generation endpoints.
- **Input Sanitization**: Ensure complete validation and sanitization of user-submitted code and HTML content (to prevent XSS).
- **Secret Management**: Integrate HashiCorp Vault or AWS Secrets Manager to manage API keys instead of `.env` files.
