
import os
import logging
from dotenv import load_dotenv
import psycopg2

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("init_solver_db")

# Load env variables
_env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(_env_path)

DB_URL = os.getenv("DATABASE_URL") 
# Fallback to constructing from Supabase URL/Key is hard for raw SQL DDL without Direct Connection String.
# Standard Supabase projects provide DATABASE_URL in the dashboard settings (Transaction/Session pooler).

def run_migration():
    if not DB_URL:
        logger.error("DATABASE_URL not found in .env. Cannot run schema migration automatically.")
        print("CRITICAL: Please copy the content of 'packages/sql/problem_solver_schema.sql' and run it in your Supabase SQL Editor.")
        return

    sql_path = os.path.join(os.path.dirname(__file__), 'sql', 'problem_solver_schema.sql')
    if not os.path.exists(sql_path):
        logger.error(f"Schema file not found at {sql_path}")
        return

    with open(sql_path, 'r') as f:
        sql_content = f.read()

    try:
        logger.info("Connecting to Database...")
        conn = psycopg2.connect(DB_URL, sslmode='require') # 'require' needed for Supabase often
        cur = conn.cursor()
        
        logger.info("Applying Schema...")
        cur.execute(sql_content)
        conn.commit()
        
        logger.info("Schema applied successfully!")
        cur.close()
        conn.close()
        
    except Exception as e:
        logger.error(f"Migration Failed: {e}")
        print("Please check your DATABASE_URL or run the SQL manually.")

if __name__ == "__main__":
    run_migration()
