/* address_picker.js — Reusable address input.
 *
 * Google Places autocomplete (proxied through Cloud Functions so the API key
 * stays server-side) + a draggable Leaflet marker with reverse geocoding.
 * Restricted to Israel by default, configurable via the `country` prop.
 *
 * Emits a structured address object through `onChange`:
 *   { fullString, street, city, coordinates: { lat, lng }, placeId, radiusKm? }
 */

(function () {
  const { useState, useEffect, useRef } = React;

  const TEL_AVIV = [32.0853, 34.7818];

  // Thin wrapper around the callable proxies in functions/index.js.
  const callFn = (name, data) =>
    firebase.functions().httpsCallable(name)(data).then((r) => r.data);

  const newSessionToken = () =>
    (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'st-' + Math.random().toString(36).slice(2) + Date.now().toString(36);

  function AddressPicker({
    value = null,
    onChange,
    label,
    placeholder,
    hint,
    error,
    required = false,
    disabled = false,
    className = '',
    country = 'IL',
    languageCode,
    showMap = true,
    defaultCenter = TEL_AVIV,
    defaultZoom = 13,
    mapHeight = 256,
    withRadius = false,
    radiusKm,
    onRadiusChange,
  }) {
    const { t, lang } = useLang();
    const lc = languageCode || (lang === 'he' ? 'he' : 'en');

    const [query, setQuery] = useState(value?.fullString || value?.city || '');
    const [suggestions, setSuggestions] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [busy, setBusy] = useState(false); // details / reverse-geocode in flight

    const mapDiv = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const debounceRef = useRef(null);
    const sessionRef = useRef(null);
    const blurRef = useRef(null);
    const radiusRef = useRef(radiusKm || 10); // latest radius for stable map handlers
    radiusRef.current = radiusKm || 10;

    // Keep the text field in sync when the value is set/seeded from outside.
    useEffect(() => {
      setQuery(value?.fullString || value?.city || '');
    }, [value?.fullString, value?.city]);

    // ── Map lifecycle ────────────────────────────────────────────
    useEffect(() => {
      if (!showMap || !mapDiv.current || mapRef.current) return;
      const center = value?.coordinates?.lat
        ? [value.coordinates.lat, value.coordinates.lng]
        : defaultCenter;

      const map = L.map(mapDiv.current).setView(center, defaultZoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);
      mapRef.current = map;

      const marker = L.marker(center, { draggable: !disabled }).addTo(map);
      markerRef.current = marker;

      if (withRadius) {
        const circle = L.circle(center, {
          radius: (radiusKm || 10) * 1000,
          color: '#b86442',
          fillColor: '#b86442',
          fillOpacity: 0.12,
          weight: 2,
        }).addTo(map);
        circleRef.current = circle;
      }

      const handleMove = (latlng) => {
        if (disabled) return;
        marker.setLatLng(latlng);
        if (circleRef.current) circleRef.current.setLatLng(latlng);
        handleReverseGeocode(latlng.lat, latlng.lng);
      };
      marker.on('dragend', () => handleMove(marker.getLatLng()));
      map.on('click', (e) => handleMove(e.latlng));

      // Leaflet needs a reflow once the container has its real size.
      setTimeout(() => map.invalidateSize(), 50);

      return () => {
        map.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      };
    }, [showMap]);

    // Recenter / move marker when coordinates change from a selection or seed.
    useEffect(() => {
      const c = value?.coordinates;
      if (!mapRef.current || !markerRef.current || !c?.lat) return;
      const latlng = [c.lat, c.lng];
      markerRef.current.setLatLng(latlng);
      if (circleRef.current) circleRef.current.setLatLng(latlng);
      mapRef.current.setView(latlng, Math.max(mapRef.current.getZoom(), defaultZoom));
    }, [value?.coordinates?.lat, value?.coordinates?.lng]);

    // Keep the radius circle in sync with the slider.
    useEffect(() => {
      if (circleRef.current && withRadius) circleRef.current.setRadius((radiusKm || 10) * 1000);
    }, [radiusKm, withRadius]);

    // ── Autocomplete ─────────────────────────────────────────────
    const runAutocomplete = (input) => {
      if (!input || input.trim().length < 2) {
        setSuggestions([]);
        setOpen(false);
        return;
      }
      if (!sessionRef.current) sessionRef.current = newSessionToken();
      setLoading(true);
      callFn('placesAutocomplete', {
        input,
        country,
        languageCode: lc,
        sessionToken: sessionRef.current,
      })
        .then((data) => {
          setSuggestions(data.suggestions || []);
          setOpen(true);
        })
        .catch((e) => {
          console.error('placesAutocomplete failed', e);
          setSuggestions([]);
        })
        .finally(() => setLoading(false));
    };

    const onInputChange = (text) => {
      setQuery(text);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runAutocomplete(text), 300);
    };

    const selectSuggestion = (s) => {
      setOpen(false);
      setQuery(s.description || s.mainText);
      setBusy(true);
      callFn('placeDetails', {
        placeId: s.placeId,
        languageCode: lc,
        sessionToken: sessionRef.current,
      })
        .then((data) => {
          sessionRef.current = null; // session ends after details
          emit(data.address);
        })
        .catch((e) => console.error('placeDetails failed', e))
        .finally(() => setBusy(false));
    };

    const handleReverseGeocode = (lat, lng) => {
      setBusy(true);
      callFn('reverseGeocode', { lat, lng, country, languageCode: lc })
        .then((data) => {
          const addr = data.address || { coordinates: { lat, lng } };
          setQuery(addr.fullString || addr.city || '');
          emit(addr);
        })
        .catch((e) => console.error('reverseGeocode failed', e))
        .finally(() => setBusy(false));
    };

    const emit = (addr) => {
      if (!onChange) return;
      onChange(withRadius ? { ...addr, radiusKm: radiusRef.current } : addr);
    };

    // ── Render ───────────────────────────────────────────────────
    const inputBase =
      'w-full min-h-[48px] py-3 px-4 rounded-xl border bg-white text-[15px] transition-all duration-200 ' +
      'placeholder:text-warm-400 focus:outline-none focus:ring-4';
    const inputState = error
      ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30'
      : 'border-warm-200 focus:border-brand-400 focus:ring-brand-50 hover:border-warm-300';

    return (
      <div className={clsx('w-full mb-5', className)}>
        {label && (
          <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex flex-wrap justify-between items-baseline gap-1">
            <span>{label} {required && <span className="text-red-500">*</span>}</span>
            {hint && <span className="text-xs font-normal text-warm-500">{hint}</span>}
          </label>
        )}

        {/* Autocomplete input + dropdown */}
        <div className="relative">
          <input
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => onInputChange(e.target.value)}
            onFocus={() => suggestions.length && setOpen(true)}
            onBlur={() => { blurRef.current = setTimeout(() => setOpen(false), 150); }}
            placeholder={placeholder || t('addr_placeholder')}
            className={clsx(inputBase, inputState, disabled && 'opacity-50 cursor-not-allowed')}
          />
          {(loading || busy) && (
            <div className="absolute inset-y-0 end-3 flex items-center text-warm-400 text-xs">
              {t('addr_searching')}
            </div>
          )}

          {open && suggestions.length > 0 && (
            <ul className="absolute z-30 mt-1 w-full bg-white border border-warm-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
              {suggestions.map((s) => (
                <li key={s.placeId}>
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); clearTimeout(blurRef.current); selectSuggestion(s); }}
                    className="w-full text-start px-4 py-2.5 hover:bg-brand-50 transition-colors border-b border-warm-100 last:border-0"
                  >
                    <span className="block text-sm font-semibold text-gray-800">{s.mainText}</span>
                    {s.secondaryText && (
                      <span className="block text-xs text-warm-500">{s.secondaryText}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in">{error}</p>}

        {/* Map */}
        {showMap && (
          <div
            ref={mapDiv}
            className="w-full rounded-xl border border-warm-200 overflow-hidden z-0 mt-3"
            style={{ height: `${mapHeight}px` }}
          />
        )}

        {/* Optional radius slider */}
        {showMap && withRadius && (
          <div className="mt-3">
            <label className="block text-sm font-semibold text-warm-600 mb-2">
              {t('radius_label')}:{' '}
              <span className="text-brand-700">
                {(radiusKm || 10) < 1 ? "500 מ'" : `${radiusKm || 10} ${t('km_unit')}`}
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="100"
              step="0.5"
              value={radiusKm || 10}
              disabled={disabled}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                if (onRadiusChange) onRadiusChange(v);
                if (value?.coordinates?.lat) onChange && onChange({ ...value, radiusKm: v });
              }}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
            <div className="flex justify-between text-[11px] text-warm-400 mt-1">
              <span>500 מ'</span>
              <span>100 {t('km_unit')}</span>
            </div>
          </div>
        )}

        {/* Selected address preview */}
        {value?.fullString && (
          <div className="mt-3 bg-brand-50 border border-brand-100 p-3 rounded-xl">
            <p className="text-xs text-brand-700 font-medium">📍 {value.fullString}</p>
          </div>
        )}
      </div>
    );
  }

  window.AddressPicker = AddressPicker;
})();
