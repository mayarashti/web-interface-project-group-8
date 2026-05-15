#!/usr/bin/env python3
# Applies targeted patches to soldier_dashboard.js
import re, sys

path = "soldier/soldier_dashboard.js"
with open(path, encoding="utf-8") as f:
    src = f.read()

orig_len = len(src)
changes = []

# ── Patch 1: Remove email from S21SoldierProfile form state ──────────────────
old = "    email: data.email || '',\r\n    bio: data.bio"
new = "    bio: data.bio"
if old in src:
    src = src.replace(old, new, 1)
    changes.append("✓ Removed email from form state")
else:
    changes.append("✗ SKIP: email form state not found (already removed?)")

# ── Patch 2: Remove email Input from JSX ─────────────────────────────────────
old = "          <Input label={t('s3_email')} value={form.email} onChange={setF('email')} />\r\n"
new = ""
if old in src:
    src = src.replace(old, new, 1)
    changes.append("✓ Removed email Input from JSX")
else:
    changes.append("✗ SKIP: email Input not found")

# ── Patch 3: Fix broken t('lang') conditional in noMatches state ─────────────
old_txt = "{t('lang') === 'he' ? '\u00d7\u00a2\u00d7\u2022\u00d7\u2122\u00d7\u2022\u00d7\u0178 \u00d7\u2019\u00d7\u2014\u00d7\u0161\u00d7\u2022\u00d7\u2014' : 'Update Request'}"
new_txt = "{lang === 'he' ? '\u05e2\u05d3\u05db\u05d5\u05df \u05d1\u05e7\u05e9\u05d4' : 'Update Request'}"
if old_txt in src:
    src = src.replace(old_txt, new_txt, 1)
    changes.append("✓ Fixed t('lang') conditional")
else:
    changes.append("✗ SKIP: t('lang') pattern not found (already fixed?)")

# ── Patch 4: Add status badges to request cards in S21SoldierProfile ─────────
old = """                        <span className={matchCount > 0 ? \"text-brand-600 text-xs font-semibold\" : \"text-warm-400 text-xs\"}>
                          {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}
                        </span>
                      </div>"""
new = """                        <span className={matchCount > 0 ? "text-brand-600 text-xs font-semibold" : "text-warm-400 text-xs"}>
                          {matchCount === 0 ? t('s15_no_matches_found') : t('s15_matches_found', matchCount)}
                        </span>
                        {req.status && (
                          <span className={clsx(
                            'mt-0.5 inline-flex text-[11px] font-bold px-2 py-0.5 rounded-full w-fit border',
                            req.status === 'matched'   && 'bg-support-50 text-support-600 border-support-100',
                            req.status === 'searching' && 'bg-brand-50 text-brand-600 border-brand-100',
                            req.status === 'canceled'  && 'bg-warm-100 text-warm-500 border-warm-200',
                          )}>
                            {req.status === 'matched'   && (lang === 'he' ? '\u2713 \u05e9\u05d5\u05d9\u05da' : '\u2713 Matched')}
                            {req.status === 'searching' && (lang === 'he' ? '\u27f3 \u05de\u05d7\u05e4\u05e9' : '\u27f3 Searching')}
                            {req.status === 'canceled'  && (lang === 'he' ? '\u2715 \u05d1\u05d5\u05d8\u05dc' : '\u2715 Canceled')}
                          </span>
                        )}
                      </div>"""
# Use CRLF version to match actual file
old_crlf = old.replace("\n", "\r\n")
new_crlf = new.replace("\n", "\r\n")
if old_crlf in src:
    src = src.replace(old_crlf, new_crlf, 1)
    changes.append("✓ Added status badges to request cards")
else:
    changes.append("✗ SKIP: status badge target not found")

