import logging
import asyncio
from typing import Dict, Any, List, Optional
from schemas import RecipeDetails, RecipeRecommendationRequest, SoldierPreferences, HostFamilyInfo, FinalResponse
from generator import RecipeGenerator
from spoonacular_client import SpoonacularClient

logger = logging.getLogger("recipe_recommendation.orchestrator")

class RecipeRecommendationOrchestrator:
    def __init__(self, generator: RecipeGenerator):
        self.generator = generator
        self.spoonacular = SpoonacularClient()

    def _is_recipe_kosher(self, title: str, ingredients: List[str]) -> bool:
        """
        Application-side kosher validation. Rejects non-kosher meats and meat/dairy mixtures.
        """
        title_lower = title.lower()
        ingredients_lower = [i.lower() for i in ingredients]

        # Non-kosher ingredients list
        non_kosher_keywords = ["pork", "bacon", "ham", "shellfish", "shrimp", "crab", "lobster"]
        for kw in non_kosher_keywords:
            if kw in title_lower or any(kw in ing for ing in ingredients_lower):
                logger.info(f"Rejected recipe '{title}' due to non-kosher ingredient: {kw}")
                return False

        # Check meat/dairy mixtures
        meat_keywords = ["chicken", "beef", "lamb", "turkey", "meat", "sausage", "pepperoni", "veal", "duck", "goose"]
        dairy_keywords = ["milk", "cheese", "butter", "cream", "yogurt", "cheddar", "mozzarella", "parmesan", "lactose"]

        has_meat = any(meat in title_lower for meat in meat_keywords) or any(
            any(meat in ing for meat in meat_keywords) for ing in ingredients_lower
        )
        has_dairy = any(dairy in title_lower for dairy in dairy_keywords) or any(
            any(dairy in ing for dairy in dairy_keywords) for ing in ingredients_lower
        )

        if has_meat and has_dairy:
            logger.info(f"Rejected recipe '{title}' due to meat and dairy mix.")
            return False

        return True

    def _is_recipe_allergy_safe(self, title: str, ingredients: List[str], allergies: List[str]) -> bool:
        """
        Check that the recipe doesn't contain any allergens.
        """
        title_lower = title.lower()
        ingredients_lower = [i.lower() for i in ingredients]

        allergy_map = {
            "gluten": ["wheat", "barley", "rye", "flour", "gluten", "pasta", "bread", "semolina"],
            "lactose": ["milk", "cheese", "butter", "cream", "yogurt", "lactose", "whey"],
            "nuts": ["nut", "almond", "cashew", "pecan", "walnut", "pistachio", "hazelnut"],
            "peanuts": ["peanut"],
            "fish": ["fish", "salmon", "tuna", "cod", "halibut", "snapper", "sardine", "tilapia", "anchovy", "trout"]
        }

        for allergy in allergies:
            allergy_clean = allergy.lower().strip()
            # Map clean key if exists, else match string directly
            keywords = allergy_map.get(allergy_clean, [allergy_clean])
            for kw in keywords:
                if kw in title_lower or any(kw in ing for ing in ingredients_lower):
                    logger.info(f"Rejected recipe '{title}' due to allergen match for '{allergy}': {kw}")
                    return False

        return True

    def _score_recipe(self, recipe: Dict[str, Any], soldier: SoldierPreferences) -> int:
        """
        Rank candidate recipes based on match scores.
        """
        score = 0
        title_lower = recipe.get("title", "").lower()
        ingredients_lower = [i.get("original", "").lower() for i in recipe.get("extendedIngredients", [])]

        # 1. Favorite foods match (+5 each)
        for fav in soldier.favoriteFoods:
            fav_clean = fav.lower().strip()
            if fav_clean in title_lower or any(fav_clean in ing for ing in ingredients_lower):
                score += 5

        # 2. Disliked foods conflict (-10 each)
        for dislike in soldier.dislikedFoods:
            dislike_clean = dislike.lower().strip()
            if dislike_clean in title_lower or any(dislike_clean in ing for ing in ingredients_lower):
                score -= 10

        # 3. Dietary preferences match (+10 each)
        # e.g., if recipe is vegetarian and soldier is vegetarian
        vegetarian_diets = ["vegetarian", "vegan"]
        if "vegetarian" in soldier.dietaryPreferences and (recipe.get("vegetarian") or recipe.get("vegan")):
            score += 10
        if "vegan" in soldier.dietaryPreferences and recipe.get("vegan"):
            score += 10
        if "gluten" in soldier.dietaryPreferences and recipe.get("glutenFree"):
            score += 10

        return score

    async def get_two_recipes(self, soldier: SoldierPreferences, host: HostFamilyInfo) -> List[RecipeDetails]:
        """
        Runs the full workflow to fetch, validate, and select exactly two recipes.
        """
        kosher_required = host.keepsKosher or soldier.isKosher
        logger.info(f"Starting recipe selection. Kosher Required: {kosher_required}")

        # 1. Ask LLM to build the parameters
        query_params = await self.generator.build_spoonacular_query(soldier)
        
        # 2. Query Spoonacular API
        candidates = self.spoonacular.search_recipes(
            include_ingredients=query_params.get("includeIngredients"),
            exclude_ingredients=query_params.get("excludeIngredients"),
            diet=query_params.get("diet"),
            number=30
        )

        # Failure Handling: if no candidates, relax favorite foods matching
        if not candidates:
            logger.info("No candidates returned from initial search. Relaxing favorite-food inclusion.")
            candidates = self.spoonacular.search_recipes(
                exclude_ingredients=query_params.get("excludeIngredients"),
                diet=query_params.get("diet"),
                number=30
            )

        # 3. Apply backend filtering
        safe_candidates = []
        for c in candidates:
            title = c.get("title", "")
            ingredients = [i.get("original", "") for i in c.get("extendedIngredients", [])]
            
            # Allergen filter
            if not self._is_recipe_allergy_safe(title, ingredients, soldier.allergies):
                continue
            # Kosher filter
            if kosher_required and not self._is_recipe_kosher(title, ingredients):
                continue
            
            safe_candidates.append(c)

        logger.info(f"Found {len(safe_candidates)} allergy and kosher safe candidates.")

        # 4. Rank candidates
        ranked_candidates = sorted(
            safe_candidates,
            key=lambda x: self._score_recipe(x, soldier),
            reverse=True
        )

        selected_recipes: List[RecipeDetails] = []

        # 5. Select and validate Recipe 1
        for candidate in ranked_candidates:
            # LLM Validation
            is_valid = await self.generator.validate_recipe(
                soldier=soldier,
                kosher_required=kosher_required,
                recipe=candidate
            )
            if is_valid:
                recipe_details = await self.generator.translate_and_format_recipe(candidate, soldier)
                selected_recipes.append(recipe_details)
                logger.info(f"Recipe 1 selected: '{recipe_details.title}'")
                break

        if not selected_recipes:
            raise ValueError("No suitable recipes matched the soldier preferences and safety restrictions.")

        # 6. Select and validate Recipe 2 (must be distinct)
        first_recipe_title_eng = ""
        for c in candidates:
            if c.get("id") == selected_recipes[0].id:
                first_recipe_title_eng = c.get("title", "")
                break

        for candidate in ranked_candidates:
            if candidate.get("id") == selected_recipes[0].id:
                continue

            # LLM Validation including distinctiveness check
            is_valid = await self.generator.validate_recipe(
                soldier=soldier,
                kosher_required=kosher_required,
                recipe=candidate,
                first_recipe_title=first_recipe_title_eng
            )
            if is_valid:
                recipe_details = await self.generator.translate_and_format_recipe(candidate, soldier)
                selected_recipes.append(recipe_details)
                logger.info(f"Recipe 2 selected: '{recipe_details.title}'")
                break

        # If we couldn't find a distinct second recipe, try relaxing difference or fetch more
        if len(selected_recipes) < 2:
            logger.info("Could not find a highly distinct second recipe. Selecting the next safest candidate.")
            for candidate in ranked_candidates:
                if candidate.get("id") == selected_recipes[0].id:
                    continue
                recipe_details = await self.generator.translate_and_format_recipe(candidate, soldier)
                selected_recipes.append(recipe_details)
                break

        return selected_recipes
