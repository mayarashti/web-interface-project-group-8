# Shabbat Dinner - Processes Sheet

This document outlines the user flows and key processes for both the Soldier and Host Family sides of the application based on the existing codebase.

## 🪖 Soldier Process (Screens 1-15)

The soldier flow focuses on verifying identity and collecting precise preferences to find the best host family match.

### Registration Flow
1. **S1 Welcome:** Entry point. User selects "I am a Soldier".
2. **S2 Explain:** Brief overview of how the matching process works.
3. **S3 Account:** Collects basic info (First/Last name, Phone, Email, Password).
4. **S4 Verify:** OTP (One-Time Password) phone verification.
5. **S5 Service:** Collects military role (Combat, Combat Support, Home Front) and unit details.
6. **S6 Upload:** Security verification (Upload Military ID / Hoger).
7. **S7 Kosher:** Religious preferences (Mehadrin, Standard Kosher, No Preference).
8. **S8 Location:** Target city where they need a meal.
9. **S9 Allergies:** Dietary restrictions (Peanuts, Gluten, Dairy, etc.).
10. **S10 Preferences:** Lifestyle needs (Smoking, Pets, Sleep accommodations).
11. **S11 Profile:** Free-text bio and profile photo upload.
12. **S12 Summary:** Review all inputted data before final submission.
13. **S13 Pending:** System approval waiting screen.
14. **S14 Success:** Confirmation of successful registration.

### Soldier Home Dashboard
- **S15 Home:** The main dashboard for approved soldiers.
  - Features an interactive Map (Leaflet) showing nearby available hosts.
  - Lists upcoming meals and status.
  - Allows requesting new meals.
  - **S21 Soldier Profile:** Accessible via the profile icon (👤) to edit personal details, kosher preferences, allergies, and bio after registration.

---

## 🏡 Host Family Process (Screens 16-20)

The host flow is designed to build a detailed profile of the family's home environment and the types of meals they offer.

### Registration Flow
1. **S1 Welcome:** Entry point. User selects "I am a Host Family".
2. **S18 Host Explain:** Brief overview of the responsibilities and benefits of hosting.
3. **S16 Host Registration:** A wizard divided into 5 internal steps:
   - **Step 1:** Personal Info (Family Name, Phone, Email).
   - **Step 2:** Location (City / Address). *(Hosting Type moved to S20)*
   - **Step 3:** Lifestyle (Shabbat Observance level, Kitchen Kosher level).
   - **Step 4:** Services (Can offer a place to sleep, Can assist with transport).
   - **Step 5:** Home Vibe (Tags like "Kids", "Quiet", "Singing"). *(Capacity moved to S20)*
4. **S17 Host Success:** Confirmation of successful profile creation.

### Host Home Dashboard & Management
- **S19 Host Home:** The interactive main dashboard for families.
  - **S22 Host Profile:** Accessible via the profile icon (👤) to edit family details and home environment post-registration.
  - **Pending Requests:** Displays real requests from soldiers. Families can **Approve** or **Reject** requests, viewing the date and time of the meal.
  - **Upcoming Hostings:** Shows approved soldiers. Families can cancel the hosting if plans change.
  - **My Posted Hostings:** Lists active hosting slots created by the family, which can be canceled/deleted.
- **S20 New Hosting:** Form to open a new hosting slot.
  - Select Date (Upcoming Fridays) and Time (Friday Evening, Saturday Lunch, Custom).
  - Select Capacity (Maximum number of soldiers for *this specific meal*).
  - Add free-text notes and upload photos of the home/table.
