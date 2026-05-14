/* S11Profile — Profile photo & bio */
const { useState } = React;

function S11Profile({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const [imgPreview, setImgPreview] = useState(data.avatarPreview || null);

  const mockUploadImg = () => {
    const colors = ['#b86442', '#6f8f72', '#687076', '#d59f83', '#5e7b61'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    setImgPreview(col);
    setData(prev => ({ ...prev, avatarPreview: col }));
  };

  return (
    <ScreenLayout
      onBack={onBack}
      onNext={onNext}
      step={5}
      total={6}
      icon
      title={t('s11_title')}
      sub={t('s11_sub')}
    >
      {/* Avatar picker */}
      <div className="flex justify-center mb-6">
        <div onClick={mockUploadImg} className="relative w-24 h-24 rounded-full cursor-pointer group">
          {imgPreview ? (
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-md"
              style={{ background: imgPreview }}
            >
              {(data.firstName || '?')[0]}
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-warm-100 flex items-center justify-center border border-dashed border-warm-300 group-hover:border-brand-200 transition-colors">
              <span className="w-8 h-8 rounded-full bg-white border border-warm-200 flex items-center justify-center text-xl leading-none" aria-hidden="true">+</span>
            </div>
          )}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">+</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-warm-400 mb-5">{t('s11_photo')}</p>

      {/* Bio textarea */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-warm-600 mb-1.5">{t('s11_bio')}</label>
        <textarea
          value={data.bio || ''}
          onChange={e => set('bio')(e.target.value)}
          placeholder={t('s11_bio_ph')}
          className="w-full px-4 py-3 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
          rows={4}
          maxLength={300}
        />
        <p className="text-xs text-warm-400 mt-1 text-left">{(data.bio || '').length}/300</p>
      </div>
    </ScreenLayout>
  );
}
