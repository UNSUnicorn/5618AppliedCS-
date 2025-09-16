import os
import json
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS # Import CORS
from PIL import Image
import io

# --- Vertex AI Imports ---
import vertexai
from vertexai.preview.generative_models import GenerativeModel, Part

# --- Vertex AI Configuration ---
GCP_PROJECT_ID = "gen-lang-client-0099371737"
GCP_LOCATION = "us-central1"

# Initialize Vertex AI SDK
try:
    vertexai.init(project=GCP_PROJECT_ID, location=GCP_LOCATION)
except Exception as e:
    print(f"Error initializing Vertex AI SDK: {e}")

# --- Flask App ---
app = Flask(__name__)
CORS(app) # Enable CORS for all routes by default, or specify origins

PROMPT = """
Analyze the provided image... (与之前版本相同)
"""

# Removed the '/' route for index.html as it will be served by Cloudflare Pages

@app.route('/analyze', methods=['POST'])
def analyze():
    """Handle the image analysis request."""
    # ... (此函数的其余部分与之前版本完全相同) ...
    image_file = request.files.get('image')
    image_url = request.form.get('url')
    
    image_bytes = None
    photo_identifier = "N/A"

    try:
        if image_file:
            image_bytes = image_file.read()
            photo_identifier = image_file.filename
        elif image_url:
            response = requests.get(image_url, stream=True, timeout=10)
            response.raise_for_status()
            image_bytes = response.content
            photo_identifier = image_url
        else:
            return jsonify({"error": "No image file or URL was provided."}), 400

        model = GenerativeModel("gemini-1.0-pro-vision")
        
        image_part = Part.from_data(image_bytes, mime_type="image/jpeg") 

        final_prompt = PROMPT.replace("provided filename or URL", photo_identifier)

        response = model.generate_content([image_part, final_prompt])
        
        json_string = response.text.strip().replace("```json", "").replace("```", "")
        result_data = json.loads(json_string)
        
        return jsonify(result_data)

    except Exception as e:
        import traceback
        print(f"An unexpected error occurred: {e}")
        print(traceback.format_exc()) 
        return jsonify({"error": "A server error occurred. Check the terminal for details."}), 500

if __name__ == '__main__':
    # Cloud Run will set its own PORT environment variable,
    # so we listen on 0.0.0.0 and the port Cloud Run specifies.
    # For local testing, it will default to 5000.
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=True)