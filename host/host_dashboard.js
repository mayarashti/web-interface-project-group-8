/* S19 Host Home (Unified Dashboard) */

var { useState } = React;

/* ── Soldier profile card modal ── */
function SoldierProfileModal({ guest, onClose }) {
  const { t } = useLang();
  if (!guest) return null;

  const allergyMap = {
    gluten: t('a_gluten'), lactose: t('a_lactose'), nuts: t('a_nuts'),
    peanuts: t('a_peanuts'), veg: t('a_veg'), vegan: t('a_vegan'),
    fish: t('a_fish'), other: t('a_other'),
  };
  const allergyList = (guest.allergies || []).map(a => allergyMap[a]).filter(Boolean).join(', ') || t('s12_no_allerg');
  const koshMap = { mehadrin: t('map_meh'), separated: t('map_kosh'), none: t('map_none') };
  const logisticsItems = [
    (guest.needSleep || guest.needsSleep) && t('s12_sleep'),
    guest.needsTransport  && t('guest_needs_transport'),
    guest.walkDistance    && t('guest_walk_dist'),
  ].filter(Boolean);

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-start flex-1 ms-2">{value}</span>
    </div>
  );

  return (
    <Modal isOpen={!!guest} onClose={onClose} title={guest.name} className="max-w-md max-h-[93vh]">
      <div className="space-y-3">
        {/* Avatar + unit + group — compact horizontal row */}
        <div className="flex items-center gap-3 pb-3 border-b border-warm-100">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-sm"
            style={{ background: guest.avatarColor || '#6f8f72' }}
          >
            {(guest.name || '?')[0]}
          </div>
          <div>
            <p className="text-xs text-warm-500">
              {[guest.unit, guest.age ? t('s3_age') + ' ' + guest.age : null].filter(Boolean).join(' · ')}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-0.5">
              <span className="me-1">👥</span>
              {(guest.groupSize || 1) > 1
                ? t('guest_group_with', (guest.groupSize || 1) - 1)
                : t('guest_group_solo')}
            </p>
          </div>
        </div>

        {/* Dietary preferences */}
        <div>
          <p className="section-label mb-1.5">{t('s12_prefs')}</p>
          <Row label={t('s12_kosh')}   value={koshMap[guest.kosher] || t('map_none')} />
          <Row label={t('s12_allerg')} value={allergyList} />
        </div>

        {/* Logistics */}
        {logisticsItems.length > 0 && (
          <div>
            <p className="section-label mb-1.5">{t('guest_logistics')}</p>
            <div className="flex flex-wrap gap-1.5">
              {logisticsItems.map(item => (
                <span key={item} className="px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {guest.bio && (
          <p className="text-sm text-warm-600 italic leading-relaxed border-s-2 border-brand-200 ps-3">
            "{guest.bio}"
          </p>
        )}

        {/* WhatsApp */}
        {guest.phone && (
          <a
            href={`https://wa.me/972${guest.phone.replace(/\D/g, '').replace(/^0/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#1ebd5b] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.695 2.54 2.599-.681c.887.486 1.856.741 2.839.741h.001c3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.769-5.767zm3.387 8.192c-.146.411-.849.761-1.157.808-.285.045-.653.075-1.047-.052-.244-.078-.553-.189-.912-.345-1.528-.66-2.518-2.213-2.593-2.313-.076-.101-.617-.82-.617-1.564 0-.743.393-1.109.531-1.258.143-.15.311-.188.413-.188h.27c.086 0 .201-.033.31.233l.423 1.027c.038.09.064.195.004.314-.06.12-.09.195-.181.3-.09.105-.19.233-.27.315-.088.09-.181.188-.076.368.106.181.469.773.999 1.246.684.609 1.261.799 1.442.889.181.09.286.075.391-.045.105-.12.451-.525.571-.705.12-.18.24-.15.405-.09.166.06 1.054.496 1.235.586.181.09.301.135.346.21.046.075.046.435-.1.846z"/></svg>
            WhatsApp
          </a>
        )}
      </div>
    </Modal>
  );
}

function S19HostHome({ data, setData, onProfile, onLogout }) {
  const { t, lang } = useLang();
  const hostings = data.hostings || [];
  const [selectedHosting,     setSelectedHosting]     = useState(null);
  const [selectedGuest,       setSelectedGuest]       = useState(null);
  const [guestSourceHosting,  setGuestSourceHosting]  = useState(null);
  const [showPrefModal,       setShowPrefModal]       = useState(false);

  const handleNewHosting = () => {
    // Block new hosting creation until preferences are filled
    if (data.hostPreferencesSkipped) {
      setShowPrefModal(true);
      return;
    }
    setData(prev => ({ ...prev, editingHostingId: null }));
    window.setScreen(20);
  };

  const handleEdit = (id) => {
    setData(prev => ({ ...prev, editingHostingId: id }));
    window.setScreen(20);
  };

  const handleCancel = async (id) => {
    if (!confirm(t('s19_confirm_cancel'))) return;

    if (!window.db) {
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.filter(h => h.id !== id),
      }));
      return;
    }

    try {
      const fn = firebase.functions().httpsCallable('cancelHosting');
      await fn({ hosting_id: id });
      // Remove from local state — the doc was deleted from Firestore by the function
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.filter(h => h.id !== id),
      }));
    } catch (e) {
      console.error('Cancel hosting error:', e);
      alert('שגיאה בביטול: ' + e.message);
    }
  };

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-20">
      {/* Header — matches AppHeader styling */}
      <AppHeader
        eyebrow={`${t('s19_greeting')} ${data.hostName || 'משפחה'}`}
        title={t('s19_status')}
        onProfile={onProfile}
        onLogout={onLogout}
      />

      <div className="max-w-md mx-auto px-5 mt-6">

        {/* Smart Alerts Section */}
        <div className="mb-6">
          <p className="section-label mb-3">{t('s19_smart_alerts')}</p>
          {data.hasSoldierNearby ? (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('s19_alert_title')}</p>
                  <p className="text-xs text-warm-600 mt-1 leading-relaxed">{t('s19_alert_desc')}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 border-dashed text-center">
              <p className="text-sm text-warm-400">{t('no_new_alerts')}</p>
            </Card>
          )}
        </div>

        {/* My Hostings Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800">{t('s19_my_hostings')}</h2>
          <button
            onClick={handleNewHosting}
            className="bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
          >
            {t('s19_new')}
          </button>
        </div>

        {/* Hostings List */}
        {hostings.length === 0 ? (
          <Card className="text-center py-10 border-dashed">
            <span className="text-3xl block mb-3 opacity-50">🍽️</span>
            <p className="text-sm font-medium text-warm-500">{t('s19_no_hostings')}</p>
            <button
              onClick={handleNewHosting}
              className="mt-4 text-sm font-semibold text-brand-600 underline underline-offset-2"
            >
              {t('s19_new')}
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {hostings.map(h => {
              const guests = h.guests || [];
              const capacity = parseInt(h.soldiers) || 0;
              const isCanceled = h.status === 'canceled';
              const totalGuests = guests.length > 0
                ? guests.reduce((sum, g) => sum + (g.groupSize || 1), 0)
                : (h.occupied || 0);
              const isFull = !isCanceled && totalGuests >= capacity && capacity > 0;

              return (
                <Card key={h.id} className={`p-0 overflow-hidden${isCanceled ? ' opacity-60' : ''}`}>
                  {/* Hosting Info */}
                  <div
                    className="p-4 border-b border-warm-100 cursor-pointer hover:bg-warm-50 transition-colors"
                    onClick={() => setSelectedHosting(h)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {new Date(h.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-warm-500 mt-0.5">
                          {h.time === 'friday_evening' ? t('s20_fri_eve') : h.time === 'saturday_lunch' ? t('s20_sat_lun') : h.customTime || h.time}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        isCanceled ? 'bg-warm-100 text-warm-500' :
                        isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                      }`}>
                        {isCanceled
                          ? t('canceled_label')
                          : `${totalGuests}/${capacity} ${t('s19_spots_taken')}`}
                      </span>
                    </div>
                    {h.note && <p className="text-xs text-warm-400 mt-2 leading-relaxed line-clamp-1">"{h.note}"</p>}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-warm-50 flex justify-end gap-3">
                    {isCanceled ? (
                      <button
                        onClick={async () => {
                          if (window.db) {
                            // 1. Reset the hosting to a fresh open state
                            await window.db.collection('family_hostings').doc(h.id).update({
                              status: 'open',
                              guests: [],
                              occupied: 0,
                              is_fully_booked: false,
                            });
                            // 2. Immediately trigger matching for all waiting soldiers on this date
                            try {
                              const fn = window.firebase.functions().httpsCallable('triggerMatchingForDate');
                              await fn({ date: h.date });
                            } catch (e) {
                              console.warn('triggerMatchingForDate:', e.message);
                            }
                          } else {
                            setData(prev => ({
                              ...prev,
                              hostings: prev.hostings.map(h2 =>
                                h2.id === h.id
                                  ? { ...h2, status: 'open', guests: [], occupied: 0, is_fully_booked: false }
                                  : h2
                              ),
                            }));
                          }
                        }}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1"
                      >
                        {t('restore_hosting')}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleCancel(h.id)}
                          className="text-xs font-semibold text-warm-500 hover:text-red-600 transition-colors py-1"
                        >
                          {t('s19_cancel')}
                        </button>
                        <button
                          onClick={() => handleEdit(h.id)}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1"
                        >
                          {t('s19_edit')}
                        </button>
                        {guests.length > 0 && (
                          <button
                            onClick={() => setSelectedHosting(h)}
                            className="text-xs font-semibold bg-white border border-warm-200 rounded-lg px-3 py-1 text-gray-700 shadow-xs hover:bg-warm-50 transition-colors"
                          >
                            {t('s19_view_guests')} ({totalGuests})
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Soldier profile card */}
      <SoldierProfileModal
        guest={selectedGuest}
        onClose={() => { setSelectedGuest(null); setSelectedHosting(guestSourceHosting); setGuestSourceHosting(null); }}
      />

      {/* Guest Details Modal */}
      {selectedHosting && (
        <Modal
          isOpen={!!selectedHosting}
          onClose={() => setSelectedHosting(null)}
          title={t('s19_guests_title')}
        >
          <div className="space-y-3">
            {(!selectedHosting.guests || selectedHosting.guests.length === 0) ? (
              <p className="text-center text-sm text-warm-500 py-6">{t('s19_no_guests_yet')}</p>
            ) : (
              selectedHosting.guests.map(g => (
                <Card key={g.id} className="p-3 bg-warm-50">
                  <div className="flex justify-between items-center gap-3">
                    <button
                      onClick={() => { setGuestSourceHosting(selectedHosting); setSelectedHosting(null); setSelectedGuest(g); }}
                      className="flex items-center gap-2.5 min-w-0 flex-1 text-start group"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
                        style={{ background: g.avatarColor || '#6f8f72' }}
                      >
                        {(g.name || '?')[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-brand-600 text-sm group-hover:underline underline-offset-2 truncate">{g.name}</p>
                        {g.unit && <p className="text-xs text-warm-500 mt-0.5">{t('s19_unit')} {g.unit}</p>}
                      </div>
                    </button>
                    <a
                      href={`https://wa.me/972${(g.phone || '').replace(/\D/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#1ebd5b] transition-colors flex-shrink-0"
                    >
                      <span>💬</span> WhatsApp
                    </a>
                  </div>
                </Card>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* Preferences questionnaire — blocks new hosting until filled */}
      <PreferencesPromptModal
        isOpen={showPrefModal}
        context="host_first_hosting"
        onNow={() => {
          setShowPrefModal(false);
          setData(prev => ({ ...prev, pendingNewHosting: true }));
          window.setScreen(22);
        }}
        onLater={() => setShowPrefModal(false)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   S20 New Hosting / Edit Hosting
───────────────────────────────────────── */

function S20NewHosting({ data, setData, onBack, onSubmit }) {
  const { t } = useLang();
  const editingHosting = data.hostings?.find(h => h.id === data.editingHostingId);

  const [form, setFormState] = useState(() => {
    if (editingHosting) return { ...editingHosting, soldiers: String(editingHosting.soldiers) };
    return { date: '', time: '', customTime: '', soldiers: '', note: '', sleepOvernight: false, pickup: false };
  });
  const [errors, setErrors] = useState({});

  const setF = (key) => (val) => setFormState(prev => ({ ...prev, [key]: val }));

  const SOLDIER_OPTS = ['1', '2', '3', '4', '5+'];

  const validate = () => {
    const e = {};
    if (!form.date)     e.date    = t('v_date');
    if (!form.time)     e.time    = t('v_time');
    if (!form.soldiers) e.soldiers = t('v_sol');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, guests: form.guests || [] });
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">
      <AppHeader onBack={onBack} />
      <div className="flex-1 flex justify-center">
      <div className="w-full max-w-md px-5 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
            {editingHosting ? t('s19_edit') : t('s20_title')}
          </h1>
          <p className="text-sm text-warm-500 mt-1">{t('s20_sub')}</p>
        </div>

        <div className="space-y-6">
          <FridayDatePicker
            label={t('s20_date_free')}
            value={form.date}
            onChange={setF('date')}
            error={errors.date}
          />

          <Input 
            label={t('s20_time_free')}
            type="time"
            value={form.time}
            onChange={setF('time')}
            error={errors.time}
            required
          />

          {/* Soldier count */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">{t('s20_sol_label')}</p>
            <div className="flex gap-2">
              {SOLDIER_OPTS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setF('soldiers')(n)}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold border transition-all ${
                    form.soldiers === n
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-white text-gray-600 border-warm-200 hover:border-warm-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {errors.soldiers && <p className="mt-1.5 text-xs text-red-500">{errors.soldiers}</p>}
          </div>

          {/* Logistics */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800">{t('s20_logistics')}</p>
            <CheckRow
              label={t('s20_sleep')}
              checked={form.sleepOvernight}
              onChange={setF('sleepOvernight')}
            />
            <CheckRow
              label={t('s20_pickup')}
              checked={form.pickup}
              onChange={setF('pickup')}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s20_note_label')}</label>
            <textarea
              value={form.note}
              onChange={e => setF('note')(e.target.value)}
              placeholder={t('s20_note_ph')}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
            />
          </div>

          <Btn onClick={handleSubmit}>{t('s20_submit')}</Btn>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   S22 Host Profile — Settings
───────────────────────────────────────── */

function S22HostProfile({ data, setData, onBack, onLogout }) {
  const { t, lang } = useLang();

  const [form, setForm] = useState({
    hostName:     data.hostName     || data.hostFullName || '',
    hostPhone:    data.hostPhone    || '',
    hostCity:     data.hostCity     || '',
    hostKosher:   data.hostKosher   || '',
    hostShabbat:  data.hostShabbat  || '',
    hasPets:      data.hasPets      || false,
    petsDetails:  data.petsDetails  || '',
    hostCooking:  data.hostCooking  || [],
    hostLanguages: data.hostLanguages || ['he'],
    hostVibe:     data.hostVibe     || '',
  });
  const [saved, setSaved] = useState(false);
  const [newLanguageText, setNewLanguageText] = useState('');
  const [customLanguages, setCustomLanguages] = useState([]);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const staticLanguages = [
    { id: 'he', label: t('lang_he') },
    { id: 'en', label: t('lang_en') },
    { id: 'ru', label: t('lang_ru') },
    { id: 'es', label: t('lang_es') },
    { id: 'ar', label: t('lang_ar') },
  ];
  const allLanguages = [...staticLanguages, ...customLanguages.map(l => ({ id: l, label: l }))];

  const handleAddLanguage = () => {
    const trimmed = newLanguageText.trim();
    if (!trimmed) return;
    if (!allLanguages.some(l => l.id.toLowerCase() === trimmed.toLowerCase())) {
      setCustomLanguages(prev => [...prev, trimmed]);
    }
    if (!form.hostLanguages.includes(trimmed)) {
      setF('hostLanguages')([...form.hostLanguages, trimmed]);
    }
    setNewLanguageText('');
  };

  const handleSave = async () => {
    const hasPending = !!data.pendingNewHosting;
    const updatedData = {
      ...form,
      ...(hasPending ? { hostPreferencesSkipped: false, pendingNewHosting: false } : {}),
    };

    if (window.DB && data.uid) {
      try {
        await window.DB.saveFamilyProfile(data.uid, updatedData);
      } catch (e) {
        alert("Error saving profile to database.");
      }
    }

    setData(prev => ({ ...prev, ...updatedData }));
    setSaved(true);
    if (hasPending) {
      setTimeout(() => window.setScreen(20), 900);
    } else {
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const shabbatOpts = [
    { id: 'keeps',       label: t('s16_shab_keeps') },
    { id: 'traditional', label: t('s16_shab_trad')  },
    { id: 'none',        label: t('s16_shab_none')  },
  ];
  const kosherOpts = [
    { id: 'mehadrin',  label: t('s16_kosh_kit')  },
    { id: 'separated', label: t('s16_kosh_sep')  },
    { id: 'none',      label: t('s16_kosh_none') },
  ];
  const cookingOptions = [
    { id: 'veg',     label: t('alg_veg')    },
    { id: 'vegan',   label: t('alg_vegan')  },
    { id: 'celiac',  label: t('alg_celiac') },
    { id: 'lactose', label: t('alg_lactose')},
    { id: 'nuts',    label: t('alg_nuts')   },
  ];

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-12">
      <AppHeader title={t('profile_settings')} onBack={onBack} />

      <div className="max-w-md mx-auto px-5 pt-6 space-y-5">

        {/* Basic details */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t('family_details_label')}
          </h2>
          <Input label={t('s16_name')}  value={form.hostName}  onChange={setF('hostName')} />
          <Input label={t('s16_phone')} type="tel" value={form.hostPhone} onChange={setF('hostPhone')} />
          <Input label={t('s16_city')}  value={form.hostCity}  onChange={setF('hostCity')} />
        </Card>

        {/* Lifestyle & preferences — identical to registration steps 2+3 */}
        <Card className="p-5 space-y-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t('lifestyle_label')}
          </h2>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
            <RadioGroup options={kosherOpts} value={form.hostKosher} onChange={setF('hostKosher')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
            <RadioGroup options={shabbatOpts} value={form.hostShabbat} onChange={setF('hostShabbat')} />
          </div>

          <div>
            <CheckRow label={t('s16_has_pets')} checked={form.hasPets} onChange={setF('hasPets')} />
            {form.hasPets && (
              <div className="mt-3 ps-1">
                <Input
                  value={form.petsDetails}
                  onChange={setF('petsDetails')}
                  placeholder={t('s16_pets_ph')}
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_cooking')}</p>
            <MultiCheck options={cookingOptions} values={form.hostCooking} onChange={setF('hostCooking')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">שפות מדוברות (לסמן את כל מה שרלוונטי)</p>
            <MultiCheck options={allLanguages} values={form.hostLanguages} onChange={setF('hostLanguages')} />
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newLanguageText}
                onChange={e => setNewLanguageText(e.target.value)}
                placeholder="הוסף שפה אחרת..."
                className="flex-1 min-h-[44px] py-2 px-4 rounded-xl border border-warm-200 bg-white text-sm transition-all placeholder:text-warm-400 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 hover:border-warm-300"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
              />
              <Btn type="button" variant="secondary" onClick={handleAddLanguage} className="!w-auto !py-2.5">הוסף</Btn>
            </div>
          </div>
        </Card>

        {/* Vibe / bio */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t('s16_3_title')}
          </h2>
          <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_vibe_label')}</label>
          <textarea
            value={form.hostVibe}
            onChange={e => setF('hostVibe')(e.target.value)}
            placeholder={t('s16_vibe_ph')}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white resize-none transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
          />
        </Card>

        <Btn onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
          {saved ? t('saved_success') : t('save_changes')}
        </Btn>
        <Btn onClick={onLogout} variant="danger" className="mt-2 mb-6">
          {t('logout')}
        </Btn>
      </div>
    </div>
  );
}

window.S19HostHome = S19HostHome;
window.S20NewHosting = S20NewHosting;
window.S22HostProfile = S22HostProfile;
