const SINHALA_PATTERN = /[\u0D80-\u0DFF]/;
const BILINGUAL_SPLIT = ' / ';

const originalTextByNode = new WeakMap();
const originalAttrByElement = new WeakMap();

const LANGUAGE_PAIRS = [
  ['Sri Lanka Railways Department', 'ලංකා දුම්රිය දෙපාර්තමේන්තුව'],
  ['SRI LANKA RAILWAYS', 'ශ්‍රී ලංකා දුම්රිය'],
  ['RAILWAY LETTER MANAGEMENT SYSTEM', 'දුම්රිය ලිපි කළමනාකරණ පද්ධතිය'],
  ['Railway Letter Monitoring System', 'දුම්රිය ලිපි අධීක්ෂණ පද්ධතිය'],
  ['Letter Management System (RLMS)', 'ලිපි කළමනාකරණ පද්ධතිය'],
  ['Welcome to the Railway Letter Management portal.', 'දුම්රිය ලිපි කළමනාකරණ ද්වාරයට ඔබව සාදරයෙන් පිළිගනිමු.'],
  ['Welcome to RLMS', 'ලිපි කළමනාකරණ පද්ධතිය වෙත සාදරයෙන් පිළිගනිමු'],
  ['Welcome', 'ආයුබෝවන්'],
  ['Login failed', 'පිවිසීම අසාර්ථකයි'],
  ['Select Identity to Sign In', 'පුරනය වීමට අනන්‍යතාවය තෝරන්න'],
  ['SELECT IDENTITY TO SIGN IN', 'පුරනය වීමට අනන්‍යතාවය තෝරන්‍න'],
  ['Sign In to System', 'පද්ධතියට පිවිසෙන්න'],
  ['Signing in...', 'පුරනය වෙමින්...'],
  ['Credentials', 'අක්තපත්‍ර'],
  ['Password', 'මුරපදය'],
  ['Auto-filled', 'ස්වයංක්‍රීයව පුරවා ඇත'],
  ['History', 'ඉතිහාසය'],
  ['Dashboard', 'පුවරුව'],
  ['Add Letter', 'ලිපියක් එක් කරන්න'],
  ['Reply to Letter', 'පිළිතුරු ලිපිය'],
  ['All Letters', 'සියලු ලිපි'],
  ['Secretary Inbox', 'ලේකම් එන ලිපි'],
  ['Reminders', 'මතක් කිරීම්'],
  ['Action Tracking', 'ක්‍රියාමාර්ග ලුහුබැඳීම'],
  ['User Tracking', 'පරිශීලක ලුහුබැඳීම'],
  ['Export Report', 'වාර්තාව නිර්යාතය'],
  ['User Management', 'පරිශීලක කළමනාකරණය'],
  ['History Log', 'ඉතිහාස සටහන'],
  ['Notifications', 'දැනුම්දීම්'],
  ['Daily Summary', 'දෛනික සාරාංශය'],
  ['Daily', 'දෛනික'],
  ['Weekly', 'සතිපතා'],
  ['Monthly', 'මාසික'],
  ['All', 'සියලු'],
  ['Pending', 'පොරොත්තු'],
  ['Completed', 'අවසන්'],
  ['Draft Letters', 'කෙටුම්පත් ලිපි'],
  ['Draft', 'කෙටුම්පත'],
  ['No Action', 'ක්‍රියාමාර්ග නැත'],
  ['Overdue Reminder', 'කල් ඉකුත් මතක් කිරීම'],
  ['Upcoming Reminder', 'ඉදිරි මතක් කිරීම'],
  ['Overdue', 'කල් ඉකුත් වූ'],
  ['Search letters...', 'ලිපි සොයන්න...'],
  ['Sign Out', 'පිටවීම'],
  ['Dark Mode', 'අඳුරු ආකාරය'],
  ['Light Mode', 'ආලෝක ආකාරය'],
  ['Department Officer', 'දෙපාර්තමේන්තු නිලධාරී'],
  ['Head of Department', 'දෙපාර්තමේන්තු ප්‍රධානියා'],
  ['Additional Secretary', 'අතිරේක ලේකම්'],
  ['System Admin', 'පද්ධති පරිපාලක'],
  ['Create/Edit Access (No Delete)', 'නිර්මාණය හා සංස්කරණය (මකා දැමීම නැත)'],
  ['View-only (All Letters & Dashboards)', 'බැලීම පමණි (සියලු ලිපි හා පුවරු)'],
  ['Category-Specific View & Reply Only', 'කාණ්ඩයට සීමිත බැලීම හා පිළිතුරු පමණි'],
  ['User Administration Only', 'පරිශීලක පරිපාලනය පමණි'],
  ['Addl. Secretary', 'අතිරේක ලේකම්'],
  ['Addl. Sec. (Administration)', 'අති. ලේක. (පරිපාලන)'],
  ['Addl. Sec. (Development)', 'අති. ලේක. (සංවර්ධන)'],
  ['Addl. Sec. (Engineering)', 'අති. ලේක. (ඉංජිනේරු)'],
  ['Addl. Sec. (SLAcS - Special)', 'අති. ලේක. (විශේෂ)'],
  ['Addl. Sec. (SLPS - Special)', 'අති. ලේක. (විශේෂ ව්‍යාපෘති)'],
  ['Addl. Sec. (Special Projects)', 'අති. ලේක. (විශේෂ ව්‍යාපෘති)'],
  ['Addl. Sec.', 'අති. ලේක.'],
  ['Officer', 'නිලධාරී'],
  ['Administration', 'පරිපාලන'],
  ['Development', 'සංවර්ධන'],
  ['Engineering', 'ඉංජිනේරු'],
  ['Special Projects', 'විශේෂ ව්‍යාපෘති'],
  ['Correspondence Details', 'ලිපි විස්තර'],
  ['Date Received *', 'ලිපි භාරගත් දිනය *'],
  ['Date Received', 'ලිපි භාරගත් දිනය'],
  ['Referring Organization / Institution *', 'යොමු කළ ආයතනය *'],
  ['Referring Organization', 'යොමු කළ ආයතනය'],
  ['Letter Number *', 'ලිපි අංකය *'],
  ['Letter Number', 'ලිපි අංකය'],
  ['Subject of the Letter *', 'ලිපියේ මාතෘකාව *'],
  ['File Number', 'ගොනු අංකය'],
  ['Document Upload', 'ලේඛන උඩුගත කිරීම'],
  ['Scan Upload', 'ස්කෑන් උඩුගත කිරීම'],
  ['Upload PDF', 'ලේඛන උඩුගත කරන්න'],
  ['Subject', 'මාතෘකාව'],
  ['Action Taken on the Letter', 'ලිපිය මත ගත් ක්‍රියාමාර්ග'],
  ['Action Taken', 'ගත් ක්‍රියාමාර්ග'],
  ['Signature / Approval / Instructions', 'අත්සන / අනුමැතිය / උපදෙස්'],
  ['Date File Forwarded/Received', 'ගොනුව යොමු/ලැබුණු දිනය'],
  ['Date File Forwarded', 'ගොනුව යොමු කළ දිනය'],
  ['Date File Received', 'ගොනුව ලැබුණු දිනය'],
  ['Date Signed (Letter Date)', 'අත්සන් කළ දිනය (ලිපි දිනය)'],
  ['Date Mailed / Posted', 'තැපැල් කළ දිනය'],
  ['Submitted By / Send By', 'ඉදිරිපත් කළේ / යැවූවේ'],
  ['Send By Copies', 'පිටපත් යවන්න'],
  ['Other Recipient Name', 'වෙනත් ලාභියාගේ නම'],
  ['Other Recipient', 'වෙනත් ලාභියා'],
  ['Reminder Date', 'මතක් කිරීමේ දිනය'],
  ['Status', 'තත්ත්වය'],
  ['Reminder', 'මතක් කිරීම'],
  ['Send To', 'යොමු කළේ'],
  ['Copies', 'පිටපත්'],
  ['Replies', 'පිළිතුරු'],
  ['Reply to letter', 'ලිපියට පිළිතුරු දෙන්න'],
  ['Reply', 'පිළිතුර'],
  ['Close', 'වසන්න'],
  ['Cancel', 'අවලංගු කරන්න'],
  ['Save Reply', 'පිළිතුරු සුරකින්න'],
  ['Save', 'සුරකින්න'],
  ['Edit Entry', 'ඇතුළත් කිරීම සංස්කරණය'],
  ['Edit', 'සංස්කරණය'],
  ['Complete', 'සම්පූර්ණ කරන්න'],
  ['New Letter', 'නව ලිපිය'],
  ['New Reply', 'නව පිළිතුර'],
  ['Draft Stage', 'කෙටුම්පත් අවස්ථාව'],
  ['Submit & Register', 'ඉදිරිපත් කර ලියාපදිංචි කරන්න'],
  ['Register Incoming Letter Form', 'එන ලිපි ලියාපදිංචි කිරීමේ ආකෘතිය'],
  ['Reply Letter Form', 'පිළිතුරු ලිපි ආකෘතිය'],
  ['Reply Source Letter', 'පිළිතුරු මුල් ලිපිය'],
  ['Selected roles', 'තෝරාගත් භූමිකා'],
  ['Approved & Signed', 'අනුමත හා අත්සන් කළ'],
  ['Pending Approval', 'අනුමැතිය බලාපොරොත්තුවෙන්'],
  ['Instructions Forwarded', 'උපදෙස් යොමු කළා'],
  ['Re-Route Required', 'නැවත මාර්ගගත කිරීම අවශ්‍යයි'],
  ['-- Select --', '-- තෝරන්න --'],
  ['No pending reminders', 'පොරොත්තු මතක් කිරීම් නොමැත'],
  ['No completed reminders', 'සම්පූර්ණ කළ මතක් කිරීම් නොමැත'],
  ['Pending Reminders', 'පොරොත්තු මතක් කිරීම්'],
  ['Previous Reminder Records', 'පෙර මතක් කිරීම් වාර්තා'],
  ['Edit Reminder', 'මතක් කිරීම සංස්කරණය'],
  ['Notes', 'සටහන්'],
  ['Yes', 'ඔව්'],
  ['No', 'නැත'],
  ['Letter Status', 'ලිපි තත්ත්වය'],
  ['Staff Activity (8am-5pm)', 'කාර්ය මණ්ඩල ක්‍රියාකාරිත්වය (පෙ.ව. 8-ප.ව. 5)'],
  ['No letter status data available', 'ලිපි තත්ත්ව දත්ත නොමැත'],
  ['No staff activity data available', 'කාර්ය මණ්ඩල ක්‍රියාකාරිත්ව දත්ත නොමැත'],
  ['Draft vs completed counts by dashboard periods.', 'පුවරු කාලසීමා අනුව කෙටුම්පත් හා අවසන් ගණන.'],
  ['Top 8 staff based on draft + completed letters.', 'කෙටුම්පත් + අවසන් ලිපි මත පදනම්ව ඉහළම කාර්ය මණ්ඩල 8.'],
  ['Letter ID', 'ලිපි හැඳුනුම'],
  ['Date', 'දිනය'],
  ['Organization', 'ආයතනය'],
  ['Recipients', 'ලාභීන්'],
  ['Created By', 'නිර්මාණය කළේ'],
  ['Actions', 'ක්‍රියා'],
  ['View', 'බලන්න'],
  ['From', 'වෙතින්'],
  ['All Correspondence Letters', 'සියලු ලිපි හුවමාරු'],
  ['+ Register New', '+ අලුතින් ලියාපදිංචි කරන්න'],
  ['All Status', 'සියලු තත්ත්ව'],
  ['No letters found', 'ලිපි හමු නොවීය'],
  ['Try adjusting filters or search terms', 'පෙරහන් හෝ සෙවුම් වචන සකසන්න'],
  ['Draft / New', 'කෙටුම්පත / නව'],
  ['Overdue / No Action', 'කල් ඉකුත් / ක්‍රියාමාර්ග නැත'],
  ['Inbox', 'එන ලිපි'],
  ['View and reply to letters assigned to your category', 'ඔබේ කාණ්ඩයට පැවරූ ලිපි බලා පිළිතුරු දෙන්න'],
  ['Reply Notes *', 'පිළිතුරු සටහන් *'],
  ['Reply PDF (optional)', 'පිළිතුරු ලේඛනය (විකල්ප)'],
  ['Mark response as completed', 'ප්‍රතිචාරය සම්පූර්ණ ලෙස සලකුණු කරන්න'],
  ['Reply / Action Panel', 'පිළිතුරු / ක්‍රියා පැනලය'],
  ['PDF Attachment', 'ලේඛන අමුණුම'],
  ['Download', 'බාගත කරන්න'],
  ['No Action Reminder', 'ක්‍රියාමාර්ග රහිත මතක් කිරීම'],
  ['Completed Reminder', 'සම්පූර්ණ කළ මතක් කිරීම'],
  ['Loading...', 'පූරණය වෙමින්...'],
  ['Mark all read', 'සියල්ල කියවූ ලෙස සලකුණු කරන්න'],
  ['From Date', 'ආරම්භක දිනය'],
  ['To Date', 'අවසාන දිනය'],
  ['Reset', 'යළි සකසන්න'],
  ['Export CSV', 'වගු නිර්යාතය'],
  ['Export PDF', 'ලේඛන නිර්යාතය'],
  ['Letter Export', 'ලිපි නිර්යාතය'],
  ['Staff Overview', 'කාර්ය මණ්ඩල දළ විශ්ලේෂණය'],
  ['Letter Action & Routing Tracking', 'ලිපි ක්‍රියාමාර්ග හා මාර්ගගත කිරීම් ලුහුබැඳීම'],
  ['Register New User', 'නව පරිශීලකයෙකු ලියාපදිංචි කරන්න'],
  ['Create User', 'පරිශීලකයා සාදන්න'],
  ['Active', 'සක්‍රීය'],
  ['Deactivate', 'අක්‍රීය කරන්න'],
  ['Activate', 'සක්‍රීය කරන්න'],
  ['User', 'පරිශීලක'],
  ['Railway LMS Security Gate • Authorized Personnel Only', 'දුම්රිය ලිපි පද්ධති ආරක්ෂක දොරටුව • අවසර ලත් පිරිසට පමණි'],
  ['Sinhala', 'සිංහල'],
  ['English', 'ඉංග්‍රීසි'],
  ['AM', 'පෙ.ව.'],
  ['PM', 'ප.ව.'],
];

