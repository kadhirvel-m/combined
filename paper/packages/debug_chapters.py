
import os
from dotenv import load_dotenv
from supabase import create_client

_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY"))
TOPIC_ID = "3e231b7f-d838-430b-8647-9a30767a75c6"

print(f"Checking for topic: {TOPIC_ID}")
res = supabase.table('lcoding_topic_chapters').select('*').eq('topic_id', TOPIC_ID).execute()
print(f"Count: {len(res.data)}")
print(res.data)
