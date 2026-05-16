# Shabbat Dinner - Processes Sheet

This document outlines the user flows and key processes for both the Soldier and Host Family sides of the application, updated to reflect the new streamlined registration and smart-matching dashboards.

## 🔐 Login Flow (Shared)
- **Login:** Users log in using strictly their **Phone Number** and **Password**. No email is required or collected in the system.

---

## 🪖 Soldier Process

The soldier flow focuses on a quick 3-step registration and an LLM-powered smart-matching dashboard.

### Registration Flow
*Note: Email has been completely removed from the registration and login process. Registration is now 3 focused steps.*
1. **Step 1: Account & Verification:** Full Name, Phone Number (serves as the login ID), Password. (Soldier Identification is handled via optional document upload).
2. **Step 2: Preferences:** 
   - Kosher Level: Don't care, Separates Meat/Dairy, or Kosher Kitchen.
   - Shabbat Observance: Not observing, Traditional, or Keep Shabbat.
   - Dietary/Allergies (Multi-select): Vegetarian, Vegan, Celiac (Gluten-Free), Lactose Intolerant, Nut Allergy, No Preferences.
   - Pets: OK with pets? (Yes/No)
3. **Step 3: Profile:** Upload a Profile Photo and a free-text "Tell me about yourself" bio. 

### Soldier Home Dashboard
- **Header:** Profile name, Settings gear (to edit profile details), and an EN/HE language toggle.
- **Smart Map:** Automatically displays the profile of the *best-matched* host family based on LLM analysis of preferences. Includes an option to view additional family options if desired.
- **Open New Hosting Search:** A modal/window to request a meal. *(Note: Personal preferences like kosher/pets are pulled from the profile and no longer asked here).*
  - **Timing:** Dinner date and time (flexible free-text/picker fields).
  - **Logistics:** Checkbox for pickup. Checkbox for an overnight stay (if checked, opens a calendar to select the specific dates/number of nights).
  - **Location:** Current address / map pin (drop a pin on the map for precise location), and a slider/input for how far they are willing to travel (radius).
  - **Come with Friends:** A count slider. If friends are added (>0), the following dynamic fields appear for the group:
    - Kosher needed? (Checkbox)
    - Shabbat observant? (Checkbox)
    - OK with pets? (Checkbox)
    - Allergies? (Multi-select: Vegetarian, Vegan, Celiac, Lactose, Nuts)
    - Notes: (Free text box)
  - **Action:** "Create Search" button. 
  - *Note: For solo searches (1 person), personal preferences like kosher/pets are pulled automatically from the profile.*
- **Search Status:** A list displaying active searches with specific system states:
  - **States:** - *Searching:* Looking for a match.
    - *Matched:* Family assigned (Shows the matched family name).
    - *Canceled:* Search aborted by the soldier.
  - **Matched State Actions:** Tapping a matched search opens a bottom-up sheet with the family's full details, a link to their map location, a WhatsApp message link, and a **"Rematch" button**. Clicking "Rematch" opens a prompt/box for the soldier to fill in a reason for canceling the current match before initiating a new search.
  - **Management:** Options to edit or cancel the search entirely.

---

## 🏡 Host Family Process

The host flow focuses on capturing the home's vibe and capabilities in 3 steps, paired with a proactive dashboard for finding guests.

### Registration Flow
*Note: Email has been completely removed from the registration and login process.*
1. **Step 1: Account & Location:** Full Name, Phone Number (serves as the login ID), Password, and Address (includes an option to pin the exact location on the map for precise matching).
2. **Step 2: Lifestyle & Accommodation:** - Kosher Level: No kosher keeping, Separates Meat/Dairy, or Kosher Kitchen.
   - Shabbat Observance: Not observing, Traditional, or Keep Shabbat.
   - Home Environment: Pets in the house? (If yes, a free-text box opens to specify the animal due to allergies).
   - Cooking Capabilities (Multi-select): Can accommodate Vegetarian, Vegan, Celiac (Gluten-Free), Lactose Intolerant, Nut Allergy.
3. **Step 3: Home Vibe:** A free-text area to describe the atmosphere of the house and a Profile Photo upload.

### Host Home Dashboard & Management
- **Header:** Profile name, Settings gear (to edit profile details), and an EN/HE language toggle.
- **Smart Alerts:** A notification system alerting the family if a soldier is within a specific radius looking for a host for the upcoming Shabbat. 
- **Matching:** System utilizes an LLM based on lifestyle preferences, home vibe, and the history of both families and soldiers to suggest the best fits.
- **Open New Hosting:** A modal/window to open a meal slot. *(Note: Photo uploads are removed from this step; the system relies on the profile photo).*
  - **Details:** Dinner date and time (flexible free-text fields), Capacity (number of guests).
  - **Logistics:** Checkboxes to indicate if the family can host for the night or provide a pickup.
  - **Notes:** Free text box for specific meal details.
  - **Action:** "Create Hosting" button.
- **Hostings Status:** A list of the family's active/upcoming hostings with specific system states:
  - **States:**
    - *Open:* Spots available for soldiers.
    - *Full:* Capacity reached.
    - *Canceled:* Hosting canceled by the family.
  - **Guest Details:** Tapping on a specific hosting opens a bottom-up sheet showing the full details of the matched soldiers. Includes a direct button to send a WhatsApp message to each soldier.