const EXTRA_SI_TO_EN = {
  'ලිපි ලියාපදිංචි කිරීමේ ආකෘතිය': 'Register Incoming Letter Form',
  'පිළිතුරු ලිපි ආකෘතිය': 'Reply Letter Form',
  'ආයුබෝවන්': 'Welcome',
  'ආයතනය': 'Referring Organization',
  'තත්වය': 'Status',
  'වෙනත්': 'Other Recipient',
  'ක්‍රියාමාර්ග': 'Action Taken',
  'නිර්යාතය': 'Export Report',
  'පරිශීලක': 'User',
  'සියලු': 'All',
  'කෙටුම්පත්': 'Draft Letters',
};

/** Sinhala display names for known demo users (login / greetings) */
export const USER_SI_NAMES = {
  priyangani: 'ප්‍රියංගනී',
  gayanthi: 'ගයන්ති',
  purnima: 'පූර්ණිමා',
  dulani: 'දුලානි',
  chathura: 'චතුර',
  erandi: 'එරන්දි',
  sandareka: 'සඳරේකා',
  chathurika: 'චතුරිකා',
  prabhamili: 'ප්‍රභාමිලි',
  hod: 'දෙපාර්තමේන්තු ප්‍රධානියා',
  admin: 'පද්ධති පරිපාලක',
  'sec-admin': 'අතිරේක ලේකම් (පරිපාලන)',
  'sec-dev': 'අතිරේක ලේකම් (සංවර්ධන)',
  'sec-eng': 'අතිරේක ලේකම් (ඉංජිනේරු)',
  'sec-slacs': 'අතිරේක ලේකම් (විශේෂ)',
  'sec-slps': 'අතිරේක ලේකම් (විශේෂ ව්‍යාපෘති)',
  'sec-special': 'අතිරේක ලේකම් (විශේෂ ව්‍යාපෘති)',
};

