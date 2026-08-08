/* S15Landing â€” Landing screen for soldiers after login */

/* True when `fam` is within the request's travel radius of the request's
   chosen location. When either side lacks coordinates we can't measure the
   distance, so we don't exclude the family (graceful fallback). */
function familyInRange(req, fam) {
  if (!req || req.lat == null || req.lng == null) return true;
  if (!fam || fam.lat == null || fam.lng == null) return true;
  const d = window.distanceKm(req.lat, req.lng, fam.lat, fam.lng);
  if (d == null) return true;
  const radius = typeof req.travelDistance === 'number' ? req.travelDistance : 30;
  return d <= radius;
}

/* The family profile and the hosting offer behind one match, read in parallel.
   Neither read is fatal — the match doc carries a denormalized family name,
   city and date to fall back on — so a failure degrades the card instead of
   emptying it. */
async function fetchMatchBundle(match) {
  const get = (collection, id) => id
    ? window.db.collection(collection).doc(id).get()
        .catch(e => { console.error(`${collection} fetch error:`, e); return null; })
    : Promise.resolve(null);

  const [familyDoc, hostingDoc] = await Promise.all([
    get('families', match.family_id),
    get('family_hostings', match.host_offer_id),
  ]);

  return {
    match,
    familyId: match.family_id,
    family: familyDoc?.exists ? familyDoc.data() : null,
    hosting: hostingDoc?.exists ? hostingDoc.data() : null,
  };
}

function ActiveRequestCard({ req, onOpen, onEdit, onCancel, lang, t }) {
  const [matchState, setMatchState] = React.useState('pending'); // 'pending', 'match_found', 'confirmed'
  const [matchDetails, setMatchDetails] = React.useState(null);
  /* A match's family_id and host_offer_id never change, so the pair of reads
     happens once per match no matter how often the status snapshot fires. */
  const bundleCache = React.useRef({});

  React.useEffect(() => {
    if (!req.is_match) {
      setMatchState('pending');
      setMatchDetails(null);
      return;
    }

    if (!window.db) {
      // No Firestore (static demo): show the match_found layout with no family
      // attached rather than inventing one that looks real.
      setMatchState('match_found');
      setMatchDetails(null);
      return;
    }

    let canceled = false;

    // Subscribe to active_matches — this listener is the pending →
    // match_found → confirmed state machine.
    const unsubscribe = window.db.collection('active_matches')
      .where('soldier_request_id', '==', req.id)
      .where('status', 'in', ['pending_soldier_approval', 'approved'])
      .limit(1)
      .onSnapshot(async (snap) => {
        if (canceled) return;
        if (snap.empty) {
          setMatchState('pending');
          setMatchDetails(null);
          return;
        }

        const match = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setMatchState(match.status === 'approved' ? 'confirmed' : 'match_found');

        const key = `${match.family_id}|${match.host_offer_id || ''}`;
        let bundle = bundleCache.current[key];
        if (!bundle) {
          bundle = await fetchMatchBundle(match);
          if (canceled) return;
          bundleCache.current[key] = bundle;
        }
        setMatchDetails({ ...bundle, match });
      }, e => console.error('Match listener error:', e));

    return () => { canceled = true; unsubscribe(); };
  }, [req.id, req.is_match]);

  let cardStyle = {
    borderRadius: '16px',
    backgroundColor: '#FFFFFF',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'relative',
    transition: 'all 200ms ease',
    border: '1px solid #E5E7EB'
  };

  const family = matchDetails?.family || {};
  const match = matchDetails?.match || null;
  const hosting = matchDetails?.hosting || null;
  const hostingCanceled = !!hosting && hosting.status === 'canceled';

  if (matchState === 'pending') {
    cardStyle.border = '1px solid #E5E7EB';
  } else if (hostingCanceled) {
    cardStyle.border = '1px solid #D97706';
  } else if (matchState === 'match_found') {
    cardStyle.border = '1px solid #E67E22';
  } else if (matchState === 'confirmed') {
    cardStyle.border = '1px solid #27AE60';
  }

  /* One label for the family across every state, so a profile with no
     hostName degrades to a generic noun phrase instead of a blank. */
  const familyName = family.hostName || match?.family_name || null;
  const famLabel = familyName
    ? t('family_display_name', familyName)
    : t('generic_family_name');

  /* When and where the meal actually is. The hosting offer is the truth; the
     match doc's denormalized date covers a missing offer, and the soldier's
     own requested date is the last resort. City only — never the address. */
  const city = family.hostCity || match?.family_city || null;
  const dateLabel = window.formatHostingDate(hosting?.date || match?.hosting_date || req.when, lang);
  /* A known offer with a blank time says the time is still coming; an offer we
     could not read stays silent rather than promising an update. */
  const timeLabel = window.formatHostingTimeLabel(hosting, t)
    || (hosting ? t('hosting_time_tbd') : '');

  let titleText = '';
  let subtitleText = '';

  if (matchState === 'pending') {
    titleText = t('card_search_title');
    // req.when is a raw 'YYYY-MM-DD'; show it the way the rest of the app does.
    subtitleText = t('card_search_sub', window.formatHostingDate(req.when, lang) || req.when, req.location);
  } else if (matchState === 'match_found') {
    titleText = t('card_match_title');
    subtitleText = t('card_match_sub', famLabel);
  } else if (matchState === 'confirmed') {
    titleText = t('card_confirmed_title', famLabel);
    subtitleText = t('card_confirmed_sub');
  }

  return (
    <div style={cardStyle} className="shadow-sm hover:shadow-md transition-all relative">
      {/* Top right badge for match_found state */}
      {matchState === 'match_found' && (
        <span
          className="absolute -top-3 left-4 md:left-6 px-3 py-1 rounded-full text-white text-[12px] font-bold shadow-sm"
          style={{ backgroundColor: '#E67E22' }}
        >
          {t('card_match_badge')}
        </span>
      )}

      {/* Header Area */}
      <div className="flex gap-4 items-start text-right" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
        {/* Icon container - Styled to match '+ New Request' button icon box */}
        <div className="flex-shrink-0 mt-0.5">
          {matchState === 'pending' && (
            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          )}
          {matchState === 'match_found' && (
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          )}
          {matchState === 'confirmed' && (
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
          )}
        </div>

        {/* Title, when/where at a glance, then subtitle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold tracking-tight text-gray-900 mb-1">
            {titleText}
          </h3>

          {matchState !== 'pending' && (
            <HostingWhenWhereStrip
              className="my-2"
              dateLabel={dateLabel}
              timeLabel={timeLabel}
              city={city}
              tone={hostingCanceled ? 'amber' : matchState === 'confirmed' ? 'green' : 'brand'}
              ariaLabel={dateLabel && timeLabel && city
                ? t('card_confirmed_invite', dateLabel, timeLabel, city)
                : undefined}
            />
          )}

          <p className="text-[13px] font-normal leading-relaxed text-warm-500">
            {subtitleText}
          </p>

          {hostingCanceled && (
            <p className="mt-2 text-[12px] font-bold leading-relaxed text-amber-800">
              {t('hosting_canceled_note')}
            </p>
          )}
        </div>
      </div>

      {/* Action Buttons Area */}
      <div className="flex gap-3 items-center w-full mt-1" style={{ direction: lang === 'he' ? 'rtl' : 'ltr' }}>
        {matchState === 'pending' && (
          <>
            <button
              onClick={() => onEdit(req)}
              className="flex-1 text-center py-2.5 text-xs font-bold text-gray-600 hover:text-brand-600 transition-colors rounded-xl bg-warm-50 border border-warm-100 hover:border-warm-200 hover:bg-warm-100 shadow-sm"
            >
              {t('edit_request')}
            </button>
            <button
              onClick={() => onCancel(req.id)}
              className="flex-1 text-center py-2.5 text-xs font-bold text-red-600 hover:text-red-700 transition-colors rounded-xl bg-red-50 border border-red-100 hover:border-red-200 hover:bg-red-100 shadow-sm"
            >
              {t('cancel_request')}
            </button>
          </>
        )}

        {matchState === 'match_found' && (
          <button
            onClick={() => onOpen(matchDetails)}
            className="w-full text-center px-4 py-2.5 rounded-xl font-bold text-white transition-all shadow-sm hover:shadow active:scale-[0.98]"
            style={{ backgroundColor: '#2D5A27' }}
          >
            {t('card_open_match_cta')}
          </button>
        )}

        {matchState === 'confirmed' && (
          <button
            onClick={() => onOpen(matchDetails)}
            className="w-full text-center px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm hover:shadow active:scale-[0.98] bg-white border"
            style={{ borderColor: '#3D2B1F', color: '#3D2B1F' }}
          >
            {t('card_open_confirmed_cta')}
          </button>
        )}
      </div>
    </div>
  );
}

