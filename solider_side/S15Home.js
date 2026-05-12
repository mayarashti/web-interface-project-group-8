/* S15Home — Soldier home screen with interactive host-family map
   Includes: MAP_FAMILIES data, FamilyInfoCard, FamilyStrip, MapView (Leaflet)
*/
const { useState, useEffect, useRef } = React;

const familyAvatarUrl = (bgColor, familyId) => {
  // Create unique warm gradients based on family ID
  const gradients = [
    { from: '#fdeedd', to: '#f7d1b5' }, // Warm peach
    { from: '#f7d1b5', to: '#e8c5a5' }, // Soft orange
    { from: '#e8c5a5', to: '#d4b08a' }, // Earthy brown
    { from: '#d4b08a', to: '#c49b7a' }, // Rich brown
    { from: '#c49b7a', to: '#b8876a' }, // Deep brown
  ];
  const grad = gradients[familyId % gradients.length];

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <radialGradient id="grad${familyId}" cx="30%" cy="30%">
        <stop offset="0%" style="stop-color:${grad.from};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${grad.to};stop-opacity:1" />
      </radialGradient>
    </defs>
    <circle cx="60" cy="60" r="60" fill="url(#grad${familyId})"/>
    <circle cx="60" cy="50" r="22" fill="#ffffff" opacity="0.9"/>
    <ellipse cx="60" cy="52" rx="18" ry="16" fill="#f1c6a4"/>
    <path d="M48 72c6-8 18-8 24 0" fill="#8b5a3c" opacity="0.8"/>
    <circle cx="54" cy="48" r="3" fill="#8b5a3c"/>
    <circle cx="66" cy="48" r="3" fill="#8b5a3c"/>
    <path d="M54 60c4 3 8 3 12 0" stroke="#8b5a3c" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* ── Mock host-family data (neighbourhood-level coords for privacy) ── */
const MAP_FAMILIES = [
  {
    id: 1, name: 'משפחת לוי', city: 'חיפה — הכרמל',
    lat: 32.7943, lng: 34.9890,
    kosher: 'kosher', shabbat: 'traditional', capacity: 3,
    canSleep: false, canTransport: true,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'singing'],
    rating: 4.9,
    shortDescription: 'אירוח חם עם נוף לים וקצת שירה משותפת',
    hostedCount: 18,
    phoneDisplay: '+972528765432',
    waDigits: '972528765432',
    imageColor: '#fdeedd',
  },
  {
    id: 2, name: 'משפחת כהן', city: 'קריית אתא',
    lat: 32.8072, lng: 35.1073,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: true, canTransport: false,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['quiet', 'shabbat_atm'],
    rating: 4.7,
    shortDescription: 'בית משפחתי רגוע עם מנהגי שבת מסורתיים',
    hostedCount: 24,
    phoneDisplay: '+972528123987',
    waDigits: '972528123987',
    imageColor: '#f7d1b5',
  },
  {
    id: 3, name: 'משפחת גולן', city: 'נשר',
    lat: 32.7730, lng: 35.0460,
    kosher: 'none', shabbat: 'secular', capacity: 4,
    canSleep: false, canTransport: true,
    hostingTypes: ['friday_dinner'],
    tags: ['food', 'spacious'],
    rating: 4.8,
    shortDescription: 'בית פתוח עם מטבח גדול ועוגת שבת טעימה',
    hostedCount: 12,
    phoneDisplay: '+972523456789',
    waDigits: '972523456789',
    imageColor: '#fff1e5',
  },
  {
    id: 4, name: 'משפחת אברהם', city: 'חיפה — נווה שאנן',
    lat: 32.8021, lng: 35.0018,
    kosher: 'kosher', shabbat: 'traditional', capacity: 3,
    canSleep: true, canTransport: false,
    hostingTypes: ['shabbat_lunch'],
    tags: ['multilingual', 'spacious'],
    rating: 4.6,
    shortDescription: 'אירוח משפחתי בשפה עברית ואנגלית',
    hostedCount: 9,
    phoneDisplay: '+972527654321',
    waDigits: '972527654321',
    imageColor: '#f9efe4',
  },
  {
    id: 5, name: 'משפחת שמיר', city: 'קריית ביאליק',
    lat: 32.8350, lng: 35.0850,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: false, canTransport: false,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'shabbat_atm'],
    rating: 5.0,
    shortDescription: 'בית שמח עם אווירה משפחתית וחלבית',
    hostedCount: 21,
    phoneDisplay: '+972527890123',
    waDigits: '972527890123',
    imageColor: '#f1dcc8',
  },
  {
    id: 6, name: 'משפחת פרץ', city: 'טירת כרמל',
    lat: 32.7608, lng: 34.9700,
    kosher: 'kosher', shabbat: 'traditional', capacity: 5,
    canSleep: true, canTransport: true,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['food', 'pets', 'spacious'],
    rating: 4.5,
    shortDescription: 'בית גדול ומסביר פנים עם מקום למנוחה אחרי הארוחה',
    hostedCount: 31,
    phoneDisplay: '+972523210987',
    waDigits: '972523210987',
    imageColor: '#f3e2d3',
  },
];


