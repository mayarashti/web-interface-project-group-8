/* components.js — Shared UI components */

var { useState, useEffect, useRef } = React;
window.clsx = (...args) => args.filter(Boolean).join(' ');
const clsx = window.clsx;

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

function Input({ label, value, onChange, placeholder, type = 'text', hint, error, required = false, className = '' }) {
  return (
    <div className={clsx("w-full mb-5", className)}>
      {label && (
        <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex flex-wrap justify-between items-baseline gap-1">
          <span>{label} {required && <span className="text-red-500">*</span>}</span>
          {hint && <span className="text-xs font-normal text-warm-500">{hint}</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className={clsx(
          "w-full min-h-[48px] px-4 py-3 rounded-xl border bg-white text-[15px] transition-all duration-200 placeholder:text-warm-400 focus:outline-none focus:ring-4",
          error 
            ? "border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/30" 
            : "border-warm-200 focus:border-brand-400 focus:ring-brand-50 hover:border-warm-300"
        )}
      />
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
          radius: initRadius * 1000,
          color: '#6B8F71',
          fillColor: '#6B8F71',
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
      {isHeb ? '→' : '←'}
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

function AppHeader({ title, eyebrow, onBack, onProfile, profileAction, actions, onLogout }) {
  const { lang, t } = useLang();
  return (
    <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-warm-200">
      <div dir="ltr" className="max-w-md mx-auto px-5 h-16 grid grid-cols-3 items-center">
        {/* Start side: actions + profile/settings btn */}
        <div className="app-header-actions flex-shrink-0">
          {actions}
          {profileAction || (onProfile && (
            <button
              onClick={onProfile}
              className="app-icon-btn"
              aria-label={lang === 'he' ? 'פרופיל' : 'Profile'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </button>
          ))}
          {onLogout && (
            <button
              onClick={onLogout}
              className="app-icon-btn"
              aria-label={t('logout')}
              title={t('logout')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          )}
        </div>
        {/* Center: logo */}
        <div className="flex justify-center">
          <img src="MEMULAIM.png" alt="מימולאים" className="h-12 w-auto object-contain" />
        </div>
        {/* End side: optional back btn + title */}
        <div className="flex items-center gap-3 min-w-0 justify-end">
          <div className="min-w-0 text-end">
            {eyebrow && <p className="text-xs font-semibold text-brand-600 truncate leading-none mb-0.5">{eyebrow}</p>}
            <h1 className="text-lg font-bold text-gray-900 tracking-tight truncate leading-tight">{title}</h1>
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="app-icon-btn flex-shrink-0"
              aria-label={lang === 'he' ? 'חזור' : 'Back'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={lang === 'he' ? 'M9 18l6-6-6-6' : 'M15 18l-6-6 6-6'}/>
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
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

function ScreenLayout({ children, onBack, onNext, nextLabel, title, sub, icon, step, totalSteps, total }) {
  const { lang } = useLang();
  // Accept both 'totalSteps' and 'total' for backward compat
  const steps = totalSteps || total;
  return (
    <div className="min-h-screen bg-warm-50 flex justify-center screen-enter">
      <div className="w-full max-w-md bg-white min-h-screen shadow-sm flex flex-col relative">
        <div className="flex-1 px-6 pt-8 pb-32">
          {onBack && <BackBtn onClick={onBack} />}
          
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
window.RadiusMapModal = RadiusMapModal;
window.PreferencesPromptModal = PreferencesPromptModal;
