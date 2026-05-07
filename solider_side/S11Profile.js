/* S11Profile — Profile photo & bio */

function S11Profile({ data, setData, onNext, onBack }) {
  const { t } = useLang();
  const set = (key) => (val) => setData(prev => ({ ...prev, [key]: val }));
  const [imgPreview, setImgPreview] = useState(data.avatarPreview || null);

  const mockUploadImg = () => {
    const colors = ['#c2560e', '#2563eb', '#16a34a', '#7c3aed', '#db2777'];
    const col = colors[Math.floor(Math.random() * colors.length)];
    setImgPreview(col);
    setData(prev => ({ ...prev, avatarPreview: col }));
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col px-5 py-8 max-w-md mx-auto">
      <BackBtn onBack={onBack} />
      <ProgressBar step={9} total={12} />
      <SectionTitle icon="😊" title={t('s11_title')} sub={t('s11_sub')} />

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
            <div className="w-24 h-24 rounded-full bg-warm-200 flex items-center justify-center border-2 border-dashed border-warm-400 group-hover:border-brand-400 transition-colors">
              <span className="text-3xl">📷</span>
            </div>
          )}
          <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-white text-sm">+</span>
          </div>
        </div>
      </div>
      <p className="text-center text-xs text-warm-400 mb-5">{t('s11_photo')}</p>

      {/* Bio textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('s11_bio')}</label>
        <textarea
          value={data.bio || ''}
          onChange={e => set('bio')(e.target.value)}
          placeholder={t('s11_bio_ph')}
          className="w-full px-4 py-3 rounded-xl border border-warm-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-brand-400 resize-none transition-all"
          rows={4}
          maxLength={300}
        />
        <p className="text-xs text-warm-400 mt-1 text-left">{(data.bio || '').length}/300</p>
      </div>

      <div className="mt-auto">
        <Btn onClick={onNext}>{t('continue')}</Btn>
      </div>
    </div>
  );
}
