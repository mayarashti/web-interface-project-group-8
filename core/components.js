/* components.js — Shared UI components */

var { useState, useEffect, useRef } = React;

// Clean line-art SVG icons in the style of CutleryIcon
const HomeIcon = () => (
  <div className="w-16 h-16 rounded-full bg-[#fbf8f5] border border-[#e6dacf] flex items-center justify-center mx-auto mb-4 shadow-sm animate-fade-in">
    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#a39081" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  </div>
);

const SummaryIcon = () => (
  <div className="w-16 h-16 rounded-full bg-[#fbf8f5] border border-[#e6dacf] flex items-center justify-center mx-auto mb-4 shadow-sm animate-fade-in">
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#a39081" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" />
      <path d="M7 8H17" />
      <path d="M7 12H17" />
      <path d="M7 16H13" />
    </svg>
  </div>
);

const ClipboardIcon = () => (
  <div className="w-16 h-16 rounded-full bg-[#fbf8f5] border border-[#e6dacf] flex items-center justify-center mx-auto mb-4 shadow-sm animate-fade-in">
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#a39081" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  </div>
);

const CameraIcon = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const BellIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const ShabbatIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="20" x2="9" y2="10" />
    <path d="M9 10c-1-2 0-4 0-4s1 2 0 4" />
    <line x1="15" y1="20" x2="15" y2="10" />
    <path d="M15 10c-1-2 0-4 0-4s1 2 0 4" />
    <path d="M6 20h12" />
  </svg>
);

const StarOfDavidIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 19 15 5 15" />
    <polygon points="12 22 19 9 5 9" />
  </svg>
);

const PawIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 14c-2 0-3.5 1-3.5 2.5S10 19 12 19s3.5-1 3.5-2.5S14 14 12 14z" />
    <circle cx="7" cy="10" r="1.5" />
    <circle cx="10" cy="7" r="1.5" />
    <circle cx="14" cy="7" r="1.5" />
    <circle cx="17" cy="10" r="1.5" />
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const SuccessIcon = () => (
  <svg className="w-12 h-12 text-green-600 animate-scale-in" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
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

function Btn({ children, onClick, variant = 'primary', className = '', type = 'button', disabled = false, loading = false }) {
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
      disabled={disabled || loading}
      className={clsx(base, variants[variant], className)}
    >
      {loading && (
        <svg className="animate-spin -ms-1 me-2 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
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

/* TimeSelect — dropdown of half-hour time slots (evening by default, with a
   toggle to reveal morning/afternoon slots too). Keeps the soldier and family
   time fields aligned on the same half-hour grid so exact matches are common. */
function buildHalfHourSlots(startHour, endHour) {
  const slots = [];
  for (let h = startHour; h <= endHour; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`);
    slots.push(`${String(h).padStart(2, '0')}:30`);
  }
  return slots;
}
const TIME_SLOTS_EVENING = buildHalfHourSlots(16, 23);
const TIME_SLOTS_MORNING = buildHalfHourSlots(8, 15);

function TimeSelect({ label, value, onChange, error, required = false, hint }) {
  const { t } = useLang();
  const [showEarlier, setShowEarlier] = useState(TIME_SLOTS_MORNING.includes(value));
  const slots = showEarlier ? [...TIME_SLOTS_MORNING, ...TIME_SLOTS_EVENING] : TIME_SLOTS_EVENING;

  return (
    <div className="w-full mb-5">
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex flex-wrap justify-between items-baseline gap-1">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {hint && <span className="text-xs font-normal text-warm-500">{hint}</span>}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={clsx(
          "w-full min-h-[48px] py-3 px-4 rounded-xl border bg-white text-[15px] transition-all duration-200 focus:outline-none focus:ring-4",
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30"
            : "border-warm-200 focus:border-brand-400 focus:ring-brand-50 hover:border-warm-300"
        )}
      >
        <option value="" disabled>{t('time_select_ph')}</option>
        {slots.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      {!showEarlier && (
        <button
          type="button"
          onClick={() => setShowEarlier(true)}
          className="mt-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 transition-colors"
        >
          {t('time_show_earlier')}
        </button>
      )}
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
            <p className="text-xs text-brand-700 font-medium flex items-center gap-1.5">
              <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{address}</span>
            </p>
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

function AppHeader({ title, eyebrow, onBack, onProfile, profileAction, actions, onLogout, onInfo, onNotifications, notificationsCount = 0, onFavorites }) {
  const { lang, setLang, t } = useLang();
  return (
    <>
      <div className="app-header-outer sticky top-0 z-20 w-full shadow-sm" style={{ backgroundColor: 'var(--brand-500)' }}>
        <div dir="ltr" className="relative w-full px-2 py-1 flex items-center" style={{ minHeight: '72px' }}>

          {/* Left — Info + profile / extra actions */}
          <div className="relative flex items-center gap-3 z-10 flex-shrink-0">
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
            {onNotifications && (
              <button
                onClick={onNotifications}
                className="app-icon-btn relative"
                aria-label={lang === 'he' ? 'התראות' : 'Notifications'}
                title={lang === 'he' ? 'התראות' : 'Notifications'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {notificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {notificationsCount > 9 ? '9+' : notificationsCount}
                  </span>
                )}
              </button>
            )}
            {onFavorites && (
              <button
                onClick={onFavorites}
                className="app-icon-btn"
                aria-label={t('fav_btn_title')}
                title={t('fav_btn_title')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
            )}
            {actions}
          </div>

          {/* Logo — absolutely centred so it never gets displaced by side buttons */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12">
            <img src="MEMULAIM.png" alt="מימולאים" className="h-14 md:h-18 w-auto object-contain drop-shadow-md pointer-events-none" />
          </div>

          <div className="relative flex items-center gap-2 min-w-0 justify-end pr-1 ml-auto z-10">
            <div className="min-w-0 text-right" dir={lang === 'he' ? 'rtl' : 'ltr'}>
              {!onBack && eyebrow && (
                <p className="text-[10px] md:text-xs font-semibold truncate leading-none mb-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  {eyebrow}
                </p>
              )}
              {!onBack && title && (
                <h1 className="text-base md:text-lg font-bold tracking-tight truncate leading-tight" style={{ color: '#fff' }}>
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

      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3 items-end" style={{ direction: 'ltr' }}>
        <button
          onClick={() => setLang(lang === 'he' ? 'en' : 'he')}
          className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sm font-bold shadow-lg border border-warm-200 transition-all hover:bg-warm-50 active:scale-95 hover:scale-105 flex-shrink-0"
          style={{ color: 'var(--warm-600)' }}
          aria-label={lang === 'he' ? 'Switch to English' : 'עבור לעברית'}
        >
          {lang === 'he' ? 'EN' : 'עב'}
        </button>

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-2 w-12 h-12 md:w-auto md:px-4 md:py-2.5 rounded-full bg-white text-red-600 shadow-lg border border-red-100 transition-all hover:bg-red-50 hover:text-red-700 active:scale-95 hover:scale-105"
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
      </div>
    </>
  );
}

function Modal({ isOpen, onClose, title, children, className }) {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] transition-opacity"
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
    </div>,
    document.body
  );
}

function ScreenLayout({ children, onBack, onNext, nextLabel, title, sub, icon, step, totalSteps, total, onInfo, isNextLoading }) {
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
              {icon && (
                <div className="mb-4 animate-fade-in">
                  {typeof icon === 'string' ? (
                    <div className="text-4xl">{icon}</div>
                  ) : (
                    icon
                  )}
                </div>
              )}
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
                <Btn onClick={onNext} loading={isNextLoading} className="shadow-lg shadow-brand-500/20">
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
      (lang === 'he' ? 'לא ניתן לשלוח בקשה ללא מילוי השאלון'
                     : 'You cannot submit a request without filling this in') :
    context === 'host_first_hosting' ?
      (lang === 'he' ? 'לא ניתן לפתוח אירוח ללא מילוי השאלון'
                     : 'You cannot create a hosting without filling this in') :
    null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-fade-in"
      style={{ zIndex: 9999 }}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            <ClipboardIcon />
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
            <p className="text-xs text-center text-red-500 font-medium mt-4 flex items-center justify-center gap-1">
              <AlertTriangleIcon className="w-4 h-4 flex-shrink-0" />
              <span>{warning}</span>
            </p>
          ) : (
            <p className="text-xs text-center text-warm-400 mt-4">{t('pref_prompt_later_hint')}</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ConfirmDialog — generic yes/no prompt. Replaces the native confirm() for
   destructive actions. Same portal + z-index pattern as PreferencesPromptModal. */
function ConfirmDialog({ isOpen, title, message, confirmLabel, cancelLabel, onConfirm, onCancel, danger = false, icon }) {
  const { t, lang } = useLang();
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-[2px] animate-fade-in"
      style={{ zIndex: 9999 }}
      dir={lang === 'he' ? 'rtl' : 'ltr'}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="text-center mb-6">
            {icon && <div className="mb-3 flex justify-center">{icon}</div>}
            <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
            {message && <p className="text-sm text-warm-500 leading-relaxed">{message}</p>}
          </div>
          <div className="space-y-3">
            <Btn variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmLabel || t('fav_yes')}
            </Btn>
            <Btn variant="secondary" onClick={onCancel}>
              {cancelLabel || t('fav_no')}
            </Btn>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* A favorites offer for a hosting whose date has passed is dead. archivePastEvents
   deletes them once a day; this hides them the moment the date rolls over, so the
   soldier is never invited to a meal that already happened. Only
   favorite_hosting_open notifications carry payload.hosting_date. */
function visibleNotifications(notifications = []) {
  const today = new Date().toISOString().split('T')[0];
  return notifications.filter(n => !(n.payload?.hosting_date && n.payload.hosting_date < today));
}

function NotificationsPanel({ isOpen, onClose, notifications: allNotifications = [], onMarkAllRead, onMarkRead, onNotificationClick, uid, telegramConnected }) {
  const { lang } = useLang();
  const isRtl = lang === 'he';
  if (!isOpen) return null;
  const notifications = visibleNotifications(allNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 z-40" dir={isRtl ? 'rtl' : 'ltr'} onClick={onClose}>
      {/* invisible backdrop — click anywhere to close */}

      {/* The floating panel itself */}
      <div
        className="absolute bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{
          top: '80px',
          left: '8px',
          width: 'min(340px, calc(100vw - 16px))',
          maxHeight: '480px',
          border: '1px solid #e8e0d8',
          animation: 'notif-drop 0.18s cubic-bezier(0.16,1,0.3,1) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Small caret pointing up toward the bell icon */}
        <div style={{
          position: 'absolute',
          top: '-7px',
          left: '22px',
          width: '14px',
          height: '7px',
          overflow: 'visible',
        }}>
          <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
            <path d="M0 7 L7 0 L14 7" fill="white" stroke="#e8e0d8" strokeWidth="1" strokeLinejoin="round"/>
            <path d="M1 7 L7 1 L13 7" fill="white" stroke="white" strokeWidth="1"/>
          </svg>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-warm-100 flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">
            {isRtl ? 'התראות' : 'Notifications'}
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold ms-2">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </h3>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && onMarkAllRead && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-brand-600 hover:text-brand-800 font-semibold transition-colors"
              >
                {isRtl ? 'סמן הכל כנקרא' : 'Mark all read'}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors text-sm font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Notification list */}
        <div className="overflow-y-auto overscroll-contain flex-1">
          {/* Telegram connect banner */}
          {!telegramConnected && uid && (
            <a
              href={`https://t.me/MemulaimBot?start=${uid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 border-b border-blue-100 bg-blue-50 hover:bg-blue-100 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#229ED9' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800 leading-snug">
                  {isRtl ? 'חבר את הטלגרם שלך' : 'Connect your Telegram'}
                </p>
                <p className="text-xs text-blue-600 leading-relaxed">
                  {isRtl ? 'לחץ לקבלת התראות ישירות לנייד' : 'Tap to get notifications on your phone'}
                </p>
              </div>
              <svg className="flex-shrink-0 text-blue-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </a>
          )}

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center space-y-3 px-6">
              <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center text-warm-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
              </div>
              <p className="text-warm-500 text-sm">{isRtl ? 'אין התראות חדשות' : 'No notifications yet'}</p>
            </div>
          ) : (
            notifications.map((n, i) => {
              const isEmergency = n.type === 'emergency_host';
              // A favorites offer the soldier already acted on is a statement,
              // not a question — it must not reopen the join modal.
              const isActionable = !n.resolved && onNotificationClick &&
                (isEmergency || (n.payload && (n.payload.request_id || n.payload.hosting_id || n.payload.family_id)));
              return (
                <div
                  key={n.id || i}
                  className={clsx(
                    'px-4 py-3 border-b transition-colors',
                    isEmergency ? 'bg-red-50 border-red-100 hover:bg-red-100' : 'border-warm-50',
                    isActionable ? 'cursor-pointer' : 'cursor-default',
                    !isEmergency && (n.read ? 'bg-white hover:bg-warm-50' : 'bg-brand-50/60 hover:bg-brand-50')
                  )}
                  onClick={() => {
                    if (!n.read && onMarkRead) onMarkRead(n.id);
                    if (isActionable) { onNotificationClick(n); onClose(); }
                  }}
                >
                  <div className="flex items-start gap-2.5">
                    {/* unread dot */}
                    <div className={clsx(
                      'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                      n.read ? 'bg-transparent' : (isEmergency ? 'bg-red-500' : 'bg-brand-500')
                    )} />
                    <div className="min-w-0 flex-1">
                      {n.title && (
                        <p className={clsx('text-sm leading-snug mb-0.5', isEmergency ? 'font-bold text-red-700' : (n.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'))}>
                          {n.title}
                        </p>
                      )}
                      <p className="text-xs text-warm-500 leading-relaxed">{n.content || n.message}</p>
                      <p className="text-[11px] text-warm-400 mt-1">{n.time}</p>
                      
                      {isEmergency && (
                        <div className="mt-2">
                          <button 
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!n.read && onMarkRead) onMarkRead(n.id);
                              if (onNotificationClick) { onNotificationClick(n); onClose(); }
                            }}
                          >
                            {lang === 'he' ? 'הזמן אותו' : 'Host him'}
                          </button>
                        </div>
                      )}
                    </div>
                    {isActionable && !isEmergency && (
                      <svg className="flex-shrink-0 mt-0.5 text-brand-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes notif-drop {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>
    </div>
  );
}

/* GuestProfileCard — the soldier's profile exactly as families see it.
   Shared by the soldier registration summary (live preview) and the
   host dashboard's registered-soldiers list, so both render identically. */
function GuestProfileCard({ guest, lang }) {
  const koshLabels = {
    mehadrin:  lang === 'he' ? 'מהדרין' : 'Mehadrin',
    separated: lang === 'he' ? 'כשר' : 'Kosher',
  };
  const koshLabel = koshLabels[guest.kosher] || (lang === 'he' ? 'רגיל' : 'Regular');

  const allergyLabels = {
    gluten:  lang === 'he' ? 'ללא גלוטן' : 'Gluten Free',
    lactose: lang === 'he' ? 'ללא לקטוז' : 'Lactose Free',
    nuts:    lang === 'he' ? 'ללא אגוזים' : 'Nut Free',
    peanuts: lang === 'he' ? 'ללא בוטנים' : 'Peanut Free',
    veg:     lang === 'he' ? 'צמחוני' : 'Vegetarian',
    vegan:   lang === 'he' ? 'טבעוני' : 'Vegan',
    fish:    lang === 'he' ? 'ללא דגים' : 'Fish Free',
    other:   lang === 'he' ? 'אלרגיה' : 'Allergy',
  };
  const afterMealLabels = {
    board: lang === 'he' ? 'משחק קופסא' : 'Board games',
    talk:  lang === 'he' ? 'שיחה ארוכה סביב השולחן' : 'A long chat around the table',
    tv:    lang === 'he' ? 'סדרה מול הטלוויזיה' : 'Watching a show',
  };
  const offDutyLabels = {
    regular: lang === 'he' ? 'חייל בסדיר' : 'Regular service soldier',
    student: lang === 'he' ? 'סטודנט' : 'Student',
    worker:  lang === 'he' ? 'עובד' : 'Employed',
    between: lang === 'he' ? 'עדיין בין לבין' : 'Still figuring it out',
  };
  const aboutLines = [
    guest.qOrigin          && { icon: '🌍', label: lang === 'he' ? 'מאיפה במקור' : 'Originally from', value: guest.qOrigin },
    (Array.isArray(guest.qOffDuty) ? guest.qOffDuty : []).length > 0 && {
      icon: '🎒',
      label: lang === 'he' ? 'כשלא במילואים' : 'When not on duty',
      value: guest.qOffDuty.map(v => offDutyLabels[v] || v).join(', '),
    },
    guest.qFridayTradition && { icon: '🕯️', label: lang === 'he' ? 'מסורת שישי' : 'Friday tradition', value: guest.qFridayTradition },
    guest.qFavoriteDish    && { icon: '🍲', label: lang === 'he' ? 'מנה אהובה על השולחן' : 'Favorite dish', value: guest.qFavoriteDish },
    guest.qDislikedFood    && { icon: '🚫', label: lang === 'he' ? 'ממש לא אוהב לאכול' : "Really doesn't like", value: guest.qDislikedFood },
    (guest.qAfterMeal || []).length > 0 && {
      icon: '🎲',
      label: lang === 'he' ? 'הכי כיף אחרי הארוחה' : 'Favorite after the meal',
      value: guest.qAfterMeal.map(v => v === 'other' ? (guest.qAfterMealOther || (lang === 'he' ? 'אחר' : 'Other')) : (afterMealLabels[v] || v)).join(', '),
    },
    guest.qMoreInfo        && { icon: '📝', label: lang === 'he' ? 'עוד משהו לספר' : 'Anything else', value: guest.qMoreInfo },
  ].filter(Boolean);

  const groupSize = guest.groupSize || 1;
  const groupLabel = groupSize > 1
    ? (lang === 'he' ? `קבוצה של ${groupSize}` : `Group of ${groupSize}`)
    : (lang === 'he' ? 'יחיד' : 'Solo');

  const subLine = [
    guest.unit ? `${lang === 'he' ? 'יחידה' : 'Unit'} ${guest.unit}` : null,
    guest.age  ? `${guest.age} ${lang === 'he' ? 'שנים' : 'y/o'}` : null,
  ].filter(Boolean).join(' · ') || (lang === 'he' ? 'חייל משרת' : 'Serving Soldier');

  return (
    <React.Fragment>
      <div className="flex items-start gap-3.5 pb-4 mb-4 border-b border-warm-100">
        <div
          className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base font-bold shadow-inner overflow-hidden"
          style={{ background: guest.photoUrl ? undefined : (guest.avatarColor || '#B0BA99') }}
        >
          {guest.photoUrl ? (
            <img src={guest.photoUrl} alt={guest.name} className="w-full h-full object-cover" />
          ) : (
            (guest.name || '?')[0]
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-baseline gap-2">
            <h4 className="font-bold text-gray-800 text-sm truncate">{guest.name || (lang === 'he' ? 'שם מלא' : 'Full Name')}</h4>
            {guest.joinDateText && (
              <span className="text-[10px] text-warm-400 flex-shrink-0">
                {lang === 'he' ? 'נרשם ב-' : 'Joined '} {guest.joinDateText}
              </span>
            )}
          </div>
          <p className="text-xs text-warm-500 mt-0.5">{subLine}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
              <span>{groupLabel}</span>
            </span>
            {(guest.logisticsItems || []).map(item => (
              <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md border border-brand-100">
                <span>{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100">
          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'רמת כשרות' : 'Kosher Level'}</span>
          <span className="font-bold text-gray-800">🍽️ {koshLabel}</span>
        </div>
        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100">
          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'אלרגיות ומגבלות' : 'Allergies'}</span>
          {(guest.allergies || []).length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {guest.allergies.map(a => (
                <span key={a} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-lg">
                  {allergyLabels[a] || a}
                </span>
              ))}
            </div>
          ) : (
            <span className="font-medium text-gray-500">🍴 {lang === 'he' ? 'אין הגבלות' : 'None'}</span>
          )}
        </div>
      </div>

      {aboutLines.length > 0 ? (
        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl mt-3 space-y-1.5">
          {aboutLines.map((l, i) => (
            <p key={i} className="text-xs text-warm-600 leading-relaxed">
              <span className="me-1">{l.icon}</span>
              <span className="font-bold text-warm-700">{l.label}: </span>
              <span>{l.value}</span>
            </p>
          ))}
        </div>
      ) : guest.bio ? (
        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl italic text-warm-600 mt-3 leading-relaxed">
          "{guest.bio}"
        </div>
      ) : null}
    </React.Fragment>
  );
}

/* HostProfileCard — the host family's profile exactly as soldiers see it.
   Mirrors GuestProfileCard's design language for a consistent, warm card. */
function HostProfileCard({ host, lang }) {
  const [showViewer, setShowViewer] = useState(false);

  const koshLabels = {
    mehadrin:  lang === 'he' ? 'מהדרין' : 'Mehadrin',
    separated: lang === 'he' ? 'כשר' : 'Kosher',
  };
  const koshLabel = koshLabels[host.kosher] || (lang === 'he' ? 'רגיל' : 'Regular');

  const shabLabels = {
    keeps:       lang === 'he' ? 'שומרי שבת' : 'Shabbat Observant',
    traditional: lang === 'he' ? 'מסורתי' : 'Traditional',
  };
  const shabLabel = shabLabels[host.shabbat] || (lang === 'he' ? 'חילוני' : 'Secular');

  const afterMealLabels = {
    board: lang === 'he' ? 'משחק קופסא' : 'Board games',
    talk:  lang === 'he' ? 'שיחה ארוכה סביב השולחן' : 'A long chat around the table',
    tv:    lang === 'he' ? 'סדרה מול הטלוויזיה' : 'Watching a show',
  };

  const kidsAgeLabel = host.kidsAgeRange === 'other'
    ? (host.kidsAgeRangeOther || (lang === 'he' ? 'אחר' : 'Other'))
    : host.kidsAgeRange;

  const aboutLines = [
    host.numKids          && { icon: '👨‍👩‍👧', label: lang === 'he' ? 'כמה ילדים בבית' : 'Kids at home', value: host.numKids },
    kidsAgeLabel           && { icon: '🧒', label: lang === 'he' ? 'טווח גילאים' : 'Age range', value: kidsAgeLabel },
    host.fridayDish       && { icon: '🍽️', label: lang === 'he' ? 'מאכל קבוע בשישי' : 'Regular Friday dish', value: host.fridayDish },
    (host.afterMeal || []).length > 0 && {
      icon: '🎲',
      label: lang === 'he' ? 'אוהבים לעשות אחרי הארוחה' : 'Love doing after the meal',
      value: host.afterMeal.map(v => v === 'other' ? (host.afterMealOther || (lang === 'he' ? 'אחר' : 'Other')) : (afterMealLabels[v] || v)).join(', '),
    },
    host.fridayTradition  && { icon: '🕯️', label: lang === 'he' ? 'מסורת שישי' : 'Friday tradition', value: host.fridayTradition },
    host.moreInfo          && { icon: '📝', label: lang === 'he' ? 'עוד לספר' : 'Anything else', value: host.moreInfo },
  ].filter(Boolean);

  return (
    <React.Fragment>
      <div className="flex items-start gap-3.5 pb-4 mb-4 border-b border-warm-100">
        <div
          className={clsx('host-preview-avatar-ring', host.hasStories && 'story-ring-unseen', host.hasStories && 'cursor-pointer')}
          onClick={host.hasStories ? () => setShowViewer(true) : undefined}
          role={host.hasStories ? 'button' : undefined}
        >
          <div className="host-preview-avatar-ring-gap">
            <div
              className="w-full h-full rounded-full flex items-center justify-center text-white text-base font-bold shadow-inner overflow-hidden"
              style={{ background: host.photoUrl ? undefined : (host.avatarColor || '#B0BA99') }}
            >
              {host.photoUrl ? (
                <img src={host.photoUrl} alt={host.name} className="w-full h-full object-cover" />
              ) : (
                (host.name || '?')[0]
              )}
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-800 text-sm truncate">{host.name || (lang === 'he' ? 'שם המשפחה' : 'Family Name')}</h4>
          <p className="text-xs text-warm-500 mt-0.5">
            {host.city || (lang === 'he' ? 'משפחה מארחת' : 'Host Family')}
          </p>
          {host.hasPets && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
                <span>🐾 {lang === 'he' ? 'יש חיות מחמד' : 'Has pets'}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100">
          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'רמת כשרות' : 'Kosher Level'}</span>
          <span className="font-bold text-gray-800">🍽️ {koshLabel}</span>
        </div>
        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100">
          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'שמירת שבת' : 'Shabbat'}</span>
          <span className="font-bold text-gray-800">🕯️ {shabLabel}</span>
        </div>
      </div>

      {aboutLines.length > 0 ? (
        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl mt-3 space-y-1.5">
          {aboutLines.map((l, i) => (
            <p key={i} className="text-xs text-warm-600 leading-relaxed">
              <span className="me-1">{l.icon}</span>
              <span className="font-bold text-warm-700">{l.label}: </span>
              <span>{l.value}</span>
            </p>
          ))}
        </div>
      ) : host.vibe ? (
        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl italic text-warm-600 mt-3 leading-relaxed">
          "{host.vibe}"
        </div>
      ) : null}

      {showViewer && (
        <StoryViewer
          family={{ id: 'host-preview', name: host.name, stories: host.previewStories || [] }}
          onClose={() => setShowViewer(false)}
          onSeeHostings={() => setShowViewer(false)}
        />
      )}
    </React.Fragment>
  );
}

/* ———————————————————————————————————————————
   Hosting presentation — shared by the soldier's match views and the
   family's own hosting screens. `family_hostings` stores capacity as the
   string field `soldiers`, and occupancy either as a `guests` array (each
   guest carrying a `groupSize`) or as a plain `occupied` counter.
————————————————————————————————————————————— */
function hostingOccupancy(hosting) {
  const capacity = parseInt(hosting?.soldiers) || 0;
  const taken = (hosting?.guests || []).reduce((s, g) => s + (g.groupSize || 1), 0)
    || hosting?.occupied || 0;
  const free = Math.max(capacity - taken, 0);
  return { capacity, taken, free, isFull: capacity > 0 && free === 0 };
}

const HOSTING_ATTENDEE_KEYS = {
  immediate_family: 's20_att_immediate',
  extended_family: 's20_att_extended',
  family_friends: 's20_att_friends',
  more_soldiers: 's20_att_soldiers',
};

/* The details of one hosting offer as icon + label + value rows. Every row is
   skipped when its field is missing, so older hostings (created before
   mealSize/attendees existed) simply render fewer rows. Renders nothing at all
   when there is nothing to say. `include` restricts the rows to a whitelist;
   `exclude` drops rows a nearby element already shows (the sheet puts date and
   time in HostingWhenWhereLines, so it excludes them here). */
function HostingDetailRows({ hosting, title, className = '', include, exclude }) {
  const { t, lang } = useLang();
  if (!hosting) return null;

  const { capacity, taken, free } = hostingOccupancy(hosting);
  const dateLabel = formatHostingDate(hosting.date, lang);
  const timeLabel = formatHostingTimeLabel(hosting, t);
  const attendeeLabels = (hosting.attendees || [])
    .map(id => (HOSTING_ATTENDEE_KEYS[id] ? t(HOSTING_ATTENDEE_KEYS[id]) : id));

  const rows = [
    dateLabel && { id: 'date', icon: '📅', label: t('s20_prev_date'), value: dateLabel },
    /* A dated hosting whose time is still blank says so; an offer with neither
       a date nor a time has nothing worth a row. */
    (timeLabel || dateLabel) && { id: 'time', icon: '🕰️', label: t('s20_prev_time'), value: timeLabel || t('hosting_time_tbd') },
    capacity > 0 && { id: 'capacity', icon: '🪑', label: t('s15_capacity'), value: `${free} ${t('s15_spots_free')} · ${taken} ${t('s15_spots_taken')}` },
    hosting.sleepOvernight && { id: 'sleep', icon: '🛏️', label: t('s12_sleep'), value: t('s15_sleep_available') },
    hosting.pickup && { id: 'pickup', icon: '🚗', label: t('hosting_pickup_row'), value: t('fav_hosting_pickup') },
    hosting.mealSize && { id: 'mealSize', icon: '🍽️', label: t('hosting_meal_size_row'), value: `${hosting.mealSize} ${t('hosting_people_unit')}` },
    attendeeLabels.length > 0 && { id: 'attendees', icon: '👨‍👩‍👧', label: t('hosting_attendees_row'), value: attendeeLabels.join(', ') },
    hosting.note && { id: 'note', icon: '💬', label: t('fav_hosting_note'), value: hosting.note },
  ].filter(Boolean)
    .filter(r => !include || include.includes(r.id))
    .filter(r => !exclude || !exclude.includes(r.id));

  if (rows.length === 0) return null;

  return (
    <div className={`p-3 bg-brand-50/50 border border-brand-100 rounded-xl space-y-1.5 ${className}`}>
      <p className="text-xs font-bold text-brand-700 mb-1">{title || t('fav_hosting_details')}</p>
      {rows.map(r => (
        <p key={r.id} className="text-xs text-warm-600 leading-relaxed">
          <span className="me-1">{r.icon}</span>
          <span className="font-bold text-warm-700">{r.label}: </span>
          <span>{r.value}</span>
        </p>
      ))}
    </div>
  );
}

/* When / where at a glance — two emphasised lines in the same voice as the
   heading above them, one step smaller. Date and time share a line because they
   answer one question; the city gets its own. A line is dropped entirely when it
   has nothing to say, so there is never a stray connector or a lone icon.
   `timePending` distinguishes "no time recorded" from "we could not read the
   offer": only the former promises an update. `ariaLabel` carries the whole
   thing as one sentence for screen readers. */
function HostingWhenWhereLines({ dateLabel, timeLabel, timePending, city, ariaLabel, className = '' }) {
  const { t } = useLang();

  const whenLine = dateLabel
    ? (timeLabel
      ? t(isClockTime(timeLabel) ? 'hosting_when_line' : 'hosting_when_line_slot', dateLabel, timeLabel)
      : timePending ? t('hosting_when_line_tbd', dateLabel)
        : dateLabel)
    : (timeLabel || '');

  const lines = [
    // A time with no date behind it is a clock reading, not a calendar entry.
    whenLine && { id: 'when', icon: dateLabel ? '📅' : '🕰️', text: whenLine },
    city && { id: 'where', icon: '📍', text: city },
  ].filter(Boolean);

  if (lines.length === 0) return null;

  return (
    <div className={`text-start ${className}`} aria-label={ariaLabel} role="group">
      {lines.map(l => (
        <p key={l.id} className="text-sm font-bold tracking-tight text-gray-900">
          <span aria-hidden="true" className="me-1">{l.icon}</span>
          {l.text}
        </p>
      ))}
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
window.NotificationsPanel = NotificationsPanel;
window.visibleNotifications = visibleNotifications;
window.ConfirmDialog = ConfirmDialog;
window.Modal = Modal;
window.ScreenLayout = ScreenLayout;
window.LocationInput = LocationInput;
window.MapPinModal = MapPinModal;
window.FridayDatePicker = FridayDatePicker;
window.RadiusMapModal = RadiusMapModal;
window.GuestProfileCard = GuestProfileCard;
window.HostProfileCard = HostProfileCard;
window.PreferencesPromptModal = PreferencesPromptModal;
window.hostingOccupancy = hostingOccupancy;
window.HostingDetailRows = HostingDetailRows;
window.HostingWhenWhereLines = HostingWhenWhereLines;

window.HomeIcon = HomeIcon;
window.SummaryIcon = SummaryIcon;
window.ClipboardIcon = ClipboardIcon;
window.CameraIcon = CameraIcon;
window.BellIcon = BellIcon;
window.AlertTriangleIcon = AlertTriangleIcon;
window.ShabbatIcon = ShabbatIcon;
window.StarOfDavidIcon = StarOfDavidIcon;
window.PawIcon = PawIcon;
window.MapPinIcon = MapPinIcon;
window.SuccessIcon = SuccessIcon;
