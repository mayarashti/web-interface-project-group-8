
import asyncio
import json

from generator import RecipeGenerator
from orchestrator import RecipeRecommendationOrchestrator
from schemas import RecipeGenerationRequest
from dotenv import load_dotenv
load_dotenv()

# ==========================================
# Interactive CLI Demonstration
# ==========================================
async def main_async(preferences_data):
    # 1. Setup services
    try:
        generator = RecipeGenerator()
    except Exception as e:
        raise RuntimeError(
            "Failed to initialize RecipeGenerator. "
            "Please make sure GROQ_API_KEY is configured."
        ) from e

    orchestrator = RecipeRecommendationOrchestrator(generator)

    request = RecipeGenerationRequest(**preferences_data)

    try:
        response = await orchestrator.generate_k_recipes(request)
        # Verify correctness:
        assert len(response.recipes) == 3, f"Expected 3 recipes, got {len(response.recipes)}"

    except Exception:
        raise AssertionError(
            "\n[ERROR] Generation failed: {e}"
        )
    return json.dumps(response.model_dump(), indent=2)


def main(preferences_data):
    return asyncio.run(main_async(preferences_data))


if __name__ == "__main__":
    request_data = {
        "k": 3,
        "people": {
            "1": ["gluten free", "spicy food"],
            "2": ["indian food"],
            "3": ["kosher", "italian"]
        }
    }
    print(main(request_data))