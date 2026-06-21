/* components.js — Shared UI components */

var { useState, useEffect, useRef } = React;
window.clsx = (...args) => args.filter(Boolean).join(' ');
const clsx = window.clsx;

/* Straight-line distance (km) between two lat/lng points (Haversine).
   Shared by the soldier dashboard to filter/sort families by location. */
window.distanceKm = function distanceKm(lat1, lng1, lat2, lng2) {
  const isNum = (n) => typeof n === 'number' && !Number.isNaN(n);
  if (![lat1, lng1, lat2, lng2].every(isNum)) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

function ProgressBar({ step, total }) {
  const { t } = useLang();
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-warm-600">{t('step_label', step, total)}</span>
        <span className="text-xs font-bold text-brand-600">{pct}%</span>
      </div>
      <div className="h-2 w-full bg-warm-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false }) {
  const base = "w-full py-3.5 px-4 rounded-xl font-bold text-[15px] transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98] shadow-sm hover:shadow-md",
    secondary: "bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100 active:scale-[0.98]",
    outline: "bg-white text-gray-700 border border-warm-200 hover:bg-warm-50 hover:border-warm-300 active:scale-[0.98]",
    ghost: "bg-transparent text-warm-600 hover:bg-warm-50 active:scale-[0.98]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-[0.98]"
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled}
      className={clsx(base, variants[variant], className)}
    >
      {children}
    </button>
  );
}

function EyeIcon({ open }) {
  return open ? (
    /* Eye open */
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
      <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
    </svg>
  ) : (
    /* Eye closed — same eye with a diagonal slash */
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
      <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
      <line x1="48" y1="40" x2="208" y2="216" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>
    </svg>
  );
}

function Input({ label, value, onChange, placeholder, type = 'text', hint, error, required = false, className = '' }) {
  const [showPw, setShowPw] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div className={clsx("w-full mb-5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex flex-wrap justify-between items-baseline gap-1">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {hint && <span className="text-xs font-normal text-warm-500">{hint}</span>}
        </label>
      )}
      <div className={isPassword ? 'relative' : undefined}>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={clsx(
            "w-full min-h-[48px] py-3 rounded-xl border bg-white text-[15px] transition-all duration-200 placeholder:text-warm-400 focus:outline-none focus:ring-4",
            isPassword ? 'ps-4 pe-12' : 'px-4',
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30"
              : "border-warm-200 focus:border-brand-400 focus:ring-brand-50 hover:border-warm-300"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPw(v => !v)}
            className="absolute inset-y-0 end-0 flex items-center px-3 text-warm-400 hover:text-brand-500 transition-colors"
            tabIndex={-1}
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPw} />
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-600 animate-fade-in">{error}</p>}
    </div>
  );
}

function LocationInput({ label, value, onChange, onMapPin, placeholder, error, required = false, hint }) {
  const { t } = useLang();
  return (
    <div className="w-full mb-5">
      <Input 
        label={label} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder} 
        error={error} 
        required={required} 
        hint={hint}
      />
      <div className="flex justify-end -mt-3">
        <button 
          type="button" 
          onClick={onMapPin}
          className="text-xs font-bold text-brand-600 flex items-center gap-1.5 hover:text-brand-700 transition-colors py-1 px-2 rounded-lg hover:bg-brand-50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {t('map_pin_btn')}
        </button>
      </div>
    </div>
  );
}

