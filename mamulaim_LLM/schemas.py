from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class SoldierPreferences(BaseModel):
    favoriteFoods: List[str] = Field(default_factory=list)
    dislikedFoods: List[str] = Field(default_factory=list)
    allergies: List[str] = Field(default_factory=list)
    dietaryPreferences: List[str] = Field(default_factory=list)
    isKosher: bool = False

class HostFamilyInfo(BaseModel):
    keepsKosher: bool = False

class RecipeRecommendationRequest(BaseModel):
    soldier: SoldierPreferences
    host: HostFamilyInfo

class RecipeGenerationRequest(BaseModel):
    k: int = Field(gt=0, description="Total number of recipes to generate.")
    people: Dict[str, List[str]] = Field(
        description="A dictionary mapping person ID/name to their list of preferences."
    )

class RecipeDetails(BaseModel):
    id: int
    recipe_id: Optional[int] = None
    title: str
    image: str
    image_url: Optional[str] = ""
    readyInMinutes: int
    servings: int
    ingredients: List[str]
    instructions: List[str]
    description: Optional[str] = ""
    matching_preferences: Optional[List[str]] = Field(default_factory=list)

class RecipeWrapper(BaseModel):
    recipe: RecipeDetails

class FinalResponse(BaseModel):
    status: str
    recipes: List[RecipeDetails]
