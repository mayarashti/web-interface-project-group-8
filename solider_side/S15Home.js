/* S15Home — Soldier home screen with interactive host-family map
   Includes: MAP_FAMILIES data, FamilySheet bottom drawer, MapView (Leaflet)
*/
const { useState, useEffect, useRef } = React;

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
  },
  {
    id: 2, name: 'משפחת כהן', city: 'קריית אתא',
    lat: 32.8072, lng: 35.1073,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: true, canTransport: false,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['quiet', 'shabbat_atm'],
    rating: 4.7,
  },
  {
    id: 3, name: 'משפחת גולן', city: 'נשר',
    lat: 32.7730, lng: 35.0460,
    kosher: 'none', shabbat: 'secular', capacity: 4,
    canSleep: false, canTransport: true,
    hostingTypes: ['friday_dinner'],
    tags: ['food', 'spacious'],
    rating: 4.8,
  },
  {
    id: 4, name: 'משפחת אברהם', city: 'חיפה — נווה שאנן',
    lat: 32.8021, lng: 35.0018,
    kosher: 'kosher', shabbat: 'traditional', capacity: 3,
    canSleep: true, canTransport: false,
    hostingTypes: ['shabbat_lunch'],
    tags: ['multilingual', 'spacious'],
    rating: 4.6,
  },
  {
    id: 5, name: 'משפחת שמיר', city: 'קריית ביאליק',
    lat: 32.8350, lng: 35.0850,
    kosher: 'mehadrin', shabbat: 'observant', capacity: 2,
    canSleep: false, canTransport: false,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'shabbat_atm'],
    rating: 5.0,
  },
  {
    id: 6, name: 'משפחת פרץ', city: 'טירת כרמל',
    lat: 32.7608, lng: 34.9700,
    kosher: 'kosher', shabbat: 'traditional', capacity: 5,
    canSleep: true, canTransport: true,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['food', 'pets', 'spacious'],
    rating: 4.5,
  },
];

/* ── vibe tag key → translation key map ── */
const VIBE_KEY_MAP = {
  kids: 'vibe_kids', quiet: 'vibe_quiet', multilingual: 'vibe_multi',
  singing: 'vibe_sing', pets: 'vibe_pets', spacious: 'vibe_space',
  shabbat_atm: 'vibe_shab', food: 'vibe_food',
};


/* ════════════════════════════════════════
   FamilySheet — bottom drawer on marker tap
════════════════════════════════════════ */
function FamilySheet({ family, onClose }) {
  const { t } = useLang();

  const koshLabel = family.kosher === 'mehadrin' ? t('map_meh')
    : family.kosher === 'kosher' ? t('map_kosh') : t('map_none');
  const shabLabel = family.shabbat === 'observant' ? t('map_obs')
    : family.shabbat === 'traditional' ? t('map_trad') : t('map_sec');

  const hostingLabels = family.hostingTypes.map(h =>
    h === 'friday_dinner' ? t('map_friday') :
    h === 'shabbat_lunch' ? t('map_lunch') : t('map_delivery')
  ).join('  ·  ');

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="family-sheet">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-warm-200" />
        </div>

        {/* Header row */}
        <div className="flex items-start justify-between mt-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-3xl flex-shrink-0">🏡</div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">{family.name}</h2>
              <p className="text-sm text-warm-500 mt-0.5">📍 {family.city}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs font-bold text-gray-700">{family.rating}</span>
                <span className="text-xs">⭐</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-warm-100 flex items-center justify-center text-warm-500 hover:bg-warm-200 transition-colors text-sm flex-shrink-0"
          >✕</button>
        </div>

        {/* Key badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">✡️ {koshLabel}</span>
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">🕯️ {shabLabel}</span>
          <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-brand-200">👥 {t('map_slots', family.capacity)}</span>
        </div>

        {/* Hosting types */}
        <p className="text-xs text-warm-500 font-medium mb-1">{t('s16_host_label')}</p>
        <p className="text-sm font-semibold text-gray-800 mb-4">{hostingLabels}</p>

        {/* Extras */}
        {(family.canSleep || family.canTransport) && (
          <div className="flex gap-2 mb-4">
            {family.canSleep     && <span className="bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">{t('map_sleep_yes')}</span>}
            {family.canTransport && <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200">{t('map_transport_yes')}</span>}
          </div>
        )}

        {/* Vibe tags */}
        {family.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {family.tags.map(tag => (
              <span key={tag} className="bg-warm-100 text-warm-600 text-xs px-2.5 py-1 rounded-full">
                {t(VIBE_KEY_MAP[tag] || tag)}
              </span>
            ))}
          </div>
        )}

        {/* Privacy note */}
        <p className="text-xs text-warm-400 mb-5 text-center">📍 {t(family.city)}</p>

        {/* CTA */}
        <Btn onClick={onClose} className="py-4 text-base">{t('שלח הודעה')} 🍽️</Btn>
      </div>
    </>
  );
}


