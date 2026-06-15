# Cloud Functions

Matching engine + address/geocoding proxies for the Memulaim app.

## Google Maps API key (AddressPicker)

The `AddressPicker` component talks to three callables — `placesAutocomplete`,
`placeDetails`, `reverseGeocode` — which call the Google Maps Platform APIs
**server-side**, so the API key is never shipped to the browser.

The key is read from the `GOOGLE_MAPS_API_KEY` secret. It is **never committed**.

### Required Google APIs
Enable these on the GCP project (and make sure **billing is enabled**):
- **Places API (New)**
- **Geocoding API**

### Production / deploy
```bash
firebase functions:secrets:set GOOGLE_MAPS_API_KEY   # paste the key when prompted
firebase deploy --only functions
```

### Local development (emulator)
Create `functions/.secret.local` (git-ignored) with:
```
GOOGLE_MAPS_API_KEY=<your-key>
```
Then run the functions emulator and the static site:
```bash
firebase emulators:start --only functions --project memulaim-88a26
```
The client auto-routes Cloud Functions calls to the emulator (`127.0.0.1:5001`)
when served from `localhost` — see `core/firebase.js`.