export function displayUserName(user, lang = 'en') {
  if (!user) return '';
  if (lang === 'si') {
    return USER_SI_NAMES[user.username] || 'පරිශීලක';
  }
  return user.fullName || user.username || '';
}

const EN_TO_SI = Object.fromEntries(LANGUAGE_PAIRS.filter(([en]) => !SINHALA_PATTERN.test(en)));
const SI_TO_EN = {
  ...Object.fromEntries(LANGUAGE_PAIRS.filter(([en]) => !SINHALA_PATTERN.test(en)).map(([en, si]) => [si, en])),
  ...EXTRA_SI_TO_EN,
};

function replaceAllByMap(text, phraseMap) {
  let result = text;
  const keys = Object.keys(phraseMap).sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    if (!result.includes(key)) return;
    result = result.split(key).join(phraseMap[key]);
  });
  return result;
}

function scrubLatinLetters(text) {
  if (typeof text !== 'string') return text;
  // Only strip Latin from mixed Sinhala text (keeps pure English names/IDs intact if untranslated)
  if (!SINHALA_PATTERN.test(text)) return text;
  return text
    .replace(/[A-Za-z]+/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function pickLanguageText(text, lang = 'en') {
  if (typeof text !== 'string') return text;

  // Split on the last " / " where the left side has no Sinhala and the right side has Sinhala.
  // This keeps English phrases with "/" intact and allows SI side to start with digits/names.
  if (text.includes(BILINGUAL_SPLIT) && SINHALA_PATTERN.test(text)) {
    let splitAt = -1;
    let searchFrom = 0;
    while (searchFrom < text.length) {
      const found = text.indexOf(BILINGUAL_SPLIT, searchFrom);
      if (found === -1) break;
      const left = text.slice(0, found);
      const right = text.slice(found + BILINGUAL_SPLIT.length);
      if (!SINHALA_PATTERN.test(left) && SINHALA_PATTERN.test(right)) {
        splitAt = found;
      }
      searchFrom = found + BILINGUAL_SPLIT.length;
    }
    if (splitAt !== -1) {
      const left = text.slice(0, splitAt).trim();
      const right = text.slice(splitAt + BILINGUAL_SPLIT.length).trim();
      const chosen = lang === 'si' ? right : left;
      return lang === 'si' ? scrubLatinLetters(chosen) : chosen;
    }
  }

  // Legacy bilingual with bare "/" — group English segments before first Sinhala segment
  if (text.includes('/') && SINHALA_PATTERN.test(text) && !text.includes(BILINGUAL_SPLIT)) {
    const parts = text.split('/').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const sinhalaIdx = parts.findIndex((part) => SINHALA_PATTERN.test(part));
      if (sinhalaIdx > 0) {
        const englishPart = parts.slice(0, sinhalaIdx).join('/').trim();
        const sinhalaPart = parts.slice(sinhalaIdx).join('/').trim();
        const chosen = lang === 'si' ? sinhalaPart : englishPart;
        return lang === 'si' ? scrubLatinLetters(chosen) : chosen;
      }
    }
  }

  if (lang === 'si') {
    return scrubLatinLetters(replaceAllByMap(text, EN_TO_SI));
  }

  return replaceAllByMap(text, SI_TO_EN);
}

export function t(lang, englishText, sinhalaText) {
  const value = lang === 'si' ? sinhalaText : englishText;
  return lang === 'si' ? scrubLatinLetters(value) : value;
}

function localizeTextNode(node, lang) {
  const current = node.nodeValue;
  if (!current || !current.trim()) return;

  // Login page already uses pick()/t(); DOM rewriting can cache English
  // option text and then scrub Latin names after partial SI translation.
  const parent = node.parentElement;
  if (parent?.closest?.('.login-page, .login-lang-toggle, .header-lang-toggle')) return;

  if (!originalTextByNode.has(node)) {
    originalTextByNode.set(node, current);
  } else {
    const previous = originalTextByNode.get(node);
    const expected = pickLanguageText(previous, lang);
    // React replaced this node with a new source string — refresh the cache.
    if (current !== previous && current !== expected) {
      originalTextByNode.set(node, current);
    }
  }

  const original = originalTextByNode.get(node);
  const localized = pickLanguageText(original, lang);

  if (localized !== current) {
    node.nodeValue = localized;
  }
}

function localizeElementAttributes(element, lang) {
  if (element.closest?.('.login-page')) return;

  const attrNames = ['placeholder', 'title', 'aria-label'];
  const existing = originalAttrByElement.get(element) || {};

  attrNames.forEach((attr) => {
    const value = element.getAttribute(attr);
    if (!value) return;

    if (!Object.prototype.hasOwnProperty.call(existing, attr)) {
      existing[attr] = value;
    } else {
      const expected = pickLanguageText(existing[attr], lang);
      if (value !== existing[attr] && value !== expected) {
        existing[attr] = value;
      }
    }

    const localized = pickLanguageText(existing[attr], lang);
    if (localized !== value) {
      element.setAttribute(attr, localized);
    }
  });

  if (Object.keys(existing).length > 0) {
    originalAttrByElement.set(element, existing);
  }
}

export function localizeDom(root, lang = 'en') {
  if (!root) return;

  // Collect first, then apply — mutating during TreeWalker can skip nodes.
  const textNodes = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  textNodes.forEach((node) => localizeTextNode(node, lang));

  const elements = Array.from(root.querySelectorAll('*'));
  elements.forEach((el) => localizeElementAttributes(el, lang));
}
