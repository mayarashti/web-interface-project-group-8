/* S16 Host Registration Wizard (3 Steps) */

var { useState, useEffect, useRef } = React;

/* StoriesAlbumEditor — multi-photo album editor, staged on the shared wizard
   `data`/`setData` (data.hostAlbumStaged) exactly like everything else in
   this file, so it survives step navigation. Photos are only actually
   uploaded to Storage at final wizard submit (core/app.js), not here —
   this component only picks, processes (via window.ImageUtils), previews,
   captions, reorders and deletes staged photos in memory. */
const MAX_ALBUM_PHOTOS = 12;

function StoriesAlbumEditor({ data, setData }) {
  const { t } = useLang();
  const albumInputRef = useRef(null);
  const [pendingChipLabel, setPendingChipLabel] = useState(null);
  const [activeCaptionId, setActiveCaptionId] = useState(null);
  const [partialAddMsg, setPartialAddMsg] = useState(null);

  const staged = data.hostAlbumStaged || [];
  const sorted = [...staged].sort((a, b) => a.order - b.order);
  const atMax = sorted.length >= MAX_ALBUM_PHOTOS;

  const updateStaged = (updater) => {
    setData(prev => ({ ...prev, hostAlbumStaged: updater(prev.hostAlbumStaged || []) }));
  };

  const chips = [
    { key: 'table', label: t('s16_album_chip_table') },
    { key: 'dish', label: t('s16_album_chip_dish') },
    { key: 'entrance', label: t('s16_album_chip_entrance') },
    { key: 'yard', label: t('s16_album_chip_yard') },
  ];

  const openPicker = (chipLabel) => {
    setPendingChipLabel(chipLabel || null);
    albumInputRef.current?.click();
  };

  const runProcessing = (id, file) => {
    window.ImageUtils.processStoryImage(file)
      .then(({ fullBlob, thumbBlob, width, height }) => {
        updateStaged(list => list.map(p => {
          if (p.id !== id) return p;
          if (p.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(p.previewUrl);
          return { ...p, file: null, fullBlob, thumbBlob, width, height, previewUrl: URL.createObjectURL(fullBlob), status: 'ready', errorMessage: null };
        }));
      })
      .catch(() => {
        updateStaged(list => list.map(p => p.id === id ? { ...p, status: 'error', errorMessage: t('s16_album_error_decode') } : p));
      });
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ''; // allow re-picking the same file later

    const remaining = MAX_ALBUM_PHOTOS - staged.length;
    const accepted = files.slice(0, Math.max(0, remaining));
    if (files.length > accepted.length) {
      setPartialAddMsg(t('s16_album_partial_add', accepted.length));
      setTimeout(() => setPartialAddMsg(null), 4000);
    }
    if (!accepted.length) return;

    const chipLabel = pendingChipLabel;
    setPendingChipLabel(null);

    let nextOrder = staged.length;
    accepted.forEach((file, i) => {
      const id = `story_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 7)}`;
      const entry = {
        id, file, fullBlob: null, thumbBlob: null,
        previewUrl: URL.createObjectURL(file),
        width: 0, height: 0,
        caption: i === 0 && chipLabel ? chipLabel : '',
        order: nextOrder++,
        status: 'processing', errorMessage: null,
      };
      updateStaged(list => [...list, entry]);
      runProcessing(id, file);
    });
  };

  const retry = (photo) => {
    if (!photo.file) return;
    updateStaged(list => list.map(p => p.id === photo.id ? { ...p, status: 'processing', errorMessage: null } : p));
    runProcessing(photo.id, photo.file);
  };

  const remove = (id) => {
    updateStaged(list => {
      const target = list.find(p => p.id === id);
      if (target?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(target.previewUrl);
      return list.filter(p => p.id !== id)
        .sort((a, b) => a.order - b.order)
        .map((p, i) => ({ ...p, order: i }));
    });
  };

  const move = (id, direction) => {
    updateStaged(list => {
      const ordered = [...list].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex(p => p.id === id);
      const swapIdx = idx + direction;
      if (idx === -1 || swapIdx < 0 || swapIdx >= ordered.length) return list;
      const a = ordered[idx], b = ordered[swapIdx];
      return list.map(p => {
        if (p.id === a.id) return { ...p, order: b.order };
        if (p.id === b.id) return { ...p, order: a.order };
        return p;
      });
    });
  };

  const setCaption = (id, caption) => {
    updateStaged(list => list.map(p => p.id === id ? { ...p, caption } : p));
  };

  const activeCaptionPhoto = sorted.find(p => p.id === activeCaptionId);

  return (
    <div className="space-y-4">
      <div>
        <p className="section-label mb-1">{t('s16_album_title')}</p>
        <p className="text-sm font-semibold text-gray-800">{t('s16_album_heading')}</p>
        <p className="text-xs text-warm-500 mt-1 leading-relaxed">{t('s16_album_sub')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {chips.map(chip => (
          <button
            key={chip.key}
            type="button"
            onClick={() => openPicker(chip.label)}
            disabled={atMax}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-warm-200 bg-warm-50 text-xs font-semibold text-warm-600 hover:bg-brand-50 hover:border-brand-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {chip.label}
          </button>
        ))}
      </div>

      <p className="text-[11px] text-warm-400">{t('s16_album_privacy_note')}</p>

      <input
        type="file"
        ref={albumInputRef}
        accept="image/*,.heic,.heif"
        multiple
        style={{ display: 'none' }}
        onChange={handleFilesSelected}
      />

      <div className="grid grid-cols-3 gap-2">
        {sorted.map((photo, i) => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border border-warm-200 bg-warm-50">
            <img
              src={photo.previewUrl}
              alt=""
              className="w-full h-full object-cover"
              style={{ opacity: photo.status === 'ready' ? 1 : 0.4 }}
            />

            {photo.status === 'processing' && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/30">
                <svg className="animate-spin h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

            {photo.status === 'error' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-red-50/90 p-1 text-center">
                <span className="text-lg">⚠️</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => retry(photo)} className="text-[10px] font-bold text-brand-700 underline">{t('s16_album_retry')}</button>
                  <button type="button" onClick={() => remove(photo.id)} className="text-[10px] font-bold text-red-600 underline">{t('s16_album_remove')}</button>
                </div>
              </div>
            )}

            {photo.status === 'ready' && (
              <>
                <button
                  type="button"
                  onClick={() => remove(photo.id)}
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-xs leading-none"
                  aria-label={t('s16_album_remove')}
                >×</button>

                <button
                  type="button"
                  onClick={() => setActiveCaptionId(activeCaptionId === photo.id ? null : photo.id)}
                  className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px]"
                  aria-label={t('s16_album_caption_ph')}
                >✎</button>

                <div className="absolute bottom-1 right-1 flex flex-col gap-0.5">
                  {i > 0 && (
                    <button type="button" onClick={() => move(photo.id, -1)} aria-label={t('s16_album_move_up')} className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] leading-none">▲</button>
                  )}
                  {i < sorted.length - 1 && (
                    <button type="button" onClick={() => move(photo.id, 1)} aria-label={t('s16_album_move_down')} className="w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center text-[10px] leading-none">▼</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {!atMax && (
          <button
            type="button"
            onClick={() => openPicker(null)}
            className="aspect-square rounded-xl border border-dashed border-warm-300 bg-warm-50 flex flex-col items-center justify-center hover:bg-brand-50 hover:border-brand-300 transition-colors"
          >
            <span className="text-2xl">+</span>
            <span className="text-[10px] text-warm-500 mt-1">{t('s16_album_add')}</span>
          </button>
        )}
      </div>

      {atMax && <p className="text-xs text-warm-400 text-center">{t('s16_album_max_reached')}</p>}
      {partialAddMsg && <p className="text-xs text-brand-600 text-center">{partialAddMsg}</p>}
      {sorted.length === 0 && <p className="text-xs text-warm-400">{t('s16_album_empty_hint')}</p>}

      {activeCaptionPhoto && (
        <input
          type="text"
          autoFocus
          value={activeCaptionPhoto.caption || ''}
          onChange={(e) => setCaption(activeCaptionPhoto.id, e.target.value)}
          onBlur={() => setActiveCaptionId(null)}
          placeholder={t('s16_album_caption_ph')}
          maxLength={80}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
        />
      )}
    </div>
  );
}

function S16HostRegistration({ data, setData, onNext, onBack, onSkipPreferences, onInfo }) {
  const { t } = useLang();
  const [step, setStep] = useState(data.hostRegStep || 1);
  const [errors, setErrors] = useState({});
  const [showPrefModal, setShowPrefModal] = useState(false);

  // Persist the current step on `data` so navigating back from the summary
  // screen (a separate top-level screen) resumes here instead of restarting.
  const goToStep = (n) => {
    setStep(n);
    setData(prev => ({ ...prev, hostRegStep: n }));
  };

  const [customLanguages, setCustomLanguages] = useState([]);
  const [newLanguageText, setNewLanguageText] = useState('');
  const fileInputRef = useRef(null);

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({ 
        ...prev, 
        hostFile: file, 
        hostPreview: URL.createObjectURL(file) 
      }));
    }
  };

  useEffect(() => {
    if (!data.hostLanguages) {
      setData(prev => ({ ...prev, hostLanguages: ['he'] }));
    }
  }, []);

  const staticLanguages = [
    { id: 'he', label: t('lang_he') },
    { id: 'en', label: t('lang_en') },
    { id: 'ru', label: t('lang_ru') },
    { id: 'es', label: t('lang_es') },
    { id: 'ar', label: t('lang_ar') },
  ];

  const allLanguages = [...staticLanguages, ...customLanguages.map(lang => ({ id: lang, label: lang }))];

  const handleAddLanguage = () => {
    const trimmed = newLanguageText.trim();
    if (!trimmed) return;
    const alreadyExists = allLanguages.some(l => l.id.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) {
      setCustomLanguages(prev => [...prev, trimmed]);
    }
    const currentLangs = data.hostLanguages || ['he'];
    if (!currentLangs.includes(trimmed)) {
      setData(prev => ({
        ...prev,
        hostLanguages: [...currentLangs, trimmed]
      }));
    }
    setNewLanguageText('');
  };


  const TOTAL_STEPS = 3;

  const validateStep = () => {
    const e = {};
    if (step === 1) {
      if (!data.hostName?.trim()) e.hostName = t('v_name');
      if (!data.hostPhone?.trim() || data.hostPhone.replace(/\D/g, '').length < 9) e.hostPhone = t('v_phone');
      if (!data.hostPassword || data.hostPassword.length < 6) e.hostPassword = t('v_pass');
      if (!data.hostCity?.trim()) e.hostCity = t('v_city');
    }
    if (step === 3) {
      if (!data.hostKosher) e.hostKosher = t('v_kosh');
      if (!data.hostShabbat) e.hostShabbat = t('v_shab');
      if (data.hasPets && !data.petsDetails?.trim()) e.petsDetails = t('v_pets');
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    // After step 1 show the preferences-prompt instead of jumping to step 2
    if (step === 1) {
      setShowPrefModal(true);
      return;
    }
    if (step < TOTAL_STEPS) goToStep(step + 1);
    else onNext();
  };

  const handleBack = () => {
    // When resuming a skipped questionnaire (started at step 2), step 1
    // (account/location) was already completed at registration — exit
    // straight back out instead of showing it again.
    if (step > 1 && !(data.pendingNewHosting && step === 2)) goToStep(step - 1);
    else onBack();
  };

  const kosherOptions = [
    { id: 'none',      label: t('s16_kosh_none') },
    { id: 'separated', label: t('s16_kosh_sep') },
    { id: 'mehadrin',  label: t('s16_kosh_kit') },
  ];

  const shabbatOptions = [
    { id: 'none',        label: t('s16_shab_none') },
    { id: 'traditional', label: t('s16_shab_trad') },
    { id: 'keeps',       label: t('s16_shab_keeps') },
  ];

  const cookingOptions = [
    { id: 'veg',     label: t('alg_veg') },
    { id: 'vegan',   label: t('alg_vegan') },
    { id: 'celiac',  label: t('alg_celiac') },
    { id: 'lactose', label: t('alg_lactose') },
    { id: 'nuts',    label: t('alg_nuts') },
  ];

  const kidsCountOptions = [
    { id: '0', label: '0' }, { id: '1', label: '1' }, { id: '2', label: '2' },
    { id: '3', label: '3' }, { id: '4+', label: '4+' },
  ];

  const kidsAgeOptions = [
    { id: '0-5',   label: '0-5' },
    { id: '5-10',  label: '5-10' },
    { id: '10-15', label: '10-15' },
    { id: '16+',   label: '16+' },
    { id: 'other', label: t('s11_am_other') },
  ];

  const afterMealOptions = [
    { id: 'board', label: t('s11_am_board') },
    { id: 'talk',  label: t('s11_am_talk')  },
    { id: 'tv',    label: t('s11_am_tv')    },
    { id: 'other', label: t('s11_am_other') },
  ];

  const titles   = ['', t('s16_1_title'), t('s16_3_title'), t('s16_2_title')];
  const subtitles = ['', t('s16_1_sub'),  t('s16_3_sub'),  t('s16_2_sub')];
  const icons     = ['', '🏡', '✨', '🍽️'];

  return (
    <>
    <ScreenLayout
      onBack={handleBack}
      onNext={handleNext}
      step={step}
      totalSteps={TOTAL_STEPS}
      icon={icons[step]}
      title={titles[step]}
      onInfo={step === 1 ? onInfo : null}
    >
      <div className="space-y-6 pb-32">
        {/* ── Step 1: Account & Location ── */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Input
              label={t('s16_name')}
              value={data.hostName || ''}
              onChange={set('hostName')}
              placeholder={t('s16_name_ph')}
              error={errors.hostName}
              required
            />
            <Input
              label={t('s16_phone')}
              type="tel"
              value={data.hostPhone || ''}
              onChange={set('hostPhone')}
              placeholder="050-1234567"
              hint={t('s16_phone_hint')}
              error={errors.hostPhone}
              required
            />
            <Input
              label={t('s3_pass')}
              type="password"
              value={data.hostPassword || ''}
              onChange={set('hostPassword')}
              placeholder={t('s3_pass_ph')}
              error={errors.hostPassword}
              required
            />
            <AddressPicker
              label={t('s16_city')}
              placeholder={t('s16_city_ph')}
              hint={data.hostLat ? t('map_pin_set') : t('s16_city_hint')}
              error={errors.hostCity}
              required
              value={data.hostCity ? {
                fullString: data.hostAddress || data.hostCity,
                city: data.hostCity,
                coordinates: { lat: data.hostLat, lng: data.hostLng },
              } : null}
              onChange={(addr) => {
                setData(prev => ({
                  ...prev,
                  hostCity: addr.city || addr.fullString || '',
                  hostAddress: addr.fullString || '',
                  hostLat: addr.coordinates?.lat,
                  hostLng: addr.coordinates?.lng,
                }));
              }}
            />
          </div>
        )}

        {/* ── Step 2: Get to know you (photo + light questions) ── */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_photo_label')}</label>
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border border-dashed border-warm-300 bg-warm-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors overflow-hidden"
                style={data.hostPreview ? { backgroundImage: `url(${data.hostPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'transparent', height: '160px' } : {}}
              >
                {!data.hostPreview && (
                  <>
                    <span className="text-3xl mb-2">📷</span>
                    <p className="text-sm font-semibold text-gray-600">{t('s16_photo_btn')}</p>
                    <p className="text-xs text-warm-400 mt-1">{t('s6_size')}</p>
                  </>
                )}
              </div>
              <p className="text-center text-[11px] text-warm-400 mt-2">{t('s16_photo_note')}</p>
            </div>

            <StoriesAlbumEditor data={data} setData={setData} />

            <p className="text-sm text-warm-500 leading-relaxed">{t('s16_q_intro')}</p>

            <RadioGroup
              label={t('s16_q_kids')}
              vertical={false}
              options={kidsCountOptions}
              value={data.hostNumKids || ''}
              onChange={set('hostNumKids')}
            />

            <div>
              <RadioGroup
                label={t('s16_q_kids_age')}
                vertical={false}
                options={kidsAgeOptions}
                value={data.hostKidsAgeRange || ''}
                onChange={set('hostKidsAgeRange')}
              />
              {data.hostKidsAgeRange === 'other' && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={data.hostKidsAgeRangeOther || ''}
                    onChange={(e) => set('hostKidsAgeRangeOther')(e.target.value)}
                    placeholder={t('s11_am_other_ph')}
                    className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                  />
                </div>
              )}
            </div>

            <Input
              label={t('s16_q_friday_dish')}
              value={data.hostFridayDish || ''}
              onChange={set('hostFridayDish')}
            />

            <div>
              <MultiCheck
                label={t('s16_q_aftermeal')}
                options={afterMealOptions}
                values={data.hostAfterMeal || []}
                onChange={set('hostAfterMeal')}
              />
              {(data.hostAfterMeal || []).includes('other') && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={data.hostAfterMealOther || ''}
                    onChange={(e) => set('hostAfterMealOther')(e.target.value)}
                    placeholder={t('s11_am_other_ph')}
                    className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                  />
                </div>
              )}
            </div>

            <Input
              label={t('s16_q_tradition')}
              value={data.hostFridayTradition || ''}
              onChange={set('hostFridayTradition')}
            />

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_q_more')}</label>
              <textarea
                value={data.hostMoreInfo || ''}
                onChange={e => set('hostMoreInfo')(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white resize-none transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
              />
            </div>
          </div>
        )}

        {/* ── Step 3: Lifestyle & Accommodations ── */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
              <RadioGroup
                options={kosherOptions}
                value={data.hostKosher || ''}
                onChange={set('hostKosher')}
              />
              {errors.hostKosher && <p className="text-xs text-red-600 mt-2">{errors.hostKosher}</p>}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
              <RadioGroup
                options={shabbatOptions}
                value={data.hostShabbat || ''}
                onChange={set('hostShabbat')}
              />
              {errors.hostShabbat && <p className="text-xs text-red-600 mt-2">{errors.hostShabbat}</p>}
            </div>

            <div>
              <CheckRow
                label={t('s16_has_pets')}
                checked={data.hasPets || false}
                onChange={set('hasPets')}
              />
              {data.hasPets && (
                <div className="mt-3 ps-1">
                  <Input
                    value={data.petsDetails || ''}
                    onChange={set('petsDetails')}
                    placeholder={t('s16_pets_ph')}
                    error={errors.petsDetails}
                  />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_cooking')}</p>
              <MultiCheck
                options={cookingOptions}
                values={data.hostCooking || []}
                onChange={set('hostCooking')}
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">שפות מדוברות (לסמן את כל מה שרלוונטי)</p>
              <MultiCheck
                options={allLanguages}
                values={data.hostLanguages || ['he']}
                onChange={set('hostLanguages')}
              />
              <div className="flex gap-2 mt-3">
                <input
                  type="text"
                  value={newLanguageText}
                  onChange={(e) => setNewLanguageText(e.target.value)}
                  placeholder="הוסף שפה אחרת..."
                  className="flex-1 min-h-[44px] py-2 px-4 rounded-xl border border-warm-200 bg-white text-sm transition-all placeholder:text-warm-400 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 hover:border-warm-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLanguage();
                    }
                  }}
                />
                <Btn
                  type="button"
                  variant="secondary"
                  onClick={handleAddLanguage}
                  className="!w-auto !py-2.5"
                >
                  הוסף
                </Btn>
              </div>
            </div>

          </div>
        )}
      </div>
    </ScreenLayout>

    {/* Preferences questionnaire prompt — shown after step 1 completes */}
    <PreferencesPromptModal
      isOpen={showPrefModal}
      context="host_reg"
      onNow={() => { setShowPrefModal(false); goToStep(2); }}
      onLater={() => { setShowPrefModal(false); if (onSkipPreferences) onSkipPreferences(); }}
    />
    </>
  );
}

/* S17 Host Summary — live, editable preview of the family's profile exactly as soldiers see it */
function S17HostSummary({ data, setData, onSubmit, onBack }) {
  const { t, lang } = useLang();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [customLanguages, setCustomLanguages] = useState([]);
  const [newLanguageText, setNewLanguageText] = useState('');
  const fileInputRef = useRef(null);

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setData(prev => ({
        ...prev,
        hostFile: file,
        hostPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleNext = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

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
    const alreadyExists = allLanguages.some(l => l.id.toLowerCase() === trimmed.toLowerCase());
    if (!alreadyExists) setCustomLanguages(prev => [...prev, trimmed]);
    const currentLangs = data.hostLanguages || ['he'];
    if (!currentLangs.includes(trimmed)) {
      setData(prev => ({ ...prev, hostLanguages: [...currentLangs, trimmed] }));
    }
    setNewLanguageText('');
  };

  const kosherOptions = [
    { id: 'none',      label: t('s16_kosh_none') },
    { id: 'separated', label: t('s16_kosh_sep') },
    { id: 'mehadrin',  label: t('s16_kosh_kit') },
  ];
  const shabbatOptions = [
    { id: 'none',        label: t('s16_shab_none') },
    { id: 'traditional', label: t('s16_shab_trad') },
    { id: 'keeps',       label: t('s16_shab_keeps') },
  ];
  const cookingOptions = [
    { id: 'veg',     label: t('alg_veg') },
    { id: 'vegan',   label: t('alg_vegan') },
    { id: 'celiac',  label: t('alg_celiac') },
    { id: 'lactose', label: t('alg_lactose') },
    { id: 'nuts',    label: t('alg_nuts') },
  ];
  const kidsCountOptions = [
    { id: '0', label: '0' }, { id: '1', label: '1' }, { id: '2', label: '2' },
    { id: '3', label: '3' }, { id: '4+', label: '4+' },
  ];
  const kidsAgeOptions = [
    { id: '0-5',   label: '0-5' },
    { id: '5-10',  label: '5-10' },
    { id: '10-15', label: '10-15' },
    { id: '16+',   label: '16+' },
    { id: 'other', label: t('s11_am_other') },
  ];
  const afterMealOptions = [
    { id: 'board', label: t('s11_am_board') },
    { id: 'talk',  label: t('s11_am_talk')  },
    { id: 'tv',    label: t('s11_am_tv')    },
    { id: 'other', label: t('s11_am_other') },
  ];

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={handleNext}
      isNextLoading={isSubmitting}
      nextLabel={t('s16_submit')}
      icon="🎉"
      title={t('s16_sum_title')}
      sub={t('s16_sum_sub')}
    >
      {/* Live preview — the exact same HostProfileCard soldiers see on your listing */}
      <p className="section-label mb-2 flex items-center gap-1.5">
        <span>👀</span><span>{t('s12_preview_badge')}</span>
      </p>
      <Card className="mb-2 p-4 border border-warm-200 shadow-sm bg-white">
        <HostProfileCard
          lang={lang}
          host={{
            name: data.hostName,
            city: data.hostCity,
            photoUrl: data.hostPreview || null,
            avatarColor: '#B0BA99',
            hasStories: (data.hostAlbumStaged || []).some(p => p.status === 'ready'),
            previewStories: (data.hostAlbumStaged || [])
              .filter(p => p.status === 'ready')
              .sort((a, b) => a.order - b.order)
              .map(p => ({ id: p.id, url: p.previewUrl, caption: p.caption, alt: p.caption || '', order: p.order })),
            kosher: data.hostKosher,
            shabbat: data.hostShabbat,
            hasPets: data.hasPets,
            numKids: data.hostNumKids,
            kidsAgeRange: data.hostKidsAgeRange,
            kidsAgeRangeOther: data.hostKidsAgeRangeOther,
            fridayDish: data.hostFridayDish,
            afterMeal: data.hostAfterMeal,
            afterMealOther: data.hostAfterMealOther,
            fridayTradition: data.hostFridayTradition,
            moreInfo: data.hostMoreInfo,
            vibe: data.hostVibe,
          }}
        />
      </Card>

      <button
        type="button"
        onClick={() => setShowEdit(v => !v)}
        className="w-full flex items-center justify-between gap-3 mt-6 mb-4 py-2 text-start"
      >
        <p className="text-xs text-warm-500 flex-1">{t('s12_edit_sub')}</p>
        <svg
          className="w-5 h-5 text-warm-400 flex-shrink-0 transition-transform duration-200"
          style={{ transform: showEdit ? 'rotate(180deg)' : 'rotate(0deg)' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {!showEdit ? null : (
      <React.Fragment>

      <Card className="mb-4 p-5">
        <p className="section-label mb-4">{t('s12_personal')}</p>
        <Input label={t('s16_sum_name')} value={data.hostName || ''} onChange={set('hostName')} />
        <Input label={t('s12_phone')} type="tel" value={data.hostPhone || ''} onChange={set('hostPhone')} />
        <AddressPicker
          label={t('s16_city')}
          placeholder={t('s16_city_ph')}
          hint={data.hostLat ? t('map_pin_set') : t('s16_city_hint')}
          value={data.hostCity ? {
            fullString: data.hostAddress || data.hostCity,
            city: data.hostCity,
            coordinates: { lat: data.hostLat, lng: data.hostLng },
          } : null}
          onChange={(addr) => {
            setData(prev => ({
              ...prev,
              hostCity: addr.city || addr.fullString || '',
              hostAddress: addr.fullString || '',
              hostLat: addr.coordinates?.lat,
              hostLng: addr.coordinates?.lng,
            }));
          }}
        />
      </Card>

      <Card className="mb-4 p-5">
        <p className="section-label mb-4">{t('s16_photo_label')}</p>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border border-dashed border-warm-300 bg-warm-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors overflow-hidden"
          style={data.hostPreview ? { backgroundImage: `url(${data.hostPreview})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'transparent', height: '160px' } : {}}
        >
          {!data.hostPreview && (
            <>
              <span className="text-3xl mb-2">📷</span>
              <p className="text-sm font-semibold text-gray-600">{t('s16_photo_btn')}</p>
              <p className="text-xs text-warm-400 mt-1">{t('s6_size')}</p>
            </>
          )}
        </div>
        <p className="text-center text-[11px] text-warm-400 mt-2">{t('s16_photo_note')}</p>

        <div className="mt-6">
          <StoriesAlbumEditor data={data} setData={setData} />
        </div>

        <div className="mt-6 space-y-5">
          <RadioGroup
            label={t('s16_q_kids')}
            vertical={false}
            options={kidsCountOptions}
            value={data.hostNumKids || ''}
            onChange={set('hostNumKids')}
          />

          <div>
            <RadioGroup
              label={t('s16_q_kids_age')}
              vertical={false}
              options={kidsAgeOptions}
              value={data.hostKidsAgeRange || ''}
              onChange={set('hostKidsAgeRange')}
            />
            {data.hostKidsAgeRange === 'other' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={data.hostKidsAgeRangeOther || ''}
                  onChange={(e) => set('hostKidsAgeRangeOther')(e.target.value)}
                  placeholder={t('s11_am_other_ph')}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                />
              </div>
            )}
          </div>

          <Input
            label={t('s16_q_friday_dish')}
            value={data.hostFridayDish || ''}
            onChange={set('hostFridayDish')}
          />

          <div>
            <MultiCheck
              label={t('s16_q_aftermeal')}
              options={afterMealOptions}
              values={data.hostAfterMeal || []}
              onChange={set('hostAfterMeal')}
            />
            {(data.hostAfterMeal || []).includes('other') && (
              <div className="mt-3">
                <input
                  type="text"
                  value={data.hostAfterMealOther || ''}
                  onChange={(e) => set('hostAfterMealOther')(e.target.value)}
                  placeholder={t('s11_am_other_ph')}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl border border-warm-200 text-[15px] bg-white focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 transition-all"
                />
              </div>
            )}
          </div>

          <Input
            label={t('s16_q_tradition')}
            value={data.hostFridayTradition || ''}
            onChange={set('hostFridayTradition')}
          />

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_q_more')}</label>
            <textarea
              value={data.hostMoreInfo || ''}
              onChange={e => set('hostMoreInfo')(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white resize-none transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
            />
          </div>
        </div>
      </Card>

      <Card className="mb-4 p-5">
        <p className="section-label mb-4">{t('s16_2_title')}</p>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
            <RadioGroup options={kosherOptions} value={data.hostKosher || ''} onChange={set('hostKosher')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
            <RadioGroup options={shabbatOptions} value={data.hostShabbat || ''} onChange={set('hostShabbat')} />
          </div>

          <div>
            <CheckRow label={t('s16_has_pets')} checked={data.hasPets || false} onChange={set('hasPets')} />
            {data.hasPets && (
              <div className="mt-3 ps-1">
                <Input value={data.petsDetails || ''} onChange={set('petsDetails')} placeholder={t('s16_pets_ph')} />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_cooking')}</p>
            <MultiCheck options={cookingOptions} values={data.hostCooking || []} onChange={set('hostCooking')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_langs')}</p>
            <MultiCheck options={allLanguages} values={data.hostLanguages || ['he']} onChange={set('hostLanguages')} />
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newLanguageText}
                onChange={(e) => setNewLanguageText(e.target.value)}
                placeholder="הוסף שפה אחרת..."
                className="flex-1 min-h-[44px] py-2 px-4 rounded-xl border border-warm-200 bg-white text-sm transition-all placeholder:text-warm-400 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 hover:border-warm-300"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
              />
              <Btn type="button" variant="secondary" onClick={handleAddLanguage} className="!w-auto !py-2.5">הוסף</Btn>
            </div>
          </div>
        </div>
      </Card>

      </React.Fragment>
      )}
    </ScreenLayout>
  );
}

/* S18 Host Success */
function S17HostSuccess({ onHome }) {
  const { t } = useLang();
  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">
      <AppHeader />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="w-24 h-24 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mb-6 shadow-sm">
          <SuccessIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">{t('s17_title')}</h1>
        <p className="text-base text-warm-500 leading-relaxed mb-10 max-w-[300px]">
          {t('s17_sub')}
        </p>
        <Btn onClick={onHome} className="w-full max-w-xs">{t('s17_btn')}</Btn>
      </div>
    </div>
  );
}

window.StoriesAlbumEditor = StoriesAlbumEditor;
window.S16HostRegistration = S16HostRegistration;
window.S17HostSummary = S17HostSummary;
window.S17HostSuccess = S17HostSuccess;
