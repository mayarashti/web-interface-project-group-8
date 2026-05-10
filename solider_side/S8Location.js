/* S8Location — Hosting needs: sleep & walk distance */

function S8Location({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      step={6}
      total={12}
      icon="🏠"
      title={t('s8_title')}
      sub={t('s8_sub')}
    >
      <Card className="mb-5">
        <p className="text-sm font-semibold text-gray-700 mb-3">{t('s8_section')}</p>
        <p className="text-xs text-warm-400 mb-4">{t('s8_multi')}</p>
        <div className="space-y-4">
          <CheckRow checked={!!data.needSleep} onChange={set('needSleep')}>
            <span>
              <span className="font-medium text-gray-800">{t('s8_sleep')}</span>
              <br />
              <span className="text-warm-400">{t('s8_sleep_s')}</span>
            </span>
          </CheckRow>
          <CheckRow checked={!!data.walkDistance} onChange={set('walkDistance')}>
            <span>
              <span className="font-medium text-gray-800">{t('s8_walk')}</span>
              <br />
              <span className="text-warm-400">{t('s8_walk_s')}</span>
            </span>
          </CheckRow>
        </div>
      </Card>
      <Card className="bg-brand-50 border-brand-100 flex gap-3 items-start">
        <span className="text-xl flex-shrink-0">💡</span>
        <p className="text-xs text-brand-800 leading-relaxed">{t('s8_tip')}</p>
      </Card>
    </ScreenLayout>
  );
}
