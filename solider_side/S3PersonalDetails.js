/* S3PersonalDetails — Combined personal details and verification document */
const { useState } = React;

function S3PersonalDetails({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  const validate = () => {
    const e = {};
    if (!data.fullName?.trim()) e.fullName = t('v_name');
    if (!data.phone?.trim() || data.phone.replace(/\D/g, '').length < 9) e.phone = t('err_phone');
    if (!data.password || data.password.length < 6) e.password = t('err_pass');
    if (!data.docUploaded) e.doc = t('s6_pick_first');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));

  const mockUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setData(prev => ({ ...prev, docUploaded: true }));
    }, 1500);
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={() => { if (validate()) onNext(); }}
      step={1}
      total={3}
      icon
      title={t('s3_title')}
      sub={t('s3_sub')}
    >
      <div className="space-y-6">
        {/* Personal Details Section */}
        <div className="space-y-4">
          <Input 
            label={t('s16_name')} 
            value={data.fullName || ''} 
            onChange={set('fullName')} 
            placeholder={t('s16_name_ph')} 
            error={errors.fullName} 
          />
          <Input 
            label={t('s3_phone')} 
            type="tel" 
            value={data.phone || ''} 
            onChange={set('phone')} 
            placeholder="050-1234567" 
            error={errors.phone} 
          />
          <Input 
            label={t('s3_pass')} 
            type="password" 
            value={data.password || ''} 
            onChange={set('password')} 
            placeholder={t('s3_pass_ph')} 
            error={errors.password} 
            hint={t('s3_pass_hint')} 
          />
        </div>

        {/* Verification Document Section */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-warm-600">{t('s6_title')}</label>
          {!data.docUploaded ? (
            <div
              onClick={() => !uploading && mockUpload()}
              className={clsx(
                'border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-150',
                'border-brand-200 bg-brand-50 hover:bg-brand-100'
              )}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-brand-600 font-medium">{t('s6_loading')}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="w-8 h-8 rounded-full border border-brand-200 bg-white flex items-center justify-center text-lg" aria-hidden="true">+</span>
                  <p className="font-semibold text-gray-700 text-sm">{t('s6_tap')}</p>
                  <p className="text-xs text-warm-400">{t('s6_size')}</p>
                </div>
              )}
            </div>
          ) : (
            <Card className="flex items-center gap-4 border-green-200 bg-green-50 py-3">
              <div className="w-10 h-10 bg-support-50 border border-support-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <div className="w-5 h-5 rounded-full bg-support-500" />
              </div>
              <div>
                <p className="font-semibold text-green-800 text-sm">{t('s6_done')}</p>
                <p className="text-xs text-green-600">{t('s6_saved')}</p>
              </div>
              <button 
                type="button"
                onClick={() => set('docUploaded')(false)}
                className="mr-auto text-xs text-warm-500 underline"
              >
                ערוך
              </button>
            </Card>
          )}
          {errors.doc && <p className="text-xs text-red-500 font-medium">{errors.doc}</p>}
          <p className="text-xs text-warm-500 leading-relaxed">{t('s6_note')}</p>
        </div>
      </div>
    </ScreenLayout>
  );
}
