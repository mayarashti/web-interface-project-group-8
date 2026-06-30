/* S19 Host Home (Unified Dashboard) */

var { useState, useEffect, useCallback, useRef } = React;

// Clean line-art SVG icons
const CalendarIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const UsersIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const MessageSquareIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const ChefHatIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 18H18A2 2 0 0 0 20 16V14C20 10 16 9 15 9C15 6 12 5 9 6C7 6 5.5 8 5 9C4 9 4 10 4 14V16A2 2 0 0 0 6 18Z" />
    <path d="M6 17V21H18V17" />
  </svg>
);

const UtensilsIcon = ({ className = "w-5 h-5", strokeWidth = 2 }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.79 13.47a3 3 0 0 0 1.25 1.8 3.32 3.32 0 0 0 2.22.73 3 3 0 0 0 2.22-.73 3 3 0 0 0 1.25-1.8L13 3H3z" />
    <path d="M9 3v10" />
    <path d="M19 15v7" />
    <path d="M20 3v12h-3V3" />
    <path d="M7 16v6" />
  </svg>
);

const CrownIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M3 20h18" />
  </svg>
);

const SproutIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22a8 8 0 0 1 8-8h4a8 8 0 0 1 8 8" />
    <path d="M12 2v12" />
    <path d="M12 8c2.9-3 4-5 4-5s-1 2-4 5z" />
    <path d="M12 8c-2.9-3-4-5-4-5s1 2 4 5z" />
  </svg>
);

const RotateCcwIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

const CarIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="22" height="13" rx="2" ry="2" />
    <path d="M5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M5 16V9h14v7" />
    <path d="M9 16h6" />
  </svg>
);

const BedIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4v16" />
    <path d="M2 8h18a2 2 0 0 1 2 2v10" />
    <path d="M2 17h20" />
    <path d="M6 8v4" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ActivityIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const renderAllergyBadge = (allergyKey, lang = 'he') => {
  const labels = {
    gluten: lang === 'he' ? 'ללא גלוטן' : 'Gluten Free',
    lactose: lang === 'he' ? 'ללא לקטוז' : 'Lactose Free',
    nuts: lang === 'he' ? 'ללא אגוזים' : 'Nut Free',
    peanuts: lang === 'he' ? 'ללא בוטנים' : 'Peanut Free',
    veg: lang === 'he' ? 'צמחוני' : 'Vegetarian',
    vegan: lang === 'he' ? 'טבעוני' : 'Vegan',
    fish: lang === 'he' ? 'ללא דגים' : 'Fish Free',
    other: lang === 'he' ? 'אלרגיה' : 'Allergy'
  };
  
  const label = labels[allergyKey] || allergyKey;
  let icon = <AlertTriangleIcon className="w-2.5 h-2.5 text-amber-600" />;
  
  if (allergyKey === 'veg' || allergyKey === 'vegan') {
    icon = <SproutIcon className="w-2.5 h-2.5 text-green-600" />;
  } else if (allergyKey === 'gluten') {
    icon = <SproutIcon className="w-2.5 h-2.5 text-amber-600" />;
  }
  
  return (
    <span key={allergyKey} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-lg shadow-2xs">
      {icon}
      <span>{label}</span>
    </span>
  );
};

const renderKosherBadge = (kosherVal, lang = 'he') => {
  switch (kosherVal) {
    case 'mehadrin':
      return (
        <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold">
          <CrownIcon className="w-4 h-4 text-brand-600" />
          <span>{lang === 'he' ? 'מהדרין' : 'Mehadrin'}</span>
        </span>
      );
    case 'separated':
      return (
        <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold">
          <SproutIcon className="w-4 h-4 text-brand-600" />
          <span>{lang === 'he' ? 'כשר' : 'Kosher'}</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-gray-800 font-bold">
          <UtensilsIcon className="w-4 h-4 text-brand-400" strokeWidth={2.2} />
          <span>{lang === 'he' ? 'רגיל' : 'Regular'}</span>
        </span>
      );
  }
};

/* ── Recipe Recommendations (family-side only) ── */

function buildPreferences(guest) {
  const prefs = [];
  const allergyLabels = {
    gluten: 'ללא גלוטן', lactose: 'ללא לקטוז', nuts: 'ללא אגוזים',
    peanuts: 'ללא בוטנים', veg: 'צמחוני', vegan: 'טבעוני',
    fish: 'ללא דגים', other: 'אלרגיה מיוחדת',
  };
  const kosherLabels = { mehadrin: 'כשרות מהדרין', separated: 'כשר', none: '' };

  if (guest.kosher && kosherLabels[guest.kosher]) prefs.push(kosherLabels[guest.kosher]);
  (guest.allergies || []).forEach(a => { if (allergyLabels[a]) prefs.push(allergyLabels[a]); });
  if (guest.shabbat === 'keeps') prefs.push('שומר שבת');
  if (guest.bio) prefs.push(guest.bio.slice(0, 80));
  if (prefs.length === 0) prefs.push('ארוחת שבת כללית');
  return prefs;
}

