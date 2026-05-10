/* S9Allergies — Food allergies & dietary preferences */

function S9Allergies({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const opts = [
    { value: 'gluten',     label: t('a_gluten')  },
    { value: 'lactose',    label: t('a_lactose') },
    { value: 'nuts',       label: t('a_nuts')    },
    { value: 'peanuts',    label: t('a_peanuts') },
    { value: 'vegetarian', label: t('a_veg')     },
    { value: 'vegan',      label: t('a_vegan')   },
    { value: 'fish',       label: t('a_fish')    },
    { value: 'other',      label: t('a_other')   },
  ];

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      step={5}
      total={8}
      icon="🥗"
      title={t('s9_title')}
      sub={t('s9_sub')}
    >
      <MultiCheck
        label={t('s9_label')}
        options={opts}
        values={data.allergies || []}
        onChange={val => set('allergies')(val)}
      />
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s9_note_label')}</label>
        <textarea
          value={data.allergyNote || ''}
          onChange={e => set('allergyNote')(e.target.value)}
          placeholder={t('s9_note_ph')}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
          rows={3}
        />
      </div>
    </ScreenLayout>
  );
}
