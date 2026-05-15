const fs = require('fs');
const path = 'host/host_dashboard.js';
let src = fs.readFileSync(path, 'utf8');
const orig = src.length;
const log = [];

const patch = (desc, search, replace) => {
  if (src.includes(search)) {
    src = src.replace(search, replace);
    log.push('OK  ' + desc);
  } else {
    log.push('SKIP ' + desc);
  }
};

// 1. Add lang to S19HostHome useLang destructure
patch('Add lang to S19HostHome',
  `function S19HostHome({ data, setData, onEditProfile }) {\r\n  const { t } = useLang();`,
  `function S19HostHome({ data, setData, onEditProfile }) {\r\n  const { t, lang } = useLang();`
);

// 2. Soft-delete for Cancel (set status:'canceled' instead of filter)
patch('Soft-delete on Cancel',
  `  const handleCancel = (id) => {\r\n    if (confirm(t('s19_confirm_cancel'))) {\r\n      setData(prev => ({\r\n        ...prev,\r\n        hostings: prev.hostings.filter(h => h.id !== id)\r\n      }));\r\n    }\r\n  };`,
  `  const handleCancel = (id) => {\r\n    if (confirm(t('s19_confirm_cancel'))) {\r\n      setData(prev => ({\r\n        ...prev,\r\n        hostings: prev.hostings.map(h => h.id === id ? { ...h, status: 'canceled' } : h)\r\n      }));\r\n    }\r\n  };`
);

// 3. Make Smart Alerts conditional on hasSoldierNearby + use section-label class
patch('Conditional smart alerts + section-label',
  `        {/* Smart Alerts Section */}\r\n        <div className="mb-6">\r\n          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{t('s19_smart_alerts')}</h2>\r\n          <Card className="p-4 bg-amber-50 border-amber-200">\r\n            <div className="flex gap-3 items-start">\r\n              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">\r\n                <span className="text-lg">\uD83D\uDD14</span>\r\n              </div>\r\n              <div>\r\n                <p className="text-sm font-semibold text-gray-900">{t('s19_alert_title')}</p>\r\n                <p className="text-xs text-warm-600 mt-1 leading-relaxed">{t('s19_alert_desc')}</p>\r\n              </div>\r\n            </div>\r\n          </Card>\r\n        </div>`,
  `        {/* Smart Alerts Section */}\r\n        <div className="mb-6">\r\n          <p className="section-label mb-3">{t('s19_smart_alerts')}</p>\r\n          {data.hasSoldierNearby ? (\r\n            <Card className="p-4 bg-amber-50 border-amber-200">\r\n              <div className="flex gap-3 items-start">\r\n                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">\r\n                  <span className="text-lg">\uD83D\uDD14</span>\r\n                </div>\r\n                <div>\r\n                  <p className="text-sm font-semibold text-gray-900">{t('s19_alert_title')}</p>\r\n                  <p className="text-xs text-warm-600 mt-1 leading-relaxed">{t('s19_alert_desc')}</p>\r\n                </div>\r\n              </div>\r\n            </Card>\r\n          ) : (\r\n            <Card className="p-4 border-dashed text-center">\r\n              <p className="text-sm text-warm-400">{lang === 'he' ? '\u05d0\u05d9\u05df \u05d4\u05ea\u05e8\u05d0\u05d5\u05ea \u05d7\u05d3\u05e9\u05d5\u05ea' : 'No new alerts'}</p>\r\n            </Card>\r\n          )}\r\n        </div>`
);

// 4. Add Canceled badge + opacity to hosting cards
patch('Add Canceled badge to hosting cards',
  `              const isFull = guests.length >= capacity && capacity > 0;\r\n\r\n              return (\r\n                <Card key={h.id} className="p-0 overflow-hidden">`,
  `              const isCanceled = h.status === 'canceled';\r\n              const isFull = !isCanceled && guests.length >= capacity && capacity > 0;\r\n\r\n              return (\r\n                <Card key={h.id} className={\`p-0 overflow-hidden\${isCanceled ? ' opacity-60' : ''}\`}>`
);