function MapPinModal({ isOpen, onClose, onConfirm, initialLat, initialLng }) {
  const { t, lang } = useLang();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [tempPos, setTempPos] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (isOpen && !mapRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const center = [initialLat || 32.0853, initialLng || 34.7818]; // Default to Tel Aviv
        const map = L.map('map-pin-container').setView(center, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);

        mapRef.current = map;

        const marker = L.marker(center, { draggable: true }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          setTempPos(pos);
          reverseGeocode(pos);
        });

        map.on('click', (e) => {
          marker.setLatLng(e.latlng);
          setTempPos(e.latlng);
          reverseGeocode(e.latlng);
        });
      }, 100);
    }
    return () => {
      if (!isOpen && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isOpen]);

  const reverseGeocode = async (pos) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`);
      const data = await res.json();
      setAddress(data.display_name);
    } catch (e) {
      setAddress('');
    }
  };

  const handleConfirm = () => {
    if (tempPos) onConfirm(tempPos, address);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('map_pin_btn')}>
      <div className="space-y-4">
        <div id="map-pin-container" className="w-full h-64 rounded-xl border border-warm-200 overflow-hidden z-0" />
        {address && (
          <div className="bg-brand-50 border border-brand-100 p-3 rounded-xl">
            <p className="text-xs text-brand-700 font-medium">{t('map_pin_set')}:</p>
            <p className="text-sm text-gray-800 leading-snug mt-1">{address}</p>
          </div>
        )}
        <Btn onClick={handleConfirm} disabled={!tempPos}>
          {t('map_pin_confirm')}
        </Btn>
      </div>
    </Modal>
  );
}

/* FridayDatePicker — shows "This Friday", "Next Friday", or "Other" (opens calendar) */
function FridayDatePicker({ label, value, onChange, error }) {
  const { t, lang } = useLang();
  const [showCustom, setShowCustom] = useState(false);
  const dateInputRef = useRef(null);

  // Compute the ISO strings for the two upcoming Fridays
  const today = new Date();
  const daysUntilFriday = (5 - today.getDay() + 7) % 7;

  const thisFriday = new Date(today);
  thisFriday.setDate(today.getDate() + daysUntilFriday);

  const nextFriday = new Date(thisFriday);
  nextFriday.setDate(thisFriday.getDate() + 7);

  const toISO   = (d) => d.toISOString().split('T')[0];
  const thisFridayISO = toISO(thisFriday);
  const nextFridayISO = toISO(nextFriday);

  const fmtDate = (d) =>
    d.toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { day: 'numeric', month: 'numeric' });

  const isCustom = value && value !== thisFridayISO && value !== nextFridayISO;

  const options = [
    { id: thisFridayISO, label: t('date_this_friday'), sub: fmtDate(thisFriday) },
    { id: nextFridayISO, label: t('date_next_friday'), sub: fmtDate(nextFriday) },
    { id: 'other',       label: t('date_other'),       sub: isCustom ? fmtDate(new Date(value + 'T00:00:00')) : null },
  ];

  const handleSelect = (id) => {
    if (id === 'other') {
      setShowCustom(true);
      if (!isCustom) onChange('');
      // Open the native calendar immediately after the input renders
      setTimeout(() => {
        try { dateInputRef.current?.showPicker(); } catch (_) {
          dateInputRef.current?.click();
        }
      }, 50);
    } else {
      setShowCustom(false);
      onChange(id);
    }
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-warm-600 mb-2">{label}</label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {options.map(opt => {
          const selected = opt.id === 'other'
            ? (showCustom || isCustom)
            : value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleSelect(opt.id)}
              className={clsx(
                'rounded-xl border px-2 py-3 text-center transition-all duration-150 flex flex-col items-center gap-1',
                selected
                  ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-sm'
                  : 'border-warm-200 bg-white text-gray-700 hover:border-brand-200 hover:bg-brand-50'
              )}
            >
              <span className="font-semibold text-sm leading-tight">{opt.label}</span>
              {opt.sub && (
                <span className={clsx('text-xs', selected ? 'text-brand-500' : 'text-warm-400')}>
                  {opt.sub}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {(showCustom || isCustom) && (
        <div className="mt-3 animate-fade-in">
          <input
            ref={dateInputRef}
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-warm-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 transition-all"
          />
        </div>
      )}
      {error && <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

function RadiusMapModal({ isOpen, onClose, onConfirm, initialLat, initialLng, initialRadius }) {
  const { t } = useLang();
  const mapRef    = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [tempPos, setTempPos] = useState(null);
  const [address, setAddress] = useState('');
  const [radius,  setRadius]  = useState(initialRadius || 10);

  useEffect(() => {
    if (isOpen && !mapRef.current) {
      setTimeout(() => {
        const center = [initialLat || 32.0853, initialLng || 34.7818];
        const map = L.map('radius-map-container').setView(center, 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(map);
        mapRef.current = map;

        const marker = L.marker(center, { draggable: true }).addTo(map);
        markerRef.current = marker;

        const initRadius = initialRadius || 10;
        const circle = L.circle(center, {
          radius: 	initRadius * 1000,
          color: '#B0BA99',
          fillColor: '#B0BA99',
          fillOpacity: 0.15,
          weight: 2,
        }).addTo(map);
        circleRef.current = circle;

        if (initialLat && initialLng) {
          setTempPos({ lat: initialLat, lng: initialLng });
          reverseGeocode({ lat: initialLat, lng: initialLng });
        }

        const updatePos = (latlng) => {
          marker.setLatLng(latlng);
          circle.setLatLng(latlng);
          setTempPos({ lat: latlng.lat, lng: latlng.lng });
          reverseGeocode(latlng);
        };

        marker.on('dragend', () => updatePos(marker.getLatLng()));
        map.on('click', (e) => updatePos(e.latlng));
      }, 100);
    }
    return () => {
      if (!isOpen && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, [isOpen]);

  // Keep circle radius in sync with slider
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius * 1000);
    }
  }, [radius]);

  const reverseGeocode = async (pos) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${pos.lat}&lon=${pos.lng}&format=json`
      );
      const json = await res.json();
      const a = json.address || {};
      setAddress(a.city || a.town || a.village || a.county || json.display_name?.split(',')[0] || '');
    } catch (_) {
      setAddress('');
    }
  };

  const handleConfirm = () => {
    if (tempPos) onConfirm({ lat: tempPos.lat, lng: tempPos.lng, radius, address });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('radius_map_title')}>
      <div className="space-y-4">
        <p className="text-sm text-warm-500 leading-relaxed">{t('radius_map_sub')}</p>

        <div
          id="radius-map-container"
          className="w-full rounded-xl border border-warm-200 overflow-hidden z-0"
          style={{ height: '240px' }}
        />

        <div>
          <label className="block text-sm font-semibold text-warm-600 mb-2">
            {t('radius_label')}: <span className="text-brand-700">
              {radius < 1 ? '500 מ\'' : `${radius} ${t('km_unit')}`}
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="100"
            step="0.5"
            value={radius}
            onChange={(e) => setRadius(parseFloat(e.target.value))}
            className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
          <div className="flex justify-between text-[11px] text-warm-400 mt-1">
            <span>500 מ'</span>
            <span>100 {t('km_unit')}</span>
          </div>
        </div>

        {address && (
          <div className="bg-brand-50 border border-brand-100 p-3 rounded-xl">
            <p className="text-xs text-brand-700 font-medium">📍 {address}</p>
          </div>
        )}

        <Btn onClick={handleConfirm} disabled={!tempPos}>
          {t('radius_confirm')}
        </Btn>
      </div>
    </Modal>
  );
}

