# app.py
import os
from dotenv import load_dotenv
load_dotenv()
import io
import time
import streamlit as st
from PIL import Image
from google import genai


# -------------------------------------------------
# MUST be the first Streamlit call (and ONLY once)
# -------------------------------------------------
st.set_page_config(
    page_title="Gemini 2.5 Flash Chatbot",
    page_icon="💬",
    layout="centered",
)

# -------------------------------------------------
# 1. Gemini client init
# -------------------------------------------------
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    st.error(
        "❌ GEMINI_API_KEY is not set.\n\n"
        "On Windows PowerShell:\n"
        '  setx GEMINI_API_KEY "YOUR_KEY_HERE"\n\n'
        "Then reopen terminal and run Streamlit again."
    )
    st.stop()

client = genai.Client(api_key=API_KEY)

# Use the multimodal flash model
MODEL_NAME = "gemini-2.5-flash"  # if your access key calls it slightly different, change this string


# -------------------------------------------------
# 2. Keep chat history in session
# -------------------------------------------------
if "messages" not in st.session_state:
    # each message = { "role": "user"/"assistant", "text": str, "images": [PIL.Image,...] }
    st.session_state.messages = [
        {
            "role": "assistant",
            "text": "👋 I'm Gemini 2.5 Flash. Send text or upload an image and ask me about it.",
            "images": [],
        }
    ]


# -------------------------------------------------
# 3. Some light CSS for chat bubbles
# -------------------------------------------------
st.markdown(
    """
    <style>
    .chat-row { display: flex; margin-bottom: 1rem; }
    .chat-row.user { justify-content: flex-end; }
    .chat-row.bot  { justify-content: flex-start; }

    .bubble {
        border-radius: 1rem;
        padding: 0.8rem 1rem;
        max-width: 80%;
        line-height: 1.4;
        font-size: 0.9rem;
        word-break: break-word;
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Inter", Roboto, "Helvetica Neue", Arial;
    }

    .bubble.user {
        background: #4C2A59;
        color: #fff;
        border-bottom-right-radius: 0.3rem;
    }

    .bubble.bot {
        background: #1E1E2F;
        color: #fff;
        border: 1px solid rgba(158,75,138,0.4);
        box-shadow: 0 20px 60px rgba(158,75,138,.18);
        border-bottom-left-radius: 0.3rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown("## 💬 Gemini 2.5 Flash Chatbot")


# -------------------------------------------------
# 4. Core call to Gemini
# -------------------------------------------------
def ask_gemini(user_text, pil_images):
    """
    Build the `contents` list exactly how THIS SDK version wants it:
    - text is just a plain Python string
    - images are raw PIL.Image.Image objects
    Then call generate_content.
    """

    payload = []

    clean_text = user_text.strip()
    if clean_text:
        payload.append(clean_text)

    # 👇 IMPORTANT: Directly append PIL images
    # The SDK validator accepts `is-instance[Image]`,
    # so we pass the actual PIL.Image.Image objects.
    for img in pil_images:
        payload.append(img)

    # Safety: if user sent nothing at all
    if not payload:
        payload = ["(no input)"]

    # Call Gemini
    try:
        resp = client.models.generate_content(
            model=MODEL_NAME,
            contents=payload,
            config={
                # ask for normal text back
                "response_mime_type": "text/plain",
            },
        )
        # Some SDK builds return .text, others .output_text
        if hasattr(resp, "text"):
            return resp.text
        if hasattr(resp, "output_text"):
            return resp.output_text
        return str(resp)

    except Exception as e:
        return f"⚠️ Error talking to model: {e}"


# -------------------------------------------------
# 5. Render chat history
# -------------------------------------------------
for msg in st.session_state.messages:
    who = "user" if msg["role"] == "user" else "bot"
    bubble_class = "bubble user" if msg["role"] == "user" else "bubble bot"

    st.markdown(
        f"""
        <div class="chat-row {who}">
            <div class="{bubble_class}">
                {msg["text"].replace("\n", "<br/>")}
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # If user had uploaded any images for that turn, show them under that bubble
    if msg["images"]:
        cols = st.columns(min(len(msg["images"]), 3))
        for i, im in enumerate(msg["images"]):
            with cols[i % len(cols)]:
                st.image(im, caption="uploaded", use_container_width=True)

st.markdown("---")


# -------------------------------------------------
# 6. Input area (text + images)
# -------------------------------------------------
with st.form("chat_form", clear_on_submit=True):
    user_input = st.text_area(
        "Your question / instruction:",
        height=80,
        placeholder="Example: 'Explain this screenshot' or 'Solve the math in this image'",
    )

    uploaded_files = st.file_uploader(
        "Attach image(s) (optional)",
        type=["png", "jpg", "jpeg", "webp", "heic", "heif"],
        accept_multiple_files=True,
    )

    send_btn = st.form_submit_button("Send 🚀")


# -------------------------------------------------
# 7. Handle the new message
# -------------------------------------------------
if send_btn:
    # Convert uploaded bytes -> PIL.Image.Image
    pil_list = []
    if uploaded_files:
        for f in uploaded_files:
            try:
                pil_list.append(Image.open(f).convert("RGB"))
            except Exception:
                st.warning(f"Couldn't open {getattr(f, 'name', 'file')} as an image.")

    # Save the user's turn into chat history
    st.session_state.messages.append(
        {
            "role": "user",
            "text": user_input if user_input.strip() else "[image only]",
            "images": pil_list,
        }
    )

    # Talk to Gemini
    with st.spinner("Thinking... 🤖"):
        reply_text = ask_gemini(user_input, pil_list)

    # Save assistant reply
    st.session_state.messages.append(
        {
            "role": "assistant",
            "text": reply_text,
            "images": [],
        }
    )

    # Rerun so UI updates with the new messages displayed nicely
    st.rerun()