# ── Patch 5: Fix encoded save button text ────────────────────────────────────
old_btn = "          {saved ? (lang === 'he' ? '\u00d7\u00a0\u00d7\u00a9\u00d7\u017e\u00d7\u00a8 \u00d7\u2019\u00d7\u2022\u00d7\u201d\u00d7\u00a6\u00d7\u009c\u00d7\u00a8\u00d7\u201d! \u00c3\u00a2\u00e2\u20ac\u00a2\u00e2\u20ac\u009c' : 'Saved successfully! \u00c3\u00a2\u00e2\u20ac\u00a2\u00e2\u20ac\u009c') : (lang === 'he' ? '\u00d7\u00a9\u00d7\u017e\u00d7\u2022\u00d7\u00a8 \u00d7\u00a9\u00d7\u2122\u00d7\u00a0\u00d7\u2022\u00d7\u2022\u00d7\u2022' : 'Save Changes')}"
new_btn = "          {saved ? (lang === 'he' ? '\u05e0\u05e9\u05de\u05e8 \u05d1\u05d4\u05e6\u05dc\u05d7\u05d4! \u2713' : 'Saved successfully! \u2713') : (lang === 'he' ? '\u05e9\u05de\u05d5\u05e8 \u05e9\u05d9\u05e0\u05d5\u05d9\u05d9\u05dd' : 'Save Changes')}"
if old_btn in src:
    src = src.replace(old_btn, new_btn, 1)
    changes.append("✓ Fixed save button encoded text")
else:
    # Try the CRLF variant
    changes.append("✗ SKIP: save button encoded text not found (may already be fixed)")

# ── Patch 6: Redesign S15Landing CTA ─────────────────────────────────────────
# Replace the heavy orange button block
old_cta = "        <button \r\n          onClick={() => onNewRequest()}\r\n          className=\"w-full text-right p-8 rounded-3xl bg-brand-500 text-white shadow-lg hover:bg-brand-600 transition-all group relative overflow-hidden\"\r\n        >"
new_cta_start = "        {/* New Request CTA — clean premium card (no decorative noise per design-sheet) */}\r\n        <button\r\n          onClick={() => onNewRequest()}\r\n          className=\"w-full text-start p-5 rounded-2xl bg-white border border-warm-200 shadow-sm hover:border-brand-300 hover:shadow-md transition-all group flex items-center gap-4\"\r\n        >"
if old_cta in src:
    src = src.replace(old_cta, new_cta_start, 1)
    # Also replace the inner content of the CTA button
    old_inner = "          <div className=\"flex items-center gap-5 relative z-10\">\r\n            <div className=\"w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform\">\r\n              <svg width=\"28\" height=\"28\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\">\r\n                <path d=\"M12 5v14M5 12h14\"/>\r\n              </svg>\r\n            </div>\r\n            <div className=\"flex-1 text-left rtl:text-right\">\r\n              <h2 className=\"text-xl font-bold\">{t('s15_landing_new_req_title')}</h2>\r\n              <p className=\"text-brand-100 text-sm opacity-90\">{t('s15_form_sub')}</p>\r\n            </div>\r\n            <svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\" className=\"opacity-70\">\r\n              <path d=\"M9 18l6-6-6-6\"/>\r\n            </svg>\r\n          </div>\r\n          {/* Decorative pattern */}\r\n          <div className=\"absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150\" />"
    new_inner = "          <div className=\"w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center text-brand-500 group-hover:bg-brand-500 group-hover:text-white transition-colors flex-shrink-0\">\r\n            <svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\">\r\n              <path d=\"M12 5v14M5 12h14\"/>\r\n            </svg>\r\n          </div>\r\n          <div className=\"flex-1 min-w-0\">\r\n            <p className=\"text-base font-bold text-gray-900\">{t('s15_landing_new_req_title')}</p>\r\n            <p className=\"text-xs text-warm-500 mt-0.5\">{t('s15_form_sub')}</p>\r\n          </div>\r\n          <svg width=\"16\" height=\"16\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" strokeWidth=\"2.5\" strokeLinecap=\"round\" strokeLinejoin=\"round\" className=\"text-warm-400 group-hover:text-brand-500 transition-colors flex-shrink-0\">\r\n            <path d=\"M9 18l6-6-6-6\"/>\r\n          </svg>"
    if old_inner in src:
        src = src.replace(old_inner, new_inner, 1)
        changes.append("✓ Redesigned S15Landing CTA button (removed decorative noise)")
    else:
        changes.append("✗ SKIP: CTA inner content not matched after outer match")