function Card({ children, className = '', onClick }) {
  const isClickable = !!onClick;
  return (
    <div 
      onClick={onClick}
      className={clsx(
        "bg-white rounded-2xl border border-warm-200 shadow-sm overflow-hidden",
        isClickable && "cursor-pointer transition-all duration-200 hover:border-brand-300 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

function Tag({ label, selected, onClick, className = '' }) {
  const isClickable = !!onClick;
  return (
    <span 
      onClick={onClick}
      className={clsx(
        "inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-200",
        isClickable && "cursor-pointer active:scale-95",
        selected 
          ? "bg-brand-50 border-brand-200 text-brand-700 shadow-sm" 
          : "bg-white border-warm-200 text-gray-600 hover:bg-warm-50 hover:border-warm-300",
        className
      )}
    >
      {label}
    </span>
  );
}

function BackBtn({ onClick }) {
  const { lang } = useLang();
  const isHeb = lang === 'he';
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-warm-200 text-gray-600 hover:bg-warm-50 hover:text-brand-600 transition-colors shadow-sm mb-6 active:scale-95"
      aria-label="Back"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256"
        style={isHeb ? {} : { transform: 'scaleX(-1)' }}>
        <path d="M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H48A16,16,0,0,0,32,88v80a16,16,0,0,0,16,16h80v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H48V88h88a8,8,0,0,0,8-8V51.31L220.69,128Z"/>
      </svg>
    </button>
  );
}

function CheckRow({ label, sub, checked, onChange, children }) {
  const displayLabel = label || children;
  return (
    <label className="flex items-start gap-3 p-4 rounded-xl border border-warm-200 bg-white hover:bg-brand-50/30 hover:border-brand-200 transition-colors cursor-pointer group">
      <div className="flex-shrink-0 pt-0.5">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
          className="w-5 h-5 rounded border-warm-300 text-brand-600 focus:ring-brand-500 focus:ring-2 transition-all cursor-pointer"
        />
      </div>
      <div className="flex-col">
        <span className="block text-sm font-semibold text-gray-800 group-hover:text-brand-800">{displayLabel}</span>
        {sub && <span className="block text-xs text-warm-500 mt-1">{sub}</span>}
      </div>
    </label>
  );
}

function RadioGroup({ options, value, onChange, vertical = true, label }) {
  return (
    <div>
      {label && <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>}
      <div className={clsx('flex gap-3', vertical ? 'flex-col' : 'flex-row flex-wrap')}>
        {options.map(opt => {
          // Support both 'id' and 'value' in option objects for backwards compat
          const optId = opt.id ?? opt.value;
          const isSel = value === optId;
          return (
            <label 
              key={optId} 
              className={clsx(
                'relative flex items-start p-4 rounded-xl border cursor-pointer transition-all duration-200',
                vertical ? 'w-full' : 'flex-1 min-w-[140px]',
                isSel 
                  ? 'bg-brand-50 border-brand-300 shadow-sm' 
                  : 'bg-white border-warm-200 hover:border-brand-200 hover:bg-warm-50'
              )}
            >
              <div className="flex-shrink-0 pt-0.5 mr-3 ml-3">
                <div className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  isSel ? 'border-brand-600' : 'border-warm-300'
                )}>
                  {isSel && <div className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pop-in" />}
                </div>
              </div>
              <div className="flex flex-col">
                <span className={clsx('block text-sm font-semibold', isSel ? 'text-brand-900' : 'text-gray-800')}>
                  {opt.label}
                </span>
                {opt.sub && (
                  <span className={clsx('block text-xs mt-1 leading-relaxed', isSel ? 'text-brand-700' : 'text-warm-500')}>
                    {opt.sub}
                  </span>
                )}
              </div>
              <input 
                type="radio" 
                name={`radiogroup-${label || 'default'}`} 
                className="sr-only" 
                checked={isSel} 
                onChange={() => onChange(optId)} 
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}

function MultiCheck({ options, values, onChange, label }) {
  const toggle = (id) => {
    // Support both 'id' and 'value' in option objects
    const key = id;
    if (values.includes(key)) onChange(values.filter(x => x !== key));
    else onChange([...values, key]);
  };
  return (
    <div>
      {label && <p className="text-sm font-semibold text-gray-800 mb-3">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(opt => {
          const optId = opt.id ?? opt.value;
          const isSel = values.includes(optId);
          return (
            <label 
              key={optId}
              className={clsx(
                'cursor-pointer select-none px-4 py-2.5 rounded-xl border transition-all duration-200 active:scale-95 flex flex-col items-center justify-center text-center flex-1 min-w-[120px]',
                isSel
                  ? 'bg-brand-50 border-brand-400 shadow-sm'
                  : 'bg-white border-warm-200 hover:border-brand-200 hover:bg-warm-50'
              )}
            >
              <input 
                type="checkbox" 
                className="sr-only" 
                checked={isSel} 
                onChange={() => toggle(optId)} 
              />
              <span className={clsx('block text-sm font-semibold', isSel ? 'text-brand-900' : 'text-gray-700')}>
                {opt.label}
              </span>
              {opt.sub && (
                <span className={clsx('block text-[11px] mt-0.5 leading-tight', isSel ? 'text-brand-700' : 'text-warm-500')}>
                  {opt.sub}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}

function SectionTitle({ title, sub }) {
  return (
    <div className="mb-6">
      <h2 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight mb-1">{title}</h2>
      {sub && <p className="text-sm text-warm-500 leading-relaxed">{sub}</p>}
    </div>
  );
}

function AppHeader({ title, eyebrow, onBack, onProfile, profileAction, actions, onLogout, onInfo }) {
  const { lang, setLang, t } = useLang();
  return (
    <>
      <div className="sticky top-0 z-20 w-full shadow-sm" style={{ backgroundColor: 'var(--brand-500)' }}>
        <div dir="ltr" className="relative w-full px-2 py-1 flex items-center" style={{ minHeight: '72px' }}>

          {/* Left — Language toggle + info + profile / extra actions */}
          <div className="relative flex items-center gap-1 z-10 flex-shrink-0">
            <button
              onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xs font-bold transition-all hover:bg-warm-100 active:scale-95 flex-shrink-0"
              style={{ color: 'var(--warm-600)' }}
              aria-label={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
            >
              {lang === 'he' ? 'EN' : 'עב'}
            </button>
            {onInfo && (
              <button
                onClick={onInfo}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center transition-all hover:bg-warm-100 active:scale-95 flex-shrink-0"
                style={{ color: 'var(--warm-600)' }}
                aria-label={t('info_btn_title')}
                title={t('info_btn_title')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </button>
            )}
            {profileAction || (onProfile && (
              <button
                onClick={onProfile}
                className="app-icon-btn"
                aria-label={lang === 'he' ? 'פרופיל' : 'Profile'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
                </svg>
              </button>
            ))}
            {actions}
          </div>

          {/* Logo — absolutely centred so it never gets displaced by side buttons */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <img src="MEMULAIM.png" alt="מימולאים" className="h-16 w-auto object-contain drop-shadow-md pointer-events-none" />
          </div>

          <div className="relative flex items-center gap-2 min-w-0 justify-end pr-1 ml-auto z-10">
            <div className="min-w-0 text-right" dir={lang === 'he' ? 'rtl' : 'ltr'}>
              {eyebrow && (
                <p className="text-xs font-semibold truncate leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="text-base font-bold tracking-tight truncate leading-tight" style={{ color: '#fff' }}>
                  {title}
                </h1>
              )}
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="app-icon-btn flex-shrink-0"
                aria-label={lang === 'he' ? 'חזור' : 'Back'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256"
                  style={lang === 'he' ? {} : { transform: 'scaleX(-1)' }}>
                  <path d="M237.66,122.34l-96-96A8,8,0,0,0,128,32V72H48A16,16,0,0,0,32,88v80a16,16,0,0,0,16,16h80v40a8,8,0,0,0,13.66,5.66l96-96A8,8,0,0,0,237.66,122.34ZM144,204.69V176a8,8,0,0,0-8-8H48V88h88a8,8,0,0,0,8-8V51.31L220.69,128Z"/>
                </svg>
              </button>
            )}
          </div>

        </div>
      </div>

      {onLogout && (
        <button
          onClick={onLogout}
          className="fixed bottom-6 right-6 z-40 flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:px-4 md:py-2.5 rounded-full bg-white text-red-600 shadow-lg border border-red-100 transition-all hover:bg-red-50 hover:text-red-700 active:scale-95 hover:scale-105"
          style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}
          aria-label={t('logout')}
          title={t('logout')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span className="hidden md:inline text-sm font-semibold tracking-wide">{t('logout')}</span>
        </button>
      )}
    </>
  );
}

function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className={`relative w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up ${className || ''}`}>
        <div className="px-5 py-4 border-b border-warm-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-warm-50 text-gray-500 hover:bg-warm-100 hover:text-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

function ScreenLayout({ children, onBack, onNext, nextLabel, title, sub, icon, step, totalSteps, total, onInfo }) {
  const { lang } = useLang();
  // Accept both 'totalSteps' and 'total' for backward compat
  const steps = totalSteps || total;
  return (
    <div className="min-h-screen bg-warm-50 flex flex-col screen-enter">
      <AppHeader onBack={onBack} onInfo={onInfo} />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-md bg-white flex flex-col relative">
          <div className="flex-1 px-6 pt-6 pb-32">
            {(step && steps) && <ProgressBar step={step} total={steps} />}

            <div className="mb-8">
              {icon && typeof icon === 'string' && <div className="text-4xl mb-4 animate-fade-in">{icon}</div>}
              {title && <h1 className="text-[28px] font-bold text-gray-900 leading-tight mb-2 tracking-tight">{title}</h1>}
              {sub && <p className="text-[15px] text-warm-500 leading-relaxed">{sub}</p>}
            </div>

            <div className="animate-fade-in delay-100">
              {children}
            </div>
          </div>

          {onNext && (
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent pointer-events-none z-10 flex justify-center">
              <div className="w-full max-w-md pointer-events-auto">
                <Btn onClick={onNext} className="shadow-lg shadow-brand-500/20">
                  {nextLabel || (lang === 'he' ? 'המשך' : 'Continue')}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* PreferencesPromptModal — Shown after page 1 of registration and before the first request / hosting */
function PreferencesPromptModal({ isOpen, context, onNow, onLater }) {
  const { t, lang } = useLang();
  if (!isOpen) return null;

  // Blocking contexts prevent the action until preferences are filled
  const isBlocking = context === 'first_request' || context === 'host_first_hosting';

  const sub =
    context === 'host_first_hosting' ? t('pref_prompt_host_sub') :
    context === 'first_request'      ? t('pref_prompt_first_req_sub') :
    t('pref_prompt_sub');

  const warning =
    context === 'first_request' ?
      (lang === 'he' ? '⚠️ לא ניתן לשלוח בקשה ללא מילוי השאלון'
                     : '⚠️ You cannot submit a request without filling this in') :
    context === 'host_first_hosting' ?
      (lang === 'he' ? '⚠️ לא ניתן לפתוח אירוח ללא מילוי השאלון'
                     : '⚠️ You cannot create a hosting without filling this in') :
    null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">{t('pref_prompt_title')}</h2>
            <p className="text-sm text-warm-500 leading-relaxed">{sub}</p>
          </div>
          <div className="space-y-3">
            <Btn onClick={onNow}>{t('pref_prompt_now')}</Btn>
            <Btn variant="secondary" onClick={onLater}>
              {isBlocking ? t('pref_prompt_decline') : t('pref_prompt_later')}
            </Btn>
          </div>
          {warning ? (
            <p className="text-xs text-center text-red-400 font-medium mt-4">{warning}</p>
          ) : (
            <p className="text-xs text-center text-warm-400 mt-4">{t('pref_prompt_later_hint')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

window.ProgressBar = ProgressBar;
window.Btn = Btn;
window.Input = Input;
window.Card = Card;
window.Tag = Tag;
window.BackBtn = BackBtn;
window.CheckRow = CheckRow;
window.RadioGroup = RadioGroup;
window.MultiCheck = MultiCheck;
window.SectionTitle = SectionTitle;
window.AppHeader = AppHeader;
window.Modal = Modal;
window.ScreenLayout = ScreenLayout;
window.LocationInput = LocationInput;
window.MapPinModal = MapPinModal;
window.FridayDatePicker = FridayDatePicker;
window.RadiusMapModal = RadiusMapModal;
window.PreferencesPromptModal = PreferencesPromptModal;
