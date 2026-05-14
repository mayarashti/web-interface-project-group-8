/* S12Summary — Registration summary & submit */

function S12Summary({ data, onEdit, onSubmit, onBack }) {
  const { t } = useLang();

  const Row = ({ label, value }) => value ? (
    <div className="flex justify-between items-start py-2.5 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-32 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-left flex-1 mr-2">{value}</span>
    </div>
  ) : null;

  const svc  = { regular: t('map_reg'), reserve: t('map_res'), career: t('map_car') };
  const kosh = { none: t('map_none'), kosher: t('map_kosh'), mehadrin: t('map_meh') };
  const pets = { ok: t('map_pets_ok'), notok: t('map_pets_no'), allergy: t('map_pets_al') };
  const sol  = { yes: t('map_sol_yes'), no: t('map_sol_no'), dontmind: t('map_sol_dm') };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onSubmit}
      nextLabel={t('s12_submit')}
      step={3}
      total={3}
      icon
      title={t('s12_title')}
      sub={t('s12_sub')}
    >
      <Card className="mb-4">
        <p className="section-label mb-3">{t('s12_personal')}</p>
        <Row label={t('s12_full')}  value={data.fullName} />
        <Row label={t('s12_phone')} value={data.phone} />
      </Card>

      <Card className="mb-4">
        <p className="section-label mb-3">{t('s12_mil')}</p>
        <Row label={t('s12_stype')} value={svc[data.serviceType]} />
        <Row label={t('s12_unit')}  value={data.unit} />
        <Row label={t('s12_doc')}   value={data.docUploaded ? t('s12_uploaded') : '—'} />
      </Card>

      <Card className="mb-4">
        <p className="section-label mb-3">{t('s12_prefs')}</p>
        <Row label={t('s12_kosh')}   value={kosh[data.kosher]} />
        <Row label={t('s12_shab')}   value={data.shabbatKeeps === 'yes' ? t('s7_yes') : data.shabbatKeeps === 'no' ? t('s7_no') : null} />
        <Row label={t('s12_sleep')}  value={data.needSleep    ? t('map_sleep') : null} />
        <Row label={t('s12_walk')}   value={data.walkDistance ? t('map_walk')  : null} />
        <Row label={t('s12_allerg')} value={(data.allergies || []).join(', ') || t('s12_no_allerg')} />
        <Row label={t('s12_pets')}   value={pets[data.pets]} />
        <Row label={t('s12_sol')}    value={sol[data.withSoldiers]} />
      </Card>

      {data.bio && (
        <Card className="mb-4 bg-brand-50 border-brand-100">
          <p className="section-label mb-2">{t('s12_bio')}</p>
          <p className="text-sm text-gray-700 leading-relaxed italic">"{data.bio}"</p>
        </Card>
      )}

      <div className="mt-4">
        <Btn variant="secondary" onClick={onEdit}>{t('s12_edit')}</Btn>
      </div>
    </ScreenLayout>
  );
}
