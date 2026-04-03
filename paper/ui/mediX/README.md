# Medix Agentic RAG

## Pages
- `ui/mediX/upload.html` → upload PDF, semantic chunking, vector indexing
- `ui/mediX/chatbot.html` → agentic RAG chat over indexed sources
- `ui/mediX/sources.html` → browse/delete indexed sources

## Backend APIs
- `POST /api/medix/rag/upload`
- `POST /api/medix/rag/upload/bulk`
- `POST /api/medix/rag/chat`
- `GET /api/medix/rag/sources`
- `DELETE /api/medix/rag/sources/{source_id}`
- `GET /api/medix/rag/sessions/{session_id}/messages`

## Required SQL
Run:
- `scripts/sql/medix_agentic_rag_pgvector.sql`

## Required env vars
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

Optional tuning:
- `MEDIX_RAG_CHAT_MODEL` (default `gemini-3-pro-preview`)
- `MEDIX_RAG_EMBED_DIM` (default `768`; model fixed to `gemini-embedding-001`)
- `MEDIX_RAG_MAX_UPLOAD_MB` (default `70`)
- `MEDIX_RAG_DEFAULT_TOP_K` (default `12`)
- `MEDIX_RAG_MAX_CONTEXT_CHARS` (default `26000`)
- `MEDIX_RAG_SEMANTIC_BUFFER_SIZE` (default `1`)
- `MEDIX_RAG_BREAKPOINT_PERCENTILE` (default `92`)
- `MEDIX_RAG_CHUNK_TARGET_CHARS` (default `1400`)
- `MEDIX_RAG_CHUNK_OVERLAP_CHARS` (default `240`)
- `MEDIX_RAG_SECTION_PARALLELISM` (default `4`)
- `MEDIX_RAG_UPLOAD_PARALLELISM` (default `3`)
- `MEDIX_RAG_EMBED_PARALLELISM` (default `2`)
- `MEDIX_RAG_EMBED_BATCH_SIZE` (default `16`)

## Install dependencies
```bash
pip install -r requirements.txt
```

## Notes
- Chat uses multi-query retrieval variants for better recall.
- Retrieval uses Supabase `pgvector` cosine similarity through RPC.
- Chunking now enforces section-aware (chapter-style) splitting + semantic splitting + overlap windows.
- Bulk upload processes multiple textbooks in parallel through `/api/medix/rag/upload/bulk`.
- Embeddings use only `gemini-embedding-001` with task-specific modes (`RETRIEVAL_DOCUMENT` / `RETRIEVAL_QUERY`).
