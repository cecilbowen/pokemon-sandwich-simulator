// Languages
const ENGLISH = require('./language/strings.json');
const SPANISH = require('./language/strings-es.json');
const GERMAN = require('./language/strings-de.json');
const JAPANESE = require('./language/strings-ja.json');
const SIMPLIFIED_CHINESE = require('./language/strings-zh-CN.json');
const TRADITIONAL_CHINESE = require('./language/strings-zh-TW.json');
const FRENCH = require('./language/strings-fr.json');
const ITALIAN = require('./language/strings-it.json');
const KOREAN = require('./language/strings-ko.json');

const LANGUAGE_STRINGS = {
  'en': ENGLISH,
  'es': SPANISH,
  'de': GERMAN,
  'ja': JAPANESE,
  'zh-CN': SIMPLIFIED_CHINESE,
  'zh-TW': TRADITIONAL_CHINESE,
  'fr': FRENCH,
  'it': ITALIAN,
  'ko': KOREAN
  //'ru': RUSSIAN,
  //'sv': SWEDISH
};

const LANGUAGE_NAMES = {
  'en': 'English',
  'es': 'Español',
  'de': 'Deutsch',
  'ja': '日本',
  'zh-CN': '简中',
  'zh-TW': '繁中',
  'fr': 'Français',
  'it': 'Italiano',
  'ko': '한국어'
  //'ru': 'Pусский',
  //'sv': 'Svenska'
};

function ts_lang(text, language) {
  text = (text || "dammerung").toLowerCase();
  const preStrings = LANGUAGE_STRINGS[language] || {};
  const strings = {};
  for (const [k, v] of Object.entries(preStrings)) {
    strings[k.toLowerCase()] = v;
  }
  return strings[text] || "???";
};

module.exports = {ts_lang, LANGUAGE_NAMES};