/* ════════════════════════════════════════
   MapView — Leaflet map with fuzzy markers
════════════════════════════════════════ */
function MapView({ families, onSelect, selectedId }) {
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

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.zoom({ position: 'bottomleft' }).addTo(map);

    families.forEach(fam => {
      // Fuzzy halo circle
      L.circle([fam.lat, fam.lng], {
        radius: 380,
        color: '#c2560e',
        fillColor: '#f7b87a',
        fillOpacity: 0.18,
        weight: 1.5,
        dashArray: '4 4',
      }).addTo(map);

      // Custom house pin icon
      const makeIcon = (selected) => L.divIcon({
        className: '',
        html: `<div class="host-marker-outer${selected ? ' selected' : ''}"><span class="host-marker-inner">🏡</span></div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 44],
        popupAnchor: [0, -48],
      });

      const marker = L.marker([fam.lat, fam.lng], { icon: makeIcon(false) })
        .addTo(map)
        .on('click', () => onSelect(fam));

      markersRef.current[fam.id] = { marker, makeIcon };
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; markersRef.current = {}; };
  }, []);

  // Highlight selected marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([id, { marker, makeIcon }]) => {
      marker.setIcon(makeIcon(Number(id) === selectedId));
    });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      style={{ height: '310px', width: '100%' }}
      className="rounded-2xl overflow-hidden shadow-md border border-warm-200"
    />
  );
}


/* ════════════════════════════════════════
   S15Home — Soldier home screen
════════════════════════════════════════ */
function S15Home({ data }) {
  const { t } = useLang();
  const [selected, setSelected] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedFilter, setExpandedFilter] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    date: '',
    timeRange: 'all',
    observance: 'all',
    includesAccommodation: false,
    kosher: 'all'
  });

  const nextFriday = new Date(
    Date.now() + ((5 - new Date().getDay() + 7) % 7 || 7) * 86400000
  ).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' });

  const filteredFamilies = MAP_FAMILIES.filter(fam => {
    if (filters.observance !== 'all' && fam.shabbat !== filters.observance) return false;
    if (filters.includesAccommodation && !fam.canSleep) return false;
    if (filters.kosher !== 'all') {
      if (filters.kosher === 'kosher' && fam.kosher === 'none') return false;
      if (filters.kosher === 'mehadrin' && fam.kosher !== 'mehadrin') return false;
    }
    // Time range filter (simplified mock logic)
    if (filters.timeRange !== 'all') {
      if (filters.timeRange === 'friday' && !fam.hostingTypes.includes('friday_dinner')) return false;
      if (filters.timeRange === 'saturday' && !fam.hostingTypes.includes('shabbat_lunch')) return false;
    }
    return true;
  });

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24">

      {/* Header */}
      <div className="bg-gradient-to-l from-brand-700 to-brand-600 text-white px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <p className="text-sm opacity-80 mb-0.5">{t('s15_hi')}</p>
        <h1 className="text-2xl font-bold mb-1">{data.fullName || (data.firstName + ' ' + data.lastName)} 👋</h1>
        <div className="flex items-center gap-2 mt-3">
          <div className="bg-green-400 w-2.5 h-2.5 rounded-full flex-shrink-0" />
          <span className="text-sm font-medium opacity-90">{t('s15_status')}</span>
        </div>
      </div>

      <div className="px-5 mt-5 space-y-5">

        {/* Filter Trigger */}
        <Btn onClick={() => setShowFilters(true)} variant="secondary" className="shadow-sm border-brand-200">
          {t('s15_filter_btn')}
        </Btn>

        {/* Map section */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-1">{t('חפשו את האירוח המתאים עבורם!')}</h2>
          <p className="text-xs text-warm-400 mb-3">{t('מפת האירוחים שלנו')}</p>
          <MapView
            families={filteredFamilies}
            selectedId={selected?.id ?? null}
            onSelect={fam => setSelected(fam)}
          />
          <p className="text-xs text-center text-warm-400 mt-2">
            {t('s15_hi') === 'שלום,' ? 'לחץ על אייקון 🏡 לפרטים על המשפחה' : 'Tap a 🏡 icon to see family details'}
          </p>
        </div>

        {/* Horizontal chip list */}
        <div className="flex gap-3 overflow-x-auto pb-1 -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
          {filteredFamilies.map(fam => (
            <button
              key={fam.id}
              onClick={() => setSelected(fam)}
              className={clsx(
                'flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border-2 text-sm font-medium transition-all whitespace-nowrap',
                selected?.id === fam.id
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md'
                  : 'border-warm-200 bg-white text-gray-700 hover:border-brand-400'
              )}
            >
              🏡 {fam.name}
              <span className={clsx('text-xs', selected?.id === fam.id ? 'text-white opacity-80' : 'text-warm-500')}>
                ⭐{fam.rating}
              </span>
            </button>
          ))}
          {filteredFamilies.length === 0 && (
            <p className="text-sm text-warm-400 py-2 w-full text-center">אין תוצאות התואמות את הסינון</p>
          )}
        </div>

        {/* Next Shabbat card */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">{t('s15_shab')}</h2>
          <Card className="bg-amber-50 border-amber-200 text-center py-5">
            <p className="text-sm font-semibold text-amber-800 mb-1">{t('s15_friday')} {nextFriday}</p>
            <p className="text-xs text-amber-600 mb-3">{t('s15_avail', filteredFamilies.length)}</p>
            <Btn variant="outline" className="border-amber-500 text-amber-700 hover:bg-amber-100 py-2.5 text-sm">
              {t('s15_view')}
            </Btn>
          </Card>
        </div>

        {/* Past meals */}
        <div>
          <h2 className="text-base font-bold text-gray-800 mb-3">{t('s15_past')}</h2>
          <Card className="text-center py-6 text-warm-400">
            <span className="text-3xl block mb-2">📭</span>
            <p className="text-sm">{t('s15_no_past')}</p>
          </Card>
        </div>
      </div>

      {/* Filter Panel (Side Sheet) */}
      {showFilters && (
        <>
          <div className="sheet-overlay" onClick={() => setShowFilters(false)} />
          <div className="family-sheet" style={{ maxHeight: '90vh', paddingBottom: '2rem' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{t('s15_filter_title')}</h2>
              <button onClick={() => setShowFilters(false)} className="text-2xl text-warm-400">✕</button>
            </div>

            <div className="space-y-3">
              {/* Date Selector */}
              <div className="border border-warm-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedFilter(expandedFilter === 'date' ? null : 'date')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📅</span>
                    <span className="font-semibold text-gray-700">{t('s15_filter_date')}</span>
                  </div>
                  <span className="text-warm-400">{filters.date || t('map_none')} ▾</span>
                </button>
                {expandedFilter === 'date' && (
                  <div className="p-4 bg-warm-50 border-t border-warm-100">
                    <input 
                      type="date" 
                      className="w-full p-3 rounded-xl border border-warm-200 bg-white"
                      value={filters.date}
                      onChange={e => {
                        setFilters(f => ({ ...f, date: e.target.value }));
                        setExpandedFilter(null);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Time Range Selector */}
              <div className="border border-warm-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedFilter(expandedFilter === 'time' ? null : 'time')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🕒</span>
                    <span className="font-semibold text-gray-700">{t('s15_filter_time')}</span>
                  </div>
                  <span className="text-warm-400">
                    {filters.timeRange === 'friday' ? t('map_fri_s') : filters.timeRange === 'saturday' ? t('map_lun_s') : t('map_none')} ▾
                  </span>
                </button>
                {expandedFilter === 'time' && (
                  <div className="p-2 bg-warm-50 border-t border-warm-100 flex flex-col gap-1">
                    {[
                      { value: 'all', label: t('map_none') },
                      { value: 'friday', label: t('map_fri_s') },
                      { value: 'saturday', label: t('map_lun_s') }
                    ].map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setFilters(f => ({ ...f, timeRange: opt.value })); setExpandedFilter(null); }}
                        className={clsx(
                          "w-full text-right p-3 rounded-xl transition-colors",
                          filters.timeRange === opt.value ? "bg-brand-600 text-white" : "hover:bg-warm-100 text-gray-700"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Observance Selector */}
              <div className="border border-warm-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedFilter(expandedFilter === 'type' ? null : 'type')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏠</span>
                    <span className="font-semibold text-gray-700">{t('s15_filter_type')}</span>
                  </div>
                  <span className="text-warm-400">
                    {filters.observance === 'all' ? t('map_none') : t('map_' + (filters.observance === 'secular' ? 'sec' : filters.observance === 'traditional' ? 'trad' : 'obs'))} ▾
                  </span>
                </button>
                {expandedFilter === 'type' && (
                  <div className="p-2 bg-warm-50 border-t border-warm-100 flex flex-col gap-1">
                    {[
                      { value: 'all', label: t('map_none') },
                      { value: 'secular', label: t('map_sec') },
                      { value: 'traditional', label: t('map_trad') },
                      { value: 'observant', label: t('map_obs') }
                    ].map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setFilters(f => ({ ...f, observance: opt.value })); setExpandedFilter(null); }}
                        className={clsx(
                          "w-full text-right p-3 rounded-xl transition-colors",
                          filters.observance === opt.value ? "bg-brand-600 text-white" : "hover:bg-warm-100 text-gray-700"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Kosher Selector */}
              <div className="border border-warm-200 rounded-2xl overflow-hidden">
                <button 
                  onClick={() => setExpandedFilter(expandedFilter === 'kosh' ? null : 'kosh')}
                  className="w-full flex items-center justify-between p-4 bg-white hover:bg-warm-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">✡️</span>
                    <span className="font-semibold text-gray-700">{t('s15_filter_kosh')}</span>
                  </div>
                  <span className="text-warm-400">
                    {filters.kosher === 'all' ? t('map_none') : filters.kosher === 'kosher' ? t('map_kosh') : t('map_meh')} ▾
                  </span>
                </button>
                {expandedFilter === 'kosh' && (
                  <div className="p-2 bg-warm-50 border-t border-warm-100 flex flex-col gap-1">
                    {[
                      { value: 'all', label: t('map_none') },
                      { value: 'kosher', label: t('map_kosh') },
                      { value: 'mehadrin', label: t('map_meh') }
                    ].map(opt => (
                      <button 
                        key={opt.value}
                        onClick={() => { setFilters(f => ({ ...f, kosher: opt.value })); setExpandedFilter(null); }}
                        className={clsx(
                          "w-full text-right p-3 rounded-xl transition-colors",
                          filters.kosher === opt.value ? "bg-brand-600 text-white" : "hover:bg-warm-100 text-gray-700"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Accommodation Toggle */}
              <div className="border border-warm-200 rounded-2xl p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🛏️</span>
                  <span className="font-semibold text-gray-700">{t('s15_filter_sleep')}</span>
                </div>
                <input 
                  type="checkbox" 
                  className="w-6 h-6 rounded-lg accent-brand-600"
                  checked={filters.includesAccommodation}
                  onChange={e => setFilters(f => ({ ...f, includesAccommodation: e.target.checked }))}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Btn onClick={() => setShowFilters(false)} className="flex-1">{t('s15_filter_apply')}</Btn>
                <Btn 
                  variant="secondary" 
                  onClick={() => setFilters({ date:'', timeRange:'all', observance:'all', includesAccommodation:false, kosher:'all' })} 
                >
                  {t('s15_filter_reset')}
                </Btn>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail sheet */}
      {selected && <FamilySheet family={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
