"""
server.py — HTTP wrapper for the mamulaim_LLM recipe engine.
Exposes POST /generate-recipes on port 8000.
Run: python server.py
"""
import sys
import os
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler

# Configure UTF-8 on Windows
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Add current directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger("recipe_server")

from dotenv import load_dotenv
load_dotenv()

from Groq import Groq
groq_wrapper = Groq()
groq_wrapper.init_model()
logger.info("✅ Groq LLM client initialized")


class RecipeHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        logger.info("HTTP %s", format % args)

    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            self._respond(200, {"status": "ok", "service": "mamulaim_LLM"})
        elif self.path == "/":
            self._respond(200, {
                "service": "mamulaim_LLM",
                "status": "running",
                "endpoints": {
                    "POST /generate-recipes": "Generates personalized recipes from preferences",
                    "GET /health": "Server health status"
                }
            })
        else:
            self._respond(404, {"error": "Not found"})

    def do_POST(self):
        if self.path != "/generate-recipes":
            self._respond(404, {"error": "Not found"})
            return

        try:
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            request_data = json.loads(body.decode("utf-8"))
        except Exception as e:
            logger.error("Bad request body: %s", e)
            self._respond(400, {"error": f"Invalid JSON: {e}"})
            return

        logger.info("Generating recipes — request: %s", request_data)
        try:
            result = groq_wrapper.generate_recipes_sync(request_data)
            logger.info("Done — %d recipes generated", len(result.get("recipes", [])))
            self._respond(200, result)
        except Exception as e:
            logger.error("Recipe generation error: %s", e, exc_info=True)
            self._respond(500, {"error": str(e)})

    def _respond(self, code, data):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    PORT = int(os.environ.get("PORT", 8000))
    server = HTTPServer(("0.0.0.0", PORT), RecipeHandler)
    logger.info("🚀 Recipe server running at http://localhost:%d", PORT)
    logger.info("   POST /generate-recipes  — generate personalized recipes")
    logger.info("   GET  /health            — health check")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Server stopped.")
        server.server_close()