function S15Landing({ onNewRequest, onViewMatches, onEditRequest, onProfile, onFillPreferences, onLogout, data, setData }) {
  const { t, lang } = useLang();
  const [activeRequest, setActiveRequest] = useState(null);
  /* The match/family/hosting bundle the card already fetched, handed to the
     sheet so it opens populated instead of empty while it re-reads. */
  const [activeMatchBundle, setActiveMatchBundle] = useState(null);
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';
  const hasRequests = data.requests && data.requests.length > 0;
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favoritePrompt, setFavoritePrompt] = useState(null); // payload of a favorite_prompt notification
  const [favoriteHosting, setFavoriteHosting] = useState(null); // payload of a favorite_hosting_open notification
  const [favoriteToast, setFavoriteToast] = useState(null);
  const [joiningHosting, setJoiningHosting] = useState(false);
  const notifications = data.notifications || [];

  const handleNewRequestClick = () => {
    if (data.soldierPreferencesSkipped) {
      setShowPrefModal(true);
    } else {
      onNewRequest();
    }
  };

  const handleNotificationClick = (notif) => {
    // "How was the hosting?" — offer to add the family to favorites.
    if (notif.type === 'favorite_prompt' && notif.payload?.family_id) {
      setFavoritePrompt(notif.payload);
      return;
    }
    // A favorite family opened a new hosting.
    if (notif.type === 'favorite_hosting_open' && notif.payload?.hosting_id) {
      setFavoriteHosting(notif.payload);
      return;
    }
    const reqId = notif.payload?.request_id;
    const req = reqId
      ? (data.requests || []).find(r => r.id === reqId)
      : (data.requests || []).find(r => r.is_match);
    if (req) setActiveRequest(req);
  };

  // A favorites notification tapped on S15Home is handed over here.
  useEffect(() => {
    const pending = data.pendingFavoriteNotif;
    if (!pending) return;
    setData(prev => ({ ...prev, pendingFavoriteNotif: null }));
    handleNotificationClick(pending);
  }, [data.pendingFavoriteNotif]);

  const showToast = (msg) => {
    setFavoriteToast(msg);
    setTimeout(() => setFavoriteToast(null), 3000);
  };

  const handleAddFavorite = async () => {
    const payload = favoritePrompt;
    setFavoritePrompt(null);
    if (!payload?.family_id || !window.DB) return;
    const ok = await window.DB.addFavoriteFamily(data.uid, payload.family_id);
    if (ok) showToast(t('fav_added'));
  };

  // One-tap join: the callable creates the request and approves the match, and
  // the soldier_hosting_searches listener drops the new card into the list.
  const handleJoinHosting = async () => {
    const hostingId = favoriteHosting?.hosting_id;
    if (!hostingId || joiningHosting) return;
    setJoiningHosting(true);
    try {
      const fn = firebase.functions().httpsCallable('joinFavoriteHosting');
      const res = await fn({ hosting_id: hostingId });
      const d = res.data || {};
      setFavoriteHosting(null);
      if (d.success) {
        showToast(t('fav_join_success'));
      } else {
        showToast(
          d.reason === 'full' ? t('fav_join_full')
          : d.reason === 'has_request' ? t('fav_join_has_request')
          : d.reason === 'gone' ? t('fav_hosting_gone')
          : t('fav_join_error')
        );
      }
    } catch (e) {
      console.error('Join favorite hosting error:', e);
      setFavoriteHosting(null);
      showToast(t('fav_join_error'));
    } finally {
      setJoiningHosting(false);
    }
  };

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-10">
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favoriteIds={data.favorite_families || []}
        uid={data.uid}
      />
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => window.DB && window.DB.markAllNotificationsRead(data.uid)}
        onMarkRead={(id) => window.DB && window.DB.markNotificationRead(id)}
        uid={data.uid}
        telegramConnected={!!data.telegram_chat_id}
        onNotificationClick={handleNotificationClick}
      />

      <FavoriteHostingModal
        payload={favoriteHosting}
        onClose={() => setFavoriteHosting(null)}
        onJoin={handleJoinHosting}
        joining={joiningHosting}
      />

      <ConfirmDialog
        isOpen={!!favoritePrompt}
        title={t('fav_prompt_title')}
        message={favoritePrompt ? t('fav_prompt_sub', favoritePrompt.family_name || '') : ''}
        confirmLabel={t('fav_yes')}
        cancelLabel={t('fav_no')}
        onConfirm={handleAddFavorite}
        onCancel={() => setFavoritePrompt(null)}
        icon={(
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center text-amber-400">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
        )}
      />

      {favoriteToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-gray-900 text-white text-sm font-semibold shadow-lg animate-fade-in text-center max-w-[90vw]" style={{ zIndex: 9998 }}>
          {favoriteToast}
        </div>
      )}
      <AppHeader
        eyebrow={t('s15_hi')}
        title={soldierName}
        profileAction={(
          <button onClick={onProfile} className="app-icon-btn" title={t('s15_landing_profile_title')} aria-label={t('s15_landing_profile_title')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
            </svg>
          </button>
        )}
        onNotifications={() => setShowNotifications(true)}
        notificationsCount={window.visibleNotifications(notifications).filter(n => !n.read).length}
        onFavorites={() => setShowFavorites(true)}
        onLogout={onLogout}
      />

      <div className="px-5 mt-8 space-y-6 max-w-md mx-auto">
        {/* Welcome Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('s15_landing_welcome_title')}
          </h1>
          <p className="text-sm text-warm-500 font-medium">
            {t('s15_landing_welcome_subtitle')}
          </p>
        </div>

        {/* ── New Request CTA (Always at the top) ── */}
        <button
          onClick={handleNewRequestClick}
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

        {/* ── Active Requests List (Only if there are requests) ── */}
        {hasRequests && (
          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold text-gray-900 border-b border-warm-100 pb-2">
              {t('s15_active_requests')}
            </h2>
            <div className="flex flex-col gap-3">
              {data.requests.map(req => (
                <ActiveRequestCard
                  key={req.id}
                  req={req}
                  onOpen={(bundle) => { setActiveMatchBundle(bundle); setActiveRequest(req); }}
                  onEdit={(r) => onEditRequest(r)}
                  onCancel={async (id) => {
                    setData(prev => ({
                      ...prev,
                      requests: (prev.requests || []).filter(r => r.id !== id)
                    }));
                    if (window.db) {
                      try {
                        const fn = firebase.functions().httpsCallable('cancelSoldierRequest');
                        await fn({ request_id: id });
                      } catch (e) {
                        console.error('Cancel request error:', e);
                      }
                    }
                  }}
                  lang={lang}
                  t={t}
                />
              ))}
            </div>
          </div>
        )}

        <SearchStatusSheet
          request={activeRequest}
          seed={activeMatchBundle}
          soldierName={soldierName}
          soldierData={data}
          onClose={() => { setActiveRequest(null); setActiveMatchBundle(null); }}
          onEdit={() => { setActiveRequest(null); onEditRequest(activeRequest); }}
          onCancel={async (id) => {
            setActiveRequest(null);
            setActiveMatchBundle(null);
            setData(prev => ({ ...prev, requests: (prev.requests || []).filter(r => r.id !== id) }));
            if (window.db) {
              try {
                const fn = firebase.functions().httpsCallable('cancelSoldierRequest');
                await fn({ request_id: id });
              } catch (e) {
                console.error('Cancel request error:', e);
              }
            }
          }}
          onRematch={async (req, reason, matchId) => {
            setData(prev => ({
              ...prev,
              requests: (prev.requests || []).map(r => r.id === req.id ? { ...r, status: 'searching', is_match: false } : r),
            }));
            if (window.db && matchId) {
              try {
                const fn = firebase.functions().httpsCallable('requestRematch');
                await fn({ match_id: matchId, is_permanent: false });
              } catch (e) {
                console.error('Rematch error:', e);
              }
            }
          }}
          onViewMap={(family) => { setActiveRequest(null); setActiveMatchBundle(null); onViewMatches(activeRequest.id, family); }}
        />
        
        <PreferencesPromptModal
          isOpen={showPrefModal}
          context="first_request"
          onNow={() => {
            setShowPrefModal(false);
            setData(prev => ({ ...prev, pendingNewRequest: true }));
            onFillPreferences();
          }}
          onLater={() => setShowPrefModal(false)}
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
  const hash = String(familyId ?? 0).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const grad = gradients[hash % gradients.length];

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

/* StorySeen — client-side (localStorage-only, no Firestore) tracking of which
   families' story albums a soldier has already opened, so the story ring can
   render colored (unseen) vs. gray (seen) without any extra reads. */
const STORY_SEEN_KEY = 'memulaim_stories_seen'; // { [familyId]: lastSeenEpochMs }

const readStorySeenMap = () => {
  try { return JSON.parse(localStorage.getItem(STORY_SEEN_KEY)) || {}; }
  catch (e) { return {}; }
};

window.StorySeen = {
  // 'none' | 'unseen' | 'seen'
  getRingState(family) {
    if (!family?.storiesCount) return 'none';
    const lastSeen = readStorySeenMap()[family.id];
    return (lastSeen && lastSeen >= (family.storiesUpdatedAt || 0)) ? 'seen' : 'unseen';
  },
  markSeen(familyId) {
    const seenMap = readStorySeenMap();
    seenMap[familyId] = Date.now();
    try { localStorage.setItem(STORY_SEEN_KEY, JSON.stringify(seenMap)); } catch (e) {}
  },
};

/* —— Mock host-family data (neighbourhood-level coords for privacy) —— */
window.MAP_FAMILIES = [
  {
    id: 2, name: 'משפחת כהן', city: 'קריית אתא',
    lat: 32.8072, lng: 35.1073,
    kosher: 'mehadrin', shabbat: 'keeps', capacity: 2, occupied: 2,
    canSleep: true, canTransport: false, hasPets: false,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['quiet', 'shabbat_atm'],
    rating: 4.7,
    shortDescription: 'בית משפחתי רגוע עם מנהגי שבת מסורתיים',
    vibe: 'בית שקט ומסורתי עם קידוש, זמירות ושולחן שבת מלא אהבה. שמחים לתת לכם בית בשישי.',
    phoneDisplay: '+972528123987',
    waDigits: '972528123987',
    imageColor: '#f7d1b5',
  },
  {
    id: 3, name: 'משפחת גולן', city: 'נשר',
    lat: 32.7730, lng: 35.0460,
    kosher: 'none', shabbat: 'none', capacity: 4, occupied: 0,
    canSleep: false, canTransport: true, hasPets: false,
    hostingTypes: ['friday_dinner'],
    tags: ['food', 'spacious'],
    rating: 4.8,
    shortDescription: 'בית פתוח עם מטבח גדול ועוגת שבת טעימה',
    vibe: 'מטבח גדול, אוכל בשפע ושולחן פתוח לכולם. לא דתיים אבל הלב גדול ותמיד שמחים לארח.',
    phoneDisplay: '+972523456789',
    waDigits: '972523456789',
    imageColor: '#fff1e5',
  },
  {
    id: 4, name: 'משפחת אברהם', city: 'חיפה — נווה שאנן',
    lat: 32.8021, lng: 35.0018,
    kosher: 'separated', shabbat: 'traditional', capacity: 3, occupied: 1,
    canSleep: true, canTransport: false, hasPets: false,
    hostingTypes: ['shabbat_lunch'],
    tags: ['multilingual', 'spacious'],
    rating: 4.6,
    shortDescription: 'אירוח משפחתי בשפה עברית ואנגלית',
    vibe: 'דוברי עברית ואנגלית, בית מרווח ואווירה נינוחה. תמיד מקום לעוד חייל סביב השולחן.',
    phoneDisplay: '+972527654321',
    waDigits: '972527654321',
    imageColor: '#f9efe4',
  },
  {
    id: 5, name: 'משפחת שמיר', city: 'קריית ביאליק',
    lat: 32.8350, lng: 35.0850,
    kosher: 'mehadrin', shabbat: 'keeps', capacity: 2, occupied: 1,
    canSleep: false, canTransport: false, hasPets: false,
    hostingTypes: ['friday_dinner'],
    tags: ['kids', 'shabbat_atm'],
    rating: 5.0,
    shortDescription: 'בית שמח עם אווירה משפחתית וחלבית',
    vibe: 'בית שמח עם ילדים קטנים ואווירת שבת מלאה. שרים, מספרים סיפורים ואוהבים לארח חיילים.',
    phoneDisplay: '+972527890123',
    waDigits: '972527890123',
    imageColor: '#f1dcc8',
  },
  {
    id: 6, name: 'משפחת פרץ', city: 'טירת כרמל',
    lat: 32.7608, lng: 34.9700,
    kosher: 'separated', shabbat: 'traditional', capacity: 5, occupied: 2,
    canSleep: true, canTransport: true, hasPets: true,
    hostingTypes: ['friday_dinner', 'shabbat_lunch'],
    tags: ['food', 'pets', 'spacious'],
    rating: 4.5,
    shortDescription: 'בית גדול ומסביר פנים עם מקום למנוחה אחרי הארוחה',
    vibe: 'בית גדול ומסביר פנים עם כלב חמוד ושולחן ארוך. יש מקום לכולם — מרחק הליכה מהבסיס.',
    phoneDisplay: '+972523210987',
    waDigits: '972523210987',
    imageColor: '#f3e2d3',
  },
];


/* ———————————————————————————————————————————
   StoryViewer — fullscreen tap-through viewer for a family's story album.
   No external gesture library — plain pointer events (unified mouse+touch).
————————————————————————————————————————————— */
function StoryViewer({ family, onClose, onSeeHostings }) {
  const { t, isRTL } = useLang();

  const stories = React.useMemo(
    () => [...(family?.stories || [])].sort((a, b) => a.order - b.order),
    [family]
  );

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loadedMap, setLoadedMap] = useState({});
  const [errorMap, setErrorMap] = useState({});
  const [dragY, setDragY] = useState(0);

  const containerRef = useRef(null);
  const pointerRef = useRef(null); // { startX, startY, timer }

  const atEnd = index >= stories.length;
  const current = stories[index];

  const prefersReducedMotion = () =>
    typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reset whenever a different family's viewer opens.
  useEffect(() => {
    setIndex(0);
    setLoadedMap({});
    setErrorMap({});
    setDragY(0);
  }, [family?.id]);

  // Mark seen, lock background scroll, and handle Escape — only while open.
  useEffect(() => {
    if (!family) return;
    window.StorySeen.markSeen(family.id);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [family?.id]);

  const goNext = () => setIndex(i => Math.min(i + 1, stories.length));
  const goPrev = () => setIndex(i => Math.max(i - 1, 0));

  // Auto-advance 5s after the current photo has actually finished loading —
  // never while paused (long-press), at the end screen, or under
  // prefers-reduced-motion (disabled entirely there, not just faster).
  useEffect(() => {
    if (!family || atEnd || paused || prefersReducedMotion()) return;
    if (!current || !loadedMap[current.id]) return;
    const timer = setTimeout(goNext, 5000);
    return () => clearTimeout(timer);
  }, [family, index, paused, loadedMap, current, atEnd]);

  // Preload the next photo's full-resolution image.
  useEffect(() => {
    const next = stories[index + 1];
    if (next?.url) { const img = new Image(); img.src = next.url; }
  }, [index, stories]);

  // A photo that failed to load is skipped automatically, not stuck on.
  useEffect(() => {
    if (current && errorMap[current.id]) goNext();
  }, [current, errorMap]);

  if (!family) return null;

  const handlePointerDown = (e) => {
    pointerRef.current = { startX: e.clientX, startY: e.clientY };
    pointerRef.current.timer = setTimeout(() => {
      if (pointerRef.current) { pointerRef.current.isLongPress = true; setPaused(true); }
    }, 200);
  };

  const handlePointerMove = (e) => {
    if (!pointerRef.current) return;
    const dy = e.clientY - pointerRef.current.startY;
    if (dy > 0) setDragY(dy);
  };

  const handlePointerUp = (e) => {
    if (!pointerRef.current) return;
    clearTimeout(pointerRef.current.timer);
    const { startX, startY, isLongPress } = pointerRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    pointerRef.current = null;
    setPaused(false);

    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { onClose(); return; }
    setDragY(0);
    if (isLongPress) return; // releasing a long-press just resumes, no navigation
    if (Math.abs(dx) > 40) return; // a horizontal drag isn't a tap — ignore

    const rect = containerRef.current.getBoundingClientRect();
    const relX = (startX - rect.left) / rect.width;
    if (relX < 1 / 3 || relX > 2 / 3) {
      const tappedStart = relX < 1 / 3;
      const goForward = isRTL ? tappedStart : !tappedStart;
      if (goForward) goNext(); else goPrev();
    }
  };

  return ReactDOM.createPortal(
    <div
      ref={containerRef}
      className="story-viewer"
      dir={isRTL ? 'rtl' : 'ltr'}
      style={dragY ? { transform: `translateY(${dragY}px)`, opacity: Math.max(1 - dragY / 400, 0.4) } : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <div className="story-viewer-progress">
        {stories.map((s, i) => (
          <div key={s.id} className="story-viewer-progress-track">
            <div className={clsx(
              'story-viewer-progress-fill',
              i < index && 'complete',
              i === index && !atEnd && 'active',
              i === index && !atEnd && paused && 'paused'
            )} />
          </div>
        ))}
      </div>

      <div className="story-viewer-chrome-top">
        <span className="story-viewer-family-name">{family.name}</span>
        <button
          className="story-viewer-close"
          onClick={onClose}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
          aria-label={t('close_label')}
        >×</button>
      </div>

      {!atEnd && current && (
        <div className="story-viewer-frame">
          {!loadedMap[current.id] && !errorMap[current.id] && (
            <div className="recipe-skeleton story-viewer-skeleton" />
          )}
          <img
            key={current.id}
            src={current.url}
            alt={current.alt || current.caption || family.name}
            className="story-viewer-image"
            style={{ opacity: loadedMap[current.id] ? 1 : 0 }}
            onLoad={() => setLoadedMap(m => ({ ...m, [current.id]: true }))}
            onError={() => setErrorMap(m => ({ ...m, [current.id]: true }))}
          />
          {current.caption && <p className="story-viewer-caption">{current.caption}</p>}
        </div>
      )}

      {atEnd && (
        <div className="story-viewer-end">
          <p className="story-viewer-end-title">{family.name}</p>
          <button
            className="story-viewer-cta"
            onClick={() => onSeeHostings(family)}
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            {t('story_viewer_cta')}
          </button>
        </div>
      )}
    </div>,
    document.body
  );
}

/* ———————————————————————————————————————————
   FamilyInfoCard — compact details beside the map
————————————————————————————————————————————— */
/* mapFamilyToInfoCard — turns a raw `families` document (host* field names) into
   the shape FamilyInfoCard expects. Pass the matching `family_hostings` document
   to fill in capacity/occupancy; `extra` merges on top (e.g. compromise_notes). */
function mapFamilyToInfoCard(familyId, d, hosting = {}, extra = {}) {
  const rawPhone = (d.hostPhone || '').replace(/\D/g, '');
  const waDigits = rawPhone.startsWith('0') ? '972' + rawPhone.slice(1) : rawPhone;
  const capacity = parseInt(hosting.soldiers) || null;
  const occupied = (hosting.guests || []).reduce((s, g) => s + (g.groupSize || 1), 0) || hosting.occupied || 0;
  return {
    id: familyId,
    name: d.hostName,
    city: d.hostCity,
    shabbat: d.hostShabbat,
    kosher: d.hostKosher,
    hasPets: d.hasPets,
    vibe: d.hostVibe,
    shortDescription: d.hostVibe ? d.hostVibe.slice(0, 100) : null,
    phoneDisplay: d.hostPhone,
    waDigits,
    lat: d.hostLat,
    lng: d.hostLng,
    capacity,
    occupied,
    profile_img_url: d.profile_img_url,
    img_urls: d.img_urls,
    stories: d.stories,
    storiesCount: d.storiesCount,
    storiesUpdatedAt: d.storiesUpdatedAt,
    numKids: d.hostNumKids,
    kidsAgeRange: d.hostKidsAgeRange,
    kidsAgeRangeOther: d.hostKidsAgeRangeOther,
    fridayDish: d.hostFridayDish,
    afterMeal: d.hostAfterMeal,
    afterMealOther: d.hostAfterMealOther,
    fridayTradition: d.hostFridayTradition,
    moreInfo: d.hostMoreInfo,
    ...extra,
  };
}

function FamilyInfoCard({ family, onClose, className = '' }) {
  const { t, lang } = useLang();
  const [showViewer, setShowViewer] = useState(false);
  const hasStories = (family.stories || []).length > 0;

  const koshLabel = family.kosher === 'mehadrin' ? t('map_meh')
    : family.kosher === 'separated' ? t('map_kosh') : t('map_none');
  const shabLabel = family.shabbat === 'keeps' ? t('map_obs')
    : family.shabbat === 'traditional' ? t('map_trad') : t('map_sec');

  const afterMealLabels = {
    board: lang === 'he' ? 'משחק קופסא' : 'Board games',
    talk:  lang === 'he' ? 'שיחה ארוכה סביב השולחן' : 'A long chat around the table',
    tv:    lang === 'he' ? 'סדרה מול הטלוויזיה' : 'Watching a show',
  };
  const kidsAgeLabel = family.kidsAgeRange === 'other'
    ? (family.kidsAgeRangeOther || (lang === 'he' ? 'אחר' : 'Other'))
    : family.kidsAgeRange;
  const aboutLines = [
    family.numKids          && { icon: '👨‍👩‍👧', label: lang === 'he' ? 'כמה ילדים בבית' : 'Kids at home', value: family.numKids },
    kidsAgeLabel             && { icon: '🧒', label: lang === 'he' ? 'טווח גילאים' : 'Age range', value: kidsAgeLabel },
    family.fridayDish       && { icon: '🍽️', label: lang === 'he' ? 'מאכל קבוע בשישי' : 'Regular Friday dish', value: family.fridayDish },
    (family.afterMeal || []).length > 0 && {
      icon: '🎲',
      label: lang === 'he' ? 'אוהבים לעשות אחרי הארוחה' : 'Love doing after the meal',
      value: family.afterMeal.map(v => v === 'other' ? (family.afterMealOther || (lang === 'he' ? 'אחר' : 'Other')) : (afterMealLabels[v] || v)).join(', '),
    },
    family.fridayTradition  && { icon: '🕯️', label: lang === 'he' ? 'מסורת שישי' : 'Friday tradition', value: family.fridayTradition },
    family.moreInfo          && { icon: '📝', label: lang === 'he' ? 'עוד לספר' : 'Anything else', value: family.moreInfo },
  ].filter(Boolean);

  const openWhatsApp = () => {
    window.open(`https://wa.me/${family.waDigits}`, '_blank');
  };
  const makeCall = () => {
    window.location.href = `tel:${family.phoneDisplay}`;
  };

  const tags = [];
  if (family.shabbat === 'keeps') tags.push({ label: t('map_obs'), cls: 'family-info-tag-shabbat', icon: <ShabbatIcon className="w-3.5 h-3.5" /> });
  else if (family.shabbat === 'traditional') tags.push({ label: t('map_trad'), cls: 'family-info-tag-shabbat', icon: <ShabbatIcon className="w-3.5 h-3.5" /> });
  if (family.kosher === 'mehadrin') tags.push({ label: t('map_meh'), cls: 'family-info-tag-kosher', icon: <StarOfDavidIcon className="w-3.5 h-3.5" /> });
  else if (family.kosher === 'separated') tags.push({ label: t('map_kosh'), cls: 'family-info-tag-kosher', icon: <StarOfDavidIcon className="w-3.5 h-3.5" /> });
  if (family.hasPets) tags.push({ label: t('vibe_pets'), cls: 'family-info-tag-pets', icon: <PawIcon className="w-3.5 h-3.5" /> });

  return (
    <aside className={`family-info-card ${className}`}>
      <div className="family-info-card-header">
        <div
          className={clsx(
            'family-info-card-avatar-ring',
            hasStories && 'cursor-pointer',
            window.StorySeen.getRingState(family) === 'unseen' && 'story-ring-unseen',
            window.StorySeen.getRingState(family) === 'seen' && 'story-ring-seen'
          )}
          onClick={hasStories ? () => setShowViewer(true) : undefined}
          role={hasStories ? 'button' : undefined}
          aria-label={hasStories ? t('story_ring_view_label') : undefined}
        >
          <div className="family-info-card-avatar-ring-gap">
            <div className="family-info-card-avatar" style={{ backgroundColor: family.imageColor || '#f3e2d3' }}>
              <img src={family.profile_img_url || (family.img_urls && family.img_urls[0]) || familyAvatarUrl(family.imageColor, family.id)} alt={family.name} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2>{family.name}</h2>
          <p>{family.city} &middot; {shabLabel}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="family-info-card-close"
            aria-label={t('close_label')}
          >&times;</button>
        )}
      </div>

      <p className="family-info-card-description">{family.shortDescription}</p>

      {tags.length > 0 && (
        <div className="family-info-tags">
          {tags.map(tag => (
            <span key={tag.label} className={`family-info-tag ${tag.cls}`}>
              {tag.icon} {tag.label}
            </span>
          ))}
        </div>
      )}

      {aboutLines.length > 0 ? (
        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl mt-1 mb-1 space-y-1.5">
          {aboutLines.map((l, i) => (
            <p key={i} className="text-xs text-warm-600 leading-relaxed">
              <span className="me-1">{l.icon}</span>
              <span className="font-bold text-warm-700">{l.label}: </span>
              <span>{l.value}</span>
            </p>
          ))}
        </div>
      ) : family.vibe ? (
        <p className="family-info-vibe">"{family.vibe}"</p>
      ) : null}

      <div className="family-info-grid">
        <div>
          <span>{t('kashrut_label')}</span>
          <strong>{koshLabel}</strong>
        </div>
        {family.capacity != null && (
          <div>
            <span>{t('s15_capacity')}</span>
            <strong>
              {(() => {
                const taken = family.occupied || 0;
                const free = family.capacity - taken;
                return `${free} ${t('s15_spots_free')} · ${taken} ${t('s15_spots_taken')}`;
              })()}
            </strong>
          </div>
        )}
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

      {showViewer && (
        <StoryViewer
          family={family}
          onClose={() => setShowViewer(false)}
          onSeeHostings={() => setShowViewer(false)}
        />
      )}
    </aside>
  );
}

