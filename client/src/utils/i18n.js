const SINHALA_PATTERN = /[\u0D80-\u0DFF]/;

const originalTextByNode = new WeakMap();
const originalAttrByElement = new WeakMap();

const LANGUAGE_PAIRS = [
  ['Sri Lanka Railways Department', 'ලංකා දුම්රිය දෙපාර්තමේන්තුව'],
  ['Sri Lanka Railways', 'ශ්‍රී ලංකා දුම්රිය'],
  ['Railway Letter Monitoring System', 'දුම්රිය ලිපි අධීක්ෂණ පද්ධතිය'],
  ['Letter Management System (RLMS)', 'ලිපි කළමනාකරණ පද්ධතිය (RLMS)'],
  ['Welcome', 'ආයුබෝවන්'],
  ['Select Identity to Sign In', 'පුරනය වීමට අනන්‍යතාවය තෝරන්න'],
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
  ['Pending', 'පොරොත්තු'],
  ['Completed', 'අවසන්'],
  ['Draft', 'කෙටුම්පත'],
  ['No Action', 'ක්‍රියාමාර්ග නැත'],
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
  ['Correspondence Details', 'ලිපි විස්තර'],
  ['Date Received', 'ලිපි භාරගත් දිනය'],
  ['Referring Organization', 'යොමු කළ ආයතනය'],
  ['Letter Number', 'ලිපි අංකය'],
  ['File Number', 'ගොනු අංකය'],
  ['Subject', 'මාතෘකාව'],
  ['Action Taken', 'ගත් ක්‍රියාමාර්ග'],
  ['Status', 'තත්ත්වය'],
  ['Reminder', 'මතක් කිරීම'],
  ['Send To', 'යොමු කළේ'],
  ['Copies', 'පිටපත්'],
  ['Other Recipient', 'වෙනත් ලාභියා'],
  ['Replies', 'පිළිතුරු'],
  ['Reply', 'පිළිතුර'],
  ['Close', 'වසන්න'],
  ['Cancel', 'අවලංගු කරන්න'],
  ['Save', 'සුරකින්න'],
  ['Edit', 'සංස්කරණය'],
  ['Complete', 'සම්පූර්ණ කරන්න'],
  ['No pending reminders', 'පොරොත්තු මතක් කිරීම් නොමැත'],
  ['No completed reminders', 'සම්පූර්ණ කළ මතක් කිරීම් නොමැත'],
  ['Railway LMS Security Gate • Authorized Personnel Only', 'දුම්රිය LMS ආරක්ෂක දොරටුව • අවසර ලත් පිරිසට පමණි'],
];

const EN_TO_SI = Object.fromEntries(LANGUAGE_PAIRS);
const SI_TO_EN = Object.fromEntries(LANGUAGE_PAIRS.map(([en, si]) => [si, en]));

function replaceAllByMap(text, phraseMap) {
  let result = text;
  const keys = Object.keys(phraseMap).sort((a, b) => b.length - a.length);
  keys.forEach((key) => {
    if (!result.includes(key)) return;
    result = result.split(key).join(phraseMap[key]);
  });
  return result;
}

function isBilingualText(text) {
  if (typeof text !== 'string') return false;
  if (!text.includes('/')) return false;
  return SINHALA_PATTERN.test(text);
}

export function pickLanguageText(text, lang = 'en') {
  if (typeof text !== 'string') return text;

  if (isBilingualText(text)) {
    const parts = text.split('/').map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const englishPart = parts.find((part) => !SINHALA_PATTERN.test(part)) || parts[0];
      const sinhalaPart = parts.find((part) => SINHALA_PATTERN.test(part)) || parts[parts.length - 1];
      return lang === 'si' ? sinhalaPart : englishPart;
    }
  }

  if (lang === 'si') {
    return replaceAllByMap(text, EN_TO_SI);
  }

  return replaceAllByMap(text, SI_TO_EN);
}

export function t(lang, englishText, sinhalaText) {
  return lang === 'si' ? sinhalaText : englishText;
}

function localizeTextNode(node, lang) {
  const current = node.nodeValue;
  if (!current || !current.trim()) return;

  if (!originalTextByNode.has(node)) {
    originalTextByNode.set(node, current);
  }

  const original = originalTextByNode.get(node);
  const localized = pickLanguageText(original, lang);

  if (localized !== current) {
    node.nodeValue = localized;
  }
}

function localizeElementAttributes(element, lang) {
  const attrNames = ['placeholder', 'title', 'aria-label'];
  const existing = originalAttrByElement.get(element) || {};

  attrNames.forEach((attr) => {
    const value = element.getAttribute(attr);
    if (!value) return;

    if (!Object.prototype.hasOwnProperty.call(existing, attr)) {
      existing[attr] = value;
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

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    localizeTextNode(walker.currentNode, lang);
  }

  const elements = root.querySelectorAll('*');
  elements.forEach((el) => localizeElementAttributes(el, lang));
}
