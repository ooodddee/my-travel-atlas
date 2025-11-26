/**
 * 旅行数据
 * Travel Data - Lucy Sun's Journey Around the World
 *
 * 数据结构说明：
 * - id: 唯一标识符
 * - lat/lng: 经纬度坐标
 * - date: 旅行日期
 * - city: 城市名称（中英文）
 * - country: 国家信息（中英文 + 旗帜emoji + 大陆）
 * - description: 旅行描述（中英文）
 * - aiTags: AI 标签/心情标签
 * - moodColor: 心情颜色
 * - photos: 照片数组（可选）
 */

import { COUNTRIES } from "./countries.js";

export const TRAVEL_DATA = [
  {
    id: 0,
    lat: 25.0389,
    lng: 102.7183,
    date: "2019.10",
    city: { zh: "昆明", en: "Kunming" },
    country: COUNTRIES.CHINA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["Hometown"],
    moodColor: "#ff9f43",
  },
  {
    id: 1,
    lat: 13.7563,
    lng: 100.5018,
    date: "2019.10",
    city: { zh: "曼谷", en: "Bangkok" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["Family"],
    moodColor: "#feca57",
  },
  {
    id: 2,
    lat: 13.7563,
    lng: 100.5018,
    date: "2023.03",
    city: { zh: "曼谷", en: "Bangkok" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["Start"],
    moodColor: "#feca57",
  },
  {
    id: 3,
    lat: 10.0956,
    lng: 99.8404,
    date: "2023.04",
    city: { zh: "涛岛", en: "Koh Tao" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["Diving", "Muay Thai"],
    moodColor: "#48dbfb",
  },
  {
    id: 4,
    lat: 13.7563,
    lng: 100.5018,
    date: "2023.05",
    city: { zh: "曼谷", en: "Bangkok" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#ffa502",
  },
  {
    id: 5,
    lat: 18.7932,
    lng: 98.9817,
    date: "2023.11",
    city: { zh: "清迈", en: "Chiang Mai" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#ff6b6b",
  },
  {
    id: 6,
    lat: 23.1291,
    lng: 113.2644,
    date: "2023.12",
    city: { zh: "广州", en: "Guangzhou" },
    country: COUNTRIES.CHINA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["City", "Culture"],
    moodColor: "#ee5a6f",
  },
  {
    id: 7,
    lat: 14.3532,
    lng: 100.5676,
    date: "2024.08",
    city: { zh: "大城府", en: "Ayutthaya" },
    country: COUNTRIES.THAILAND,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#d4a574",
  },
  {
    id: 8,
    lat: 47.6062,
    lng: -122.3321,
    date: "2024.08",
    city: { zh: "西雅图", en: "Seattle" },
    country: COUNTRIES.USA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["New Life"],
    moodColor: "#54a0ff",
  },
  {
    id: 9,
    lat: 49.2827,
    lng: -123.1207,
    date: "2024.12.29",
    city: { zh: "温哥华", en: "Vancouver" },
    country: COUNTRIES.CANADA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#c8d6e5",
  },
  {
    id: 10,
    lat: 22.0964,
    lng: -159.5261,
    date: "2025.05.19",
    city: { zh: "可爱岛", en: "Kauai" },
    country: COUNTRIES.USA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#1dd1a1",
  },
  {
    id: 11,
    lat: 21.3069,
    lng: -157.8583,
    date: "2025.06.17",
    city: { zh: "檀香山", en: "Honolulu" },
    country: COUNTRIES.USA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: [""],
    moodColor: "#ff9f43",
  },
  {
    id: 12,
    lat: 19.5429,
    lng: -155.6659,
    date: "2025.06.29",
    city: { zh: "大岛", en: "Big Island" },
    country: COUNTRIES.USA,
    description: {
      zh: "正在努力回忆中。。。",
      en: "Trying hard to recall...",
    },
    aiTags: ["Volcano"],
    moodColor: "#ee5253",
  },
];

/**
 * 根据 ID 获取旅行数据
 * @param {number} id - 旅行记录 ID
 * @returns {Object|null} 旅行数据对象
 */
export const getTravelById = (id) => {
  return TRAVEL_DATA.find((item) => item.id === id) || null;
};

/**
 * 根据城市名称搜索旅行数据
 * @param {string} cityName - 城市名称（中文或英文）
 * @returns {Array} 匹配的旅行数据数组
 */
export const searchByCity = (cityName) => {
  const query = cityName.toLowerCase();
  return TRAVEL_DATA.filter(
    (item) =>
      item.city.zh.toLowerCase().includes(query) ||
      item.city.en.toLowerCase().includes(query)
  );
};

/**
 * 根据国家筛选旅行数据
 * @param {string} countryName - 国家名称（中文或英文）
 * @returns {Array} 该国家的所有旅行记录
 */
export const filterByCountry = (countryName) => {
  return TRAVEL_DATA.filter(
    (item) => item.country.zh === countryName || item.country.en === countryName
  );
};

/**
 * 根据年份筛选旅行数据
 * @param {string|number} year - 年份
 * @returns {Array} 该年份的所有旅行记录
 */
export const filterByYear = (year) => {
  const yearStr = String(year);
  return TRAVEL_DATA.filter((item) => item.date.startsWith(yearStr));
};

/**
 * 获取所有访问过的国家（去重）
 * @returns {Array} 国家列表
 */
export const getUniqueCountries = () => {
  const countries = new Map();
  TRAVEL_DATA.forEach((item) => {
    const key = item.country.en;
    if (!countries.has(key)) {
      countries.set(key, item.country);
    }
  });
  return Array.from(countries.values());
};

/**
 * 获取所有旅行年份（去重并排序）
 * @returns {Array} 年份列表
 */
export const getUniqueYears = () => {
  const years = new Set();
  TRAVEL_DATA.forEach((item) => {
    const year = item.date.split(".")[0];
    years.add(year);
  });
  return Array.from(years).sort();
};
