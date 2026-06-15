import os
import logging
from typing import Optional
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential
from schemas import RecipePlan, RecipeDetails, RecipeResult

logger = logging.getLogger("recipe_recommendation.generator")

class RecipeGenerator:
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY not found. Please check your environment or .env file.")
        self.client = AsyncGroq(api_key=key)
        self.model = "llama-3.3-70b-versatile"


    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_recipe(self, plan: RecipePlan) -> RecipeResult:
        """
        Calls the Groq API to generate recipe details matching the plan.
        """
        # Load system instructions dynamically from prompt_instructions.txt
        base_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(base_dir, "prompt_instructions.txt")
        try:
            with open(prompt_path, "r", encoding="utf-8") as f:
                system_prompt = f.read().strip()
        except Exception as e:
            logger.warning(f"Could not read prompt_instructions.txt at {prompt_path}: {e}. Using fallback system prompt.")
            system_prompt = (
                "You are a master culinary chef and meal planner.\n"
                "Your task is to generate a detailed recipe matching a target list of food preferences.\n"
                "You must return ONLY a single, valid JSON object matching the RecipeDetails schema."
            )

        user_prompt = (
            f"Target Preferences: {plan.target_preferences}\n"
            f"Exclusion Constraints: {plan.exclusion_constraints}\n"
            f"Please generate the recipe."
        )

        logger.info(f"Generating recipe for Slot {plan.recipe_id} (satisfies: {plan.satisfied_people})")
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2
        )

        raw_content = response.choices[0].message.content
        details = RecipeDetails.model_validate_json(raw_content)

        return RecipeResult(
            recipe_id=plan.recipe_id,
            title=details.title,
            description=details.description,
            ingredients=details.ingredients,
            instructions=details.instructions,
            satisfied_people=plan.satisfied_people,
            matching_preferences=details.matching_preferences
        )
