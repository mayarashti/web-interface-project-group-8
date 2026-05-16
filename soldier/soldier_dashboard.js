/* S15Landing â€” Landing screen for soldiers after login */

function S15Landing({ onNewRequest, onViewMatches, onEditRequest, onProfile, data, setData }) {
  const { t, lang } = useLang();
  const [activeRequest, setActiveRequest] = useState(null);
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';
  const hasRequests = data.requests && data.requests.length > 0;

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-10">
      <AppHeader
        eyebrow={t('s15_hi')}
        title={soldierName}
        profileAction={(
          <button onClick={onProfile} className="app-icon-btn" title={t('s15_landing_profile_title')} aria-label={t('s15_landing_profile_title')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </button>
        )}
        actions={<LangToggle variant="inline" />}
      />

      <div className="px-5 mt-8 space-y-6 max-w-md mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {hasRequests ? t('s15_landing_title') : t('s15_landing_no_req_title')}
          </h1>
          {hasRequests ? (
            <div className="space-y-3">
              <p className="text-warm-500">{t('s15_landing_has_req_sub', data.requests.length)}</p>
              <div className="flex flex-col gap-3 max-w-sm mx-auto">
                {data.requests.map(req => {
                  const families = window.MAP_FAMILIES || [];
                  const matchCount = families.filter(fam => {
                    if (req.kosher) {
                      if (fam.kosher === 'none' && req.kosher !== 'none') return false;
                      if (req.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
                    }
                    if (req.shabbat && fam.shabbat === 'secular') return false;
                    if (req.needSleep && !fam.canSleep) return false;
                    return true;
                  }).length;

                  return (
                    <div key={req.id} className="flex items-center gap-2">
                      <button 
                        onClick={() => setActiveRequest(req)}
                        className="flex-1 px-5 py-3 bg-white text-gray-900 text-sm font-bold rounded-2xl border border-warm-200 shadow-sm hover:border-brand-200 transition-all flex items-center justify-between group/btn"
                      >
                        <div className="flex flex-col items-start gap-0.5 text-right">
                          <span>{req.when} - {req.location}</span>
                          <span className={matchCount > 0 ? "text-brand-600 text-[11px] font-semibold" : "text-warm-400 text-[11px] font-medium"}>
                            {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}
                          </span>
                        </div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500 group-hover/btn:translate-x-1 transition-transform rtl:group-hover/btn:-translate-x-1">
                          <path d="M9 18l6-6-6-6"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => onEditRequest(req)}
                        className="w-12 h-12 rounded-2xl bg-white border border-warm-200 text-warm-500 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 shadow-sm transition-colors"
                        title={t('s15_edit_req')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-warm-500">{t('s15_landing_new_req_sub')}</p>
          )}
        </div>
        
        {/* New Request CTA */}
        <button
          onClick={() => onNewRequest()}
          className="w-full text-start p-5 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0 text-right">
            <p className="text-base font-bold text-gray-900">{t('s15_landing_new_req_title')}</p>
            <p className="text-xs text-warm-500 mt-0.5">{t('s15_form_sub')}</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-warm-400 group-hover:text-brand-500 transition-colors flex-shrink-0">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <SearchStatusSheet 
          request={activeRequest}
          soldierName={soldierName}
          onClose={() => setActiveRequest(null)}
          onEdit={() => { setActiveRequest(null); onEditRequest(activeRequest); }}
          onCancel={(id) => { setActiveRequest(null); data.requests = data.requests.filter(r => r.id !== id); setData({...data}); }}
          onRematch={(req, reason) => {
            // Mock rematch logic
            req.status = 'searching';
            setData({...data});
          }}
          onViewMap={() => { setActiveRequest(null); onViewMatches(activeRequest.id); }}
        />
      </div>
    </div>
  );
}



/* S15Home — Soldier home screen with interactive host-family map
   Includes: MAP_FAMILIES data, FamilyInfoCard, FamilyStrip, MapView (Leaflet)
*/
var { useState, useEffect, useRef } = React;

const familyAvatarUrl = (bgColor, familyId) => {
  // Create calm, distinct avatar tones based on family ID.
  const gradients = [
    { from: '#f3e3d9', to: '#e8e3dc' },
    { from: '#e3ecdf', to: '#f4f1ed' },
    { from: '#dfe8ed', to: '#f4f1ed' },
    { from: '#eadfd8', to: '#f3e3d9' },
    { from: '#e8e3dc', to: '#d8d0c6' },
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
    <ellipse cx="60" cy="52" rx="18" ry="16" fill="#d8b09d"/>
    <path d="M48 72c6-8 18-8 24 0" fill="#6f5b4f" opacity="0.8"/>
    <circle cx="54" cy="48" r="3" fill="#6f5b4f"/>
    <circle cx="66" cy="48" r="3" fill="#6f5b4f"/>
    <path d="M54 60c4 3 8 3 12 0" stroke="#6f5b4f" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/* —— Mock host-family data (neighbourhood-level coords for privacy) —— */
window.MAP_FAMILIES = [
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


/* ——————————————————————————————————————————— 
   FamilyInfoCard — compact details beside the map
————————————————————————————————————————————— */
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
          aria-label={t('close_label')}
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
          <span>{t('kashrut_label')}</span>
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

/* ——————————————————————————————————————————— 
   MapView — Leaflet map with fuzzy markers
————————————————————————————————————————————— */
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
        color: '#b86442',
        fillColor: '#f3e3d9',
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
      className="rounded-xl overflow-hidden border border-warm-200 shadow-sm bg-white"
    />
  );
}


/* ——————————————————————————————————————————— 
   S15Home — Soldier home screen
————————————————————————————————————————————— */
function S15Home({ data, onProfile, onNewRequest, onBack }) {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';

  const nextFriday = new Date(
    Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000
  ).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  // Matching Logic
  const requests = data.requests || [];
  const activeRequest = data.selectedRequestId 
    ? requests.find(r => r.id === data.selectedRequestId)
    : requests[0]; // Fallback to most recent

  let filteredFamilies = [];
  if (activeRequest) {
    if (activeRequest.status === 'matched') {
      filteredFamilies = [MAP_FAMILIES[0]].filter(Boolean); // Mocking the matched family
    } else {
      filteredFamilies = MAP_FAMILIES.filter(fam => {
        // 1. Kashrut
        if (activeRequest.kosher) {
          if (fam.kosher === 'none' && activeRequest.kosher !== 'none') return false;
          if (activeRequest.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
        }
        // 2. Shabbat
        if (activeRequest.shabbat && fam.shabbat === 'secular') return false;
        
        // 3. Sleeping
        if (activeRequest.needSleep && !fam.canSleep) return false;

        return true;
      });
    }
  }

  const noRequests = requests.length === 0;
  const noMatches = !noRequests && filteredFamilies.length === 0;

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24 relative">
      <AppHeader
        eyebrow={t('s15_hi')}
        title={soldierName}
        onBack={onBack}
        profileAction={(
          <button onClick={onProfile} className="app-icon-btn" title={t('settings_label')} aria-label={t('settings_label')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3h.1A1.7 1.7 0 0 0 10 3.1V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6h.1a1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.6.9h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z" />
            </svg>
          </button>
        )}
        actions={<LangToggle variant="inline" />}
      />

      <div className="px-5 mt-2 space-y-5 max-w-6xl mx-auto">
        {noRequests ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center text-warm-400">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('s15_no_requests_title')}</h2>
            <p className="text-warm-500 max-w-xs">{t('s15_no_requests_sub')}</p>
            <Btn onClick={onNewRequest} className="max-w-xs">{t('s15_landing_new_req_title')}</Btn>
          </div>
        ) : noMatches ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-500">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t('s15_no_matches_title')}</h2>
            <p className="text-warm-500 max-w-sm">{t('s15_no_matches_sub')}</p>
            <Btn variant="secondary" onClick={onNewRequest} className="max-w-xs">{t('update_request')}</Btn>
          </div>
        ) : (
          <React.Fragment>
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

            <div className="rounded-xl bg-support-50 border border-support-100 p-4 text-center">
              <p className="text-sm font-semibold text-support-600">{t('s15_open_table')} • {nextFriday}</p>
              <p className="text-xs text-brand-500 mt-1">{t('s15_avail', filteredFamilies.length)}</p>
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}


/* S15NewRequest — Form for soldiers to request accommodation */
var { useState } = React;

function S15NewRequest({ onBack, onSubmit, onCancel, data, setData }) {
  const { t } = useLang();
  const initialRequest = data.editingRequest || {
    id: Date.now(),
    when: '',
    startTime: '19:00',
    endTime: '22:00',
    guestCount: 1,
    friendDietary: [],
    friendDietaryOther: '',
    petsComfort: 'ok',
    shabbat: data.shabbat === 'observant' || data.shabbat === 'traditional',
    kosher: data.kosher === 'kosher' || data.kosher === 'mehadrin',
    duration: 'dinner',
    transport: false,
    needSleep: data.needsSleep || false,
    travelDistance: 10,
    location: data.unit || '',
    status: 'searching'
  };

  const [request, setRequest] = useState(initialRequest);
  const [showMap, setShowMap] = useState(false);

  const dietaryOpts = [
    { value: 'gluten',     label: t('a_gluten')  },
    { value: 'lactose',    label: t('a_lactose') },
    { value: 'nuts',       label: t('a_nuts')    },
    { value: 'peanuts',    label: t('a_peanuts') },
    { value: 'vegetarian', label: t('a_veg')     },
    { value: 'vegan',      label: t('a_vegan')   },
    { value: 'fish',       label: t('a_fish')    },
    { value: 'other',      label: t('a_other')   },
  ];

  const handleChange = (field, value) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(request);
  };

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-10">
      <AppHeader 
        title={data.editingRequest ? t('edit_request') : t('s15_form_title')} 
        onBack={onBack}
      />
      
      <div className="px-5 mt-6 max-w-md mx-auto">
        <p className="text-base text-warm-500 mb-8 leading-6">{t('s15_form_sub')}</p>
        
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <Input 
            label={t('s15_when')}
            type="date"
            value={request.when}
            onChange={(val) => handleChange('when', val)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label={t('start_time')}
              type="time"
              value={request.startTime}
              onChange={(val) => handleChange('startTime', val)}
              required
            />
            <Input 
              label={t('end_time')}
              type="time"
              value={request.endTime}
              onChange={(val) => handleChange('endTime', val)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">
              {t('s15_guest_count')}: {request.guestCount}
            </label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={request.guestCount} 
              onChange={(e) => handleChange('guestCount', parseInt(e.target.value))}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {request.guestCount > 1 && (
            <div className="space-y-4">
              <MultiCheck 
                label={t('s15_friend_dietary')}
                options={dietaryOpts}
                values={request.friendDietary || []}
                onChange={(val) => handleChange('friendDietary', val)}
              />
              {(request.friendDietary || []).includes('other') && (
                <div className="animate-enter">
                  <textarea 
                    value={request.friendDietaryOther} 
                    onChange={e => handleChange('friendDietaryOther', e.target.value)}
                    placeholder={t('other_prefs_ph')}
                    className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
                    rows={3}
                  />
                </div>
              )}
              <RadioGroup 
                label={t('s15_shabbat')}
                value={request.shabbat ? 'yes' : 'no'}
                onChange={(val) => handleChange('shabbat', val === 'yes')}
                options={[
                  { value: 'yes', label: t('s15_yes') },
                  { value: 'no', label: t('s15_no') }
                ]}
              />
              <RadioGroup 
                label={t('s15_kosher')}
                value={request.kosher ? 'yes' : 'no'}
                onChange={(val) => handleChange('kosher', val === 'yes')}
                options={[
                  { value: 'yes', label: t('s15_yes') },
                  { value: 'no', label: t('s15_no') }
                ]}
              />
              <RadioGroup 
                label={t('s15_pets_comfort')}
                value={request.petsComfort}
                onChange={(val) => handleChange('petsComfort', val)}
                options={[
                  { value: 'ok', label: t('s15_pets_ok') },
                  { value: 'no', label: t('s15_pets_no') }
                ]}
              />
            </div>
          )}

          <RadioGroup 
            label={t('s15_duration')}
            value={request.duration}
            onChange={(val) => {
              handleChange('duration', val);
              if (val === 'full' || val === 'weekend') handleChange('needSleep', true);
              else handleChange('needSleep', false);
            }}
            options={[
              { value: 'dinner',  label: t('s15_duration_dinner') },
              { value: 'full',    label: t('s15_duration_full'),    sub: t('includes_overnight') },
              { value: 'weekend', label: t('s15_duration_weekend'), sub: t('fri_sat_label') },
            ]}
          />

          <RadioGroup 
            label={t('s15_transport')}
            value={request.transport ? 'yes' : 'no'}
            onChange={(val) => handleChange('transport', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <RadioGroup 
            label={t('s15_need_sleep')}
            value={request.needSleep ? 'yes' : 'no'}
            onChange={(val) => handleChange('needSleep', val === 'yes')}
            options={[
              { value: 'yes', label: t('s15_yes') },
              { value: 'no', label: t('s15_no') }
            ]}
          />

          <div className="mb-4">
            <label className="block text-sm font-semibold text-warm-600 mb-1.5">
              {t('s15_travel_dist')}: {request.travelDistance} {t('km_unit')}
            </label>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={request.travelDistance} 
              onChange={(e) => handleChange('travelDistance', e.target.value)}
              className="w-full h-2 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          <LocationInput 
            label={t('s15_location')}
            placeholder={t('s15_location_ph')}
            value={request.location}
            onChange={(val) => handleChange('location', val)}
            onMapPin={() => setShowMap(true)}
            required
            hint={request.lat ? t('map_pin_set') : null}
          />

          <MapPinModal 
            isOpen={showMap}
            onClose={() => setShowMap(false)}
            onConfirm={(pos, addr) => {
              handleChange('lat', pos.lat);
              handleChange('lng', pos.lng);
              if (addr) handleChange('location', addr.split(',')[0]); // Take city part
            }}
            initialLat={request.lat}
            initialLng={request.lng}
          />

          <div className="pt-4 space-y-3">
            <Btn type="submit">
              {data.editingRequest ? t('save_changes') : t('s15_submit_request')}
            </Btn>
            
            {data.editingRequest && (
              <button 
                type="button"
                onClick={() => onCancel(request.id)}
                className="w-full py-4 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
              >
                {t('cancel_request')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}



/* S21SoldierProfile — Soldier profile and request dashboard */
var { useState } = React;

function S21SoldierProfile({ data, setData, onBack, onNewRequest, onEditRequest, onDeleteRequest, onViewMatches }) {
  const { t, lang } = useLang();
  
  // Use local state for the form so edits are not global until saved
  const [form, setForm] = useState({
    fullName: data.fullName || '',
    phone: data.phone || '',
    bio: data.bio || '',
    kosher: data.kosher || 'kosher',
    shabbat: data.shabbat || 'no',
    allergies: data.allergies || [],
  });

  const [saved, setSaved] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setData(prev => ({ ...prev, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const allergyOpts = [
    { value:'gluten',  label:t('a_gluten') },
    { value:'lactose', label:t('a_lactose') },
    { value:'nuts',    label:t('a_nuts') },
    { value:'peanuts', label:t('a_peanuts') },
    { value:'veg',     label:t('a_veg') },
    { value:'vegan',   label:t('a_vegan') },
    { value:'fish',    label:t('a_fish') },
  ];

  // Logic to calculate matches for each request
  const getMatchCount = (req) => {
    const families = window.MAP_FAMILIES || [];
    return families.filter(fam => {
      if (req.kosher) {
        if (fam.kosher === 'none' && req.kosher !== 'none') return false;
        if (req.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
      }
      if (req.shabbat && fam.shabbat === 'secular') return false;
      if (req.needSleep && !fam.canSleep) return false;
      return true;
    }).length;
  };

  const requests = data.requests || [];

  return (
    <div className="screen-enter min-h-screen flex flex-col pb-12 bg-warm-50">
      <AppHeader 
        title={t('s15_landing_profile_title')} 
        onBack={onBack} 
        actions={<LangToggle variant="inline" />}
      />
      <div className="w-full max-w-md mx-auto px-5 space-y-6">
        
        {/* Open Requests Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{t('s15_open_requests')}</h2>
          </div>

          {/* Small plus button above all requests */}
          <div className="flex justify-start">
            <button 
              onClick={onNewRequest}
              className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-sm hover:bg-brand-600 transition-colors"
              title={t('s15_new_req')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {requests.length === 0 ? (
              <p className="text-warm-500 text-sm italic">{t('s15_no_requests_title')}</p>
            ) : (
              requests.map(req => {
                const matchCount = getMatchCount(req);
                const formatDate = (dateStr) => {
                  if (!dateStr) return '';
                  const d = new Date(dateStr);
                  if (isNaN(d.getTime())) return dateStr;
                  return d.toLocaleDateString('he-IL').replace(/\//g, '.');
                };
                
                return (
                  <div key={req.id} className="relative flex items-center gap-3">
                    <button
                      onClick={() => {
                        console.log('Viewing matches for request:', req.id);
                        onViewMatches(req.id);
                      }}
                      className="flex-1 text-right p-5 pr-6 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-200 transition-all flex items-center justify-between group/btn"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900">{formatDate(req.when)}</span>
                        <span className={req.status === 'matched' ? "text-support-600 text-xs font-semibold" : "text-brand-600 text-xs font-semibold"}>
                          {req.status === 'matched' ? t('s15_match_success') : t('s15_searching_sub')}
                        </span>
                        {req.status && (
                          <span className={clsx(
                            'mt-0.5 inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full w-fit border',
                            req.status === 'matched'   && 'bg-support-50 text-support-600 border-support-100',
                            req.status === 'searching' && 'bg-brand-50 text-brand-600 border-brand-100',
                            req.status === 'canceled'  && 'bg-warm-100 text-warm-500 border-warm-200',
                          )}>
                            {req.status === 'matched'   && t('status_matched')}
                            {req.status === 'searching' && t('status_searching')}
                            {req.status === 'canceled'  && t('status_canceled')}
                          </span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-500 flex items-center justify-center group-hover/btn:bg-brand-500 group-hover/btn:text-white transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                    </button>
                    
                    {/* Action buttons next to the request button */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); onEditRequest(req); }}
                        className="w-10 h-10 rounded-xl bg-white text-warm-500 border border-warm-200 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 shadow-sm transition-colors"
                        title={t('s15_edit_req')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); if(confirm(t('confirm_delete'))) onDeleteRequest(req.id); }}
                        className="w-10 h-10 rounded-xl bg-white text-warm-500 border border-warm-200 flex items-center justify-center hover:bg-red-50 hover:text-red-600 shadow-sm transition-colors"
                        title={t('delete_request')}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Personal Details Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s12_personal')}</h2>
          <Input label={t('s3_first')} value={form.fullName} onChange={setF('fullName')} />
          <Input label={t('s3_phone')} value={form.phone} onChange={setF('phone')} />
        </Card>

        {/* Preferences Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s12_prefs')}</h2>
          <RadioGroup 
            label={t('s7_kosh')} 
            value={form.kosher} 
            onChange={setF('kosher')}
            options={[
              { value:'mehadrin', label:t('s7_meh'),    sub:t('s7_meh_s') },
              { value:'kosher',   label:t('s7_kosh_k'), sub:t('s7_kosh_k_s') },
              { value:'none',     label:t('s7_none'),   sub:t('s7_none_s') },
            ]}
          />
          <RadioGroup 
            label={t('s7_shab')} 
            value={form.shabbat} 
            onChange={setF('shabbat')}
            options={[
              { value:'yes', label:t('s7_yes'), sub:t('s7_yes_s') },
              { value:'no',  label:t('s7_no'),  sub:t('s7_no_s') },
            ]}
          />
          <MultiCheck label={t('s9_title')} options={allergyOpts} values={form.allergies} onChange={setF('allergies')} />
        </Card>

        {/* Bio Section */}
        <Card className="space-y-4">
          <h2 className="section-label">{t('s11_bio')}</h2>
          <div>
            <textarea value={form.bio} onChange={e => setF('bio')(e.target.value)}
              placeholder={t('s11_bio_ph')}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none" rows={4} />
          </div>
        </Card>

        <Btn onClick={handleSave} className="text-base py-4 shadow-lg">
          {saved ? t('saved_success') : t('save_changes')}
        </Btn>
        <Btn onClick={() => window.setScreen(1)} variant="danger" className="text-base py-4 shadow-sm mb-6">
          {t('logout')}
        </Btn>
      </div>
    </div>
  );
}


function SearchStatusSheet({ request, onClose, onEdit, onCancel, onRematch, onViewMap, soldierName }) {
  const { t, lang } = useLang();
  const [view, setView] = useState('status'); // 'status' or 'rematch'
  const [rematchReason, setRematchReason] = useState('');

  if (!request) return null;

  const statusKey = request.status ? ('search_status_' + request.status) : 'search_status_searching';
  const matchedFamily = window.MAP_FAMILIES?.[0]; // Mocking first family as match for demo

  const handleRematchSubmit = () => {
    onRematch(request, rematchReason);
    setView('status');
    setRematchReason('');
    onClose();
  };

  return (
    <Modal isOpen={!!request} onClose={onClose} title={t(statusKey)}>
      <div className="space-y-6">
        {view === 'status' ? (
          <>
            {request.status === 'searching' && (
              <div className="text-center py-4">
                <div className="flex justify-center gap-1.5 mb-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-sm text-warm-500">{t('s15_searching_sub')}</p>
              </div>
            )}

            {request.status === 'matched' && matchedFamily && (
              <div className="space-y-6 animate-enter">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-brand-50 border border-brand-100">
                  <img src={matchedFamily.image} className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{matchedFamily.name}</h3>
                    <p className="text-xs text-warm-500 mt-0.5">{matchedFamily.location}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Btn onClick={() => {
                    const msg = t('whatsapp_msg', soldierName, request.when);
                    window.open(`https://wa.me/${matchedFamily.phone}?text=${encodeURIComponent(msg)}`);
                  }} variant="outline" className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.695 2.54 2.599-.681c.887.486 1.856.741 2.839.741h.001c3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.769-5.767zm3.387 8.192c-.146.411-.849.761-1.157.808-.285.045-.653.075-1.047-.052-.244-.078-.553-.189-.912-.345-1.528-.66-2.518-2.213-2.593-2.313-.076-.101-.617-.82-.617-1.564 0-.743.393-1.109.531-1.258.143-.15.311-.188.413-.188h.27c.086 0 .201-.033.31.233l.423 1.027c.038.09.064.195.004.314-.06.12-.09.195-.181.3-.09.105-.19.233-.27.315-.088.09-.181.188-.076.368.106.181.469.773.999 1.246.684.609 1.261.799 1.442.889.181.09.286.075.391-.045.105-.12.451-.525.571-.705.12-.18.24-.15.405-.09.166.06 1.054.496 1.235.586.181.09.301.135.346.21.046.075.046.435-.1.846z"/></svg>
                    WhatsApp
                  </Btn>
                  <Btn onClick={onViewMap} variant="outline" className="flex items-center justify-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {t('view_map')}
                  </Btn>
                </div>

                <div className="pt-4 border-t border-warm-100">
                  <button 
                    onClick={() => setView('rematch')}
                    className="w-full py-3 text-sm font-semibold text-warm-500 hover:text-brand-600 transition-colors"
                  >
                    {t('request_rematch')}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-col gap-3">
              <Btn onClick={onEdit} variant="outline">{t('edit_request')}</Btn>
              <button onClick={() => onCancel(request.id)} className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">{t('cancel_request')}</button>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-enter">
            <div>
              <label className="block text-sm font-semibold text-warm-700 mb-2">{t('rematch_reason_label')}</label>
              <textarea 
                value={rematchReason}
                onChange={e => setRematchReason(e.target.value)}
                placeholder={t('rematch_reason_ph')}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Btn onClick={() => setView('status')} variant="outline" className="flex-1">{t('s16_back')}</Btn>
              <Btn onClick={handleRematchSubmit} className="flex-1">{t('s16_submit')}</Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

window.S15Landing = S15Landing;
window.S15Home = S15Home;
window.S15NewRequest = S15NewRequest;
window.S21SoldierProfile = S21SoldierProfile;
window.SearchStatusSheet = SearchStatusSheet;
