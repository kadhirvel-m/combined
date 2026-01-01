
from fastapi import APIRouter, HTTPException, Depends
from supabase import Client
import logging
from functools import lru_cache
import os
from dotenv import load_dotenv
from typing import Optional

# Setup similar logging/client retrieval as main.py or just re-implement simple one
# For a package, it's better to accept the client or get it from env.

router = APIRouter(prefix="/api/tunex", tags=["tunex"])

# Load env for standalone usage if needed, but typically main.py handles it.
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service role for reading if we want full access, or Anon.

def get_supabase() -> Client:
    from supabase import create_client
    if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(status_code=500, detail="Database configuration missing")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

@router.get("/topics/{topic_id}/full")
async def get_topic_full(topic_id: str):
    """
    Get topic metadata and all chapters with full content.
    """
    supabase = get_supabase()
    
    # 1. Get Topic Metadata
    topic_res = supabase.table("lcoding_topics").select("id, title, order_index").eq("id", topic_id).execute()
    if not topic_res.data:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    topic = topic_res.data[0]
    
    # 2. Get Chapters (Sorted)
    chapters_res = supabase.table("lcoding_topic_chapters")\
        .select("id, chapter_number, chapter_type, title, content")\
        .eq("topic_id", topic_id)\
        .order("chapter_number")\
        .execute()
        
    return {
        "id": topic["id"],
        "title": topic["title"],
        "description": topic.get("description", ""),
        "chapters": chapters_res.data
    }
