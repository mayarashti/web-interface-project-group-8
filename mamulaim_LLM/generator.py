import os
import json
import logging
import urllib.parse
from typing import Optional, List, Dict, Any
from groq import AsyncGroq
from tenacity import retry, stop_after_attempt, wait_exponential
from schemas import SoldierPreferences, RecipeDetails

logger = logging.getLogger("recipe_recommendation.generator")

class RecipeGenerator:
    def __init__(self, api_key: Optional[str] = None):
        key = api_key or os.getenv("GROQ_API_KEY")
        if not key:
            raise ValueError("GROQ_API_KEY not found. Please check your environment or .env file.")
        self.client = AsyncGroq(api_key=key)
        self.model = "llama-3.3-70b-versatile"

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def build_spoonacular_query(self, soldier: SoldierPreferences) -> Dict[str, Any]:
        """
        Use LLM to parse soldier preferences (often in Hebrew) and generate English Spoonacular parameters.
        """
        system_prompt = (
            "You are a translation assistant. Your task is to translate food preferences and restrictions "
            "from Hebrew to English API query parameters for the Spoonacular API.\n"
            "Return ONLY a JSON object with this structure:\n"
            "{\n"
            '  "includeIngredients": ["english ingredient 1", "english ingredient 2"],\n'
            '  "excludeIngredients": ["english allergen/disliked 1", "english allergen/disliked 2"],\n'
            '  "diet": "vegetarian or vegan or gluten free or empty string"\n'
            "}"
        )

        user_prompt = (
            f"Translate these soldier preferences to Spoonacular API parameters:\n"
            f"- Favorite Foods (Hebr/Eng): {soldier.favoriteFoods}\n"
            f"- Disliked Foods (Hebr/Eng): {soldier.dislikedFoods}\n"
            f"- Allergies (Hebr/Eng): {soldier.allergies}\n"
            f"- Dietary Preferences (Hebr/Eng): {soldier.dietaryPreferences}\n"
        )

        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=256
            )
            raw_content = response.choices[0].message.content
            return json.loads(raw_content)
        except Exception as e:
            logger.error(f"Error mapping preferences to Spoonacular query: {e}")
            return {
                "includeIngredients": [],
                "excludeIngredients": soldier.allergies + soldier.dislikedFoods,
                "diet": ""
            }


    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def validate_recipe(
        self,
        soldier: SoldierPreferences,
        kosher_required: bool,
        recipe: Dict[str, Any],
        first_recipe_title: Optional[str] = None
    ) -> bool:
        """
        Use the LLM to validate the recipe against all constraints, including distinctiveness.
        """
        system_prompt = (
            "You are an expert culinary safety inspector. Your task is to validate if a recipe is completely safe "
            "and compatible with a soldier's preferences and restrictions. "
            "the food must be kosher"
            "You must return ONLY a JSON object and nothing else.\n\n"
            "JSON structure:\n"
            "{\n"
            '  "is_valid": true/false,\n'
            '  "reason": "a brief explanation of your decision in English"\n'
            "}"
        )

        user_prompt = (
            f"Soldier Preferences:\n"
            f"- Favorite Foods: {soldier.favoriteFoods}\n"
            f"- Disliked Foods: {soldier.dislikedFoods}\n"
            f"- Allergies: {soldier.allergies}\n"
            f"- Dietary Preferences: {soldier.dietaryPreferences}\n"
            f"- Is Kosher Required: {kosher_required}\n\n"
            f"Recipe Candidates to Validate:\n"
            f"- Title: {recipe.get('title')}\n"
            f"- Ingredients: {[i.get('original') for i in recipe.get('extendedIngredients', [])]}\n"
            f"- Instructions: {recipe.get('instructions') or recipe.get('analyzedInstructions')}\n\n"
        )

        if first_recipe_title:
            user_prompt += (
                f"Previous Selected Recipe Title: {first_recipe_title}\n"
                f"CRITICAL: The new recipe must be a completely different type of dish and cannot be a minor variation "
                f"of '{first_recipe_title}' (e.g. no similar pasta types, no similar chicken dishes, etc.).\n\n"
            )

        user_prompt += (
            "Validate against these rules:\n"
            "1. Must NOT contain any allergens.\n"
            "2. Must NOT contain any disliked ingredients.\n"
            "3. Must NOT contain non-kosher ingredients (pork, bacon, ham, shellfish, shrimp, crab, lobster, etc.) and MUST NOT mix meat and dairy.\n"
            "4. Must match dietary preferences (e.g. vegetarian, vegan).\n"
            "5. (If previous recipe is provided) Must be a distinct type of dish.\n"
            "6. if there is a prefered food it should return only the food"
        )

        logger.info(f"LLM validating recipe: '{recipe.get('title')}'")
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.0,
                max_tokens=256
            )
            raw_content = response.choices[0].message.content
            result = json.loads(raw_content)
            is_valid = result.get("is_valid", False)
            reason = result.get("reason", "")
            logger.info(f"LLM validation result for '{recipe.get('title')}': {is_valid} (Reason: {reason})")
            return is_valid
        except Exception as e:
            logger.error(f"Error during LLM validation of recipe {recipe.get('title')}: {e}")
            return False

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def translate_and_format_recipe(
        self,
        recipe: Dict[str, Any],
        soldier: SoldierPreferences
    ) -> RecipeDetails:
        """
        Translate the Spoonacular recipe details into natural, high-quality Hebrew.
        """
        system_prompt = (
            "You are a professional chef and translation expert.\n"
            "Your task is to translate an English recipe into high-quality, warm, and in natural Hebrew.\n"
            "You must return ONLY a valid JSON object matching the target schema.\n\n"
            "Target JSON structure:\n"
            "{\n"
            '  "title": "Hebrew recipe title",\n'
            '  "description": "Short explanation in Hebrew of the recipe/ dish",\n'
            '  "ingredients": [\n'
            '    "Hebrew translated ingredient with quantities",\n'
            '    "Hebrew translated ingredient with quantities"\n'
            '  ],\n'
            '  "instructions": [\n'
            '    "Hebrew translated instruction step 1",\n'
            '    "Hebrew translated instruction step 2"\n'
            '  ],\n'
            '  "matching_preferences": [\n'
            '    "Matched preferences in Hebrew (e.g., כשר, ללא גלוטן, צמחוני, אהוב)"\n'
            '  ]\n'
            "}"
        )

        raw_ingredients = [i.get('original') for i in recipe.get('extendedIngredients', [])][:20] # Limit to 20 ingredients max
        
        # Extract instructions
        instructions_list = []
        analyzed = recipe.get("analyzedInstructions", [])
        if analyzed and isinstance(analyzed, list) and len(analyzed) > 0:
            for step in analyzed[0].get("steps", []):
                instructions_list.append(step.get("step", ""))
        else:
            raw_inst = recipe.get("instructions", "")
            if raw_inst:
                # simple clean up and split by period/newline
                instructions_list = [s.strip() for s in raw_inst.replace("<ol>", "").replace("</ol>", "").replace("<li>", "").replace("</li>", "").split("\n") if s.strip()]

        instructions_list = instructions_list[:15] # Limit to 15 steps max

        if not instructions_list:
            instructions_list = ["Cook according to taste."]

        user_prompt = (
            f"Original English Recipe details:\n"
            f"Title: {recipe.get('title')}\n"
            f"Ingredients:\n" + "\n".join(f"- {ing}" for ing in raw_ingredients) + "\n"
            f"Instructions:\n" + "\n".join(f"{idx+1}. {step}" for idx, step in enumerate(instructions_list)) + "\n\n"
            f"Please translate all details into Hebrew. Keep translations brief and concise. The ingredients and instructions list must be fully translated."
        )

        logger.info(f"LLM translating recipe: '{recipe.get('title')}'")
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=2048
        )

        raw_content = response.choices[0].message.content
        translated = json.loads(raw_content)

        # Build clean model output
        image_url = recipe.get("image", "")

        return RecipeDetails(
            id=recipe.get("id"),
            recipe_id=recipe.get("id"),
            title=translated.get("title", recipe.get("title")),
            image=image_url,
            image_url=image_url,
            readyInMinutes=recipe.get("readyInMinutes", 30),
            servings=recipe.get("servings", 4),
            ingredients=translated.get("ingredients", []),
            instructions=translated.get("instructions", []),
            description=translated.get("description", ""),
            matching_preferences=translated.get("matching_preferences", [])
        )

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
    async def generate_recipe_directly(
        self,
        target_preferences: List[str],
        exclusion_constraints: List[str],
        previous_recipe_titles: Optional[List[str]] = None
    ) -> RecipeDetails:
        """
        Directly generate a high-quality Israeli Shabbat recipe from preferences.
        """
        system_prompt = (
            "You are a master culinary chef specializing in authentic Israeli, Middle Eastern, Sephardic, and Ashkenazi home cooking, "
            "specifically family-style Shabbat dinners. Your task is to generate a recipe in Hebrew that is: \n"
            "1. A traditional, delicious, and common dish in the Israeli kitchen suitable for Shabbat dinner "
            "(e.g., Moroccan Chrayme/Fish, Shabbat slow-cooked Hamin/Cholent, Roast Chicken with Silan/potatoes, "
            "Mafrum, beef/chicken meatballs simmered in tomato sauce, Moroccan olives chicken, vegetarian/vegan Siniya, "
            "stuffed peppers/vegetables, rich vegetable soup with couscous, etc.).\n"
            "2. Tailored to the provided target preferences and strictly safe from all exclusion constraints.\n"
            "   CRITICAL DIETARY CONSTRAINTS:\n"
            "   - If 'vegetarian' is in the preferences or exclusions: The recipe MUST contain absolutely NO meat, poultry, chicken, beef, lamb, or fish. It must be a plant-based, dairy, or egg dish (e.g. Vegetarian Siniya, Couscous with vegetable soup, Shakshuka, roasted vegetables, pasta, etc.).\n"
            "   - If 'vegan' is in the preferences or exclusions: The recipe MUST contain absolutely NO animal products (no meat, chicken, beef, fish, dairy, cheese, butter, cream, yogurt, eggs, honey, gelatin, etc.).\n"
            "   - If 'celiac' or 'gluten' or 'gluten-free' or 'gluten free' is in the preferences or exclusions: The recipe MUST contain absolutely NO wheat, barley, rye, flour, pasta, bread, couscous, semolina, or gluten-containing ingredients.\n"
            "3. Strictly Kosher if required: Must NOT contain non-kosher ingredients (pork, bacon, ham, shellfish, crab, shrimp, etc.) "
            "and MUST NOT mix meat (beef, chicken, turkey, lamb) and dairy (milk, cheese, butter, cream, yogurt) in the same recipe.\n"
            "4. Distinct: It must be a completely different style/course of dish from any already selected recipes in this session.\n"
            "5. Output format: Return ONLY a valid JSON object matching the target schema and nothing else.\n"
            "   CRITICAL LANGUAGE RULE: All fields (title, description, ingredients, instructions, matching_preferences) MUST be written in Hebrew. However, the 'image_prompt' field MUST be written strictly in English describing the food scene (e.g. food photography of the dish, no people, no kitchen interiors, just the plate of food close up).\n\n"
            "Target JSON structure:\n"
            "{\n"
            '  "title": "Hebrew recipe title",\n'
            '  "description": "Hebrew description explaining the dish and why it perfectly matches the preferences",\n'
            '  "ingredients": [\n'
            '    "Hebrew translated ingredient with quantities (e.g. 4 כרעי עוף, 3 כפות סילאן, 1 כפית מלח)",\n'
            '    "Hebrew translated ingredient with quantities"\n'
            '  ],\n'
            '  "instructions": [\n'
            '    "Hebrew translated instruction step 1",\n'
            '    "Hebrew translated instruction step 2"\n'
            '  ],\n'
            '  "matching_preferences": [\n'
            '    "Matched preferences in Hebrew (e.g., כשר, ללא גלוטן, צמחוני, אהוב)"\n'
            '  ],\n'
            '  "readyInMinutes": 45,\n'
            '  "servings": 4,\n'
            '  "image_prompt": "A detailed, professional English food photography prompt for this specific dish to generate a realistic cookbook-style photo (e.g. \'Moroccan fish chrayme in a red sauce, served in a traditional clay pot, cilantro garnish, close-up, rustic table, cookbook style, warm lighting, depth of field\')"\n'
            "}"
        )

        user_prompt = (
            f"Generate a recipe matching these target preferences: {', '.join(target_preferences)}\n"
            f"And these exclusions/allergies: {', '.join(exclusion_constraints)}\n"
        )
        if "כשר" in target_preferences or "kosher" in [p.lower() for p in target_preferences]:
            user_prompt += "- Ensure the recipe is strictly Kosher (no meat + dairy, no pork/shellfish).\n"

        if previous_recipe_titles:
            user_prompt += (
                f"\nAlready Selected Recipes in this session: {json.dumps(previous_recipe_titles)}\n"
                f"CRITICAL: The new recipe must be a completely different type of dish/course from the already selected recipes. "
                f"For example, if you already generated a chicken/meat main course, generate a vegetarian side dish, salad, or fish option.\n\n"
            )

        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=1536
        )

        raw_content = response.choices[0].message.content
        result = json.loads(raw_content)

        title = result.get("title", "מתכון מותאם אישית")
        image_prompt = result.get("image_prompt", title)
        encoded_prompt = urllib.parse.quote(image_prompt)
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=636&height=393&nologo=true&private=true"

        import random
        recipe_id = random.randint(1, 1000000)

        return RecipeDetails(
            id=recipe_id,
            recipe_id=recipe_id,
            title=title,
            image=image_url,
            image_url=image_url,
            readyInMinutes=result.get("readyInMinutes", 45),
            servings=result.get("servings", 4),
            ingredients=result.get("ingredients", []),
            instructions=result.get("instructions", []),
            description=result.get("description", ""),
            matching_preferences=result.get("matching_preferences", [])
        )
