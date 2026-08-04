import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator
from schemas import RecipeGenerationRequest

async def main():
    try:
        generator = RecipeGenerator()
    except Exception as e:
        print(f"Error: {e}")
        return

    orchestrator = RecipeRecommendationOrchestrator(generator)
    
    req = RecipeGenerationRequest(
        k=2,
        people={
            "soldier_1": ["כשר", "צמחוני", "ללא גלוטן"],
            "soldier_2": ["עוף בתנור", "פסטה"]
        }
    )
    
    print("Testing generate_k_recipes...")
    try:
        res = await orchestrator.generate_k_recipes(req)
        print("Status:", res.status)
        print("Recipes generated:")
        for idx, r in enumerate(res.recipes):
            print(f"\n--- Recipe {idx + 1} ---")
            print("Title:", r.title)
            print("Description:", r.description)
            print("Image URL:", r.image_url)
            print("Ingredients:", r.ingredients)
            print("Instructions:", r.instructions)
            print("Matching Prefs:", r.matching_preferences)
    except Exception as e:
        print("Error during execution:", e)

if __name__ == "__main__":
    asyncio.run(main())
