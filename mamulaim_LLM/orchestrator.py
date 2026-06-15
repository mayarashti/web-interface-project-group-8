import asyncio
import logging
from schemas import RecipeGenerationRequest, FinalResponse
from planner import RecipePlanner
from generator import RecipeGenerator

logger = logging.getLogger("recipe_recommendation.orchestrator")

class RecipeRecommendationOrchestrator:
    def __init__(self, generator_service: RecipeGenerator):
        self.generator_service = generator_service

    async def generate_k_recipes(self, request: RecipeGenerationRequest) -> FinalResponse:
        """
        Plans and generates exactly K recipes in parallel ensuring coverage.
        """
        people = request.people
        k = request.k
        n = len(people)

        # 1. Validation
        if k < n:
            raise ValueError(
                f"Cannot satisfy preference coverage constraint: K ({k}) is less than N ({n})."
            )

        # 2. Plan target recipe slots
        plans = RecipePlanner.create_plan(people, k)
        logger.info(f"Created recipe plan for {k} recipes covering {n} people.")

        # 3. Trigger parallel execution of LLM recipe generators
        tasks = [self.generator_service.generate_recipe(plan) for plan in plans]
        recipes = await asyncio.gather(*tasks)

        return FinalResponse(
            status="success",
            recipes=list(recipes)
        )