/* ——————————————————————————————————————————— 
   MapView — Leaflet map with fuzzy markers
————————————————————————————————————————————— */
function FamilyStrip({ families, selectedId, onSelect, onHover }) {
  const { t } = useLang();
  const [viewerFamily, setViewerFamily] = useState(null);

  return (
    <div className="family-strip overflow-x-auto scrollbar-none pb-3 -mx-5 px-5">
      <div className="flex gap-4 items-start">
        {families.map(fam => {
          const hasStories = (fam.stories || []).length > 0;
          return (
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
              <div
                className={clsx(
                  'family-strip-avatar',
                  window.StorySeen.getRingState(fam) === 'unseen' && 'story-ring-unseen',
                  window.StorySeen.getRingState(fam) === 'seen' && 'story-ring-seen'
                )}
                onClick={hasStories ? (e) => { e.stopPropagation(); setViewerFamily(fam); } : undefined}
                role={hasStories ? 'button' : undefined}
                aria-label={hasStories ? t('story_ring_view_label') : undefined}
              >
                <div className="family-strip-avatar-inner">
                  <img src={fam.profile_img_url || (fam.img_urls && fam.img_urls[0]) || familyAvatarUrl(fam.imageColor, fam.id)} alt={fam.name} className="family-strip-image" style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                </div>
              </div>
              <p>{fam.name}</p>
            </button>
          );
        })}
      </div>

      <StoryViewer
        family={viewerFamily}
        onClose={() => setViewerFamily(null)}
        onSeeHostings={(fam) => { setViewerFamily(null); onSelect(fam); }}
      />
    </div>
  );
}

