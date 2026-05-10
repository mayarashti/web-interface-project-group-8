/* S6Upload — Service document upload & verification */
const { useState } = React;

function S6Upload({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [uploaded,  setUploaded]  = useState(!!data.docUploaded);
  const [docType,   setDocType]   = useState(data.docType || '');
  const [uploading, setUploading] = useState(false);

  const mockUpload = () => {
    if (!docType) return;
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      setData(prev => ({ ...prev, docUploaded: true, docType }));
    }, 1800);
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      nextDisabled={!uploaded}
      step={4}
      total={9}
      icon="📄"
      title={t('s6_title')}
      sub={t('s6_sub')}
    >
      <RadioGroup
        label={t('s6_doc')}
        value={docType}
        onChange={setDocType}
        options={[
          { value: 'tag',     label: t('s6_tag') },
          { value: 'reserve', label: t('s6_res') },
          { value: 'other',   label: t('s6_oth') },
        ]}
      />
      {!uploaded ? (
        <div className="mb-5">
          <div
            onClick={() => docType && mockUpload()}
            className={clsx(
              'border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
              docType
                ? 'border-brand-400 bg-brand-50 hover:bg-brand-100'
                : 'border-warm-300 bg-warm-50 cursor-not-allowed opacity-60'
            )}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-brand-600 font-medium">{t('s6_loading')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">📸</span>
                <p className="font-semibold text-gray-700 text-sm">{t('s6_tap')}</p>
                <p className="text-xs text-warm-400">{t('s6_size')}</p>
              </div>
            )}
          </div>
          {!docType && <p className="text-xs text-amber-600 mt-2 text-center">{t('s6_pick_first')}</p>}
        </div>
      ) : (
        <Card className="flex items-center gap-4 mb-5 border-green-200 bg-green-50">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <p className="font-semibold text-green-800 text-sm">{t('s6_done')}</p>
            <p className="text-xs text-green-600 mt-0.5">{t('s6_saved')}</p>
          </div>
        </Card>
      )}
      <Card className="flex items-start gap-3 mb-6 bg-amber-50 border-amber-200">
        <span className="text-xl flex-shrink-0">🔒</span>
        <p className="text-xs text-amber-800 leading-relaxed">{t('s6_note')}</p>
      </Card>
    </ScreenLayout>
  );
}