/* ════════════════════════════════════════
   FamilyInfoCard — compact details beside the map
════════════════════════════════════════ */
function FamilyInfoCard({ family, onClose }) {
  const { t } = useLang();

  const koshLabel = family.kosher === 'mehadrin' ? t('map_meh')
    : family.kosher === 'kosher' ? t('map_kosh') : t('map_none');
  const shabLabel = family.shabbat === 'observant' ? t('map_obs')
    : family.shabbat === 'traditional' ? t('map_trad') : t('map_sec');

  const openWhatsApp = () => {
    window.open(`https://wa.me/${family.waDigits}`, '_blank');
  };
  const makeCall = () => {
    window.location.href = `tel:${family.phoneDisplay}`;
  };

  return (
    <aside className="family-info-card">
      <div className="family-info-card-header">
        <div className="family-info-card-avatar" style={{ backgroundColor: family.imageColor }}>
          <img src={familyAvatarUrl(family.imageColor, family.id)} alt={family.name} />
        </div>
        <div className="min-w-0 flex-1">
          <h2>{family.name}</h2>
          <p>{family.city} &middot; {shabLabel}</p>
        </div>
        <button
          onClick={onClose}
          className="family-info-card-close"
          aria-label="Close family details"
        >&times;</button>
      </div>

      <p className="family-info-card-description">{family.shortDescription}</p>

      <div className="family-info-card-status">
        <div>
          <p>{t('s15_open_table')}</p>
          <span>{family.hostedCount} {t('s15_guests_title')}</span>
        </div>
        <strong>{t('s15_open_table')}</strong>
      </div>

      <div className="family-info-grid">
        <div>
          <span>{t('map_kosh')}</span>
          <strong>{koshLabel}</strong>
        </div>
        <div>
          <span>{t('s15_capacity')}</span>
          <strong>{family.capacity}</strong>
        </div>
        {family.canSleep && (
          <div className="family-info-grid-wide">
            <span>{t('s15_sleep_available')}</span>
            <strong>{t('s15_sleep_available')}</strong>
          </div>
        )}
      </div>

      <div className="family-info-actions">
        <button onClick={openWhatsApp} className="family-info-primary">
          {t('s15_talk_whatsapp')}
        </button>
        <button onClick={makeCall} className="family-info-secondary">
          {t('s15_call')} &middot; {family.phoneDisplay}
        </button>
      </div>
    </aside>
  );
}

