const fs = require('fs');
const path = 'soldier/soldier_dashboard.js';
let src = fs.readFileSync(path, 'utf8');
const orig = src.length;
const log = [];

const patch = (desc, search, replace) => {
  if (src.includes(search)) {
    src = src.split(search).join(replace); // replace all occurrences matching (though we use once)
    log.push('OK  ' + desc);
    return true;
  }
  log.push('SKIP ' + desc + ' — pattern not found');
  return false;
};

// 1. Remove email from form state
patch('Remove email from form state',
  "    email: data.email || '',\r\n    bio: data.bio",
  "    bio: data.bio"
);

// 2. Remove email Input JSX
patch('Remove email Input from JSX',
  "          <Input label={t('s3_email')} value={form.email} onChange={setF('email')} />\r\n",
  ""
);

// 3. Fix broken t('lang') conditional in noMatches
// The file uses encoded Hebrew so search for the ASCII portion
const badLang = "{t('lang') === 'he'";
if (src.includes(badLang)) {
  // Find the full button content and replace just the condition
  const btnOld = "<Btn variant=\"secondary\" onClick={onNewRequest} className=\"max-w-xs\">{t('lang') === 'he'";
  const idx = src.indexOf(btnOld);
  if (idx !== -1) {
    const endIdx = src.indexOf('</Btn>', idx) + 6;
    const fullBtn = src.substring(idx, endIdx);
    const newBtn = "<Btn variant=\"secondary\" onClick={onNewRequest} className=\"max-w-xs\">{lang === 'he' ? '\u05e2\u05d3\u05db\u05d5\u05df \u05d1\u05e7\u05e9\u05d4' : 'Update Request'}</Btn>";
    src = src.substring(0, idx) + newBtn + src.substring(endIdx);
    log.push('OK  Fix t(lang) conditional in noMatches');
  }
} else {
  log.push('SKIP t(lang) fix — already fixed or not found');
}

// 4. Add status badges to request cards in S21SoldierProfile
// Search for the unique span around matchCount in S21
const matchSpan = `                        <span className={matchCount > 0 ? "text-brand-600 text-xs font-semibold" : "text-warm-400 text-xs"}>\r\n                          {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}\r\n                        </span>\r\n                      </div>`;
const matchSpanNew = `                        <span className={matchCount > 0 ? "text-brand-600 text-xs font-semibold" : "text-warm-400 text-xs"}>\r\n                          {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}\r\n                        </span>\r\n                        {req.status && (\r\n                          <span className={clsx(\r\n                            'mt-0.5 inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full w-fit border',\r\n                            req.status === 'matched'   && 'bg-support-50 text-support-600 border-support-100',\r\n                            req.status === 'searching' && 'bg-brand-50 text-brand-600 border-brand-100',\r\n                            req.status === 'canceled'  && 'bg-warm-100 text-warm-500 border-warm-200',\r\n                          )}>\r\n                            {req.status === 'matched'   && (lang === 'he' ? '\u2713 \u05e9\u05d5\u05d9\u05da' : '\u2713 Matched')}\r\n                            {req.status === 'searching' && (lang === 'he' ? '\u27f3 \u05de\u05d7\u05e4\u05e9' : '\u27f3 Searching')}\r\n                            {req.status === 'canceled'  && (lang === 'he' ? '\u2715 \u05d1\u05d5\u05d8\u05dc' : '\u2715 Canceled')}\r\n                          </span>\r\n                        )}\r\n                      </div>`;
patch('Add status badges to S21 request cards', matchSpan, matchSpanNew);

