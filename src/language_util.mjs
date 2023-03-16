// Languages

import ENGLISH from './language/strings.json' assert { type: "json" };
import SPANISH from './language/strings-es.json' assert { type: "json" };
import GERMAN from './language/strings-de.json' assert { type: "json" };
import JAPANESE from './language/strings-ja.json' assert { type: "json" };
import SIMPLIFIED_CHINESE from './language/strings-zh-CN.json' assert { type: "json" };
import TRADITIONAL_CHINESE from './language/strings-zh-TW.json' assert { type: "json" };
import FRENCH from './language/strings-fr.json' assert { type: "json" };
import ITALIAN from './language/strings-it.json' assert { type: "json" };
import KOREAN from './language/strings-ko.json' assert { type: "json" };

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

export const LANGUAGE_NAMES = {
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

export function ts_lang(text, language) {
  text = (text || "dammerung").toLowerCase();
  const preStrings = LANGUAGE_STRINGS[language] || {};
  const strings = {};
  for (const [k, v] of Object.entries(preStrings)) {
    strings[k.toLowerCase()] = v;
  }
  return strings[text] || "???";
};
