import os
import requests
import logging
from typing import Dict, Any, List

logger = logging.getLogger("recipe_recommendation.spoonacular")

class SpoonacularClient:
    def __init__(self):
        self.api_key = os.getenv("SPOONACULAR_API_KEY")
        if not self.api_key:
            raise ValueError("SPOONACULAR_API_KEY environment variable is not set.")
        self.base_url = "https://api.spoonacular.com"

    def search_recipes(
        self,
        include_ingredients: List[str] = None,
        exclude_ingredients: List[str] = None,
        diet: str = None,
        number: int = 30
    ) -> List[Dict[str, Any]]:
        """
        Search Spoonacular for recipes with full recipe details.
        """
        url = f"{self.base_url}/recipes/complexSearch"
        params = {
            "apiKey": self.api_key,
            "addRecipeInformation": "true",
            "fillIngredients": "true",
            "number": number,
            "instructionsRequired": "true"
        }

        if include_ingredients:
            params["includeIngredients"] = ",".join(include_ingredients)
        if exclude_ingredients:
            params["excludeIngredients"] = ",".join(exclude_ingredients)
        if diet:
            params["diet"] = diet

        logger.info(f"Spoonacular complexSearch params: {params}")
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            data = response.json()
            return data.get("results", [])
        except Exception as e:
            logger.error(f"Error calling Spoonacular complexSearch: {e}")
            return []

    def get_recipe_details(self, recipe_id: int) -> Dict[str, Any]:
        """
        Fetch full details for a single recipe.
        """
        url = f"{self.base_url}/recipes/{recipe_id}/information"
        params = {
            "apiKey": self.api_key,
            "includeNutrition": "false"
        }
        try:
            response = requests.get(url, params=params, timeout=15)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Error calling Spoonacular details for {recipe_id}: {e}")
            return {}
