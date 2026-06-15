import os
from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator
from schemas import RecipeGenerationRequest
from typing import Dict, Any
import asyncio



class Groq:
    """
    Legacy compatibility class wrapper to preserve the class interface in llm_api.py.
    """
    def __init__(self):
        self._initialized = False
        self.api_key = None

    def init_model(self, model_name=None):
        self.api_key = os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise Exception("GROQ_API_KEY not found in env.")
        self._initialized = True
        return self

    def generate_recipes_sync(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synchronous interface for recipe generation orchestrator.
        """
        if not self._initialized:
            self.init_model()

        request = RecipeGenerationRequest(**request_data)
        generator = RecipeGenerator(api_key=self.api_key)
        orchestrator = RecipeRecommendationOrchestrator(generator)

        # Run the async loop inside the sync context
        response = asyncio.run(orchestrator.generate_k_recipes(request))
        return response.model_dump()