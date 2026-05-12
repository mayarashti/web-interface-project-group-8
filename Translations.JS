/* ─────────────────────────────────────────
   translations.js
   Language context, hook, toggle button,
   and full HE / EN string map.
───────────────────────────────────────── */

const LangContext = React.createContext({ lang:'he', setLang: () => {} });
window.LangContext = LangContext;

function useLang() {
  const { lang, setLang } = React.useContext(LangContext);
  const t = (key, ...args) => {
    const val = T[lang]?.[key] ?? T['he']?.[key] ?? key;
    return typeof val ==='function'? val(...args) : val;
  };
  return { lang, setLang, t, isRTL: lang ==='he'};
}

function LangToggle({ variant ='fixed'} = {}) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang ==='he'?'en':'he')}
      className={`lang-toggle${variant ==='inline'?'lang-toggle-inline':''}`}
      title={lang ==='he'?'Switch to English':'עבור לעברית'}
    >
      {lang ==='he'?'EN':'עב'}
    </button>
  );
}

const T = {
  /* ══════════════════════════════════════════
     HEBREW
  ══════════════════════════════════════════ */
  he: {
    back:'חזור',
    continue:'המשך ←',
    step_label: (s, total) => `שלב ${s} מתוך ${total}`,

    /* S1 Welcome */
    s1_title:'מארחי שבת', s1_subtitle:'Shabbat Hosts',
    s1_tagline:'הצטרף לקהילת האירוח שלנו',
    s1_soldier:'הרשמה כחייל', s1_host:'הרשמה כמשפחה מארחת',
    s1_footer:'הצטרף לקהילה שמחברת חיילים עם משפחות מארחות',
    s1_login:'כבר יש לך חשבון? התחברות',

    /* S0 Login */
    s0_title:'התחברות', s0_subtitle:'ברוך שובך!',
    s0_email:'כתובת אימייל', s0_email_placeholder:'your@email.com',
    s0_password:'סיסמה', s0_password_placeholder:'הזן סיסמה',
    s0_remember:'זכור אותי', s0_forgot:'שכחתי סיסמה',
    s0_login_button:'התחבר', s0_back_to_register:'חזרה להרשמה',

    /* S2 Explain (soldier) */
    s2_title:'איך זה עובד?', s2_sub:'כל מה שצריך לדעת לפני שמתחילים',
    s2_f1_t:'מיקום קרוב',     s2_f1_d:'מצא משפחות מארחות בקרבת הבסיס שלך',
    s2_f2_t:'התאמה אישית',    s2_f2_d:'כשרות, אלרגיות והעדפות — הכל לפי מה שמתאים לך',
    s2_f3_t:'גמישות מלאה',    s2_f3_d:'אשר אירוח לשישי הקרוב בכמה לחיצות',
    s2_f4_t:'תקשורת בטוחה',  s2_f4_d:'דברו עם המשפחה דרך מערכת מוגנת ובטוחה',
    s2_btn:'התחל הרשמה ←',

    /* S3 Account */
    s3_title:'יצירת חשבון', s3_sub:'כמה פרטים קטנים ואתה בפנים!',
    s3_first:'שם פרטי', s3_last:'שם משפחה',
    s3_phone:'מספר טלפון', s3_email:'אימייל',
    s3_pass:'סיסמה', s3_pass_ph:'לפחות 6 תווים', s3_pass_hint:'הסיסמה שמורה בצורה מאובטחת',
    s3_terms_pre:'אני מאשר/ת את', s3_terms_link1:'תנאי השימוש',
    s3_terms_and:'ו', s3_terms_link2:'מדיניות הפרטיות',
    s3_ph_first:'ישראל', s3_ph_last:'כהן', s3_ph_email:'israel@gmail.com',
    err_first:'שם פרטי הוא שדה חובה', err_last:'שם משפחה הוא שדה חובה',
    err_phone:'הכנס מספר טלפון תקין', err_email:'הכנס כתובת אימייל תקינה',
    err_pass:'סיסמה חייבת להכיל לפחות 6 תווים', err_terms:'יש לאשר את תנאי השימוש',

    /* S4 Verify */
    s4_title:'אימות מספר טלפון', s4_sent:'שלחנו קוד אימות ב-SMS אל',
    s4_label:'קוד אימות (6 ספרות)', s4_hint:'לצורך הדגמה, הכנס: 123456',
    s4_btn:'אמת', s4_wrong:'קוד שגוי, נסה שוב', s4_resent:'הקוד נשלח מחדש!',
    s4_resend: (sec) => sec > 0 ? `שלח קוד מחדש (${sec}ש)` :'שלח קוד מחדש',

    /* S5 Service */
    s5_title:'סטטוס שירות', s5_sub:'ספר לנו על השירות הצבאי שלך',
    s5_type:'סוג שירות',
    s5_reg:'שירות סדיר', s5_reg_s:'חייל/ת בשירות חובה',
    s5_res:'מילואים',    s5_res_s:'שירות מילואים פעיל',
    s5_car:'קבע',        s5_car_s:'קצין/ת או נגד קבע',
    s5_unit:'יחידה / בסיס (אופציונלי)',
    s5_unit_ph:'לדוגמה: בסיס רמת דוד, גולני...',
    s5_unit_hint:'לא חובה — עוזר להתאמה טובה יותר',

    /* S6 Upload */
    s6_title:'אימות מסמך שירות', s6_sub:'העלה מסמך לאימות — הכל מאובטח ומוגן',
    s6_doc:'סוג מסמך', s6_tag:'צילום חוגר (תג)', s6_res:'אישור מילואים', s6_oth:'מסמך אחר',
    s6_tap:'לחץ להעלאה / צילום', s6_size:'JPG, PNG, PDF — עד 10MB',
    s6_loading:'מעלה מסמך...', s6_pick_first:'בחר סוג מסמך תחילה',
    s6_done:'המסמך הועלה בהצלחה!', s6_saved:'הקובץ נשמר בצורה מאובטחת',
    s6_note:'המסמך משמש לאימות בלבד. הוא אינו מועבר למשפחות המארחות ונמחק לאחר האימות.',

    /* S7 Kosher & Shabbat */
    s7_title:'כשרות ושבת', s7_sub:'נשתמש במידע הזה כדי להתאים לך את המשפחה המושלמת',
    s7_kosh:'כשרות',
    s7_none:'לא חשוב', s7_none_s:'מקבל/ת כל סוג אוכל',
    s7_kosh_k:'כשר', s7_kosh_k_s:'בשר/חלב נפרדים ותו הכשר',
    s7_meh:'כשר למהדרין', s7_meh_s:'הכשר מהדרין בלבד',
    s7_shab:'שמירת שבת',
    s7_yes:'שומר/ת שבת', s7_yes_s:'חשוב לי להיות בבית שומר שבת',
    s7_no:'לא שומר/ת שבת', s7_no_s:'מתאים לי גם בית לא דתי',

    /* S8 Hosting Options */
    s8_title:'צרכי אירוח', s8_sub:'ספר לנו מה אתה צריך — נמצא משפחה שתתאים בדיוק',
    s8_section:'מה אתה צריך לשישי?', s8_multi:'אפשר לסמן יותר מאפשרות אחת',
    s8_sleep:'צריך/ה מקום לישון', s8_sleep_s:'אשאר לישון אצל המשפחה בשבת',
    s8_walk:'צריך/ה מרחק הליכה מהבסיס', s8_walk_s:'אני לא נוסע בשבת, המשפחה צריכה להיות קרובה',
    s8_tip:'אם לא סימנת כלום — נמצא לך משפחה לארוחה בלבד. תמיד אפשר לעדכן בפרופיל שלך.',

    /* S9 Allergies */
    s9_title:'אלרגיות והעדפות אוכל', s9_sub:'המשפחה המארחת תדע בדיוק מה להכין בשבילך',
    s9_label:'בחר/י את כל מה שרלוונטי',
    s9_note_label:'יש משהו נוסף שכדאי למשפחה לדעת?',
    s9_note_ph:'לדוגמה: אני לא אוכל ירקות מסוגים מסוימים, יש לי אלרגיה לחומרי ניקוי...',
    a_gluten:'ללא גלוטן', a_lactose:'ללא לקטוז', a_nuts:'אלרגיה לאגוזים',
    a_peanuts:'אלרגיה לבוטנים', a_veg:'צמחוני', a_vegan:'טבעוני',
    a_fish:'דגים בלבד', a_other:'אחר',

    /* S10 Prefs */
    s10_title:'העדפות נוספות', s10_sub:'נשתמש בזה כדי למצוא לך את ההתאמה הטובה ביותר',
    s10_sol:'מעדיף/ה להתארח עם חיילים נוספים?',
    s10_sol_yes:'כן, אשמח', s10_sol_no:'מעדיף/ה לבד', s10_sol_dm:'לא משנה לי',
    s10_lang:'שפה מועדפת לתקשורת',
    s10_pets:'נוחות עם חיות מחמד',
    s10_pets_ok:'נוח עם חיות', s10_pets_no:'לא נוח', s10_pets_al:'יש לי אלרגיה לחיות',

    /* S11 Profile */
    s11_title:'הפרופיל שלך', s11_sub:'פרופיל עשיר עוזר למשפחות להכיר אותך לפני שמגיע שישי',
    s11_photo:'לחץ לבחירת תמונה (אופציונלי)',
    s11_bio:'ספר לנו עליך',
    s11_bio_ph:'היי, אני דניאל, משרת באזור חיפה ומחפש ארוחת שישי חמה כשאני יוצא מהבסיס.',

    /* S12 Summary */
    s12_title:'סיכום הרשמה', s12_sub:'בדוק שהכל נכון לפני השליחה',
    s12_personal:'פרטים אישיים', s12_full:'שם מלא', s12_phone:'טלפון', s12_email:'אימייל',
    s12_mil:'שירות צבאי', s12_stype:'סוג שירות', s12_unit:'יחידה', s12_doc:'מסמך',
    s12_uploaded:'הועלה',
    s12_prefs:'העדפות', s12_kosh:'כשרות', s12_shab:'שמירת שבת',
    s12_sleep:'לינה', s12_walk:'מרחק הליכה', s12_allerg:'אלרגיות',
    s12_no_allerg:'ללא', s12_pets:'חיות מחמד', s12_sol:'עם חיילים',
    s12_bio:'תיאור אישי', s12_submit:'שלח פרופיל', s12_edit:'ערוך פרטים',

    /* S13 Pending */
    s13_title:'הפרופיל שלך בבדיקה',
    s13_sub:'לאחר אישור, תוכל ליצור בקשת אירוח ולהתחבר למשפחות מארחות בכל הארץ',
    s13_eta:'בדרך כלל לוקח פחות מדקה',
    s13_done:'האימות הושלם בהצלחה!', s13_redir:'מעביר אותך לדף הבית...',

    /* S14 Success */
    s14_hi:'ברוך הבא!', s14_ok:'האימות הושלם בהצלחה',
    s14_desc:'אתה עכשיו חלק מקהילת מארחי שבת.\nאפשר להתחיל לחפש ארוחת שישי חמה!',
    s14_home:'לעמוד הבית',

    /* S15 Soldier Home */
    s15_hi:'שלום,', s15_status:'סטטוס: חייל/ת מאומת/ת',
    s15_filter_btn:'סנן ארוחות',
    s15_filter_title:'סינון ארוחות',
    s15_filter_date:'תאריך',
    s15_filter_time:'טווח שעות',
    s15_filter_type:'סוג הבית',
    s15_filter_sleep:'כולל לינה',
    s15_filter_kosh:'כשרות',
    s15_filter_apply:'החל סינון',
    s15_filter_reset:'איפוס',
    s15_send_msg:'שלח הודעה',
    s15_chat_title:'צ׳אט עם משפחת',
    s15_chat_ph:'הקלד הודעה...',
    s15_chat_send:'שלח',
    s15_chat_welcome: (name) => `היי! כאן משפחת ${name}. נשמח לארח אותך, מוזמן לשאול כל דבר!`,
    s15_new:'צור בקשת אירוח לשישי',
    s15_shab:'שבת קרובה', s15_friday:'שישי,',
    s15_avail: (n) => `${n} משפחות זמינות באזורך`,
    s15_map_title:'משפחות שפתחו שולחן לשישי',
    s15_map_sub:'מצא משפחה חמה לשבת הקרובה שלך',
    s15_tap_map:'לחצו על בית במפה כדי לראות פרטים',
    s15_talk_whatsapp:'דברו בוואטסאפ',
    s15_call:'התקשרו',
    s15_capacity:'מקומות',
    s15_sleep_available:'לינה זמינה',
    s15_open_table:'שולחן פתוח',
    s15_guests_title:'חיילים כבר התארחו',
    s15_view:'צפה בהתאמות', s15_rec:'התאמות מומלצות',
    s15_past:'אירוחים קודמים',
    s15_no_past:'עדיין לא היו לך אירוחים — בוא נחפש את הראשון שלך!',
    s15_slots:'מקומות פנויים',

    /* S18 Host Explain */
    s18_title:'איך זה עובד?', s18_sub:'כל מה שצריך לדעת לפני שמתחילים',
    s18_f1_t:'חיילים מאומתים',   s18_f1_d:'כל חייל עובר תהליך אימות לפני שיכול לפנות למשפחות',
    s18_f2_t:'אתם קובעים מתי',   s18_f2_d:'אתם מחליטים אם ומתי לארח — אין התחייבות קבועה',
    s18_f3_t:'התאמה מדויקת',     s18_f3_d:'נתאים לכם חיילים לפי כשרות, שפה והעדפות הבית',
    s18_f4_t:'תקשורת מאובטחת',  s18_f4_d:'כל התקשורת עם החיילים עוברת דרך המערכת שלנו',
    s18_btn:'התחל הרשמה ←',

    /* S16 Host Registration */
    s16_step_labels: ['פרטים אישיים','סוג אירוח','אורח החיים','שירותים','אופי הבית'],
    s16_1_title:'הרשמת משפחה מארחת', s16_1_sub:'בואו נכיר אתכם לפני שנפגיש אתכם עם חיילים',
    s16_welcome:'תודה שבחרתם לפתוח את ביתכם לחיילים. מלאו את הפרטים ונחזור אליכם בהקדם!',
    s16_name:'שם מלא', s16_name_ph:'שם פרטי ושם משפחה',
    s16_phone:'מספר טלפון', s16_phone_hint:'נשתמש בו ליצירת קשר לפני שישי',
    s16_email:'כתובת אימייל',
    s16_2_title:'סוג אירוח ומיקום', s16_2_sub:'ספרו לנו מה אתם מציעים ואיפה אתם נמצאים',
    s16_host_label:'סוג אירוח מועדף', s16_host_multi:'אפשר לבחור יותר מאפשרות אחת',
    s16_fri_din:'ארוחת ליל שישי', s16_fri_din_s:'סעודת שבת — ארוחה ראשונה',
    s16_sat_lun:'ארוחת צהריים שבת', s16_sat_lun_s:'סעודת היום — ארוחה שנייה',
    s16_deliv:'משלוח מנות לבסיסים', s16_deliv_s:'שליחת מנות חמות לחיילים בבסיס',
    s16_city:'כתובת בית / עיר', s16_city_ph:'לדוגמה: חיפה, רחוב הרצל 12...',
    s16_city_hint:'כתובת מדויקת מאפשרת התאמה מיטבית לחיילים מקרוב',
    s16_langs:'שפות שמדברים בבית',
    s16_3_title:'אורח החיים', s16_3_sub:'פרטים אלו עוזרים לנו להתאים חיילים עם אותן ציפיות',
    s16_shab_lev:'רמת שמירת שבת',
    s16_obs:'שומרי שבת',  s16_obs_s:'ללא חשמל, שבת מלאה לפי ההלכה',
    s16_trad:'מסורתי',      s16_trad_s:'קידוש, ארוחה חמה ואווירה שבתית',
    s16_sec:'חילוני',       s16_sec_s:'ארוחה חמה ואווירה נעימה ומשפחתית',
    s16_kosh_lev:'כשרות',
    s16_meh:'כשר למהדרין', s16_meh_s:'הכשר מהדרין, ללא חשש עירוב',
    s16_k:'כשר',          s16_k_s:'בשר/חלב נפרדים ותו הכשר',
    s16_none:'לא חשוב',      s16_none_s:'מתאים לכל סוג חייל',
    s16_4_title:'שירותים נוספים', s16_4_sub:'כל תוספת עוזרת לנו להתאים לכם חיילים שמחפשים בדיוק את זה',
    s16_opt:'אופציונלי — כל תוספת תסייע לחיילים',
    s16_slp:'מקום לינה', s16_slp_s:'יכולים לספק מקום שינה לחייל/ת בשבת',
    s16_trn:'הסעה',       s16_trn_s:'יכולים להסיע מ/לבסיס או לתחנה קרובה',
    s16_tip:'אם לא תסמנו כלום — נתאים לכם חיילים לארוחה בלבד. אפשר לעדכן בכל עת מהפרופיל.',
    s16_5_title:'אופי הבית', s16_5_sub:'כמה פרטים אחרונים ואתם מוכנים!',
    s16_cap_label:'מקסימום חיילים לאירוח', s16_cap_sub:'כמה חיילים תוכלו לארח בסעודה אחת?',
    s16_vibe_label:'תגיות אופי הבית',
    s16_vibe_sub:'בחרו תגיות שמתארות את הבית שלכם — עוזר לחיילים להרגיש בנוח',
    s16_sum_title:'סיכום הרשמה',
    s16_sum_name:'שם', s16_sum_city:'עיר', s16_sum_host:'אירוח',
    s16_sum_shab:'שבת', s16_sum_cap:'קיבולת', s16_sum_tags:'תגיות',
    s16_cap_unit: (n) => `עד ${n} חיילים`,
    s16_submit:'השלם ורשום פרופיל',
    v_name:'שם מלא הוא שדה חובה', v_phone:'הכנס מספר טלפון תקין',
    v_email:'הכנס כתובת אימייל תקינה', v_hosting:'יש לבחור לפחות סוג אירוח אחד',
    v_city:'יש להזין עיר או כתובת', v_shab:'יש לבחור רמת שמירת שבת',
    v_kosh:'יש לבחור רמת כשרות', v_cap:'יש לבחור מספר חיילים מרבי',

    /* S17 Host Success */
    s17_hi:'ברוכים הבאים!', s17_ok:'ההרשמה הושלמה בהצלחה',
    s17_desc:'אתם עכשיו חלק ממשפחת מארחי שבת.\nחיילים יוכלו למצוא אתכם ולבקש אירוח לשישי!',
    s17_home:'לעמוד הבית',

    /* S19 Host Home */
    s19_hi:'שלום,', s19_status:'משפחה מארחת מאומתת',
    s19_new:'פתח אירוח לשישי הקרוב',
    s19_my_hostings:'האירוחים שלי',
    s19_no_hostings:'לא יצרת אירוחים עדיין',
    s19_spots_taken:'מקומות תפוסים',
    s19_guests_title:'חיילים שמגיעים:',
    s19_no_guests_yet:'עדיין אין נרשמים לאירוח זה',
    s19_edit_hosting:'ערוך אירוח',
    s19_cancel_hosting:'בטל אירוח',
    s19_unit:'יחידה:',

    /* S20 New Hosting */
    s20_title:'פתיחת אירוח חדש', s20_sub:'מלאו את הפרטים וחיילים יוכלו להירשם',
    s20_date_label:'בחרו תאריך', s20_date_sub:'השישי הקרוב מסומן ראשון',
    s20_day:'שישי', s20_shab:'שבת', s20_other:'או בחרו תאריך אחר',
    s20_time_label:'שעת האירוח',
    s20_fri_eve:'ערב שישי', s20_fri_eve_s:'ארוחת ליל שבת ~19:00',
    s20_sat_lun:'צהריים שבת', s20_sat_lun_s:'ארוחת שבת ~12:30',
    s20_custom:'שעה אחרת', s20_custom_s:'בחר שעה מותאמת אישית',
    s20_sol_label:'כמה חיילים לאירוח זה?', s20_sol_sub:'ניתן לשנות לכל אירוח בנפרד',
    s20_note_label:'הערה חופשית (אופציונלי)',
    s20_note_sub:'ספרו לחיילים משהו על האירוח — מה יהיה בתפריט, אווירה, וכו\'',
    s20_note_ph:'לדוגמה: נכין חמין מסורתי, יש פסנתר בבית, מרפסת נוף לים...',
    s20_img_label:'תמונות (אופציונלי)',
    s20_img_sub:'תמונות של הבית, הארוחה או האווירה — עוזר לחיילים להתחבר',
    s20_add:'הוסף', s20_img_count: (n) => `${n}/5 תמונות`,
    s20_prev_title:'תצוגה מקדימה',
    s20_prev_date:'תאריך', s20_prev_time:'שעה', s20_prev_slots:'מקומות',
    s20_slots_val: (n) => `עד ${n} חיילים`,
    s20_fri_time:'ערב שישי ~19:00', s20_sat_time:'צהריים שבת ~12:30', s20_cust_time:'שעה מותאמת',
    s20_submit:'פרסם אירוח',
    s20_done_title:'האירוח פורסם!',
    s20_done_sub:'חיילים באזורכם יוכלו לראות את האירוח ולבקש להצטרף',
    v_date:'יש לבחור תאריך', v_time:'יש לבחור שעה', v_sol:'יש לבחור מספר חיילים',

    /* Shared labels */
    lang_he:'עברית', lang_en:'אנגלית', lang_ru:'רוסית',
    lang_ar:'ערבית', lang_fr:'צרפתית', lang_other:'אחר',
    vibe_kids:'בית עם ילדים', vibe_quiet:'בית שקט', vibe_multi:'דוברי שפות',
    vibe_sing:'אוהבי שירה', vibe_pets:'יש חיות בית', vibe_space:'בית מרווח',
    vibe_shab:'אווירה שבתית', vibe_food:'אוהבי בישול',
    map_meh:'כשר למהדרין', map_kosh:'כשר', map_none:'לא חשוב',
    map_obs:'שומרי שבת', map_trad:'מסורתי', map_sec:'חילוני',
    map_pets_ok:'נוח', map_pets_no:'לא נוח', map_pets_al:'אלרגי לחיות',
    map_sol_yes:'כן', map_sol_no:'לא', map_sol_dm:'לא משנה',
    map_reg:'שירות סדיר', map_res:'מילואים', map_car:'קבע',
    map_sleep:'צריך/ה מקום לישון', map_walk:'נדרש מרחק הליכה',
    map_fri:'ארוחת ליל שישי', map_lun:'ארוחת צהריים שבת', map_del:'משלוח לבסיסים',
    map_fri_s:'ליל שישי', map_lun_s:'צהריים שבת', map_del_s:'משלוח',
  },

  /* ══════════════════════════════════════════
     ENGLISH
  ══════════════════════════════════════════ */
  en: {
    back:'Back',
    continue:'Continue →',
    step_label: (s, total) => `Step ${s} of ${total}`,

    /* S1 Welcome */
    s1_title:'Shabbat Hosts', s1_subtitle:'מארחי שבת',
    s1_tagline:'Join our hosting community',
    s1_soldier:'Register as Soldier', s1_host:'Register as Host Family',
    s1_footer:'Join the community connecting soldiers with host families',
    s1_login:'Already have an account? Log in',

    /* S0 Login */
    s0_title:'Login', s0_subtitle:'Welcome back!',
    s0_email:'Email address', s0_email_placeholder:'your@email.com',
    s0_password:'Password', s0_password_placeholder:'Enter password',
    s0_remember:'Remember me', s0_forgot:'Forgot password?',
    s0_login_button:'Log in', s0_back_to_register:'Back to registration',

    /* S2 Explain */
    s2_title:'How does it work?', s2_sub:'Everything you need to know before getting started',
    s2_f1_t:'Nearby Location',    s2_f1_d:'Find host families close to your base',
    s2_f2_t:'Personal Match',     s2_f2_d:'Kashrut, allergies and preferences — all tailored for you',
    s2_f3_t:'Full Flexibility',   s2_f3_d:'Confirm hosting for next Friday in just a few taps',
    s2_f4_t:'Secure Communication', s2_f4_d:'Talk with the family through our protected system',
    s2_btn:'Start Registration →',

    /* S3 Account */
    s3_title:'Create Account', s3_sub:'Just a few details and you\'re in!',
    s3_first:'First Name', s3_last:'Last Name',
    s3_phone:'Phone Number', s3_email:'Email',
    s3_pass:'Password', s3_pass_ph:'At least 6 characters', s3_pass_hint:'Your password is stored securely',
    s3_terms_pre:'I agree to the', s3_terms_link1:'Terms of Service',
    s3_terms_and:'and', s3_terms_link2:'Privacy Policy',
    s3_ph_first:'John', s3_ph_last:'Cohen', s3_ph_email:'john@gmail.com',
    err_first:'First name is required', err_last:'Last name is required',
    err_phone:'Enter a valid phone number', err_email:'Enter a valid email address',
    err_pass:'Password must be at least 6 characters', err_terms:'You must accept the terms of service',

    /* S4 Verify */
    s4_title:'Verify Phone Number', s4_sent:'We sent a verification code via SMS to',
    s4_label:'Verification Code (6 digits)', s4_hint:'For demo purposes, enter: 123456',
    s4_btn:'Verify', s4_wrong:'Wrong code, try again', s4_resent:'Code resent!',
    s4_resend: (sec) => sec > 0 ? `Resend code (${sec}s)` :'Resend code',

    /* S5 Service */
    s5_title:'Service Status', s5_sub:'Tell us about your military service',
    s5_type:'Type of Service',
    s5_reg:'Active Duty',     s5_reg_s:'Mandatory service soldier',
    s5_res:'Reserve',         s5_res_s:'Active reserve service',
    s5_car:'Career Military', s5_car_s:'Officer or career NCO',
    s5_unit:'Unit / Base (optional)',
    s5_unit_ph:'e.g. Golani Brigade, Ramat David...',
    s5_unit_hint:'Not required — helps us find a better match',

    /* S6 Upload */
    s6_title:'Verify Service Document', s6_sub:'Upload a document for verification — fully secure',
    s6_doc:'Document Type', s6_tag:'Military ID Photo', s6_res:'Reserve Duty Order', s6_oth:'Other Document',
    s6_tap:'Tap to Upload / Take Photo', s6_size:'JPG, PNG, PDF — up to 10MB',
    s6_loading:'Uploading...', s6_pick_first:'Choose a document type first',
    s6_done:'Document uploaded successfully!', s6_saved:'File saved securely',
    s6_note:'The document is used for verification only. It is never shared with host families and is deleted after verification.',

    /* S7 Kosher & Shabbat */
    s7_title:'Kashrut & Shabbat', s7_sub:'We\'ll use this to match you with the perfect host family',
    s7_kosh:'Kashrut Level',
    s7_none:'Not important',   s7_none_s:'I eat anything',
    s7_kosh_k:'Kosher',        s7_kosh_k_s:'Separate meat/dairy with certification',
    s7_meh:'Mehadrin Kosher',  s7_meh_s:'Mehadrin certification only',
    s7_shab:'Shabbat Observance',
    s7_yes:'I observe Shabbat',       s7_yes_s:'I prefer a Shabbat-observant household',
    s7_no:'I don\'t observe Shabbat', s7_no_s:'A non-religious home is also fine',

    /* S8 Hosting Options */
    s8_title:'Hosting Needs', s8_sub:'Tell us what you need — we\'ll find the perfect match',
    s8_section:'What do you need for Shabbat?', s8_multi:'You can select more than one option',
    s8_sleep:'I need a place to sleep', s8_sleep_s:'I\'ll stay overnight at the host family\'s home',
    s8_walk:'I need walking distance from base', s8_walk_s:'I don\'t travel on Shabbat — the family must be nearby',
    s8_tip:'If nothing is checked — we\'ll find you a meal-only host. You can update anytime in your profile.',

    /* S9 Allergies */
    s9_title:'Food Allergies & Preferences', s9_sub:'The host family will know exactly what to prepare for you',
    s9_label:'Select all that apply',
    s9_note_label:'Anything else the family should know?',
    s9_note_ph:'e.g. I don\'t eat certain vegetables, I have a cleaning product allergy...',
    a_gluten:'Gluten-free', a_lactose:'Lactose-free', a_nuts:'Nut allergy',
    a_peanuts:'Peanut allergy', a_veg:'Vegetarian', a_vegan:'Vegan',
    a_fish:'Fish only', a_other:'Other',

    /* S10 Prefs */
    s10_title:'Additional Preferences', s10_sub:'We\'ll use this to find your best match',
    s10_sol:'Do you prefer to be hosted with other soldiers?',
    s10_sol_yes:'Yes, I\'d love that', s10_sol_no:'I prefer alone', s10_sol_dm:'Doesn\'t matter',
    s10_lang:'Preferred Language',
    s10_pets:'Comfort with pets',
    s10_pets_ok:'Comfortable with pets', s10_pets_no:'Not comfortable', s10_pets_al:'I\'m allergic to animals',

    /* S11 Profile */
    s11_title:'Your Profile', s11_sub:'A full profile helps families get to know you before Shabbat',
    s11_photo:'Tap to choose a photo (optional)',
    s11_bio:'Tell us about yourself',
    s11_bio_ph:'Hi, I\'m Daniel, serving near Haifa and looking for a warm Friday dinner when I leave base.',

    /* S12 Summary */
    s12_title:'Registration Summary', s12_sub:'Check everything is correct before submitting',
    s12_personal:'Personal Details', s12_full:'Full Name', s12_phone:'Phone', s12_email:'Email',
    s12_mil:'Military Service', s12_stype:'Service Type', s12_unit:'Unit', s12_doc:'Document',
    s12_uploaded:'Uploaded',
    s12_prefs:'Preferences', s12_kosh:'Kashrut', s12_shab:'Shabbat',
    s12_sleep:'Sleep', s12_walk:'Walk Distance', s12_allerg:'Allergies',
    s12_no_allerg:'None', s12_pets:'Pets', s12_sol:'With soldiers',
    s12_bio:'Personal Bio', s12_submit:'Submit Profile', s12_edit:'Edit Details',

    /* S13 Pending */
    s13_title:'Your Profile is Under Review',
    s13_sub:'Once approved, you can create hosting requests and connect with host families across the country',
    s13_eta:'Usually takes less than a minute',
    s13_done:'Verification complete!', s13_redir:'Taking you to the home page...',

    /* S14 Success */
    s14_hi:'Welcome!', s14_ok:'Verification complete',
    s14_desc:'You are now part of the Shabbat Hosts community.\nYou can start looking for a warm Friday dinner!',
    s14_home:'Go to Home',

    /* S15 Soldier Home */
    s15_hi:'Hello,', s15_status:'Status: Verified Soldier',
    s15_new:'Create a Hosting Request',
    s15_shab:'Upcoming Shabbat', s15_friday:'Friday,',
    s15_avail: (n) => `${n} families available in your area`,
    s15_map_title:'Families opening a Shabbat table for Friday',
    s15_map_sub:'Find a warm family near you for the coming Shabbat',
    s15_tap_map:'Tap a home on the map to see details',
    s15_talk_whatsapp:'Talk on WhatsApp',
    s15_call:'Call',
    s15_capacity:'Capacity',
    s15_sleep_available:'Sleep available',
    s15_open_table:'Open table',
    s15_guests_title:'soldiers already hosted',
    s15_view:'View Matches', s15_rec:'Recommended Matches',
    s15_past:'Past Shabbat Meals',
    s15_no_past:'No meals yet — let\'s find your first one!',
    s15_slots:'spots available',

    /* S18 Host Explain */
    s18_title:'How does it work?', s18_sub:'Everything you need to know before getting started',
    s18_f1_t:'Verified Soldiers',      s18_f1_d:'Every soldier goes through a verification process before they can contact families',
    s18_f2_t:'You Decide When',        s18_f2_d:'You choose if and when to host — no fixed commitment',
    s18_f3_t:'Precise Matching',       s18_f3_d:'We\'ll match soldiers to your kashrut, language and home preferences',
    s18_f4_t:'Secure Communication',   s18_f4_d:'All communication with soldiers goes through our platform',
    s18_btn:'Start Registration →',

    /* S16 Host Registration */
    s16_step_labels: ['Personal Info','Hosting Type','Lifestyle','Services','Home Vibe'],
    s16_1_title:'Host Family Registration', s16_1_sub:'Let us get to know you before we match you with soldiers',
    s16_welcome:'Thank you for choosing to open your home to soldiers. Fill in the details and we\'ll get back to you soon!',
    s16_name:'Full Name', s16_name_ph:'First and last name',
    s16_phone:'Phone Number', s16_phone_hint:'We\'ll use this to contact you before Friday',
    s16_email:'Email Address',
    s16_2_title:'Hosting Type & Location', s16_2_sub:'Tell us what you offer and where you are',
    s16_host_label:'Preferred Hosting Type', s16_host_multi:'You can select more than one option',
    s16_fri_din:'Friday Night Dinner', s16_fri_din_s:'Shabbat dinner — the first meal',
    s16_sat_lun:'Saturday Lunch',       s16_sat_lun_s:'Shabbat lunch — the second meal',
    s16_deliv:'Meal Delivery to Bases', s16_deliv_s:'Send hot meals to soldiers on base',
    s16_city:'Home Address / City', s16_city_ph:'e.g. Haifa, 12 Herzl Street...',
    s16_city_hint:'An accurate address allows better matching with nearby soldiers',
    s16_langs:'Languages spoken at home',
    s16_3_title:'Lifestyle', s16_3_sub:'These details help us match soldiers with similar expectations',
    s16_shab_lev:'Shabbat Observance Level',
    s16_obs:'Shabbat Observant', s16_obs_s:'No electricity, full Shabbat observance',
    s16_trad:'Traditional',        s16_trad_s:'Kiddush, warm meal and Shabbat atmosphere',
    s16_sec:'Secular',             s16_sec_s:'Warm meal and a pleasant family atmosphere',
    s16_kosh_lev:'Kashrut',
    s16_meh:'Mehadrin Kosher', s16_meh_s:'Mehadrin certification, no mixing concerns',
    s16_k:'Kosher',           s16_k_s:'Separate meat/dairy with certification',
    s16_none:'Not important',    s16_none_s:'Suitable for any type of soldier',
    s16_4_title:'Additional Services', s16_4_sub:'Every extra helps us match soldiers who need exactly this',
    s16_opt:'Optional — every addition helps soldiers',
    s16_slp:'Sleeping Space', s16_slp_s:'Can provide a place to sleep on Shabbat',
    s16_trn:'Transportation',  s16_trn_s:'Can drive to/from base or a nearby station',
    s16_tip:'If nothing is checked — we\'ll match soldiers for meals only. You can update anytime from your profile.',
    s16_5_title:'Home Vibe', s16_5_sub:'Just a few last details and you\'re ready!',
    s16_cap_label:'Maximum soldiers per meal', s16_cap_sub:'How many soldiers can you host at one meal?',
    s16_vibe_label:'Home Vibe Tags',
    s16_vibe_sub:'Choose tags that describe your home — helps soldiers feel comfortable',
    s16_sum_title:'Registration Summary',
    s16_sum_name:'Name', s16_sum_city:'City', s16_sum_host:'Hosting',
    s16_sum_shab:'Shabbat', s16_sum_cap:'Capacity', s16_sum_tags:'Tags',
    s16_cap_unit: (n) => `Up to ${n} soldiers`,
    s16_submit:'Complete & Submit Profile',
    v_name:'Full name is required', v_phone:'Enter a valid phone number',
    v_email:'Enter a valid email address', v_hosting:'Please select at least one hosting type',
    v_city:'Please enter a city or address', v_shab:'Please select your Shabbat observance level',
    v_kosh:'Please select a kashrut level', v_cap:'Please select the maximum number of soldiers',

    /* S17 Host Success */
    s17_hi:'Welcome!', s17_ok:'Registration complete!',
    s17_desc:'You are now part of the Shabbat Hosts family.\nSoldiers will be able to find you and request hosting for Shabbat!',
    s17_home:'Go to Home',

    /* S19 Host Home */
    s19_hi:'Hello,', s19_status:'Verified Host Family',
    s19_new:'Open Hosting for Next Friday',
    s19_my_hostings:'My Hostings',
    s19_no_hostings:'You haven\'t created any hostings yet',
    s19_spots_taken:'spots taken',
    s19_guests_title:'Attending Soldiers:',
    s19_no_guests_yet:'No soldiers have joined this hosting yet',
    s19_edit_hosting:'Edit Details',
    s19_cancel_hosting:'Cancel Hosting',
    s19_unit:'Unit:',

    /* S20 New Hosting */
    s20_title:'Create New Hosting', s20_sub:'Fill in the details and soldiers can sign up',
    s20_date_label:'Choose a Date', s20_date_sub:'The nearest Friday is shown first',
    s20_day:'Friday', s20_shab:'Shabbat', s20_other:'or choose another date',
    s20_time_label:'Hosting Time',
    s20_fri_eve:'Friday Evening', s20_fri_eve_s:'Shabbat dinner ~7:00 PM',
    s20_sat_lun:'Saturday Lunch',  s20_sat_lun_s:'Shabbat lunch ~12:30 PM',
    s20_custom:'Custom Time',      s20_custom_s:'Pick a specific time',
    s20_sol_label:'How many soldiers for this hosting?', s20_sol_sub:'Can be changed per hosting',
    s20_note_label:'Free Notes (optional)',
    s20_note_sub:'Tell soldiers something about the hosting — what\'s on the menu, the vibe, etc.',
    s20_note_ph:'e.g. We\'re making cholent, there\'s a piano, sea view balcony...',
    s20_img_label:'Photos (optional)',
    s20_img_sub:'Photos of your home, the food or the atmosphere — helps soldiers connect',
    s20_add:'Add', s20_img_count: (n) => `${n}/5 photos`,
    s20_prev_title:'Preview',
    s20_prev_date:'Date', s20_prev_time:'Time', s20_prev_slots:'Spots',
    s20_slots_val: (n) => `Up to ${n} soldiers`,
    s20_fri_time:'Friday Evening ~7:00 PM', s20_sat_time:'Saturday Lunch ~12:30 PM', s20_cust_time:'Custom time',
    s20_submit:'Publish Hosting',
    s20_done_title:'Hosting Published!',
    s20_done_sub:'Soldiers in your area will be able to see this hosting and request to join',
    v_date:'Please choose a date', v_time:'Please choose a time', v_sol:'Please choose number of soldiers',

    /* Shared */
    lang_he:'Hebrew', lang_en:'English', lang_ru:'Russian',
    lang_ar:'Arabic', lang_fr:'French', lang_other:'Other',
    vibe_kids:'Home with kids', vibe_quiet:'Quiet home', vibe_multi:'Multilingual',
    vibe_sing:'Love singing', vibe_pets:'Pets at home', vibe_space:'Spacious home',
    vibe_shab:'Shabbat atmosphere', vibe_food:'Food lovers',
    map_meh:'Mehadrin Kosher', map_kosh:'Kosher', map_none:'Not important',
    map_obs:'Shabbat Observant', map_trad:'Traditional', map_sec:'Secular',
    map_pets_ok:'Comfortable', map_pets_no:'Not comfortable', map_pets_al:'Allergic to animals',
    map_sol_yes:'Yes', map_sol_no:'No', map_sol_dm:'Doesn\'t matter',
    map_reg:'Active Duty', map_res:'Reserve', map_car:'Career Military',
    map_sleep:'Needs overnight', map_walk:'Walking distance required',
    map_fri:'Friday Night Dinner', map_lun:'Saturday Lunch', map_del:'Base Delivery',
    map_fri_s:'Friday dinner', map_lun_s:'Sat. lunch', map_del_s:'Delivery',
  }
};
