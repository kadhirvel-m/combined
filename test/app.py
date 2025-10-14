from __future__ import annotations
import os
import secrets
from datetime import timedelta
from flask import Flask, render_template, request, send_file, jsonify, abort
from werkzeug.utils import secure_filename
from nup import compose_nup_pdf, render_preview_png

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
PREVIEW_DIR = os.path.join(BASE_DIR, 'previews')
EXPORT_DIR = os.path.join(BASE_DIR, 'exports')

for d in (UPLOAD_DIR, PREVIEW_DIR, EXPORT_DIR):
    os.makedirs(d, exist_ok=True)

ALLOWED_EXT = {'.pdf'}

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200 MB
app.secret_key = os.environ.get('FLASK_SECRET', secrets.token_hex(16))
app.permanent_session_lifetime = timedelta(days=1)


def _ensure_pdf(file_storage) -> str:
    filename = secure_filename(file_storage.filename or '')
    if not filename:
        abort(400, description='No file name')
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXT:
        abort(400, description='Only PDF files are allowed')

    token = secrets.token_hex(8)
    stored_name = f"{os.path.splitext(filename)[0]}_{token}.pdf"
    path = os.path.join(UPLOAD_DIR, stored_name)
    file_storage.save(path)
    return stored_name


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        abort(400, description='Missing file')
    f = request.files['file']
    stored_name = _ensure_pdf(f)
    return jsonify({
        'ok': True,
        'file_id': stored_name,
    })


@app.route('/preview', methods=['POST'])
def preview():
    data = request.get_json(force=True)
    file_id = data.get('file_id')
    n_up = int(data.get('n_up', 2))
    page_size = data.get('page_size', 'A4')
    orientation = data.get('orientation', 'portrait')
    margin = float(data.get('margin', 18))
    gap = float(data.get('gap', 6))
    sheet_index = int(data.get('sheet_index', 0))

    src_path = os.path.join(UPLOAD_DIR, file_id)
    if not os.path.exists(src_path):
        abort(404, description='File not found')

    png = render_preview_png(
        input_pdf_path=src_path,
        n_up=n_up,
        page_size=page_size,
        orientation=orientation,
        margin=margin,
        gap=gap,
        dpi=130,
        sheet_index=sheet_index,
    )

    # Write a temp PNG asset to disk so the browser can cache it by URL
    token = secrets.token_hex(6)
    out_name = f"preview_{token}.png"
    out_path = os.path.join(PREVIEW_DIR, out_name)
    with open(out_path, 'wb') as fp:
        fp.write(png)

    return jsonify({'ok': True, 'url': f'/static-preview/{out_name}'})


@app.route('/static-preview/<name>', methods=['GET'])
def static_preview(name: str):
    path = os.path.join(PREVIEW_DIR, secure_filename(name))
    if not os.path.exists(path):
        abort(404)
    return send_file(path, mimetype='image/png', as_attachment=False, download_name=name)


@app.route('/export', methods=['POST'])
def export():
    data = request.get_json(force=True)
    file_id = data.get('file_id')
    n_up = int(data.get('n_up', 2))
    page_size = data.get('page_size', 'A4')
    orientation = data.get('orientation', 'portrait')
    margin = float(data.get('margin', 18))
    gap = float(data.get('gap', 6))

    src_path = os.path.join(UPLOAD_DIR, file_id)
    if not os.path.exists(src_path):
        abort(404, description='File not found')

    token = secrets.token_hex(8)
    out_name = f"nup_{n_up}_{token}.pdf"
    out_path = os.path.join(EXPORT_DIR, out_name)

    compose_nup_pdf(
        input_pdf_path=src_path,
        output_pdf_path=out_path,
        n_up=n_up,
        page_size=page_size,
        orientation=orientation,
        margin=margin,
        gap=gap,
    )

    return jsonify({'ok': True, 'url': f'/download/{out_name}'})


@app.route('/download/<name>', methods=['GET'])
def download(name: str):
    path = os.path.join(EXPORT_DIR, secure_filename(name))
    if not os.path.exists(path):
        abort(404)
    return send_file(path, mimetype='application/pdf', as_attachment=True, download_name=name)


if __name__ == '__main__':
    app.run(debug=True)
