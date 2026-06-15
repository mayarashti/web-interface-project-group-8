from typing import List, Dict
from schemas import RecipePlan


class RecipePlanner:
    """
    Deterministically creates K recipe profiles covering all N people.
    Enforces the constraint: K >= N.
    """

    @staticmethod
    def create_plan(people_map: Dict[str, List[str]], k: int) -> List[RecipePlan]:
        n = len(people_map)
        if k < n:
            raise ValueError(
                f"Coverage constraint violated: target count K ({k}) must be "
                f"greater than or equal to the number of people ({n})."
            )

        plans: List[RecipePlan] = []
        people_list = list(people_map.items())  # list of (name, preferences_list)

        # 1. Core Constraint Guarantee: Allocate first N recipe slots directly to satisfy each person's preferences
        for idx, (person_id, preferences) in enumerate(people_list):
            plans.append(RecipePlan(
                recipe_id=idx + 1,
                target_preferences=preferences,
                exclusion_constraints=[],
                satisfied_people=[person_id]
            ))

        # 2. Allocate the remaining K - N recipe slots
        # These recipes target combinations of preferences to satisfy multiple people.
        for idx in range(n, k):
            person_a_id, person_a_prefs = people_list[0]
            person_b_id, person_b_prefs = people_list[min(idx - n + 1, n - 1)]

            combined_prefs = list(set(person_a_prefs + person_b_prefs))
            satisfied_names = list({person_a_id, person_b_id})

            plans.append(RecipePlan(
                recipe_id=idx + 1,
                target_preferences=combined_prefs,
                exclusion_constraints=[],
                satisfied_people=satisfied_names
            ))

        return plans