/* ———————————————————————————————————————————
   FavoritesPanel — the soldier's private favorite families.
   Opens from the star button in AppHeader, styled like NotificationsPanel.
————————————————————————————————————————————— */
function FavoritesPanel({ isOpen, onClose, favoriteIds = [], uid }) {
  const { t, lang } = useLang();
  const isRtl = lang === 'he';
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);   // family shown in the details modal
  const [pendingRemove, setPendingRemove] = useState(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!isOpen || !window.db) return;
    let canceled = false;
    const ids = favoriteIds || [];
    const missing = ids.filter(id => !cacheRef.current[id]);

    const load = async () => {
      if (missing.length > 0) setLoading(true);
      await Promise.all(missing.map(async (id) => {
        try {
          const doc = await window.db.collection('families').doc(id).get();
          if (doc.exists) cacheRef.current[id] = mapFamilyToInfoCard(doc.id, doc.data());
        } catch (e) {
          console.error('Error loading favorite family:', e);
        }
      }));
      if (canceled) return;
      setFamilies(ids.map(id => cacheRef.current[id]).filter(Boolean));
      setLoading(false);
    };
    load();
    return () => { canceled = true; };
  }, [isOpen, (favoriteIds || []).join(',')]);

  const handleRemove = async () => {
    const family = pendingRemove;
    setPendingRemove(null);
    if (!family || !window.DB) return;
    setSelected(null);
    // The soldier-doc listener in core/app.js pushes the new list back down,
    // which re-runs the effect above and drops the row.
    await window.DB.removeFavoriteFamily(uid, family.id);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40" dir={isRtl ? 'rtl' : 'ltr'} onClick={onClose}>
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
            {/* Small caret pointing up toward the star icon */}
            <div style={{ position: 'absolute', top: '-7px', left: '22px', width: '14px', height: '7px', overflow: 'visible' }}>
              <svg width="14" height="7" viewBox="0 0 14 7" fill="none">
                <path d="M0 7 L7 0 L14 7" fill="white" stroke="#e8e0d8" strokeWidth="1" strokeLinejoin="round"/>
                <path d="M1 7 L7 1 L13 7" fill="white" stroke="white" strokeWidth="1"/>
              </svg>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-warm-100 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900">{t('fav_title')}</h3>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-warm-100 text-warm-500 hover:bg-warm-200 transition-colors text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              {loading && families.length === 0 ? (
                <div className="flex justify-center gap-1.5 py-14">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              ) : families.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-14 text-center space-y-3 px-6">
                  <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center text-warm-400">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                    </svg>
                  </div>
                  <p className="text-warm-500 text-sm font-medium">{t('fav_empty')}</p>
                  <p className="text-warm-400 text-xs leading-relaxed">{t('fav_empty_sub')}</p>
                </div>
              ) : (
                families.map(fam => (
                  <div
                    key={fam.id}
                    className="px-4 py-3 border-b border-warm-50 flex items-center gap-3 bg-white hover:bg-warm-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(fam)}
                  >
                    <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border border-warm-200">
                      <img
                        src={fam.profile_img_url || (fam.img_urls && fam.img_urls[0]) || familyAvatarUrl(fam.imageColor, fam.id)}
                        alt={fam.name}
                        style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{fam.name}</p>
                      {fam.city && <p className="text-xs text-warm-500 truncate">{fam.city}</p>}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setPendingRemove(fam); }}
                      className="w-8 h-8 flex items-center justify-center rounded-full text-amber-400 hover:bg-amber-50 transition-colors flex-shrink-0"
                      aria-label={t('fav_remove_tooltip')}
                      title={t('fav_remove_tooltip')}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Family details — same card the soldier sees after a match is approved */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} className="max-w-md max-h-[93vh]">
        {selected && (
          <div className="space-y-3">
            <FamilyInfoCard family={selected} onClose={null} />
            <button
              onClick={() => setPendingRemove(selected)}
              className="w-full py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors"
            >
              {t('fav_remove_title')}
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={!!pendingRemove}
        danger
        title={t('fav_remove_confirm_title')}
        message={pendingRemove ? t('fav_remove_confirm_sub', pendingRemove.name) : ''}
        confirmLabel={t('fav_yes')}
        cancelLabel={t('fav_no')}
        onConfirm={handleRemove}
        onCancel={() => setPendingRemove(null)}
      />
    </>
  );
}

