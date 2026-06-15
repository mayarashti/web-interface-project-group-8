from typing import List, Dict
from pydantic import BaseModel, Field

class RecipeGenerationRequest(BaseModel):
    k: int = Field(gt=0, description="Total number of recipes to generate.")
    people: Dict[str, List[str]] = Field(
        description="A dictionary mapping person ID/name to their list of preferences."
    )

class RecipePlan(BaseModel):
    recipe_id: int
    target_preferences: List[str]
    exclusion_constraints: List[str] = Field(default_factory=list)
    satisfied_people: List[str]

class RecipeDetails(BaseModel):
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    matching_preferences: List[str]

class RecipeResult(BaseModel):
    recipe_id: int
    title: str
    description: str
    ingredients: List[str]
    instructions: List[str]
    satisfied_people: List[str]
    matching_preferences: List[str]

class FinalResponse(BaseModel):
    status: str
    recipes: List[RecipeResult]