/* ════════════════════════════════════════
   MapView — Leaflet map with fuzzy markers
════════════════════════════════════════ */
function FamilyStrip({ families, selectedId, onSelect, onHover }) {
  return (
    <div className="family-strip overflow-x-auto pb-3 -mx-5 px-5">
      <div className="flex gap-4 items-start">
        {families.map(fam => (
          <button
            key={fam.id}
            onClick={() => onSelect(fam)}
            onMouseEnter={() => onHover?.(fam)}
            onMouseLeave={() => onHover?.(null)}
            className={clsx(
              'family-story-item transition-all duration-200',
              selectedId === fam.id && 'selected'
            )}
          >
            <div className="family-strip-avatar">
              <div className="family-strip-avatar-inner">
                <img src={familyAvatarUrl(fam.imageColor, fam.id)} alt={fam.name} className="family-strip-image" />
              </div>
            </div>
            <p>{fam.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function MapView({ families, onSelect, selectedId, hoveredId }) {
  const containerRef = useRef(null);
  const mapRef       = useRef(null);
  const markersRef   = useRef({});

  useEffect(() => {
    if (mapRef.current || !window.L) return;

    const map = L.map(containerRef.current, {
      center: [32.800, 35.020],
      zoom: 12,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
      maxZoom: 17,
      minZoom: 10,
    }).addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    families.forEach(fam => {
      L.circle([fam.lat, fam.lng], {
        radius: 420,
        color: '#c2560e',
        fillColor: '#fdeedd',
        fillOpacity: 0.2,
        weight: 1.8,
        dashArray: '5 5',
      }).addTo(map);

      const makeIcon = (selected, hovered) => L.divIcon({
        className: '',
        html: `<div class="host-marker-outer${selected ? ' selected' : hovered ? ' hovered' : ''}"><img class="host-marker-inner" src="${familyAvatarUrl(fam.imageColor, fam.id)}" alt="${fam.name}"/></div>`,
        iconSize: [56, 56],
        iconAnchor: [28, 56],
        popupAnchor: [0, -52],
      });

      const marker = L.marker([fam.lat, fam.lng], { icon: makeIcon(false, false) })
        .addTo(map)
        .on('click', () => onSelect(fam));

      markersRef.current[fam.id] = { marker, makeIcon };
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current = {}; };
  }, [families]);

  // Highlight selected/hovered marker and pan to selected
  useEffect(() => {
    if (!mapRef.current) return;

    const resizeTimer = setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 180);

    const selectedFamily = selectedId ? families.find(f => f.id === selectedId) : null;
    if (selectedFamily) {
      mapRef.current.panTo([selectedFamily.lat, selectedFamily.lng], { animate: true, duration: 0.5 });
    }

    Object.entries(markersRef.current).forEach(([id, { marker, makeIcon }]) => {
      const isSelected = Number(id) === selectedId;
      const isHovered = Number(id) === hoveredId;
      marker.setIcon(makeIcon(isSelected, isHovered));
    });

    return () => clearTimeout(resizeTimer);
  }, [selectedId, hoveredId, families]);

  return (
    <div
      ref={containerRef}
      style={{ height: '420px', width: '100%' }}
      className="rounded-[28px] overflow-hidden shadow-lg bg-white"
    />
  );
}


/* ════════════════════════════════════════
   S15Home — Soldier home screen
════════════════════════════════════════ */
function S15Home({ data, onProfile }) {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';

  const nextFriday = new Date(
    Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000
  ).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  const filteredFamilies = MAP_FAMILIES;

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24 relative">


      {/* Header */}
      <div className="soldier-home-header">
        <div className="soldier-home-greeting">
          <span>{t('s15_hi')}</span>
          <strong>{soldierName}</strong>
        </div>
        <div className="soldier-home-actions">
          <LangToggle variant="inline" />
          <button onClick={onProfile} className="soldier-home-icon-btn" title="הגדרות" aria-label="הגדרות">⚙️</button>
        </div>
      </div>

      <div className="px-5 mt-2 space-y-5">
        <FamilyStrip families={filteredFamilies} selectedId={selected?.id ?? null} onSelect={fam => setSelected(fam)} onHover={setHovered} />

        <div>
          <div className={clsx('map-detail-layout', selected && 'has-selection')}>
            <div className="map-panel">
              <MapView
                families={filteredFamilies}
                selectedId={selected?.id ?? null}
                hoveredId={hovered?.id ?? null}
                onSelect={fam => setSelected(fam)}
              />
            </div>
            {selected && (
              <FamilyInfoCard
                family={selected}
                onClose={() => setSelected(null)}
              />
            )}
          </div>
          <p className="text-xs text-center text-warm-400 mt-3">{t('s15_tap_map')}</p>
        </div>

        <div className="rounded-3xl bg-brand-50 border border-brand-100 p-4 text-center">
          <p className="text-sm font-semibold text-brand-700">{t('s15_open_table')} • {nextFriday}</p>
          <p className="text-xs text-brand-500 mt-1">{t('s15_avail', filteredFamilies.length)}</p>
        </div>
      </div>


    </div>
  );
}
