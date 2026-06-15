import os
import logging
from typing import Dict, Any, List
import asyncio
from schemas import RecipeGenerationRequest
from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator

logger = logging.getLogger("recipe_recommendation.compatibility")

class Groq:
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
        Synchronous interface supporting both the new format (k, people) and legacy format (soldier, host).
        """
        if not self._initialized:
            self.init_model()

        # Check if the incoming request is in the legacy format
        if "soldier" in request_data:
            soldier = request_data.get("soldier", {})
            prefs = []
            
            # Map allergies
            for allergy in soldier.get("allergies", []):
                mapping = {
                    "peanuts": "ללא בוטנים",
                    "vegan": "טבעוני",
                    "vegetarian": "צמחוני",
                    "celiac": "ללא גלוטן",
                    "lactose": "ללא לקטוז",
                    "gluten": "ללא גלוטן"
                }
                prefs.append(mapping.get(allergy.lower(), allergy))
                
            # Map dietary preferences
            for dp in soldier.get("dietaryPreferences", []):
                mapping = {
                    "vegan": "טבעוני",
                    "vegetarian": "צמחוני",
                    "gluten-free": "ללא גלוטן"
                }
                prefs.append(mapping.get(dp.lower(), dp))
                
            # Map kosher
            if soldier.get("isKosher"):
                prefs.append("כשר")
                
            # Disliked foods
            for df in soldier.get("dislikedFoods", []):
                prefs.append(f"ללא {df}")
                
            # Deduplicate
            prefs = list(set(prefs))
            if not prefs:
                prefs = ["ארוחת שבת כללית"]
                
            # Convert to new structure
            request_data = {
                "k": 2,
                "people": {
                    "חייל": prefs
                }
            }

        request = RecipeGenerationRequest(**request_data)
        generator = RecipeGenerator(api_key=self.api_key)
        orchestrator = RecipeRecommendationOrchestrator(generator)

        # Run the async loop inside the sync context
        response = asyncio.run(orchestrator.generate_k_recipes(request))
        return response.model_dump()