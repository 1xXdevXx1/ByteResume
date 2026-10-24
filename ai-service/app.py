"""
Flask AI & NLP Microservice for ByteResume
BCSE406L - NoSQL Database Project
Port: 8000
"""

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from resume_parser import parse_resume
from analyzer import analyze_resume
from matcher import match_resume_to_job

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), "temp_uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "service": "ByteResume AI/NLP Service",
        "version": "1.0.0"
    }), 200


@app.route("/extract", methods=["POST"])
def extract():
    """
    Extracts text and structured metadata from resume.
    Can accept multipart file upload OR JSON body with filePath / rawText.
    """
    try:
        if "file" in request.files:
            file = request.files["file"]
            if not file or file.filename == "":
                return jsonify({"error": "No file selected"}), 400

            file_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(file_path)
            result = parse_resume(file_path=file_path, file_name=file.filename)
            # Cleanup temp file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception:
                    pass
            return jsonify(result), 200

        data = request.get_json(silent=True) or {}
        file_path = data.get("filePath")
        raw_text = data.get("rawText")
        file_name = data.get("fileName", "resume.txt")

        if not file_path and not raw_text:
            return jsonify({"error": "Provide either 'file' in multipart, or 'filePath' / 'rawText' in JSON"}), 400

        result = parse_resume(file_path=file_path, raw_text=raw_text, file_name=file_name)
        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Error extracting resume: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/analyze", methods=["POST"])
def analyze():
    """
    Analyzes resume data and generates deterministic 0-100 ATS score and breakdown.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request body"}), 400

        # If data is just rawText, parse first
        if "rawText" in data and not data.get("technicalSkills"):
            parsed = parse_resume(raw_text=data["rawText"], file_name=data.get("fileName"))
        else:
            parsed = data

        analysis = analyze_resume(parsed)
        return jsonify(analysis), 200

    except Exception as e:
        app.logger.error(f"Error analyzing resume: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/match", methods=["POST"])
def match():
    """
    Matches resume skills/data against job description requirements.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid request body"}), 400

        resume_data = data.get("resume", {})
        job_data = data.get("job", {})

        if not resume_data or not job_data:
            return jsonify({"error": "Both 'resume' and 'job' objects are required"}), 400

        match_result = match_resume_to_job(resume_data, job_data)
        return jsonify(match_result), 200

    except Exception as e:
        app.logger.error(f"Error matching resume to job: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    print(f"Starting ByteResume AI/NLP service on http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=False)
