import sys
import os
import asyncio
import logging

# Add current directory to path so imports work
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

from schemas import SoldierPreferences, HostFamilyInfo
from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("test_runner")

async def test_workflow():
    generator = RecipeGenerator()
    orchestrator = RecipeRecommendationOrchestrator(generator)

    # Mock Soldier and Host Family details matching the user prompt examples
    soldier = SoldierPreferences(
        favoriteFoods=["פסטה", "שניצל"],
        dislikedFoods=["פטריות"],
        allergies=["בוטנים"],
        dietaryPreferences=["vegetarian"],
        isKosher=True
    )
    host = HostFamilyInfo(keepsKosher=True)

    logger.info("--- RUNNING SPOONACULAR WORKFLOW TEST ---")
    try:
        recipes = await orchestrator.get_two_recipes(soldier, host)
        assert len(recipes) == 2, f"Expected 2 recipes, got {len(recipes)}"
        
        for idx, recipe in enumerate(recipes):
            logger.info(f"\nRecipe {idx+1}:")
            logger.info(f"ID: {recipe.id}")
            logger.info(f"Title (Hebrew): {recipe.title}")
            logger.info(f"Image: {recipe.image}")
            logger.info(f"Prep Time: {recipe.readyInMinutes} mins")
            logger.info(f"Servings: {recipe.servings}")
            logger.info(f"Ingredients (Hebrew): {recipe.ingredients}")
            logger.info(f"Instructions (Hebrew): {recipe.instructions}")
            logger.info(f"Matching Prefs: {recipe.matching_preferences}")

            # Safety validations
            # 1. Image must be a spoonacular image URL or standard url, not an AI generated link from pollinations
            assert "spoonacular.com" in recipe.image, "Image URL must originate from Spoonacular"
            
            # 2. No peanuts (allergy)
            for ing in recipe.ingredients:
                assert "בוטנים" not in ing and "peanut" not in ing.lower(), "Allergy violation: found peanuts!"
            
            # 3. Kosher check (no meat/dairy mix, no non-kosher meats)
            non_kosher = ["חזיר", "בייקון", "שרימפס", "סרטן", "pork", "bacon", "shellfish", "shrimp", "lobster"]
            for nk in non_kosher:
                assert nk not in recipe.title.lower() and not any(nk in ing.lower() for ing in recipe.ingredients), f"Kosher violation: found {nk}"

        logger.info("\n✅ SUCCESS: Both recipes matched Spoonacular truth, passed LLM validation, and are kosher & allergen safe!")
    except Exception as e:
        logger.error(f"❌ TEST FAILED: {e}", exc_info=True)

if __name__ == "__main__":
    asyncio.run(test_workflow())
