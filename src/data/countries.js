/**
 * 国家信息配置
 * Country Information Configuration
 */

export const COUNTRIES = {
  CHINA: {
    zh: "中国",
    en: "China",
    code: "🇨🇳",
    continent: "Asia"
  },
  THAILAND: {
    zh: "泰国",
    en: "Thailand",
    code: "🇹🇭",
    continent: "Asia"
  },
  USA: {
    zh: "美国",
    en: "USA",
    code: "🇺🇸",
    continent: "North America"
  },
  CANADA: {
    zh: "加拿大",
    en: "Canada",
    code: "🇨🇦",
    continent: "North America"
  }
};

/**
 * 获取国家信息
 * @param {string} countryKey - 国家键名
 * @returns {Object} 国家信息对象
 */
export const getCountry = (countryKey) => {
  return COUNTRIES[countryKey] || COUNTRIES.CHINA;
};
