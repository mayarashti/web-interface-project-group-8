/* S19 Host Home (Unified Dashboard) */

var { useState } = React;

function S19HostHome({ data, setData, onEditProfile }) {
  const { t } = useLang();
  const hostings = data.hostings || [];
  const [selectedHosting, setSelectedHosting] = useState(null);

  const handleNewHosting = () => {
    setData(prev => ({ ...prev, editingHostingId: null }));
    window.setScreen(20);
  };

  const handleEdit = (id) => {
    setData(prev => ({ ...prev, editingHostingId: id }));
    window.setScreen(20);
  };

  const handleCancel = (id) => {
    if (confirm(t('s19_confirm_cancel'))) {
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.filter(h => h.id !== id)
      }));
    }
  };

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-warm-200">
        <div className="max-w-md mx-auto px-5 h-16 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-brand-600">{t('s19_greeting')} {data.hostName || 'משפחה'}</p>
            <p className="text-[11px] text-warm-500">{t('s19_status')}</p>
          </div>
          <div className="flex gap-2 items-center">
            <LangToggle />
            <button
              onClick={onEditProfile}
              className="w-10 h-10 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center hover:bg-brand-100 transition-colors active:scale-95"
              aria-label="Settings"
            >
              <span className="text-lg">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-5 mt-6">

        {/* Smart Alerts Section */}
        <div className="mb-6">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('s19_smart_alerts')}</h2>
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
              const isFull = guests.length >= capacity && capacity > 0;

              return (
                <Card key={h.id} className="p-0 overflow-hidden">
                  {/* Hosting Info */}
                  <div
                    className="p-4 border-b border-warm-100 cursor-pointer hover:bg-warm-50 transition-colors"
                    onClick={() => setSelectedHosting(h)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          {new Date(h.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-xs text-warm-500 mt-0.5">
                          {h.time === 'friday_evening' ? t('s20_fri_eve') : h.time === 'saturday_lunch' ? t('s20_sat_lun') : h.customTime || h.time}
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {guests.length}/{capacity} {t('s19_spots_taken')}
                      </span>
                    </div>
                    {h.note && <p className="text-xs text-warm-400 mt-2 leading-relaxed line-clamp-1">"{h.note}"</p>}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 bg-warm-50 flex justify-end gap-3">
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
                        {t('s19_view_guests')} ({guests.length})
                      </button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

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
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{g.name}</p>
                      {g.unit && <p className="text-xs text-warm-500 mt-0.5">{t('s19_unit')} {g.unit}</p>}
                    </div>
                    <a
                      href={`https://wa.me/972${(g.phone || '').replace(/\D/g, '').replace(/^0/, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-[#25D366] text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-[#1ebd5b] transition-colors"
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

  const upcomingDates = (() => {
    const dates = [];
    let d = new Date();
    d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7 || 7));
    for (let i = 0; i < 4; i++) {
      const fri = new Date(d);
      dates.push({
        value: fri.toISOString().split('T')[0],
        label: fri.toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
      });
      d.setDate(d.getDate() + 7);
    }
    return dates;
  })();

  const TIME_OPTIONS = [
    { id: 'friday_evening', label: t('s20_fri_eve'), sub: t('s20_fri_eve_s') },
    { id: 'saturday_lunch', label: t('s20_sat_lun'), sub: t('s20_sat_lun_s') },
    { id: 'custom',         label: t('s20_custom'),  sub: t('s20_custom_s') },
  ];

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

    setData(prev => {
      const hostings = prev.hostings || [];
      if (prev.editingHostingId) {
        return {
          ...prev,
          hostings: hostings.map(h => h.id === prev.editingHostingId ? { ...h, ...form } : h),
          editingHostingId: null
        };
      } else {
        return {
          ...prev,
          hostings: [...hostings, { ...form, id: Date.now(), guests: [] }]
        };
      }
    });

    onSubmit();
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col max-w-md mx-auto bg-warm-50">
      <div className="px-5 pt-8 pb-24">
        <BackBtn onClick={onBack} />
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
            {editingHosting ? t('s19_edit') : t('s20_title')}
          </h1>
          <p className="text-sm text-warm-500 mt-1">{t('s20_sub')}</p>
        </div>

        <div className="space-y-6">
          {/* Date Picker */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">{t('s20_date_label')}</p>
            <div className="grid grid-cols-2 gap-2">
              {upcomingDates.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setF('date')(d.value)}
                  className={`p-3 rounded-xl border text-center transition-all duration-150 text-sm ${
                    form.date === d.value
                      ? 'border-brand-400 bg-brand-50 shadow-sm text-brand-700 font-bold'
                      : 'border-warm-200 bg-white text-gray-700 hover:border-warm-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            {errors.date && <p className="mt-1.5 text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Time */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">{t('s20_time_label')}</p>
            <RadioGroup
              options={TIME_OPTIONS}
              value={form.time}
              onChange={setF('time')}
            />
            {form.time === 'custom' && (
              <div className="mt-3">
                <Input type="time" value={form.customTime} onChange={setF('customTime')} />
              </div>
            )}
            {errors.time && <p className="mt-1.5 text-xs text-red-500">{errors.time}</p>}
          </div>

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
  );
}

/* ─────────────────────────────────────────
   S22 Host Profile — Settings
───────────────────────────────────────── */

function S22HostProfile({ data, setData, onBack }) {
  const { t, lang } = useLang();

  const [form, setForm] = useState({
    hostName:          data.hostName || data.hostFullName || '',
    hostPhone:         data.hostPhone || '',
    hostCity:          data.hostCity  || '',
    hostKosher:        data.hostKosher        || 'kosher',
    hostShabbat:       data.hostShabbat       || 'traditional',
  });
  const [saved, setSaved] = useState(false);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    setData(prev => ({ ...prev, ...form }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const shabbatOpts = [
    { id: 'keeps',       label: t('s16_shab_keeps') },
    { id: 'traditional', label: t('s16_shab_trad')  },
    { id: 'none',        label: t('s16_shab_none')  },
  ];

  const kosherOpts = [
    { id: 'kitchen',   label: t('s16_kosh_kit')  },
    { id: 'separated', label: t('s16_kosh_sep')  },
    { id: 'none',      label: t('s16_kosh_none') },
  ];

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-12">
      <AppHeader
        title={lang === 'he' ? 'הגדרות פרופיל' : 'Profile Settings'}
        onBack={onBack}
      />

      <div className="max-w-md mx-auto px-5 pt-6 space-y-5">
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {lang === 'he' ? 'פרטי המשפחה' : 'Family Details'}
          </h2>
          <Input label={t('s16_name')} value={form.hostName} onChange={setF('hostName')} />
          <Input label={t('s16_phone')} type="tel" value={form.hostPhone} onChange={setF('hostPhone')} />
          <Input label={t('s16_city')} value={form.hostCity} onChange={setF('hostCity')} />
        </Card>

        <Card className="p-5 space-y-5">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {lang === 'he' ? 'אורח חיים' : 'Lifestyle'}
          </h2>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
            <RadioGroup options={shabbatOpts} value={form.hostShabbat} onChange={setF('hostShabbat')} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
            <RadioGroup options={kosherOpts} value={form.hostKosher} onChange={setF('hostKosher')} />
          </div>
        </Card>

        <Btn onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
          {saved
            ? (lang === 'he' ? '✓ נשמר בהצלחה' : '✓ Saved successfully')
            : (lang === 'he' ? 'שמור שינויים' : 'Save Changes')}
        </Btn>
      </div>
    </div>
  );
}

window.S19HostHome = S19HostHome;
window.S20NewHosting = S20NewHosting;
window.S22HostProfile = S22HostProfile;