function RecipeCard({ recipe, guestKey, prefs, onRefresh, refreshing }) {
  const { t, lang } = useLang();
  const [showSteps, setShowSteps] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Programmatic difficulty calculation
  const stepsCount = recipe.instructions ? recipe.instructions.length : 0;
  const difficultyText = stepsCount <= 4 
    ? (lang === 'he' ? 'קל' : 'Easy') 
    : stepsCount <= 8 
      ? (lang === 'he' ? 'בינוני' : 'Medium') 
      : (lang === 'he' ? 'מאתגר' : 'Challenging');

  // Ingredients summary
  const ingredientsSummary = recipe.ingredients && recipe.ingredients.length > 0
    ? recipe.ingredients.slice(0, 3).join(', ') + (recipe.ingredients.length > 3 ? '...' : '')
    : '';

  return (
    <div className="recipe-card mb-4 border border-warm-200/80 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow bg-white">
      {recipe.image_url && !imgError ? (
        <img
          className="recipe-card-img h-40 w-full object-cover"
          src={recipe.image_url}
          alt={recipe.title}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="recipe-card-img-placeholder h-40 bg-gradient-to-br from-brand-50 to-warm-100 flex items-center justify-center">
          <ChefHatIcon className="w-12 h-12 text-brand-400" />
        </div>
      )}
      <div className="p-4">
        {/* Title row + refresh button */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-base leading-tight flex-1">{recipe.title}</h3>
          <button
            className="recipe-alt-btn flex-shrink-0 flex items-center gap-1.5"
            disabled={refreshing}
            onClick={() => onRefresh(recipe.recipe_id - 1)}
          >
            <RotateCcwIcon className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{lang === 'he' ? 'שנה' : 'Change'}</span>
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-warm-600 leading-relaxed mb-3">{recipe.description}</p>

        {/* Prep Time & Difficulty Row */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-warm-50/50 p-2.5 rounded-xl border border-warm-100/50 text-xs">
          <div>
            <span className="text-[10px] text-warm-400 font-bold flex items-center gap-1 mb-0.5">
              <ClockIcon className="w-3.5 h-3.5 text-warm-400" />
              <span>{lang === 'he' ? 'זמן הכנה' : 'Prep Time'}</span>
            </span>
            <span className="font-bold text-gray-800">{recipe.readyInMinutes || 30} {lang === 'he' ? 'דק׳' : 'mins'}</span>
          </div>
          <div>
            <span className="text-[10px] text-warm-400 font-bold flex items-center gap-1 mb-0.5">
              <ActivityIcon className="w-3.5 h-3.5 text-warm-400" />
              <span>{lang === 'he' ? 'רמת קושי' : 'Difficulty'}</span>
            </span>
            <span className="font-bold text-gray-800">{difficultyText}</span>
          </div>
        </div>

        {/* Matching prefs tags */}
        {recipe.matching_preferences && recipe.matching_preferences.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.matching_preferences.map((pref, i) => (
              <span key={i} className="recipe-ingredient-pill bg-brand-50 border-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{pref}</span>
            ))}
          </div>
        )}

        {/* Ingredients Summary */}
        <div className="mb-3 text-xs">
          <span className="text-[10px] text-warm-400 font-bold flex items-center gap-1 mb-0.5">
            <UtensilsIcon className="w-3.5 h-3.5 text-warm-400" strokeWidth={2.2} />
            <span>{lang === 'he' ? 'רכיבים עיקריים' : 'Main Ingredients'}</span>
          </span>
          <p className="text-gray-700 font-medium truncate">{ingredientsSummary}</p>
        </div>

        {/* Details Toggle Button */}
        <button
          onClick={() => setShowSteps(v => !v)}
          className="w-full flex items-center justify-center gap-1.5 bg-warm-50 hover:bg-warm-100 border border-warm-200 text-xs font-bold text-gray-700 transition-colors py-2 rounded-xl"
        >
          <span className="inline-flex items-center gap-1">
            <ChefHatIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>{showSteps ? (lang === 'he' ? 'סגור פרטי מתכון' : 'Hide Recipe Details') : (lang === 'he' ? 'צפה במתכון המלא' : 'View Full Recipe')}</span>
          </span>
          <span className="text-warm-400 text-[9px]">{showSteps ? '▲' : '▼'}</span>
        </button>

        {showSteps && (
          <div className="mt-3 space-y-4 border-t border-warm-100 pt-3">
            {/* Ingredients Full List */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <UtensilsIcon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.2} />
                <span>{lang === 'he' ? 'כל המרכיבים' : 'All Ingredients'}</span>
              </p>
              <ul className="space-y-1">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i} className="text-sm text-gray-700 flex gap-2 items-start">
                     <span className="text-brand-400 mt-1 flex-shrink-0">•</span>
                     <span>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Steps */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <ChefHatIcon className="w-3.5 h-3.5 text-gray-400" />
                <span>{lang === 'he' ? 'הוראות הכנה' : 'Instructions'}</span>
              </p>
              <ol className="space-y-2">
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-2.5 text-sm text-gray-700 items-start">
                    <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipeModal({ guest, host, onClose }) {
  const { t, lang } = useLang();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshingIdx, setRefreshingIdx] = useState(null); // index of recipe being refreshed

  const fetchRecipes = useCallback(async () => {
    if (!guest) return;
    setLoading(true);
    setError(null);
    try {
      const data = {
        soldier: {
          favoriteFoods: guest.favoriteFoods || [],
          dislikedFoods: guest.dislikedFoods || [],
          allergies: guest.allergies || [],
          dietaryPreferences: guest.dietaryPreferences || (guest.allergies || []).filter(a => a === 'veg' || a === 'vegan'),
          isKosher: guest.kosher && guest.kosher !== 'none'
        },
        host: {
          keepsKosher: host?.kosher_level && host.kosher_level !== 'none'
        },
        count: 2
      };
      const generateRecipesFn = firebase.functions().httpsCallable('generateRecipes');
      const result = await generateRecipesFn(data);
      const recipesList = ((result.data && result.data.recipes) || []).map((recipe, idx) => ({
        ...recipe,
        recipe_id: idx + 1
      }));
      setRecipes(recipesList);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [guest, host]);

  useEffect(() => {
    fetchRecipes();
  }, [guest, fetchRecipes]);

  const handleRefresh = async (idx) => {
    setRefreshingIdx(idx);
    try {
      const existingTitles = recipes.map(r => r.title);
      const data = {
        soldier: {
          favoriteFoods: guest.favoriteFoods || [],
          dislikedFoods: [...(guest.dislikedFoods || []), ...existingTitles],
          allergies: guest.allergies || [],
          dietaryPreferences: guest.dietaryPreferences || (guest.allergies || []).filter(a => a === 'veg' || a === 'vegan'),
          isKosher: guest.kosher && guest.kosher !== 'none'
        },
        host: {
          keepsKosher: host?.kosher_level && host.kosher_level !== 'none'
        },
        count: 1
      };
      const generateRecipesFn = firebase.functions().httpsCallable('generateRecipes');
      const result = await generateRecipesFn(data);
      const newRecipes = (result.data && result.data.recipes) || [];
      if (newRecipes && newRecipes[0]) {
        const newRecipe = { ...newRecipes[0], recipe_id: idx + 1 };
        setRecipes(prev => prev.map((r, i) => i === idx ? newRecipe : r));
      }
    } catch (e) {
      console.error("Failed to refresh recipe:", e);
    } finally {
      setRefreshingIdx(null);
    }
  };

  if (!guest) return null;

  const favs = guest.favoriteFoods || [];
  const dislikes = guest.dislikedFoods || [];

  return (
    <Modal
      isOpen={!!guest}
      onClose={onClose}
      title={lang === 'he' ? `המלצות מתכונים עבור ${guest.name}` : `Recipe Recommendations for ${guest.name}`}
      className="max-w-lg max-h-[92vh]"
    >
      <div className="space-y-4">
        {/* Soldier Preferences Summary Block */}
        <div className="p-4 bg-warm-50/60 rounded-2xl border border-warm-100 text-xs space-y-2.5">
          <h4 className="font-bold text-gray-800 text-[13px] border-b border-warm-100 pb-1.5 flex items-center gap-1.5">
            <SproutIcon className="w-4 h-4 text-brand-600" />
            <span>{lang === 'he' ? 'העדפות ומגבלות תזונה של החייל' : "Soldier's Dietary Preferences"}</span>
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'כשרות' : 'Kosher'}</span>
              <span className="font-semibold text-gray-700">{renderKosherBadge(guest.kosher, lang)}</span>
            </div>
            <div>
              <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'אלרגיות' : 'Allergies'}</span>
              {(guest.allergies || []).length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {(guest.allergies || []).map(a => renderAllergyBadge(a, lang))}
                </div>
              ) : (
                <span className="text-gray-500 font-medium flex items-center gap-1">
                  <UtensilsIcon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.2} />
                  <span>{lang === 'he' ? 'אין הגבלות' : 'None'}</span>
                </span>
              )}
            </div>
          </div>

          {(favs.length > 0 || dislikes.length > 0) && (
            <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-warm-100/50">
              {favs.length > 0 && (
                <div>
                  <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'אוכל מועדף' : 'Favorite Foods'}</span>
                  <span className="text-gray-700 font-medium">{favs.join(', ')}</span>
                </div>
              )}
              {dislikes.length > 0 && (
                <div>
                  <span className="text-[10px] text-warm-400 font-bold block mb-0.5">{lang === 'he' ? 'פחות אוהב' : 'Disliked Foods'}</span>
                  <span className="text-gray-700 font-medium">{dislikes.join(', ')}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4">
            <p className="text-sm text-warm-500 text-center flex items-center justify-center gap-2 animate-pulse">
              <svg className="animate-spin h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>{lang === 'he' ? 'מייצר המלצות מתכונים אישיות...' : 'Generating personalized recipes...'}</span>
            </p>
            {[1, 2].map(i => (
              <div key={i} className="recipe-card overflow-hidden">
                <div className="recipe-skeleton" style={{ height: 140 }} />
                <div className="p-4 space-y-2">
                  <div className="recipe-skeleton" style={{ height: 20, width: '70%' }} />
                  <div className="recipe-skeleton" style={{ height: 14, width: '90%' }} />
                  <div className="recipe-skeleton" style={{ height: 14, width: '60%' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Server offline error */}
        {!loading && error === 'server_off' && (
          <div className="text-center py-8 space-y-4">
            <AlertTriangleIcon className="w-12 h-12 text-amber-500 mx-auto" />
            <p className="font-bold text-gray-800">שרת המתכונים אינו פעיל</p>
            <p className="text-sm text-warm-500 leading-relaxed">
              הפעל את שרת ה-LLM על פורט 8000 כדי לקבל המלצות מתכונים מותאמות אישית.
            </p>
            <button
              onClick={fetchRecipes}
              className="mt-2 text-sm font-bold text-brand-600 border border-brand-200 bg-brand-50 hover:bg-brand-100 transition-colors px-5 py-2 rounded-xl flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcwIcon className="w-3.5 h-3.5" />
              <span>נסה שוב</span>
            </button>
          </div>
        )}

        {/* Generic error */}
        {!loading && error && error !== 'server_off' && (
          <div className="text-center py-6 space-y-3">
            <AlertTriangleIcon className="w-10 h-10 text-red-500 mx-auto" />
            <p className="text-sm text-warm-600">{error}</p>
            <button onClick={fetchRecipes} className="text-sm font-bold text-brand-600 underline">
              נסה שוב
            </button>
          </div>
        )}

        {/* Recipe cards */}
        {!loading && !error && recipes.map((recipe, idx) => (
          <RecipeCard
            key={`${recipe.recipe_id}-${recipe.title}`}
            recipe={recipe}
            guestKey={guest?.id || guest?.name || 'soldier'}
            prefs={guest.allergies || []}
            onRefresh={handleRefresh}
            refreshing={refreshingIdx === idx}
          />
        ))}

        {/* Empty state */}
        {!loading && !error && recipes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-warm-500 text-sm">לא נמצאו מתכונים. נסו שוב.</p>
            <button onClick={fetchRecipes} className="mt-3 text-sm font-bold text-brand-600 underline">
              נסה שוב
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}


/* ── Soldier profile card modal ── */
function SoldierProfileModal({ guest, onClose }) {
  const { t } = useLang();
  if (!guest) return null;

  const allergyMap = {
    gluten: t('a_gluten'), lactose: t('a_lactose'), nuts: t('a_nuts'),
    peanuts: t('a_peanuts'), veg: t('a_veg'), vegan: t('a_vegan'),
    fish: t('a_fish'), other: t('a_other'),
  };
  const allergyList = (guest.allergies || []).map(a => allergyMap[a]).filter(Boolean).join(', ') || t('s12_no_allerg');
  const koshMap = { mehadrin: t('map_meh'), separated: t('map_kosh'), none: t('map_none') };
  const logisticsItems = [
    (guest.needSleep || guest.needsSleep) && t('s12_sleep'),
    guest.needsTransport  && t('guest_needs_transport'),
    guest.walkDistance    && t('guest_walk_dist'),
  ].filter(Boolean);

  const Row = ({ label, value }) => (
    <div className="flex justify-between items-start py-2 border-b border-warm-100 last:border-0">
      <span className="text-xs text-warm-500 font-medium w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 text-start flex-1 ms-2">{value}</span>
    </div>
  );

  return (
    <Modal isOpen={!!guest} onClose={onClose} title={guest.name} className="max-w-md max-h-[93vh]">
      <div className="space-y-3">
        {/* Avatar + unit + group — compact horizontal row */}
        <div className="flex items-center gap-3 pb-3 border-b border-warm-100">
          <div
            className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xl font-bold shadow-sm overflow-hidden"
            style={{ background: guest.avatarColor || '#B0BA99' }}
          >
            {guest.profile_img_url ? (
              <img src={guest.profile_img_url} alt={guest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              (guest.name || '?')[0]
            )}
          </div>
          <div>
            <p className="text-xs text-warm-500">
              {[guest.unit, guest.age ? t('s3_age') + ' ' + guest.age : null].filter(Boolean).join(' · ')}
            </p>
            <p className="text-sm font-medium text-gray-800 mt-0.5 flex items-center gap-1">
              {(guest.groupSize || 1) > 1 ? <UsersIcon className="w-4 h-4 text-gray-500" /> : <UserIcon className="w-4 h-4 text-gray-500" />}
              <span>
                {(guest.groupSize || 1) > 1
                  ? t('guest_group_with', (guest.groupSize || 1) - 1)
                  : t('guest_group_solo')}
              </span>
            </p>
          </div>
        </div>

        {/* Dietary preferences */}
        <div>
          <p className="section-label mb-1.5">{t('s12_prefs')}</p>
          <Row label={t('s12_kosh')}   value={koshMap[guest.kosher] || t('map_none')} />
          <Row label={t('s12_allerg')} value={allergyList} />
        </div>

        {/* Logistics */}
        {logisticsItems.length > 0 && (
          <div>
            <p className="section-label mb-1.5">{t('guest_logistics')}</p>
            <div className="flex flex-wrap gap-1.5">
              {logisticsItems.map(item => (
                <span key={item} className="px-3 py-1 bg-brand-50 border border-brand-100 text-brand-700 text-xs font-semibold rounded-full">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {guest.bio && (
          <p className="text-sm text-warm-600 italic leading-relaxed border-s-2 border-brand-200 ps-3">
            "{guest.bio}"
          </p>
        )}

        {/* WhatsApp */}
        {guest.phone && (
          <a
            href={`https://wa.me/972${guest.phone.replace(/\D/g, '').replace(/^0/, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-[#25D366] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#1ebd5b] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.025 3.207l-.695 2.54 2.599-.681c.887.486 1.856.741 2.839.741h.001c3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.769-5.767zm3.387 8.192c-.146.411-.849.761-1.157.808-.285.045-.653.075-1.047-.052-.244-.078-.553-.189-.912-.345-1.528-.66-2.518-2.213-2.593-2.313-.076-.101-.617-.82-.617-1.564 0-.743.393-1.109.531-1.258.143-.15.311-.188.413-.188h.27c.086 0 .201-.033.31.233l.423 1.027c.038.09.064.195.004.314-.06.12-.09.195-.181.3-.09.105-.19.233-.27.315-.088.09-.181.188-.076.368.106.181.469.773.999 1.246.684.609 1.261.799 1.442.889.181.09.286.075.391-.045.105-.12.451-.525.571-.705.12-.18.24-.15.405-.09.166.06 1.054.496 1.235.586.181.09.301.135.346.21.046.075.046.435-.1.846z"/></svg>
            WhatsApp
          </a>
        )}
      </div>
    </Modal>
  );
}

function S19HostHome({ data, setData, onProfile, onLogout }) {
  const { t, lang } = useLang();
  const hostings = data.hostings || [];

  const [selectedHostingId, setSelectedHostingId] = useState(null);
  const [selectedRecipeGuest, setSelectedRecipeGuest] = useState(null);
  const [showPrefModal,       setShowPrefModal]       = useState(false);
  const [showNotifications,   setShowNotifications]   = useState(false);
  const notifications = data.notifications || [];

  // Resolve current active hosting from data
  const selectedHosting = hostings.find(h => h.id === selectedHostingId);

  const handleNewHosting = () => {
    // Block new hosting creation until preferences are filled
    if (data.hostPreferencesSkipped) {
      setShowPrefModal(true);
      return;
    }
    setData(prev => ({ ...prev, editingHostingId: null }));
    window.setScreen(20);
  };

  const handleEdit = (id) => {
    setData(prev => ({ ...prev, editingHostingId: id }));
    window.setScreen(20);
  };

  const handleCancel = async (id) => {
    if (!confirm(t('s19_confirm_cancel'))) return;
    
    setSelectedHostingId(null); // Close details view

    if (!window.db) {
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.filter(h => h.id !== id),
      }));
      return;
    }

    try {
      const fn = firebase.functions().httpsCallable('cancelHosting');
      await fn({ hosting_id: id });
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.filter(h => h.id !== id),
      }));
    } catch (e) {
      console.error('Cancel hosting error:', e);
      alert('שגיאה בביטול: ' + e.message);
    }
  };

  const handleRestore = async (id) => {
    if (window.db) {
      try {
        const fn = firebase.functions().httpsCallable('restoreHosting');
        await fn({ hosting_id: id });
        setData(prev => ({
          ...prev,
          hostings: prev.hostings.filter(h2 => h2.id !== id),
        }));
        setSelectedHostingId(null);
      } catch (e) {
        console.error('Restore error:', e);
        alert('שגיאה בשחזור: ' + e.message);
      }
    } else {
      setData(prev => ({
        ...prev,
        hostings: prev.hostings.map(h2 =>
          h2.id === id
            ? { ...h2, status: 'open', guests: [], occupied: 0, is_fully_booked: false, _archived: false }
            : h2
        ),
      }));
    }
  };

  const handleCancelOrRestore = async (id) => {
    const h = hostings.find(x => x.id === id);
    if (!h) return;
    if (h.status === 'canceled') {
      await handleRestore(id);
    } else {
      await handleCancel(id);
    }
  };

  if (selectedHosting) {
    return (
      <>
        <HostingDetailsView
          hosting={selectedHosting}
          host={data}
          onBack={() => setSelectedHostingId(null)}
          onEdit={handleEdit}
          onCancel={handleCancelOrRestore}
          onOpenRecipes={(g) => setSelectedRecipeGuest(g)}
          lang={lang}
          t={t}
        />

        <RecipeModal
          guest={selectedRecipeGuest}
          host={data}
          onClose={() => setSelectedRecipeGuest(null)}
        />
      </>
    );
  }

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-20">
      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={() => window.DB && window.DB.markAllNotificationsRead(data.uid)}
        onMarkRead={(id) => window.DB && window.DB.markNotificationRead(id)}
      />
      {/* Header — matches AppHeader styling */}
      <AppHeader
        eyebrow={t('s19_greeting')}
        title={data.hostName || 'משפחה'}
        onProfile={onProfile}
        onNotifications={() => setShowNotifications(true)}
        notificationsCount={notifications.filter(n => !n.read).length}
        onLogout={onLogout}
      />

      <div className="max-w-md mx-auto px-5 mt-6">

        {/* Smart Alerts Section */}
        <div className="mb-6">
          <p className="section-label mb-3">{t('s19_smart_alerts')}</p>
          {data.hasSoldierNearby ? (
            <Card className="p-4 bg-amber-50 border-amber-200">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🔔</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t('s19_alert_title')}</p>
                  <p className="text-xs text-warm-600 mt-1 leading-relaxed">{t('s19_alert_desc')}</p>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 border-dashed text-center">
              <p className="text-sm text-warm-400">{t('no_new_alerts')}</p>
            </Card>
          )}
        </div>

        {/* My Hostings Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-800">{t('s19_my_hostings')}</h2>
          <button
            onClick={handleNewHosting}
            className="bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-brand-700 active:scale-95 transition-all"
          >
            {t('s19_new')}
          </button>
        </div>

        {/* Hostings List */}
        {hostings.length === 0 ? (
          <Card className="text-center py-10 border-dashed">
            <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-3 opacity-80">
              <UtensilsIcon className="w-6 h-6 text-warm-400" strokeWidth={2.2} />
            </div>
            <p className="text-sm font-medium text-warm-500">{t('s19_no_hostings')}</p>
            <button
              onClick={handleNewHosting}
              className="mt-4 text-sm font-semibold text-brand-600 underline underline-offset-2"
            >
              {t('s19_new')}
            </button>
          </Card>
        ) : (
          <div className="space-y-4">
            {hostings.map(h => {
              const guests = h.guests || [];
              const capacity = parseInt(h.soldiers) || 0;
              const isCanceled = h.status === 'canceled';
              const totalGuests = guests.length > 0
                ? guests.reduce((sum, g) => sum + (g.groupSize || 1), 0)
                : (h.occupied || 0);
              const isFull = !isCanceled && totalGuests >= capacity && capacity > 0;

              return (
                <Card 
                  key={h.id} 
                  className={`cursor-pointer transition-all hover:shadow-md hover:border-brand-300 ${isCanceled ? ' opacity-70' : ''}`}
                  onClick={() => setSelectedHostingId(h.id)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                          <CalendarIcon className="w-4 h-4 text-brand-600" />
                          <span>
                            {new Date(h.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
                          </span>
                        </p>
                        <p className="text-xs text-warm-500 mt-1.5 flex items-center gap-1.5">
                          <ClockIcon className="w-4 h-4 text-brand-600" />
                          <span>
                            {h.time === 'friday_evening' ? t('s20_fri_eve') : h.time === 'saturday_lunch' ? t('s20_sat_lun') : h.customTime || h.time}
                          </span>
                        </p>
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full ${
                        isCanceled ? 'bg-warm-100 text-warm-500' :
                        isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
                      }`}>
                        {isCanceled
                          ? (lang === 'he' ? 'מבוטל' : 'Canceled')
                          : `${totalGuests}/${capacity} ${t('s19_spots_taken')}`}
                      </span>
                    </div>
                    {h.note && (
                      <p className="text-xs text-warm-400 mt-3 leading-relaxed line-clamp-1 italic bg-warm-50/50 p-2.5 rounded-xl border border-warm-100/40">
                        "{h.note}"
                      </p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recipe Recommendations Modal (family-side only) */}
      <RecipeModal
        guest={selectedRecipeGuest}
        host={data}
        onClose={() => setSelectedRecipeGuest(null)}
      />

      {/* Preferences questionnaire — blocks new hosting until filled */}
      <PreferencesPromptModal
        isOpen={showPrefModal}
        context="host_first_hosting"
        onNow={() => {
          setShowPrefModal(false);
          setData(prev => ({ ...prev, pendingNewHosting: true }));
          window.setScreen(22);
        }}
        onLater={() => setShowPrefModal(false)}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   S19.5 Hosting Details View
───────────────────────────────────────── */
function HostingDetailsView({ hosting, host, onBack, onEdit, onCancel, onOpenRecipes, lang, t }) {
  const guests = hosting.guests || [];
  const capacity = parseInt(hosting.soldiers) || 0;
  const isCanceled = hosting.status === 'canceled';

  const [resolvedPhones, setResolvedPhones] = useState({});
  const [resolvedImages, setResolvedImages] = useState({});

  useEffect(() => {
    guests.forEach(async (g) => {
      const sId = g.soldier_id || g.id;
      if (sId && (!g.phone || !g.profile_img_url) && (!resolvedPhones[sId] || !resolvedImages[sId])) {
        try {
          const doc = await window.db.collection('soldiers').doc(sId).get();
          if (doc.exists) {
            const data = doc.data();
            if (data.phone) setResolvedPhones(prev => ({ ...prev, [sId]: data.phone }));
            if (data.profile_img_url) setResolvedImages(prev => ({ ...prev, [sId]: data.profile_img_url }));
          }
        } catch (e) {
          console.error("Failed to fetch data for soldier:", sId, e);
        }
      }
    });
  }, [guests]);

  const getGuestPhone = (g) => g.phone || resolvedPhones[g.soldier_id || g.id];
  const getGuestImage = (g) => g.profile_img_url || resolvedImages[g.soldier_id || g.id];

  const enrichedGuests = guests.map(g => ({
    ...g,
    phone: getGuestPhone(g),
    profile_img_url: getGuestImage(g)
  }));

  const handleWhatsAppRedirect = (g) => {
    const phone = getGuestPhone(g);
    if (!g || !phone) return;
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '972' + cleanPhone.slice(1);
    } else if (cleanPhone.startsWith('972')) {
      // Already has 972
    } else if (cleanPhone.length === 9 && cleanPhone.startsWith('5')) {
      cleanPhone = '972' + cleanPhone;
    }
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    const message = lang === 'he' 
      ? 'שלום! אנחנו המשפחה המארחת שלך לשבת. נשמח לתאם פרטים.' 
      : 'Hello! We are your host family for Shabbat. Let\'s coordinate details.';
    const encodedText = encodeURIComponent(message);

    const baseUrl = isMobile 
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
      
    window.open(baseUrl, '_blank');
  };

  
  const totalGuests = guests.length > 0
    ? guests.reduce((sum, g) => sum + (g.groupSize || 1), 0)
    : (hosting.occupied || 0);
    
  const isFull = !isCanceled && totalGuests >= capacity && capacity > 0;
  const remainingSpots = Math.max(0, capacity - totalGuests);

  // Formatting date
  const formattedDate = new Date(hosting.date).toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const timeString = hosting.time === 'friday_evening' 
    ? t('s20_fri_eve') 
    : hosting.time === 'saturday_lunch' 
      ? t('s20_sat_lun') 
      : hosting.customTime || hosting.time;

  // Resolved Location
  const locationString = host.hostAddress || host.hostCity || (lang === 'he' ? 'לא עודכן מיקום' : 'No location specified');

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-24">
      <AppHeader
        title={t('s19_details_title')}
        onBack={onBack}
      />

      <div className="max-w-md mx-auto px-5 mt-6 space-y-6">
        {/* Section 1 - Overview Card */}
        <Card className="p-5 border border-warm-200/80 shadow-md relative overflow-hidden bg-white">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-brand-500" />
          
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t('s19_overview')}
              </span>
              <h2 className="text-lg font-bold text-gray-900 mt-0.5">
                {timeString}
              </h2>
            </div>
            
            <span className={`text-[10px] font-bold px-2.5 py-1.5 rounded-full ${
              isCanceled ? 'bg-red-50 text-red-600' :
              isFull ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'
            }`}>
              {isCanceled ? t('s19_status_canceled') : isFull ? t('s19_status_full') : t('s19_status_open')}
            </span>
          </div>

          <div className="space-y-3.5 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">{lang === 'he' ? 'תאריך:' : 'Date:'}</p>
                <p className="text-warm-600 mt-0.5">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ClockIcon className="w-5 h-5 text-brand-600 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-800">{lang === 'he' ? 'שעות האירוח:' : 'Time:'}</p>
                <p className="text-warm-600 mt-0.5">{timeString}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{lang === 'he' ? 'מיקום:' : 'Location:'}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationString)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center gap-1 mt-0.5 truncate"
                >
                  {locationString} ↗
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <UsersIcon className="w-5 h-5 text-brand-600 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between items-baseline mb-1.5">
                  <p className="font-semibold text-gray-800">
                    {lang === 'he' ? 'תפוסה:' : 'Capacity:'} {totalGuests} / {capacity}
                  </p>
                  <span className="text-xs font-bold text-brand-600">
                    {isCanceled ? '' : t('s19_spots_left', remainingSpots)}
                  </span>
                </div>
                
                <div className="h-2.5 w-full bg-warm-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${isCanceled ? 'bg-gray-300' : isFull ? 'bg-amber-500' : 'bg-brand-500'}`}
                    style={{ width: `${Math.min(100, (totalGuests / (capacity || 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {hosting.note && (
            <div className="mt-5 pt-4 border-t border-warm-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                {lang === 'he' ? 'הערות לאירוח:' : 'Hosting Notes:'}
              </p>
              <p className="text-xs text-warm-600 leading-relaxed italic bg-warm-50/50 p-2.5 rounded-xl border border-warm-100/40">
                "{hosting.note}"
              </p>
            </div>
          )}
        </Card>

        {/* Section 2 - Action controls */}
        <div className="flex gap-3">
          {isCanceled ? (
            <button
              onClick={() => onCancel(hosting.id)}
              className="flex-1 py-3 px-4 bg-brand-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcwIcon className="w-4 h-4" />
              <span>{lang === 'he' ? 'שחזר אירוח' : 'Restore Hosting'}</span>
            </button>
          ) : (
            <>
              <button
                onClick={() => onEdit(hosting.id)}
                className="flex-1 py-3 px-4 bg-white border border-warm-200 text-gray-700 rounded-xl text-sm font-bold shadow-xs hover:bg-warm-50 hover:border-warm-300 transition-all flex items-center justify-center gap-1.5"
              >
                <EditIcon className="w-4 h-4 text-gray-500" />
                <span>{t('s19_edit_btn')}</span>
              </button>
              <button
                onClick={() => onCancel(hosting.id)}
                className="py-3 px-5 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
              >
                <TrashIcon className="w-4 h-4 text-red-500" />
                <span>{lang === 'he' ? 'ביטול' : 'Cancel'}</span>
              </button>
            </>
          )}
        </div>

        {/* Section 3 - Registered Soldiers */}
        <div className="space-y-4">
          <div className="flex justify-between items-baseline border-b border-warm-200/80 pb-2">
            <h3 className="font-bold text-gray-900 text-base">
              {t('s19_registered_soldiers')}
            </h3>
            <span className="text-xs font-bold text-warm-500">
              ({guests.length} {lang === 'he' ? 'חיילים' : 'soldiers'})
            </span>
          </div>

          {guests.length === 0 ? (
            <Card className="text-center py-12 px-6 border-dashed border-warm-300/80">
              <div className="w-12 h-12 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-3 opacity-80">
                <UtensilsIcon className="w-6 h-6 text-warm-400" strokeWidth={2.2} />
              </div>
              <p className="text-sm font-semibold text-gray-700">
                {t('s19_no_guests_yet')}
              </p>
              <p className="text-xs text-warm-400 mt-2 max-w-xs mx-auto leading-relaxed">
                {t('s19_no_soldiers_desc')}
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {enrichedGuests.map(g => {
                const logisticsItems = [];
                if (g.needsTransport) {
                  logisticsItems.push({
                    id: 'transport',
                    label: lang === 'he' ? 'צריך הסעה' : 'Needs Ride',
                    icon: <CarIcon className="w-3.5 h-3.5 text-brand-600" />
                  });
                }
                if (g.needSleep) {
                  logisticsItems.push({
                    id: 'sleep',
                    label: lang === 'he' ? 'צריך לינה' : 'Needs Lodging',
                    icon: <BedIcon className="w-3.5 h-3.5 text-brand-600" />
                  });
                }

                const joinDateText = g.registrationDate || new Date().toLocaleDateString(lang === 'he' ? 'he-IL' : 'en-US', {
                  day: 'numeric',
                  month: 'short'
                });

                return (
                  <Card key={g.id || g.soldier_id || g.name} className="p-4 border border-warm-200 shadow-sm bg-white hover:border-brand-200 transition-colors">
                    {/* Soldier Info Row */}
                    <div className="flex items-start gap-3.5 pb-4 mb-4 border-b border-warm-100">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white text-base font-bold shadow-inner overflow-hidden"
                        style={{ background: g.avatarColor || '#B0BA99' }}
                      >
                        {g.profile_img_url ? (
                          <img src={g.profile_img_url} alt={g.name} className="w-full h-full object-cover" />
                        ) : (
                          (g.name || '?')[0]
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="font-bold text-gray-800 text-sm truncate">
                            {g.name}
                          </h4>
                          <span className="text-[10px] text-warm-400 flex-shrink-0">
                            {lang === 'he' ? 'נרשם ב-' : 'Joined '} {joinDateText}
                          </span>
                        </div>
                        
                        <p className="text-xs text-warm-500 mt-0.5">
                          {[g.unit ? `${t('s19_unit')} ${g.unit}` : null, g.age ? `${g.age} ${lang === 'he' ? 'שנים' : 'y/o'}` : null].filter(Boolean).join(' · ') || (lang === 'he' ? 'חייל משרת' : 'Serving Soldier')}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">
                            {(g.groupSize || 1) > 1 ? <UsersIcon className="w-3.5 h-3.5 text-gray-500" /> : <UserIcon className="w-3.5 h-3.5 text-gray-500" />}
                            <span>
                              {(g.groupSize || 1) > 1 
                                ? (lang === 'he' ? `קבוצה של ${g.groupSize}` : `Group of ${g.groupSize}`)
                                : (lang === 'he' ? 'יחיד' : 'Solo')}
                            </span>
                          </span>
                          {logisticsItems.map(item => (
                            <span key={item.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-700 text-[10px] font-bold rounded-md border border-brand-100">
                              {item.icon}
                              <span>{item.label}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Soldier Preferences */}
                    <div className="space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100">
                          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">
                            {lang === 'he' ? 'רמת כשרות' : 'Kosher Level'}
                          </span>
                          <span className="font-bold text-gray-800">{renderKosherBadge(g.kosher, lang)}</span>
                        </div>

                        <div className="bg-warm-50/60 p-2 rounded-xl border border-warm-100 flex flex-col justify-center">
                          <span className="text-[10px] text-warm-400 font-bold block mb-0.5">
                            {lang === 'he' ? 'אלרגיות ומגבלות' : 'Allergies'}
                          </span>
                          {(g.allergies || []).length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-0.5">
                              {(g.allergies || []).map(a => renderAllergyBadge(a, lang))}
                            </div>
                          ) : (
                            <span className="font-medium text-gray-500 flex items-center gap-1 mt-0.5">
                              <UtensilsIcon className="w-3.5 h-3.5 text-gray-400" strokeWidth={2.2} />
                              <span>{lang === 'he' ? 'אין הגבלות' : 'None'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {g.bio && (
                        <div className="p-2.5 bg-warm-50/30 border-s-2 border-brand-300 rounded-e-xl italic text-warm-600 mt-1 leading-relaxed">
                          "{g.bio}"
                        </div>
                      )}

                      {(() => {
                        const phone = getGuestPhone(g);
                        return (
                          <div className="flex flex-col gap-1.5 pt-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleWhatsAppRedirect(g)}
                                disabled={!phone}
                                className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-3 font-bold shadow-xs active:scale-[0.98] transition-all ${
                                  phone
                                    ? "bg-white border border-warm-200 text-gray-700 hover:bg-warm-50"
                                    : "bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                                }`}
                                title={!phone ? t('s19_phone_missing_msg') : ''}
                              >
                                <WhatsAppIcon className={`w-4 h-4 ${phone ? 'text-[#25D366]' : 'text-gray-400'}`} />
                                <span>{t('s19_send_msg')}</span>
                              </button>
                              <button
                                onClick={() => onOpenRecipes(g)}
                                className="flex-1 flex items-center justify-center gap-1.5 bg-brand-50 border border-brand-200 text-brand-700 py-2 px-3 rounded-xl hover:bg-brand-100 transition-colors font-bold active:scale-[0.98]"
                              >
                                <ChefHatIcon className="w-4 h-4 text-brand-700" />
                                <span>{t('s19_view_recipes')}</span>
                              </button>
                            </div>
                            {!phone && (
                              <p className="text-[10px] text-red-500 font-medium px-1 mt-0.5">
                                ⚠️ {t('s19_phone_missing_msg')}
                              </p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────
   S20 New Hosting / Edit Hosting
───────────────────────────────────────── */

function S20NewHosting({ data, setData, onBack, onSubmit }) {
  const { t } = useLang();
  const editingHosting = data.hostings?.find(h => h.id === data.editingHostingId);

  const [form, setFormState] = useState(() => {
    if (editingHosting) return { ...editingHosting, soldiers: String(editingHosting.soldiers) };
    return { date: '', time: '', customTime: '', soldiers: '', note: '', sleepOvernight: false, pickup: false };
  });
  const [errors, setErrors] = useState({});

  const setF = (key) => (val) => setFormState(prev => ({ ...prev, [key]: val }));

  const SOLDIER_OPTS = ['1', '2', '3', '4', '5+'];

  const previousHostings = [...(data.hostings || [])]
    .filter(h => h.id !== data.editingHostingId)
    .sort((a, b) => {
      const aVal = typeof a.id === 'string' ? parseInt(a.id) : a.id;
      const bVal = typeof b.id === 'string' ? parseInt(b.id) : b.id;
      return bVal - aVal;
    });

  const handleReuse = (prevHosting) => {
    setFormState({
      date: prevHosting.date || '',
      time: prevHosting.time || '',
      customTime: prevHosting.customTime || '',
      soldiers: String(prevHosting.soldiers || ''),
      note: prevHosting.note || '',
      sleepOvernight: prevHosting.sleepOvernight || false,
      pickup: prevHosting.pickup || false,
    });
  };

  const validate = () => {
    const e = {};
    if (!form.date)     e.date    = t('v_date');
    if (!form.time)     e.time    = t('v_time');
    if (!form.soldiers) e.soldiers = t('v_sol');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form, guests: form.guests || [] });
  };

  return (
    <div className="screen-enter min-h-screen flex flex-col bg-warm-50">
      <AppHeader onBack={onBack} />
      <div className="flex-1 flex justify-center">
      <div className="w-full max-w-md px-5 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
            {editingHosting ? t('s19_edit') : t('s20_title')}
          </h1>
          <p className="text-sm text-warm-500 mt-1">{t('s20_sub')}</p>
        </div>

        {(!editingHosting && previousHostings.length > 0) && (
          <div className="mb-6 bg-white border border-warm-200 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">אירוחים קודמים</p>
            <p className="text-sm font-semibold text-gray-800">בחרו אירוח קודם כדי להשתמש בו כתבנית:</p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {previousHostings.map(h => (
                <div key={h.id} className="p-3 bg-warm-50 rounded-xl border border-warm-100 flex items-center justify-between gap-3 hover:border-brand-200 transition-colors">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900">
                      {new Date(h.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })} | {h.time === 'friday_evening' ? 'ערב שישי' : h.time === 'saturday_lunch' ? 'צהריים שבת' : h.time}
                    </p>
                    <p className="text-[11px] text-warm-500 mt-0.5">
                      {h.soldiers} חיילים {h.sleepOvernight ? '• לינה' : ''} {h.pickup ? '• הסעה' : ''}
                    </p>
                    {h.note && (
                      <p className="text-[11px] text-warm-400 mt-1 leading-relaxed truncate">
                        "{h.note}"
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReuse(h)}
                    className="px-3 py-1.5 bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold rounded-lg hover:bg-brand-100 transition-all active:scale-[0.98] flex-shrink-0"
                  >
                    השתמש בבקשה קודמת
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-6">

          <FridayDatePicker
            label={t('s20_date_free')}
            value={form.date}
            onChange={setF('date')}
            error={errors.date}
          />

          <Input 
            label={t('s20_time_free')}
            type="time"
            value={form.time}
            onChange={setF('time')}
            error={errors.time}
            required
          />

          {/* Soldier count */}
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-2">{t('s20_sol_label')}</p>
            <div className="flex gap-2">
              {SOLDIER_OPTS.map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setF('soldiers')(n)}
                  className={`flex-1 h-12 rounded-xl text-sm font-bold border transition-all ${
                    form.soldiers === n
                      ? 'bg-brand-600 text-white border-brand-600 shadow-md'
                      : 'bg-white text-gray-600 border-warm-200 hover:border-warm-300'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            {errors.soldiers && <p className="mt-1.5 text-xs text-red-500">{errors.soldiers}</p>}
          </div>

          {/* Logistics */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-800">{t('s20_logistics')}</p>
            <CheckRow
              label={t('s20_sleep')}
              checked={form.sleepOvernight}
              onChange={setF('sleepOvernight')}
            />
            <CheckRow
              label={t('s20_pickup')}
              checked={form.pickup}
              onChange={setF('pickup')}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s20_note_label')}</label>
            <textarea
              value={form.note}
              onChange={e => setF('note')(e.target.value)}
              placeholder={t('s20_note_ph')}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300 resize-none transition-all"
            />
          </div>

          <Btn onClick={handleSubmit}>{t('s20_submit')}</Btn>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   S22 Host Profile — Settings
───────────────────────────────────────── */

function S22HostProfile({ data, setData, onBack, onLogout }) {
  const { t, lang } = useLang();

  const [form, setForm] = useState({
    hostName:     data.hostName     || data.hostFullName || '',
    hostPhone:    data.hostPhone    || '',
    hostCity:     data.hostCity     || '',
    hostAddress:  data.hostAddress  || '',
    hostLat:      data.hostLat,
    hostLng:      data.hostLng,
    hostKosher:   data.hostKosher   || '',
    hostShabbat:  data.hostShabbat  || '',
    hasPets:      data.hasPets      || false,
    petsDetails:  data.petsDetails  || '',
    hostCooking:  data.hostCooking  || [],
    hostLanguages: data.hostLanguages || ['he'],
    hostVibe:     data.hostVibe     || '',
  });
  const [saved, setSaved] = useState(false);
  const [newLanguageText, setNewLanguageText] = useState('');
  const [customLanguages, setCustomLanguages] = useState([]);
  const fileInputRef = useRef(null);

  const setF = (key) => (val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm(prev => ({ 
        ...prev, 
        hostFile: file, 
        hostPreview: URL.createObjectURL(file),
        removePhoto: false
      }));
    }
  };

  const staticLanguages = [
    { id: 'he', label: t('lang_he') },
    { id: 'en', label: t('lang_en') },
    { id: 'ru', label: t('lang_ru') },
    { id: 'es', label: t('lang_es') },
    { id: 'ar', label: t('lang_ar') },
  ];
  const allLanguages = [...staticLanguages, ...customLanguages.map(l => ({ id: l, label: l }))];

  const handleAddLanguage = () => {
    const trimmed = newLanguageText.trim();
    if (!trimmed) return;
    if (!allLanguages.some(l => l.id.toLowerCase() === trimmed.toLowerCase())) {
      setCustomLanguages(prev => [...prev, trimmed]);
    }
    if (!form.hostLanguages.includes(trimmed)) {
      setF('hostLanguages')([...form.hostLanguages, trimmed]);
    }
    setNewLanguageText('');
  };

  const handleSave = async () => {
    const hasPending = !!data.pendingNewHosting;

    let profileUrl = null;
    if (form.hostFile && window.DB && data.uid) {
      profileUrl = await window.DB.uploadProfileImage(data.uid, form.hostFile, 'families');
    }

    const { hostFile, hostPreview, removePhoto, ...restForm } = form;
    const updatedData = {
      ...restForm,
      ...(profileUrl ? { profile_img_url: profileUrl, img_urls: [profileUrl] } : {}),
      ...(hasPending ? { hostPreferencesSkipped: false, pendingNewHosting: false } : {}),
    };

    if (removePhoto && window.DB && !profileUrl) {
      if (data.profile_img_url) {
        await window.DB.deleteProfileImage(data.profile_img_url);
      }
      updatedData.profile_img_url = null;
      updatedData.img_urls = [];
    }

    if (window.DB && data.uid) {
      try {
        await window.DB.saveFamilyProfile(data.uid, updatedData);
      } catch (e) {
        alert("Error saving profile to database.");
      }
    }

    setData(prev => ({ ...prev, ...updatedData }));
    setSaved(true);
    if (hasPending) {
      setTimeout(() => window.setScreen(20), 900);
    } else {
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const shabbatOpts = [
    { id: 'keeps',       label: t('s16_shab_keeps') },
    { id: 'traditional', label: t('s16_shab_trad')  },
    { id: 'none',        label: t('s16_shab_none')  },
  ];
  const kosherOpts = [
    { id: 'mehadrin',  label: t('s16_kosh_kit')  },
    { id: 'separated', label: t('s16_kosh_sep')  },
    { id: 'none',      label: t('s16_kosh_none') },
  ];
  const cookingOptions = [
    { id: 'veg',     label: t('alg_veg')    },
    { id: 'vegan',   label: t('alg_vegan')  },
    { id: 'celiac',  label: t('alg_celiac') },
    { id: 'lactose', label: t('alg_lactose')},
    { id: 'nuts',    label: t('alg_nuts')   },
  ];

  return (
    <div className="screen-enter min-h-screen bg-warm-50 pb-12">
      <AppHeader title={t('profile_settings')} onBack={onBack} />

      <div className="max-w-md mx-auto px-5 pt-6 space-y-5">

        {/* Basic details */}
        <Card className="p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t('family_details_label')}
          </h2>
          <Input label={t('s16_name')}  value={form.hostName}  onChange={setF('hostName')} />
          <Input label={t('s16_phone')} type="tel" value={form.hostPhone} onChange={setF('hostPhone')} />
          <AddressPicker
            label={t('s16_city')}
            placeholder={t('s16_city_ph')}
            value={form.hostCity ? {
              fullString: form.hostAddress || form.hostCity,
              city: form.hostCity,
              coordinates: { lat: form.hostLat, lng: form.hostLng },
            } : null}
            onChange={(addr) => setForm(prev => ({
              ...prev,
              hostCity: addr.city || addr.fullString || '',
              hostAddress: addr.fullString || '',
              hostLat: addr.coordinates?.lat,
              hostLng: addr.coordinates?.lng,
            }))}
          />
        </Card>

        {/* Lifestyle & preferences — identical to registration steps 2+3 */}
        <Card className="p-5 space-y-6">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">
            {t('lifestyle_label')}
          </h2>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_kosher')}</p>
            <RadioGroup options={kosherOpts} value={form.hostKosher} onChange={setF('hostKosher')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_shabbat')}</p>
            <RadioGroup options={shabbatOpts} value={form.hostShabbat} onChange={setF('hostShabbat')} />
          </div>

          <div>
            <CheckRow label={t('s16_has_pets')} checked={form.hasPets} onChange={setF('hasPets')} />
            {form.hasPets && (
              <div className="mt-3 ps-1">
                <Input
                  value={form.petsDetails}
                  onChange={setF('petsDetails')}
                  placeholder={t('s16_pets_ph')}
                />
              </div>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">{t('s16_cooking')}</p>
            <MultiCheck options={cookingOptions} values={form.hostCooking} onChange={setF('hostCooking')} />
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">שפות מדוברות (לסמן את כל מה שרלוונטי)</p>
            <MultiCheck options={allLanguages} values={form.hostLanguages} onChange={setF('hostLanguages')} />
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                value={newLanguageText}
                onChange={e => setNewLanguageText(e.target.value)}
                placeholder="הוסף שפה אחרת..."
                className="flex-1 min-h-[44px] py-2 px-4 rounded-xl border border-warm-200 bg-white text-sm transition-all placeholder:text-warm-400 focus:outline-none focus:ring-4 focus:ring-brand-50 focus:border-brand-400 hover:border-warm-300"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLanguage(); } }}
              />
              <Btn type="button" variant="secondary" onClick={handleAddLanguage} className="!w-auto !py-2.5">הוסף</Btn>
            </div>
          </div>
        </Card>

        {/* Vibe / bio */}
        <Card className="p-5 space-y-3">
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
            {t('s16_3_title')}
          </h2>
          
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-800 mb-2">{t('s16_photo_label')}</label>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border border-dashed border-warm-300 bg-warm-50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-brand-50 hover:border-brand-300 transition-colors overflow-hidden"
              style={((form.hostPreview || data.profile_img_url) && !form.removePhoto) ? { backgroundImage: `url(${form.hostPreview || data.profile_img_url})`, backgroundSize: 'cover', backgroundPosition: 'center', borderColor: 'transparent', height: '160px' } : {}}
            >
              {!((form.hostPreview || data.profile_img_url) && !form.removePhoto) && (
                <>
                  <span className="text-3xl mb-2">📷</span>
                  <p className="text-sm font-semibold text-gray-600">{t('s16_photo_btn')}</p>
                  <p className="text-xs text-warm-400 mt-1">{t('s6_size')}</p>
                </>
              )}
            </div>
            {((form.hostPreview || data.profile_img_url) && !form.removePhoto) && (
              <div className="mt-2 flex justify-end">
                <button 
                  onClick={() => setForm(prev => ({ ...prev, removePhoto: true, hostFile: null, hostPreview: null }))}
                  className="text-xs text-red-500 font-medium hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-lg border border-red-100"
                >
                  {t('remove_photo') || 'הסר תמונה'}
                </button>
              </div>
            )}
          </div>

          <label className="block text-sm font-semibold text-gray-800 mb-2 mt-4">{t('s16_vibe_label')}</label>
          <textarea
            value={form.hostVibe}
            onChange={e => setF('hostVibe')(e.target.value)}
            placeholder={t('s16_vibe_ph')}
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-warm-200 text-[15px] text-gray-900 bg-white resize-none transition-all duration-150 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-300"
          />
        </Card>

        <Btn onClick={handleSave} variant={saved ? 'secondary' : 'primary'}>
          {saved ? t('saved_success') : t('save_changes')}
        </Btn>
        <Btn onClick={onLogout} variant="danger" className="mt-2 mb-6">
          {t('logout')}
        </Btn>
      </div>
    </div>
  );
}

window.S19HostHome = S19HostHome;
window.S20NewHosting = S20NewHosting;
window.S22HostProfile = S22HostProfile;