/* ———————————————————————————————————————————
   FavoriteHostingModal — opened from a `favorite_hosting_open` notification.
   Shows the family exactly as after an approved match, plus this hosting's
   details. `onJoin` is optional — without it the modal is view-only.
————————————————————————————————————————————— */
function FavoriteHostingModal({ payload, onClose, onJoin, joining = false }) {
  const { t } = useLang();
  const [family, setFamily] = useState(null);
  const [hosting, setHosting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!payload?.hosting_id || !window.db) return;
    let canceled = false;
    setLoading(true);
    setFamily(null);
    setHosting(null);
    Promise.all([
      window.db.collection('family_hostings').doc(payload.hosting_id).get(),
      payload.family_id
        ? window.db.collection('families').doc(payload.family_id).get()
        : Promise.resolve(null),
    ]).then(([hostingDoc, familyDoc]) => {
      if (canceled) return;
      const h = hostingDoc.exists ? hostingDoc.data() : null;
      setHosting(h);
      if (familyDoc?.exists) setFamily(mapFamilyToInfoCard(familyDoc.id, familyDoc.data(), h || {}));
      setLoading(false);
    }).catch(e => {
      console.error('Error loading favorite hosting:', e);
      if (!canceled) setLoading(false);
    });
    return () => { canceled = true; };
  }, [payload?.hosting_id, payload?.family_id]);

  if (!payload) return null;

  const { isFull } = hostingOccupancy(hosting);
  const gone = !loading && (!hosting || hosting.status === 'canceled');
  const full = !gone && hosting && (hosting.is_fully_booked || isFull);

  return (
    <Modal isOpen={!!payload} onClose={onClose} title={t('fav_hosting_title')} className="max-w-md max-h-[93vh]">
      {loading ? (
        <div className="flex justify-center gap-1.5 py-10">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : gone ? (
        <p className="py-8 text-center text-sm text-warm-500">{t('fav_hosting_gone')}</p>
      ) : (
        <div className="space-y-3">
          {family && <FamilyInfoCard family={family} onClose={null} />}

          <HostingDetailRows hosting={hosting} />

          {full && (
            <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-center">
              {t('fav_hosting_full')}
            </div>
          )}

          {onJoin && !full && (
            <Btn onClick={() => onJoin(hosting)} loading={joining}>
              {t('fav_join_btn')}
            </Btn>
          )}
        </div>
      )}
    </Modal>
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

      const ringState = window.StorySeen.getRingState(fam);
      const ringClass = ringState === 'unseen' ? ' story-ring-unseen' : ringState === 'seen' ? ' story-ring-seen' : '';
      const makeIcon = (selected, hovered) => L.divIcon({
        className: '',
        html: `<div class="host-marker-outer${selected ? ' selected' : hovered ? ' hovered' : ''}"><div class="host-marker-ring${ringClass}"><img class="host-marker-inner" src="${fam.profile_img_url || (fam.img_urls && fam.img_urls[0]) || familyAvatarUrl(fam.imageColor, fam.id)}" style="object-fit:cover; width:100%; height:100%; border-radius:50%;" alt="${fam.name}"/></div></div>`,
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
function S15Home({ data, setData, onNewRequest, onProfile, onFillPreferences, onBack, onLogout }) {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState(data.focusFamilyForMap || null);
  const [hovered, setHovered] = useState(null);
  const [showPrefModal, setShowPrefModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const soldierName = data.fullName || [data.firstName, data.lastName].filter(Boolean).join(' ') || '';
  const notifications = data.notifications || [];

  const handleNewRequestClick = () => {
    if (data.soldierPreferencesSkipped) {
      setShowPrefModal(true);
    } else {
      onNewRequest();
    }
  };

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
      // Use the real matched family if we have it (with lat/lng), otherwise fall back to mock
      const realFamily = data.focusFamilyForMap;
      filteredFamilies = realFamily
        ? [realFamily]
        : [MAP_FAMILIES[0]].filter(Boolean);
    } else {
      filteredFamilies = MAP_FAMILIES.filter(fam => {
        if (activeRequest.kosher && activeRequest.kosher !== 'none') {
          const kRank = { mehadrin: 2, separated: 1, none: 0 };
          if ((kRank[fam.kosher] ?? 0) < (kRank[activeRequest.kosher] ?? 0)) return false;
        }
        if (activeRequest.shabbat && activeRequest.shabbat !== 'none') {
          if (activeRequest.shabbat === 'keeps' && fam.shabbat !== 'keeps') return false;
          if (activeRequest.shabbat === 'traditional' && fam.shabbat === 'none') return false;
        }
        if (activeRequest.needSleep && !fam.canSleep) return false;
        if (!familyInRange(activeRequest, fam)) return false;
        return true;
      });

      // Show the closest families first when we know the soldier's location.
      if (activeRequest.lat != null && activeRequest.lng != null) {
        filteredFamilies = [...filteredFamilies].sort((a, b) => {
          const da = window.distanceKm(activeRequest.lat, activeRequest.lng, a.lat, a.lng);
          const db = window.distanceKm(activeRequest.lat, activeRequest.lng, b.lat, b.lng);
          return (da ?? Infinity) - (db ?? Infinity);
        });
      }
    }
  }

  const noRequests = requests.length === 0;
  const noMatches = !noRequests && filteredFamilies.length === 0;

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24 relative">
      <FavoritesPanel
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        favoriteIds={data.favorite_families || []}
        uid={data.uid}
      />
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => window.DB && window.DB.markAllNotificationsRead(data.uid)}
        onMarkRead={(id) => window.DB && window.DB.markNotificationRead(id)}
        uid={data.uid}
        telegramConnected={!!data.telegram_chat_id}
        onNotificationClick={(notif) => {
          // Favorites prompts are handled on S15Landing — hand the notification over.
          if (notif.type === 'favorite_prompt' || notif.type === 'favorite_hosting_open') {
            setData(prev => ({ ...prev, pendingFavoriteNotif: notif }));
            onBack();
            return;
          }
          const reqId = notif.payload?.request_id;
          const req = reqId
            ? (data.requests || []).find(r => r.id === reqId)
            : (data.requests || []).find(r => r.is_match);
          if (req) onBack(); // go back to S15Landing which will show the request sheet
        }}
      />
      <AppHeader
        eyebrow={lang === 'he' ? 'תוצאות חיפוש' : 'Search Results'}
        title={lang === 'he' ? 'משפחות מארחות' : 'Host Families'}
        onBack={onBack}
        profileAction={(
          <button onClick={onProfile} className="app-icon-btn" title={t('s15_landing_profile_title')} aria-label={t('s15_landing_profile_title')}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 256 256">
              <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"/>
            </svg>
          </button>
        )}
        onNotifications={() => setShowNotifications(true)}
        notificationsCount={window.visibleNotifications(notifications).filter(n => !n.read).length}
        onFavorites={() => setShowFavorites(true)}
        onLogout={onLogout}
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
            <Btn onClick={handleNewRequestClick} className="max-w-xs">{t('s15_landing_new_req_title')}</Btn>
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
            <Btn variant="secondary" onClick={handleNewRequestClick} className="max-w-xs">{t('update_request')}</Btn>
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
                    className="family-info-card-overlay"
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
        
        <PreferencesPromptModal
          isOpen={showPrefModal}
          context="first_request"
          onNow={() => {
            setShowPrefModal(false);
            setData(prev => ({ ...prev, pendingNewRequest: true }));
            onFillPreferences();
          }}
          onLater={() => setShowPrefModal(false)}
        />
      </div>
    </div>
  );
}


/* S15NewRequest — Form for soldiers to request accommodation */
var { useState } = React;

function S15NewRequest({ onBack, onSubmit, onCancel, data, setData }) {
  const { t, lang } = useLang();
  const initialRequest = data.editingRequest || {
    id: Date.now(),
    when: '',
    startTime: '',
    guestCount: 1,
    friendDietary: [],
    friendDietaryOther: '',
    petsComfort: data.pets === 'notok' || data.pets === 'allergy' ? 'no' : 'ok',
    shabbat: data.shabbatKeeps || 'none',
    kosher: data.kosher || 'none',
    duration: 'dinner',
    transport: false,
    needSleep: data.needsSleep || false,
    travelDistance: 10,
    location: data.unit || '',
    status: 'searching'
  };

  const sortedRequests = [...(data.requests || [])]
    .filter(r => r.id !== (data.editingRequest?.id))
    .sort((a, b) => {
      const aVal = typeof a.id === 'string' ? parseInt(a.id) : a.id;
      const bVal = typeof b.id === 'string' ? parseInt(b.id) : b.id;
      return bVal - aVal;
    });
  const mostRecentRequest = sortedRequests[0];

  const handleReuseRecent = () => {
    if (!mostRecentRequest) return;
    setRequest({
      ...mostRecentRequest,
      id: Date.now(),
      status: 'searching'
    });
  };

  const [request, setRequest] = useState(initialRequest);


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
        
        {(!data.editingRequest && mostRecentRequest) && (
          <div className="mb-6 bg-white border border-warm-200 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {lang === 'he' ? 'בקשה קודמת' : 'Previous Request'}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-900">
                  {mostRecentRequest.when ? new Date(mostRecentRequest.when).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }) : ''} | {mostRecentRequest.location || ''}
                </p>
                <p className="text-[11px] text-warm-500 mt-0.5">
                  {mostRecentRequest.guestCount} {lang === 'he' ? 'אורחים' : 'guests'} | {mostRecentRequest.duration === 'dinner' ? (lang === 'he' ? 'ארוחה בלבד' : 'dinner only') : (lang === 'he' ? 'שבת מלאה' : 'full shabbat')}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReuseRecent}
                className="px-4 py-2 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold rounded-xl hover:bg-brand-100 transition-all active:scale-[0.98] flex-shrink-0"
              >
                {lang === 'he' ? 'השתמש בבקשה הקודמת שלי' : 'Use My Previous Request'}
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <FridayDatePicker
            label={t('s15_when')}
            value={request.when}
            onChange={(val) => handleChange('when', val)}
          />

          <TimeSelect
            label={t('s15_arrival_time')}
            value={request.startTime}
            onChange={(val) => handleChange('startTime', val)}
            required
          />

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
              className="w-full h-2 py-3 bg-warm-200 rounded-lg appearance-none cursor-pointer accent-brand-500"
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
                value={request.shabbat || 'none'}
                onChange={(val) => handleChange('shabbat', val)}
                options={[
                  { value: 'keeps',       label: t('s7_yes'),        sub: t('s7_yes_s')   },
                  { value: 'traditional', label: t('s16_shab_trad'), sub: t('s7_trad_s') },
                  { value: 'none',        label: t('s7_no'),         sub: t('s7_no_s')    },
                ]}
              />
              <RadioGroup
                label={t('s15_kosher')}
                value={request.kosher || 'none'}
                onChange={(val) => handleChange('kosher', val)}
                options={[
                  { value: 'mehadrin',  label: t('s7_meh'),    sub: t('s7_meh_s')    },
                  { value: 'separated', label: t('s7_kosh_k'), sub: t('s7_kosh_k_s') },
                  { value: 'none',      label: t('s7_none'),   sub: t('s7_none_s')   },
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

          {/* ── Location + travel radius picker ── */}
          <AddressPicker
            label={t('radius_map_btn')}
            hint={t('radius_map_sub')}
            withRadius
            radiusKm={request.travelDistance || 10}
            onRadiusChange={(km) => handleChange('travelDistance', km)}
            value={request.lat ? {
              fullString: request.location || '',
              city: request.location || '',
              coordinates: { lat: request.lat, lng: request.lng },
            } : null}
            onChange={(addr) => {
              setRequest(prev => ({
                ...prev,
                lat: addr.coordinates?.lat,
                lng: addr.coordinates?.lng,
                location: addr.city || addr.fullString || prev.location,
                travelDistance: addr.radiusKm ?? prev.travelDistance,
              }));
            }}
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
var { useState, useRef } = React;

function S21SoldierProfile({ data, setData, onBack, onNewRequest, onEditRequest, onDeleteRequest, onViewMatches, onLogout }) {
  const { t, lang } = useLang();
  
  // Use local state for the form so edits are not global until saved
  const [form, setForm] = useState({
    fullName: data.fullName || '',
    phone: data.phone || '',
    bio: data.bio || '',
    kosher: data.kosher || 'separated',
    shabbat: data.shabbat || data.shabbatKeeps || 'none',
    allergies: data.allergies || [],
  });

  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ 
        ...prev, 
        avatarFile: file, 
        avatarPreview: URL.createObjectURL(file),
        removePhoto: false
      }));
    }
  };

  const handleSave = async () => {
    const hasPending = !!data.pendingNewRequest;
    
    // Upload image if present
    let profileUrl = null;
    if (form.avatarFile && window.DB && data.uid) {
      profileUrl = await window.DB.uploadProfileImage(data.uid, form.avatarFile, 'soldiers');
    }

    const { avatarFile, avatarPreview, removePhoto, ...restForm } = form;
    const updatedData = {
      ...restForm,
      ...(profileUrl ? { profile_img_url: profileUrl } : {}),
      ...(hasPending ? { soldierPreferencesSkipped: false, pendingNewRequest: false } : {}),
    };

    if (removePhoto && window.DB && !profileUrl) {
      if (data.profile_img_url) {
        await window.DB.deleteProfileImage(data.profile_img_url);
      }
      updatedData.profile_img_url = null;
    }

    if (window.DB && data.uid) {
      try {
        await window.DB.saveSoldierProfile(data.uid, updatedData);
      } catch (e) {
        alert("Error saving profile to database.");
      }
    }

    setData(prev => ({ ...prev, ...updatedData }));
    setSaved(true);
    if (hasPending) {
      setTimeout(() => onNewRequest(), 900);
    } else {
      setTimeout(() => setSaved(false), 2000);
    }
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
      if (req.kosher && req.kosher !== 'none') {
        const kRank = { mehadrin: 2, separated: 1, none: 0 };
        if ((kRank[fam.kosher] ?? 0) < (kRank[req.kosher] ?? 0)) return false;
      }
      if (req.shabbat && req.shabbat !== 'none') {
        if (req.shabbat === 'keeps' && fam.shabbat !== 'keeps') return false;
        if (req.shabbat === 'traditional' && fam.shabbat === 'none') return false;
      }
      if (req.needSleep && !fam.canSleep) return false;
      if (!familyInRange(req, fam)) return false;
      return true;
    }).length;
  };

  const requests = data.requests || [];

  return (
    <div className="screen-enter min-h-screen flex flex-col pb-12 bg-warm-50">
      <AppHeader 
        title={t('s15_landing_profile_title')} 
        onBack={onBack}
      />
      <div className="w-full max-w-md mx-auto px-5 space-y-6">
        
        {/* Profile Picture at the top (Circular Avatar with Edit overlay) */}
        <div className="flex flex-col items-center justify-center pt-4">
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <div onClick={() => fileInputRef.current?.click()} className="relative w-28 h-28 rounded-full cursor-pointer group shadow-md active:scale-95 transition-all">
            {(form.avatarPreview || data.profile_img_url) && !form.removePhoto ? (
              <img src={form.avatarPreview || data.profile_img_url} className="w-28 h-28 rounded-full object-cover border-2 border-white" alt="Avatar" />
            ) : (
              <div className="w-28 h-28 rounded-full bg-warm-100 flex items-center justify-center border border-dashed border-warm-300 group-hover:border-brand-200 transition-colors">
                <span className="text-3xl text-warm-500 font-bold">{(form.fullName || '?')[0]}</span>
              </div>
            )}
            <div className="absolute bottom-0 left-0 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all border border-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
          </div>
          {((form.avatarPreview || data.profile_img_url) && !form.removePhoto) && (
            <button 
              onClick={() => setForm(prev => ({ ...prev, removePhoto: true, avatarFile: null, avatarPreview: null }))}
              className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors bg-red-50 px-3 py-1 rounded-full border border-red-100 mt-3"
            >
              {t('remove_photo') || 'הסר תמונה'}
            </button>
          )}
        </div>

        {/* Personal Details Section */}
        <Card className="p-5 space-y-4">
          <h2 className="section-label">{t('s12_personal')}</h2>
          <Input label={t('s3_first')} value={form.fullName} onChange={setF('fullName')} />
          <Input label={t('s3_phone')} value={form.phone} onChange={setF('phone')} />
        </Card>

        {/* Preferences Section */}
        <Card className="p-5 space-y-4">
          <h2 className="section-label">{t('s12_prefs')}</h2>
          <RadioGroup 
            label={t('s7_kosh')} 
            value={form.kosher} 
            onChange={setF('kosher')}
            options={[
              { value:'mehadrin',  label:t('s7_meh'),    sub:t('s7_meh_s')    },
              { value:'separated', label:t('s7_kosh_k'), sub:t('s7_kosh_k_s') },
              { value:'none',      label:t('s7_none'),   sub:t('s7_none_s')   },
            ]}
          />
          <RadioGroup 
            label={t('s7_shab')} 
            value={form.shabbat} 
            onChange={setF('shabbat')}
            options={[
              { value:'keeps',       label:t('s7_yes'),        sub:t('s7_yes_s')   },
              { value:'traditional', label:t('s16_shab_trad'), sub:t('s7_trad_s') },
              { value:'none',        label:t('s7_no'),         sub:t('s7_no_s')    },
            ]}
          />
          <MultiCheck label={t('s9_title')} options={allergyOpts} values={form.allergies} onChange={setF('allergies')} />
        </Card>

        {/* Bio Section */}
        <Card className="p-5 space-y-4">
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
        <Btn onClick={onLogout} variant="danger" className="text-base py-4 shadow-sm mb-6">
          {t('logout')}
        </Btn>
      </div>
    </div>
  );
}


