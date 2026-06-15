import os
import sys
import asyncio
import logging
from typing import Dict, Any
from dotenv import load_dotenv
# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    stream=sys.stdout
)
logger = logging.getLogger("recipe_recommendation")


# Configure stdout and stderr to use UTF-8 encoding on Windows to prevent UnicodeEncodeError
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

load_dotenv()

# Import modular components
from schemas import RecipeGenerationRequest
from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator

# ==========================================
# Legacy Compatibility Wrapper (Optional)
# ==========================================

class Groq:
    """
    Legacy compatibility class wrapper to preserve the class interface in llm_api.py.
    """
    def __init__(self):
        self._initialized = False
        self.api_key = None

    def init_model(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise Exception("GROQ_API_KEY not found in env.")
        self._initialized = True
        return self

    def generate_recipes_sync(self, preferences_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronous interface for recipe generation orchestrator.
        """
        if not self._initialized:
            self.init_model()

        request = RecipeGenerationRequest(**preferences_data)
        generator = RecipeGenerator(api_key=self.api_key)
        orchestrator = RecipeRecommendationOrchestrator(generator)

        # Run the async loop inside the sync context
        response = asyncio.run(orchestrator.generate_k_recipes(request))
        return response.model_dump()

