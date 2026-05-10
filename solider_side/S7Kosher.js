/* S7Kosher — Kashrut & Shabbat observance preferences */

function S7Kosher({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.kosher || !data.shabbatKeeps}
      step={5}
      icon="🕍"
      title={t('s7_title')}
      sub={t('s7_sub')}
    >
      <RadioGroup
        label={t('s7_kosh')}
        value={data.kosher || ''}
        onChange={set('kosher')}
        options={[
          { value: 'none',     label: t('s7_none'),   sub: t('s7_none_s')   },
          { value: 'kosher',   label: t('s7_kosh_k'), sub: t('s7_kosh_k_s') },
          { value: 'mehadrin', label: t('s7_meh'),    sub: t('s7_meh_s')    },
        ]}
      />
      <RadioGroup
        label={t('s7_shab')}
        value={data.shabbatKeeps || ''}
        onChange={set('shabbatKeeps')}
        options={[
          { value: 'yes', label: t('s7_yes'), sub: t('s7_yes_s') },
          { value: 'no',  label: t('s7_no'),  sub: t('s7_no_s')  },
        ]}
      />
    </ScreenLayout>
  );
}
