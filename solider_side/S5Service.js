/* S5Service — Military service type selection */

function S5Service({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!data.serviceType}
      step={2}
      total={8}
      icon="🪖"
      title={t('s5_title')}
      sub={t('s5_sub')}
    >
      <RadioGroup
        label={t('s5_type')}
        value={data.serviceType || ''}
        onChange={set('serviceType')}
        options={[
          { value: 'regular', label: t('s5_reg'), sub: t('s5_reg_s') },
          { value: 'reserve', label: t('s5_res'), sub: t('s5_res_s') },
          { value: 'career',  label: t('s5_car'), sub: t('s5_car_s') },
        ]}
      />
      <Input
        label={t('s5_unit')}
        value={data.unit || ''}
        onChange={set('unit')}
        placeholder={t('s5_unit_ph')}
        hint={t('s5_unit_hint')}
      />
    </ScreenLayout>
  );
}
