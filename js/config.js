/**
 * アプリケーション設定とグローバル定数
 */

// アプリケーション設定
export const CONFIG = {
  // API設定
  MAX_CONCURRENT_REQUESTS: 2,
  REQUEST_DELAY: 500,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24時間

  // アニメーション設定
  TIME_STEP: 6, // 毎フレーム6分進める
  YEAR_ANIMATION_SPEED: 80, // 80ms = 毎秒12日

  // 地図設定
  MAP_SIZE: [1100, 600],

  // 年度設定
  YEAR_2025_MAX_DAY: 243, // 2025年8月31日まで
  NORMAL_YEAR_MAX_DAY: 365,
};

// API URL設定
export const API_URLS = {
  WORLD_TOPO: "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
  OPEN_METEO_ARCHIVE: "https://archive-api.open-meteo.com/v1/archive",
};

// 国旗絵文字マッピング
export const FLAG_EMOJI_MAP = {
  JP: "🇯🇵",
  CN: "🇨🇳",
  KR: "🇰🇷",
  US: "🇺🇸",
  GB: "🇬🇧",
  FR: "🇫🇷",
  DE: "🇩🇪",
  IT: "🇮🇹",
  ES: "🇪🇸",
  RU: "🇷🇺",
  IN: "🇮🇳",
  BR: "🇧🇷",
  CA: "🇨🇦",
  AU: "🇦🇺",
  ZA: "🇿🇦",
  AQ: "🇦🇶",
  GL: "🇬🇱",
  EC: "🇪🇨",
  CO: "🇨🇴",
  KE: "🇰🇪",
  UG: "🇺🇬",
};

// タイムゾーンオフセット設定
export const TIMEZONE_OFFSETS = {
  "Asia/Shanghai": 8,
  "Asia/Tokyo": 9,
  "Asia/Seoul": 9,
  "Asia/Kolkata": 5.5,
  "Europe/London": 0, // GMT
  "Europe/Berlin": 1,
  "Europe/Paris": 1,
  "Europe/Rome": 1,
  "Europe/Madrid": 1,
  "Europe/Moscow": 3,
  "America/New_York": -5, // EST
  "America/Chicago": -6, // CST
  "America/Los_Angeles": -8, // PST
  "America/Toronto": -5,
  "America/Vancouver": -8,
  "America/Montreal": -5,
  "America/Sao_Paulo": -3,
  "Australia/Sydney": 11,
  "Australia/Melbourne": 11,
  "Australia/Brisbane": 10,
  "Africa/Cape_Town": 2,
  "Africa/Johannesburg": 2,
  "America/Nuuk": -3,
  "Antarctica/McMurdo": 13,
  "Antarctica/Rothera": -3,
};