else:
    changes.append("✗ SKIP: CTA button outer not found")

# ── Patch 7: Add friend kosher/shabbat fields when guestCount > 1 ────────────
old_group_end = "            </div>\r\n          )}\r\n\r\n          <RadioGroup \r\n            label={t('s15_pets_comfort')}"
new_group_end = "              {/* Group kosher & shabbat — required by processes_sheet for guestCount > 1 */}\r\n              <RadioGroup\r\n                label={lang === 'he' ? '\u05d7\u05d1\u05e8\u05d9\u05dd \u05d6\u05e7\u05d5\u05e7\u05d9\u05dd \u05dc\u05db\u05e9\u05e8\u05d5\u05ea?' : 'Do friends need kosher food?'}\r\n                value={request.friendKosher || 'no'}\r\n                onChange={(val) => handleChange('friendKosher', val)}\r\n                options={[\r\n                  { value: 'yes', label: t('s15_yes') },\r\n                  { value: 'no',  label: t('s15_no')  },\r\n                ]}\r\n              />\r\n              <RadioGroup\r\n                label={lang === 'he' ? '\u05d7\u05d1\u05e8\u05d9\u05dd \u05e9\u05d5\u05de\u05e8\u05d9 \u05e9\u05d1\u05ea?' : 'Are friends Shabbat observant?'}\r\n                value={request.friendShabbat || 'no'}\r\n                onChange={(val) => handleChange('friendShabbat', val)}\r\n                options={[\r\n                  { value: 'yes', label: t('s15_yes') },\r\n                  { value: 'no',  label: t('s15_no')  },\r\n                ]}\r\n              />\r\n            </div>\r\n          )}\r\n\r\n          <RadioGroup \r\n            label={t('s15_pets_comfort')}"
if old_group_end in src:
    src = src.replace(old_group_end, new_group_end, 1)
    changes.append("✓ Added friend kosher/shabbat fields")
else:
    changes.append("✗ SKIP: guestCount group end not found")

# ── Patch 8: Link duration to needSleep automatically ────────────────────────
old_dur = "            onChange={(val) => handleChange('duration', val)}\r\n            options={[\r\n              { value: 'dinner', label: t('s15_duration_dinner') },\r\n              { value: 'full', label: t('s15_duration_full') },\r\n              { value: 'weekend', label: t('s15_duration_weekend') }\r\n            ]}"
new_dur = "            onChange={(val) => {\r\n              handleChange('duration', val);\r\n              if (val === 'full' || val === 'weekend') handleChange('needSleep', true);\r\n              else handleChange('needSleep', false);\r\n            }}\r\n            options={[\r\n              { value: 'dinner',  label: t('s15_duration_dinner') },\r\n              { value: 'full',    label: t('s15_duration_full'),    sub: lang === 'he' ? '\u05db\u05d5\u05dc\u05dc \u05dc\u05d9\u05e0\u05d4' : 'Includes overnight' },\r\n              { value: 'weekend', label: t('s15_duration_weekend'), sub: lang === 'he' ? '\u05e9\u05d9\u05e9\u05d9-\u05e9\u05d1\u05ea' : 'Fri\u2013Sat' },\r\n            ]}"
if old_dur in src:
    src = src.replace(old_dur, new_dur, 1)
    changes.append("✓ Linked duration to needSleep")
else:
    changes.append("✗ SKIP: duration onChange not found")

# ── Patch 9: Add km label to travel distance slider ──────────────────────────
old_dist = "              {t('s15_travel_dist')}: {request.travelDistance}\r\n            </label>"
new_dist = "              {t('s15_travel_dist')}: {request.travelDistance} km\r\n            </label>"
if old_dist in src:
    src = src.replace(old_dist, new_dist, 1)
    changes.append("✓ Added km unit to travel distance")
else:
    changes.append("✗ SKIP: travel distance label not found")

with open(path, "w", encoding="utf-8") as f:
    f.write(src)

print(f"Done. {len(src)} bytes (was {orig_len})")
for c in changes:
    print(c)