// 5. Redesign S15Landing CTA — remove heavy orange block, replace with clean card
const heavyCTA = `        <button \r\n          onClick={() => onNewRequest()}\r\n          className="w-full text-right p-8 rounded-3xl bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-all group relative overflow-hidden"\r\n        >\r\n          <div className="flex items-center gap-5 relative z-10">\r\n            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform">\r\n              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">\r\n                <path d="M12 5v14M5 12h14"/>\r\n              </svg>\r\n            </div>\r\n            <div className="flex-1 text-left rtl:text-right">\r\n              <h2 className="text-xl font-bold">{t('s15_landing_new_req_title')}</h2>\r\n              <p className="text-brand-100 text-sm opacity-90">{t('s15_form_sub')}</p>\r\n            </div>\r\n            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-70">\r\n              <path d="M9 18l6-6-6-6"/>\r\n            </svg>\r\n          </div>\r\n          {/* Decorative pattern */}\r\n          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150" />\r\n        </button>`;
const cleanCTA = `        {/* New Request CTA — clean premium card, no decorative noise */}\r\n        <button\r\n          onClick={() => onNewRequest()}\r\n          className="w-full text-start p-5 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex items-center gap-4"\r\n        >\r\n          <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0">\r\n            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">\r\n              <path d="M12 5v14M5 12h14"/>\r\n            </svg>\r\n          </div>\r\n          <div className="flex-1 min-w-0">\r\n            <p className="text-base font-bold text-gray-900">{t('s15_landing_new_req_title')}</p>\r\n            <p className="text-xs text-warm-500 mt-0.5">{t('s15_form_sub')}</p>\r\n          </div>\r\n          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-warm-400 group-hover:text-brand-500 transition-colors flex-shrink-0">\r\n            <path d="M9 18l6-6-6-6"/>\r\n          </svg>\r\n        </button>`;
patch('Redesign S15Landing CTA (remove heavy orange block)', heavyCTA, cleanCTA);

// 6. Add friend kosher/shabbat to guestCount > 1 block
const guestEnd = `            </div>\r\n          )}\r\n\r\n          <RadioGroup \r\n            label={t('s15_pets_comfort')}`;
const guestEndNew = `              {/* Group kosher & shabbat — required by processes_sheet for guestCount > 1 */}\r\n              <RadioGroup\r\n                label={lang === 'he' ? '\u05d7\u05d1\u05e8\u05d9\u05dd \u05d6\u05e7\u05d5\u05e7\u05d9\u05dd \u05dc\u05db\u05e9\u05e8\u05d5\u05ea?' : 'Do friends need kosher food?'}\r\n                value={request.friendKosher || 'no'}\r\n                onChange={(val) => handleChange('friendKosher', val)}\r\n                options={[\r\n                  { value: 'yes', label: t('s15_yes') },\r\n                  { value: 'no',  label: t('s15_no')  },\r\n                ]}\r\n              />\r\n              <RadioGroup\r\n                label={lang === 'he' ? '\u05d7\u05d1\u05e8\u05d9\u05dd \u05e9\u05d5\u05de\u05e8\u05d9 \u05e9\u05d1\u05ea?' : 'Are friends Shabbat observant?'}\r\n                value={request.friendShabbat || 'no'}\r\n                onChange={(val) => handleChange('friendShabbat', val)}\r\n                options={[\r\n                  { value: 'yes', label: t('s15_yes') },\r\n                  { value: 'no',  label: t('s15_no')  },\r\n                ]}\r\n              />\r\n            </div>\r\n          )}\r\n\r\n          <RadioGroup \r\n            label={t('s15_pets_comfort')}`;
patch('Add friend kosher/shabbat to group section', guestEnd, guestEndNew);

// 7. Link duration to needSleep
const durOld = `            onChange={(val) => handleChange('duration', val)}\r\n            options={[\r\n              { value: 'dinner', label: t('s15_duration_dinner') },\r\n              { value: 'full', label: t('s15_duration_full') },\r\n              { value: 'weekend', label: t('s15_duration_weekend') }\r\n            ]}`;
const durNew = `            onChange={(val) => {\r\n              handleChange('duration', val);\r\n              if (val === 'full' || val === 'weekend') handleChange('needSleep', true);\r\n              else handleChange('needSleep', false);\r\n            }}\r\n            options={[\r\n              { value: 'dinner',  label: t('s15_duration_dinner') },\r\n              { value: 'full',    label: t('s15_duration_full'),    sub: lang === 'he' ? '\u05db\u05d5\u05dc\u05dc \u05dc\u05d9\u05e0\u05d4' : 'Includes overnight' },\r\n              { value: 'weekend', label: t('s15_duration_weekend'), sub: lang === 'he' ? '\u05e9\u05d9\u05e9\u05d9\u2013\u05e9\u05d1\u05ea' : 'Fri\u2013Sat' },\r\n            ]}`;
patch('Link duration to needSleep', durOld, durNew);

// 8. Add km unit to travel distance slider
patch('Add km unit to travel distance',
  `              {t('s15_travel_dist')}: {request.travelDistance}\r\n            </label>`,
  `              {t('s15_travel_dist')}: {request.travelDistance} km\r\n            </label>`
);

fs.writeFileSync(path, src, 'utf8');
console.log(`Done. ${src.length} bytes (was ${orig})`);
log.forEach(l => console.log(l));