// 5. Update the status badge to include Canceled state
patch('Add Canceled to status badge',
  `                       <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}\`}>\r\n                         {guests.length}/{capacity} {t('s19_spots_taken')}\r\n                       </span>`,
  `                       <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full \${isCanceled ? 'bg-warm-100 text-warm-500' : isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}\`}>\r\n                         {isCanceled ? (lang === 'he' ? '\u05d1\u05d5\u05d8\u05dc' : 'Canceled') : \`\${guests.length}/\${capacity} \${t('s19_spots_taken')}\`}\r\n                       </span>`
);

// 6. Fix date locale in hosting cards (always he-IL → use lang)
patch('Fix date locale in hosting cards',
  `{new Date(h.date).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}`,
  `{new Date(h.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}`
);

// 7. Also fix Edit/Cancel actions to hide when hosting is canceled
patch('Hide Edit/Cancel actions for canceled hostings',
  `                  {/* Actions */}\r\n                  <div className="px-4 py-3 bg-warm-50 flex justify-end gap-3">\r\n                    <button\r\n                      onClick={() => handleCancel(h.id)}\r\n                      className="text-xs font-semibold text-warm-500 hover:text-red-600 transition-colors py-1"\r\n                    >\r\n                      {t('s19_cancel')}\r\n                    </button>\r\n                    <button\r\n                      onClick={() => handleEdit(h.id)}\r\n                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1"\r\n                    >\r\n                      {t('s19_edit')}\r\n                    </button>`,
  `                  {/* Actions */}\r\n                  <div className="px-4 py-3 bg-warm-50 flex justify-end gap-3">\r\n                    {isCanceled ? (\r\n                      <button\r\n                        onClick={() => setData(prev => ({ ...prev, hostings: prev.hostings.map(h2 => h2.id === h.id ? { ...h2, status: 'open' } : h2) }))}\r\n                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1"\r\n                      >\r\n                        {lang === 'he' ? '\u05e9\u05d7\u05d6\u05e8 \u05d0\u05d9\u05e8\u05d5\u05d7' : 'Restore'}\r\n                      </button>\r\n                    ) : (\r\n                      <>\r\n                    <button\r\n                      onClick={() => handleCancel(h.id)}\r\n                      className="text-xs font-semibold text-warm-500 hover:text-red-600 transition-colors py-1"\r\n                    >\r\n                      {t('s19_cancel')}\r\n                    </button>\r\n                    <button\r\n                      onClick={() => handleEdit(h.id)}\r\n                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors py-1"\r\n                    >\r\n                      {t('s19_edit')}\r\n                    </button>\r\n                      </>`
);

// Need to close the ternary — add closing paren after the "view guests" button block  
patch('Close isCanceled ternary after view-guests button',
  `                    {guests.length > 0 && (\r\n                      <button\r\n                        onClick={() => setSelectedHosting(h)}\r\n                        className="text-xs font-semibold bg-white border border-warm-200 rounded-lg px-3 py-1 text-gray-700 shadow-xs hover:bg-warm-50 transition-colors"\r\n                      >\r\n                        {t('s19_view_guests')} ({guests.length})\r\n                      </button>\r\n                    )}\r\n                  </div>`,
  `                    {guests.length > 0 && (\r\n                      <button\r\n                        onClick={() => setSelectedHosting(h)}\r\n                        className="text-xs font-semibold bg-white border border-warm-200 rounded-lg px-3 py-1 text-gray-700 shadow-xs hover:bg-warm-50 transition-colors"\r\n                      >\r\n                        {t('s19_view_guests')} ({guests.length})\r\n                      </button>\r\n                    )}\r\n                    )}\r\n                  </div>`
);

fs.writeFileSync(path, src, 'utf8');
console.log(`Done. ${src.length} bytes (was ${orig})`);
log.forEach(l => console.log(l));
