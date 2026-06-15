import requests
import json

url = "http://localhost:8000/generate-recipes"

# Test payload mimicking what the frontend sends
payload = {
    "soldier": {
        "favoriteFoods": [],
        "dislikedFoods": [],
        "allergies": [],
        "dietaryPreferences": [],
        "isKosher": False
    },
    "host": {
        "keepsKosher": False
    }
}

try:
    print("Sending request to http://localhost:8000/generate-recipes...")
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status Code: {response.status_code}")
    print("Response JSON:")
    print(json.dumps(response.json(), indent=2, ensure_ascii=False))
except Exception as e:
    print(f"Error: {e}")
