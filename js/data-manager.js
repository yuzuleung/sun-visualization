/**
 * データ管理とAPI呼び出し
 */

import { CONFIG, API_URLS } from "./config.js";
import { getFlagEmoji } from "./utils.js";

// APIリクエスト制限管理
let apiRequestQueue = [];
let isProcessingQueue = false;

/**
 * JSONファイルから国データを取得し、都市データを構築
 */
export async function fetchCountriesAndCities() {
  const cacheKey = "countries_cities_cache";
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // 24時間キャッシュ
    if (Date.now() - timestamp < CONFIG.CACHE_DURATION) {
      return data;
    }
  }

  try {
    // 直接JSONファイルから読み込み（キャッシュ破棄パラメータ）
    const cacheBuster = Date.now();
    const response = await fetch(`./sun-data-fallback.json?v=${cacheBuster}`);
    if (!response.ok) {
      throw new Error(`JSON fallback API error: ${response.status}`);
    }

    const fallbackData = await response.json();
    // JSONデータをキャッシュ
    window.fallbackJsonData = fallbackData;

    // JSONファイルから都市と国データを構築
    const cities = fallbackData.metadata.cities;

    // 国家リストを構築
    const countryMap = new Map();
    cities.forEach((city) => {
      if (!countryMap.has(city.country)) {
        countryMap.set(city.country, {
          cca2: city.country,
          name: { common: city.countryName },
          flag: getFlagEmoji(city.country),
        });
      }
    });

    const result = {
      countries: Array.from(countryMap.values()),
      cities: cities,
    };

    // キャッシュに保存
    localStorage.setItem(
      cacheKey,
      JSON.stringify({
        data: result,
        timestamp: Date.now(),
      })
    );

    return result;
  } catch (error) {
    console.error("Failed to load city data:", error);
    throw new Error(`データの読み込みに失敗しました: ${error.message}`);
  }
}

/**
 * Open-Meteo Archive API URL生成
 */
function createArchiveURL(lat, lon, startDate, endDate, timezone) {
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate, // YYYY-MM-DD format
    end_date: endDate, // YYYY-MM-DD format
    daily: "sunrise,sunset",
    timezone: timezone, // ローカルタイムゾーンを使用
  });
  return `${API_URLS.OPEN_METEO_ARCHIVE}?${params.toString()}`;
}

/**
 * Open-Meteo Archive APIから365日間の実際の日の出日の入りデータを取得
 */
async function fetchRealSunTimes(city, year) {
  // 日付範囲を計算（今年9月1日から来年8月31日まで、365日をカバー）
  const startDate = `2024-01-01`;
  const endDate = `2025-08-31`;

  const cacheKey = `archive_${city.city}_${year}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const url = createArchiveURL(city.lat, city.lon, startDate, endDate, city.tz);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      // レート制限エラーの特別処理
      if (response.status === 429) {
        throw new Error(
          `Rate limit exceeded for ${city.city} - using fallback`
        );
      }

      throw new Error(
        `Archive API error ${response.status}: ${response.statusText} @ ${city.city}`
      );
    }

    const json = await response.json();

    // APIレスポンス構造を検証
    if (
      !json.daily ||
      !json.daily.time ||
      !json.daily.sunrise ||
      !json.daily.sunset
    ) {
      throw new Error(
        `Invalid Archive API response structure for ${city.city}`
      );
    }

    // データフォーマットを変換
    const result = {
      country: city.country,
      city: city.city,
      lat: city.lat,
      lon: city.lon,
      tz: city.tz,
      year,
      daily: json.daily.time.map((date, i) => ({
        date,
        sunrise: json.daily.sunrise[i],
        sunset: json.daily.sunset[i],
      })),
      source: "open-meteo-archive",
    };

    // 結果をキャッシュ（24時間有効）
    localStorage.setItem(cacheKey, JSON.stringify(result));

    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * JSONバックアップファイルから都市データを取得
 */
async function fetchFromJsonFallback(city, year) {
  try {
    // キャッシュからJSONデータの取得を試行
    let fallbackData = window.fallbackJsonData;

    if (!fallbackData) {
      const cacheBuster = Date.now();
      const response = await fetch(`./sun-data-fallback.json?v=${cacheBuster}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON fallback: ${response.status}`);
      }

      fallbackData = await response.json();
      // メモリにキャッシュして重複読み込みを回避
      window.fallbackJsonData = fallbackData;
    }

    // 対応する都市と年のデータを検索
    const dataKey = `${city.city}_${year}`;

    let cityData = fallbackData.data[dataKey];

    // 完全一致が失敗した場合、都市名を含むキーを検索
    if (!cityData) {
      const availableKeys = Object.keys(fallbackData.data);
      const matchingKey = availableKeys.find((key) => {
        const keyCity = key.split("_")[0];
        return keyCity === city.city;
      });

      if (matchingKey) {
        cityData = fallbackData.data[matchingKey];
      } else {
        throw new Error(`No JSON data found for ${city.city} in ${year}`);
      }
    }

    return {
      country: city.country,
      city: city.city,
      lat: city.lat,
      lon: city.lon,
      tz: city.tz,
      year: cityData.year,
      daily: cityData.daily,
      source: "json-fallback",
      lastUpdated: cityData.lastUpdated,
    };
  } catch (error) {
    throw error;
  }
}

/**
 * メインデータ取得関数 - Archive APIを優先使用し、失敗時はJSONデータを使用
 */
export async function fetchYearSunTimes(city, year) {
  try {
    // API呼び出し
    return await fetchRealSunTimes(city, year);
  } catch (apiError) {
    try {
      // APIが失敗した場合、JSONファイルからフォールバック
      return await fetchFromJsonFallback(city, year);
    } catch (jsonError) {
      throw new Error(
        `All data sources failed for ${city.city}: API (${apiError.message}), JSON (${jsonError.message})`
      );
    }
  }
}

/**
 * APIリクエストをキューに追加し、並行数を制御
 */
export async function queueApiRequest(requestFunc) {
  return new Promise((resolve, reject) => {
    apiRequestQueue.push({ requestFunc, resolve, reject });
    processQueue();
  });
}

/**
 * APIリクエストキューを処理
 */
async function processQueue() {
  if (isProcessingQueue || apiRequestQueue.length === 0) return;

  isProcessingQueue = true;
  const activeRequests = [];

  while (apiRequestQueue.length > 0 || activeRequests.length > 0) {
    // 新しいリクエストを開始（最大並行数を超えない）
    while (
      activeRequests.length < CONFIG.MAX_CONCURRENT_REQUESTS &&
      apiRequestQueue.length > 0
    ) {
      const { requestFunc, resolve, reject } = apiRequestQueue.shift();

      const request = requestFunc()
        .then(resolve)
        .catch(reject)
        .finally(() => {
          const index = activeRequests.indexOf(request);
          if (index > -1) activeRequests.splice(index, 1);
        });

      activeRequests.push(request);

      // APIレート制限回避のため遅延を追加
      if (apiRequestQueue.length > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.REQUEST_DELAY)
        );
      }
    }

    // 最低1つのリクエスト完了を待機
    if (activeRequests.length > 0) {
      await Promise.race(activeRequests);
    }
  }

  isProcessingQueue = false;
}