function SearchStatusSheet({ request, seed, onClose, onEdit, onCancel, onRematch, onViewMap, soldierName, soldierData }) {
  const { t, lang } = useLang();
  const [view, setView] = useState('status'); // 'status' or 'rematch'
  const [rematchReason, setRematchReason] = useState('');
  const [realMatch, setRealMatch] = useState(null);
  const [fullFamily, setFullFamily] = useState(null);
  const [hosting, setHosting] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!request?.id || !request.is_match) {
      setRealMatch(null); setFullFamily(null); setHosting(null); setConfirmed(false);
      return;
    }

    /* `seed` is whatever the card already read for this match. Applying it first
       means the sheet opens populated instead of blank while it re-reads for
       fresh capacity. Read here rather than in the dep list: the effect already
       re-runs on every open, which is exactly when a new seed arrives. */
    if (seed?.match) applyMatchBundle(seed);

    if (!window.db) return;
    let canceled = false;
    window.db.collection('active_matches')
      .where('soldier_request_id', '==', request.id)
      .where('status', 'in', ['pending_soldier_approval', 'approved'])
      .limit(1)
      .get()
      .then(async snap => {
        if (canceled || snap.empty) return;
        const match = { id: snap.docs[0].id, ...snap.docs[0].data() };
        setRealMatch(match);
        const bundle = await fetchMatchBundle(match);
        if (!canceled) applyMatchBundle(bundle);
      })
      .catch(e => console.error('Match fetch error:', e));

    return () => { canceled = true; };
  }, [request?.id, request?.is_match]);

  function applyMatchBundle(bundle) {
    if (bundle.match) setRealMatch(bundle.match);
    setHosting(bundle.hosting || null);
    if (bundle.familyId && bundle.family) {
      setFullFamily(mapFamilyToInfoCard(bundle.familyId, bundle.family, bundle.hosting || {}, {
        compromise_notes: bundle.match?.compromise_notes,
      }));
    }
  }

  if (!request) return null;

  // Real match: use fetched family data. Demo mode: fall back to mock families.
  const matchedFamily = fullFamily
    || (realMatch ? { name: realMatch.family_name, city: realMatch.family_city, compromise_notes: realMatch.compromise_notes } : null)
    || (request?.status === 'matched' ? window.MAP_FAMILIES?.[0] : null);

  /* request.status stays 'matched' after approval, so the match doc is the only
     thing that tells "needs your confirmation" apart from "confirmed".
     `confirmed` is the optimistic flag, reset on no_spot_left below. */
  const isApproved = realMatch?.status === 'approved' || confirmed;
  const subState = !realMatch ? 'loading' : isApproved ? 'confirmed' : 'awaiting_confirm';

  const statusKey = request.status !== 'matched'
    ? (request.status ? 'search_status_' + request.status : 'search_status_searching')
    : subState === 'confirmed' ? 'search_status_confirmed'
      : subState === 'awaiting_confirm' ? 'search_status_match_found'
        : 'search_status_matched';

  // When and where — city only, never the address.
  const dateLabel = window.formatHostingDate(hosting?.date || realMatch?.hosting_date, lang);
  /* Same rule as the card: a readable offer with no time set says so in the
     strip, which is also why the time row stays excluded below. */
  const timeLabel = window.formatHostingTimeLabel(hosting, t)
    || (hosting ? t('hosting_time_tbd') : '');
  const city = matchedFamily?.city || realMatch?.family_city || null;
  const hostingCanceled = !!hosting && hosting.status === 'canceled';
  const hostingMissing = !!realMatch?.host_offer_id && !hosting;

  const handleRematchSubmit = () => {
    onRematch(request, rematchReason, realMatch?.id);
    setView('status');
    setRematchReason('');
    onClose();
  };

  const handleConfirmArrival = async () => {
    if (!realMatch?.id || confirmed || realMatch.status === 'approved') return;
    setConfirmed(true); // optimistic — the sheet flips to "confirmed" immediately
    try {
      const fn = firebase.functions().httpsCallable('confirmMatch');
      const result = await fn({ match_id: realMatch.id });
      if (result.data?.no_spot_left) {
        setConfirmed(false); // spot was taken — real-time listener will show notification
      }
    } catch (e) {
      console.error('Confirm error:', e);
      setConfirmed(false);
    }
  };

  /* The pieces both sub-states share, in one place so the two orderings below
     stay honestly identical in content and differ only in sequence. */
  const whenWhereStrip = (
    <HostingWhenWhereStrip
      dateLabel={dateLabel}
      timeLabel={timeLabel}
      city={city}
      tone={hostingCanceled ? 'amber' : isApproved ? 'green' : 'brand'}
      ariaLabel={dateLabel && timeLabel && city
        ? t('card_confirmed_invite', dateLabel, timeLabel, city)
        : undefined}
    />
  );

  const compromiseNotes = matchedFamily?.compromise_notes?.length > 0 ? (
    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-1">
      {matchedFamily.compromise_notes.map((note, i) => (
        <p key={i} className="text-xs text-amber-800">{note}</p>
      ))}
    </div>
  ) : null;

  /* A canceled or vanished offer replaces the detail rows with an explanation —
     the family card and every action stay, so the soldier can still rematch. */
  const hostingBlock = hostingCanceled || hostingMissing ? (
    <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
      {hostingCanceled ? t('hosting_canceled_note') : t('fav_hosting_gone')}
    </div>
  ) : (
    /* Date and time live in the strip above — repeating them here reads as a bug. */
    <HostingDetailRows hosting={hosting} exclude={['date', 'time']} />
  );

  const otherActions = (
    <div className="flex flex-col gap-1.5 pt-3 border-t border-warm-100">
      <p className="text-[11px] font-bold uppercase tracking-wider text-warm-400">{t('sheet_other_actions')}</p>
      <Btn onClick={() => { onViewMap(matchedFamily); onClose(); }} variant="outline" className="!py-2.5 flex items-center justify-center gap-1.5 text-sm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        {t('view_map')}
      </Btn>
      {/* Promoted when the offer fell through — styling only, never gated. */}
      <Btn onClick={() => setView('rematch')} variant={hostingCanceled || hostingMissing ? 'primary' : 'outline'} className="!py-2.5 text-sm">{t('request_rematch')}</Btn>
      <Btn onClick={onEdit} variant="outline" className="!py-2.5 text-sm">{t('edit_request')}</Btn>
      <button onClick={() => onCancel(request.id)} className="w-full py-2 text-sm text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">{t('cancel_request')}</button>
    </div>
  );

  return (
    <Modal isOpen={!!request} onClose={onClose} title={t(statusKey)} className="max-w-md max-h-[93vh]">
      <div className="space-y-3">
        {view === 'status' ? (
          <>
            {/* Searching state */}
            {request.status === 'searching' && (
              <div className="text-center py-4">
                {request.notification === 'no_spot_left' && (
                  <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800 text-right">
                    {t('notif_no_spot_left')}
                  </div>
                )}
                <div className="flex justify-center gap-1.5 mb-4">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <p className="text-sm text-warm-500">{t('s15_searching_sub')}</p>
              </div>
            )}

            {/* Matched state. Before approval the order is decision-first: when
                and where, then any caveat, then the offer, then the family, then
                the CTA. After approval it becomes an invitation: the confirmed
                banner, then contact, then the details needed on the day. */}
            {request.status === 'matched' && matchedFamily && (
              <div className="space-y-3 animate-enter">
                {isApproved && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-bold">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>{t('sheet_confirmed_pill')}</span>
                  </div>
                )}

                {whenWhereStrip}

                {/* A caveat about this particular match is a decision input
                    before approval, and only background information after. */}
                {!isApproved && compromiseNotes}
                {!isApproved && hostingBlock}

                <FamilyInfoCard family={matchedFamily} onClose={null} />

                {isApproved && hostingBlock}
                {isApproved && compromiseNotes}

                {!isApproved && realMatch && (
                  <div className="sticky bottom-0 -mx-5 -mb-4 px-5 pt-3 pb-4 bg-white/95 backdrop-blur border-t border-warm-100">
                    <p className="text-[12px] text-warm-500 mb-2 text-center">{t('sheet_confirm_hint')}</p>
                    <button
                      onClick={handleConfirmArrival}
                      className="w-full py-3.5 rounded-2xl text-base font-bold transition-all duration-300 bg-brand-500 text-white hover:bg-brand-600 active:scale-[0.98] shadow-md"
                    >
                      {t('sheet_confirm_cta')}
                    </button>
                  </div>
                )}

                {otherActions}
              </div>
            )}

            {/* Searching state actions */}
            {request.status === 'searching' && (
              <div className="flex flex-col gap-3 pt-2">
                <Btn onClick={onEdit} variant="outline">{t('edit_request')}</Btn>
                <button onClick={() => onCancel(request.id)} className="w-full py-3 text-red-600 font-bold hover:bg-red-50 rounded-xl transition-colors">{t('cancel_request')}</button>
              </div>
            )}
          </>
        ) : (
          /* Rematch view */
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
              <Btn onClick={() => setView('status')} variant="outline" className="flex-1">{t('back')}</Btn>
              <Btn onClick={handleRematchSubmit} className="flex-1">{t('rematch_submit')}</Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

window.FavoritesPanel = FavoritesPanel;
window.FavoriteHostingModal = FavoriteHostingModal;
window.mapFamilyToInfoCard = mapFamilyToInfoCard;
window.S15Landing = S15Landing;
window.S15Home = S15Home;
window.S15NewRequest = S15NewRequest;
window.S21SoldierProfile = S21SoldierProfile;
window.SearchStatusSheet = SearchStatusSheet;
