/**
 * 夜の灯（ともしび）— 年間・世界都市の日出日没アニメーション
 * 世界の主要都市の日出日没時刻を表示し、夜間に都市を点灯させるアニメーション
 */

/* ========= 1) 都市データ定義 ========= */

// 動的に取得された都市データ
let CITY_BANK = [];

/**
 * 主要都市データ（国コード別）
 * REST Countries APIでは都市データが取得できないため、
 * 主要都市データを国別に定義
 */
const MAJOR_CITIES = {
  JP: [
    { city: "Tokyo", lat: 35.6828, lon: 139.7595, tz: "Asia/Tokyo" },
    { city: "Osaka", lat: 34.6937, lon: 135.5023, tz: "Asia/Tokyo" },
    { city: "Yokohama", lat: 35.4437, lon: 139.638, tz: "Asia/Tokyo" },
  ],
  CN: [
    { city: "Beijing", lat: 39.9042, lon: 116.4074, tz: "Asia/Shanghai" },
    { city: "Shanghai", lat: 31.2304, lon: 121.4737, tz: "Asia/Shanghai" },
    { city: "Guangzhou", lat: 23.1291, lon: 113.2644, tz: "Asia/Shanghai" },
  ],
  KR: [
    { city: "Seoul", lat: 37.5665, lon: 126.978, tz: "Asia/Seoul" },
    { city: "Busan", lat: 35.1796, lon: 129.0756, tz: "Asia/Seoul" },
    { city: "Incheon", lat: 37.4563, lon: 126.7052, tz: "Asia/Seoul" },
  ],
  US: [
    { city: "New York", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
    {
      city: "Los Angeles",
      lat: 34.0522,
      lon: -118.2437,
      tz: "America/Los_Angeles",
    },
    { city: "Chicago", lat: 41.8781, lon: -87.6298, tz: "America/Chicago" },
  ],
  GB: [
    { city: "London", lat: 51.5072, lon: -0.1276, tz: "Europe/London" },
    { city: "Manchester", lat: 53.4808, lon: -2.2426, tz: "Europe/London" },
    { city: "Birmingham", lat: 52.4862, lon: -1.8904, tz: "Europe/London" },
  ],
  FR: [
    { city: "Paris", lat: 48.8566, lon: 2.3522, tz: "Europe/Paris" },
    { city: "Lyon", lat: 45.764, lon: 4.8357, tz: "Europe/Paris" },
    { city: "Marseille", lat: 43.2965, lon: 5.3698, tz: "Europe/Paris" },
  ],
  DE: [
    { city: "Berlin", lat: 52.52, lon: 13.405, tz: "Europe/Berlin" },
    { city: "Munich", lat: 48.1351, lon: 11.582, tz: "Europe/Berlin" },
    { city: "Hamburg", lat: 53.5511, lon: 9.9937, tz: "Europe/Berlin" },
  ],
  IT: [
    { city: "Rome", lat: 41.9028, lon: 12.4964, tz: "Europe/Rome" },
    { city: "Milan", lat: 45.4642, lon: 9.19, tz: "Europe/Rome" },
    { city: "Naples", lat: 40.8518, lon: 14.2681, tz: "Europe/Rome" },
  ],
  ES: [
    { city: "Madrid", lat: 40.4168, lon: -3.7038, tz: "Europe/Madrid" },
    { city: "Barcelona", lat: 41.3851, lon: 2.1734, tz: "Europe/Madrid" },
    { city: "Valencia", lat: 39.4699, lon: -0.3763, tz: "Europe/Madrid" },
  ],
  RU: [
    { city: "Moscow", lat: 55.7558, lon: 37.6173, tz: "Europe/Moscow" },
    {
      city: "Saint Petersburg",
      lat: 59.9311,
      lon: 30.3609,
      tz: "Europe/Moscow",
    },
    { city: "Novosibirsk", lat: 55.0084, lon: 82.9357, tz: "Asia/Novosibirsk" },
  ],
  IN: [
    { city: "New Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
    { city: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
    { city: "Bangalore", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  ],
  BR: [
    {
      city: "São Paulo",
      lat: -23.5558,
      lon: -46.6396,
      tz: "America/Sao_Paulo",
    },
    {
      city: "Rio de Janeiro",
      lat: -22.9068,
      lon: -43.1729,
      tz: "America/Sao_Paulo",
    },
    { city: "Brasília", lat: -15.8267, lon: -47.9218, tz: "America/Sao_Paulo" },
  ],
  CA: [
    { city: "Toronto", lat: 43.6532, lon: -79.3832, tz: "America/Toronto" },
    {
      city: "Vancouver",
      lat: 49.2827,
      lon: -123.1207,
      tz: "America/Vancouver",
    },
    { city: "Montreal", lat: 45.5017, lon: -73.5673, tz: "America/Toronto" },
  ],
  AU: [
    { city: "Sydney", lat: -33.8688, lon: 151.2093, tz: "Australia/Sydney" },
    {
      city: "Melbourne",
      lat: -37.8136,
      lon: 144.9631,
      tz: "Australia/Melbourne",
    },
    {
      city: "Brisbane",
      lat: -27.4698,
      lon: 153.0251,
      tz: "Australia/Brisbane",
    },
  ],
  ZA: [
    {
      city: "Cape Town",
      lat: -33.9249,
      lon: 18.4241,
      tz: "Africa/Johannesburg",
    },
    {
      city: "Johannesburg",
      lat: -26.2041,
      lon: 28.0473,
      tz: "Africa/Johannesburg",
    },
    { city: "Durban", lat: -29.8587, lon: 31.0218, tz: "Africa/Johannesburg" },
  ],
  AQ: [
    {
      city: "McMurdo Station",
      lat: -77.8419,
      lon: 166.6863,
      tz: "Antarctica/McMurdo",
    },
    {
      city: "Rothera Research Station",
      lat: -67.5681,
      lon: -68.1272,
      tz: "Antarctica/Rothera",
    },
  ],
  GL: [
    { city: "Nuuk", lat: 64.1836, lon: -51.7214, tz: "America/Nuuk" },
    { city: "Ilulissat", lat: 69.2196, lon: -51.0986, tz: "America/Nuuk" },
  ],
};

/**
 * REST Countries APIから国データを取得し、都市データを構築
 */
async function fetchCountriesAndCities() {
  const cacheKey = "countries_cities_cache";
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // 24時間キャッシュ
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      return data;
    }
  }

  try {
    const response = await fetch(
      "https://restcountries.com/v3.1/all?fields=name,cca2,population,flag"
    );

    if (!response.ok) {
      throw new Error(`REST Countries API error: ${response.status}`);
    }

    const countries = await response.json();

    // 人口の多い順にソートし、主要都市データがある国を優先
    const sortedCountries = countries
      .filter((country) => MAJOR_CITIES[country.cca2])
      .sort((a, b) => (b.population || 0) - (a.population || 0))
      .slice(0, 20); // 上位20ヶ国に制限

    const result = {
      countries: sortedCountries,
      cities: [],
    };

    // 各国の主要都市を追加
    for (const country of sortedCountries) {
      const countryCode = country.cca2;
      const cities = MAJOR_CITIES[countryCode] || [];

      cities.forEach((city) => {
        result.cities.push({
          country: countryCode,
          countryName: country.name.common,
          flag: country.flag,
          ...city,
        });
      });
    }

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
    // フォールバック: 静的データを使用
    return {
      countries: [
        { cca2: "JP", name: { common: "Japan" }, flag: "🇯🇵" },
        { cca2: "CN", name: { common: "China" }, flag: "🇨🇳" },
        { cca2: "KR", name: { common: "South Korea" }, flag: "🇰🇷" },
        { cca2: "US", name: { common: "United States" }, flag: "🇺🇸" },
        { cca2: "GB", name: { common: "United Kingdom" }, flag: "🇬🇧" },
        { cca2: "FR", name: { common: "France" }, flag: "🇫🇷" },
        { cca2: "ZA", name: { common: "South Africa" }, flag: "🇿🇦" },
        { cca2: "BR", name: { common: "Brazil" }, flag: "🇧🇷" },
        { cca2: "AQ", name: { common: "Antarctica" }, flag: "🇦🇶" },
        { cca2: "GL", name: { common: "Greenland" }, flag: "🇬🇱" },
      ],
      cities: Object.values(MAJOR_CITIES)
        .flat()
        .map((city) => ({
          ...city,
          countryName: "Unknown",
          flag: "",
        })),
    };
  }
}

/**
 * 国選択肢を更新
 */
function updateCountryOptions(countries) {
  const select = document.getElementById("countrySel");
  select.innerHTML = "";

  // ALLオプション
  const allOption = document.createElement("option");
  allOption.value = "ALL";
  allOption.textContent = `ALL (${countries.length}ヶ国)`;
  select.appendChild(allOption);

  // 各国オプション
  countries.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.cca2;
    option.textContent = `${country.flag} ${country.name.common}`;
    select.appendChild(option);
  });
}

/* ========= 2) グローバル変数 ========= */
let playing = false;
let yearPlaying = false; // 年度再生状態
let frameReq = null;
let yearFrameReq = null; // 年度再生アニメーションリクエストID
let currentData = new Map(); // key=city_year, val=dataset

// DOM要素
let countrySel,
  yearSel,
  daySlider,
  timeSlider,
  dayLabel,
  timeLabel,
  playBtn,
  yearPlayBtn,
  clearCacheBtn,
  exportDataBtn,
  testApiBtn;
let svg, gMap, gCities, projection, geoPath;

/* ========= 2) API関数 ========= */

/**
 * Open-Meteo Archive API - 365日間の実際の日の出日の入りデータを取得
 */
const OPEN_METEO_ARCHIVE_URL = (lat, lon, startDate, endDate, timezone) => {
  const baseUrl = `https://archive-api.open-meteo.com/v1/archive`;
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate, // YYYY-MM-DD format
    end_date: endDate, // YYYY-MM-DD format
    daily: "sunrise,sunset",
    timezone: timezone, // ローカルタイムゾーンを使用
  });
  return `${baseUrl}?${params.toString()}`;
};

/**
 * 年と日から年月日文字列を生成
 */
function ymdFromYearDay(year, day) {
  const d = new Date(Date.UTC(year, 0, 1));
  d.setUTCDate(day);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * ローカル時刻文字列をUTC分数に変換
 * @param {string} localTimeIso - ローカル時刻のISO文字列 (例: "2024-09-01T06:30:00")
 * @param {string} timezone - タイムゾーン識別子 (例: "Asia/Tokyo")
 * @returns {number} UTC分数 (0-1439)
 */
function localTimeToUTCMinutes(localTimeIso, timezone) {
  try {
    // 時刻文字列を解析し、時と分を取得
    let timeString = localTimeIso;

    // 異なる時刻フォーマットに対応
    if (timeString.includes("T")) {
      timeString = timeString.split("T")[1]; // T以降の時刻部分を取得
    }

    const [hoursStr, minutesStr] = timeString.split(":");
    const localHours = parseInt(hoursStr, 10);
    const localMinutes = parseInt(minutesStr, 10);

    if (isNaN(localHours) || isNaN(localMinutes)) {
      return 0;
    }

    // 簡易的なタイムゾーンオフセット計算を使用
    let utcOffsetHours = 0;

    // 主要タイムゾーンオフセット（簡易版、実用では正確なタイムゾーンライブラリを使用）
    const timezoneOffsets = {
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

    utcOffsetHours = timezoneOffsets[timezone] || 0;

    // ローカル時刻をUTC時刻に変換
    let totalLocalMinutes = localHours * 60 + localMinutes;
    let totalUTCMinutes = totalLocalMinutes - utcOffsetHours * 60;

    // 時刻を0-1439範囲内に確保（日付を跨ぐ場合を処理）
    while (totalUTCMinutes < 0) {
      totalUTCMinutes += 1440; // 1日加算
    }
    while (totalUTCMinutes >= 1440) {
      totalUTCMinutes -= 1440; // 1日減算
    }

    return totalUTCMinutes; // 0..1439
  } catch (error) {
    return 0;
  }
}

/**
 * ISO時刻文字列をUTC分に変換（旧版、下位互換性のため保留）
 */
function toUTCMinutes(hhmmIso, timezone = null) {
  if (timezone) {
    return localTimeToUTCMinutes(hhmmIso, timezone);
  }

  const t = new Date(hhmmIso);
  if (isNaN(t.getTime())) {
    return 0;
  }
  return t.getUTCHours() * 60 + t.getUTCMinutes();
}

/**
 * 分を時:分形式に変換
 */
function hhmm(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

  const url = OPEN_METEO_ARCHIVE_URL(
    city.lat,
    city.lon,
    startDate,
    endDate,
    city.tz
  );

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
 * メインデータ取得関数 - Archive APIを優先使用し、失敗時はJSONデータを使用
 */
async function fetchYearSunTimes(city, year) {
  try {
    // まずArchive APIを試行
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

/* ========= 4) 地図初期化 ========= */
async function initMap() {
  const WORLD_TOPO =
    "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

  try {
    const world = await d3.json(WORLD_TOPO);
    const countries = topojson.feature(world, world.objects.countries);

    // 海洋背景
    gMap
      .append("path")
      .attr("d", geoPath({ type: "Sphere" }))
      .attr("fill", "#0a0f1a");

    // 国境
    gMap
      .selectAll("path.country")
      .data(countries.features)
      .join("path")
      .attr("class", "country")
      .attr("d", geoPath)
      .attr("fill", "#0f1a2a")
      .attr("stroke", "#1e2a3a")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.95);
  } catch (error) {
    // 地図読み込み失敗時も続行
  }
}

/**
 * 都市マーカーを描画
 */
function drawCityMarkers(cities) {
  const sel = gCities.selectAll("g.cityG").data(cities, (d) => d.city);
  const ent = sel.enter().append("g").attr("class", "cityG");

  ent.append("circle").attr("class", "city").attr("r", 3);
  ent
    .append("text")
    .attr("class", "cityLabel")
    .attr("dy", -6)
    .attr("text-anchor", "middle")
    .text((d) => d.city);

  sel.exit().remove();

  // 位置を更新
  const cityGroups = [];
  gCities.selectAll("g.cityG").each(function (d) {
    const [x, y] = projection([d.lon, d.lat]);
    d3.select(this).attr("transform", `translate(${x},${y})`);
    cityGroups.push({ element: this, x, y, city: d.city });
  });

  // ラベルの知能的な配置で重複を回避
  adjustLabelPositions(cityGroups);
}

/**
 * 都市ラベル位置を調整して重複を回避
 */
function adjustLabelPositions(cityGroups) {
  const positions = [
    { dx: 0, dy: -6 }, // 上
    { dx: 8, dy: -2 }, // 右上
    { dx: 8, dy: 4 }, // 右下
    { dx: 0, dy: 8 }, // 下
    { dx: -8, dy: 4 }, // 左下
    { dx: -8, dy: -2 }, // 左上
  ];

  cityGroups.forEach((group, i) => {
    const label = d3.select(group.element).select("text.cityLabel");
    let bestPosition = positions[0];
    let bestScore = -Infinity;

    // 各ラベルに対して異なる位置を試行
    positions.forEach((pos) => {
      const labelX = group.x + pos.dx;
      const labelY = group.y + pos.dy;

      // 他のラベルとの距離を計算
      let minDistToOthers = Infinity;
      cityGroups.forEach((otherGroup, j) => {
        if (i === j) return;
        const otherLabelX = otherGroup.x + (otherGroup.labelPos?.dx || 0);
        const otherLabelY = otherGroup.y + (otherGroup.labelPos?.dy || -6);
        const dist = Math.sqrt(
          Math.pow(labelX - otherLabelX, 2) + Math.pow(labelY - otherLabelY, 2)
        );
        minDistToOthers = Math.min(minDistToOthers, dist);
      });

      // スコア評価：他のラベルから遠いほど良い、上方位置を優先
      const score = minDistToOthers + (pos.dy < 0 ? 5 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = pos;
      }
    });

    // 最適位置を適用
    label
      .attr("dx", bestPosition.dx)
      .attr("dy", bestPosition.dy)
      .attr(
        "text-anchor",
        bestPosition.dx > 0 ? "start" : bestPosition.dx < 0 ? "end" : "middle"
      );

    // 次回計算用に位置情報を保存
    group.labelPos = bestPosition;
  });
}

/* ========= 5) データ読み込み ========= */

// APIリクエスト制限管理
let apiRequestQueue = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 2; // 最大並行リクエスト数
const REQUEST_DELAY = 500; // リクエスト間遅延（ミリ秒）

/**
 * APIリクエストをキューに追加し、並行数を制御
 */
async function queueApiRequest(requestFunc) {
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
      activeRequests.length < MAX_CONCURRENT_REQUESTS &&
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
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));
      }
    }

    // 最低1つのリクエスト完了を待機
    if (activeRequests.length > 0) {
      await Promise.race(activeRequests);
    }
  }

  isProcessingQueue = false;
}

async function ensureDataLoaded() {
  const year = +yearSel.value;
  const cc = countrySel.value;
  const cities =
    cc === "ALL" ? CITY_BANK : CITY_BANK.filter((c) => c.country === cc);

  // 読み込み進捗を表示
  updateLoadingProgress(0, cities.length);

  const tasks = cities.map(async (c, index) => {
    const key = `${c.city}_${year}`;

    // リクエストキューを使用して並行処理を制御
    try {
      const dataset = await queueApiRequest(() => fetchYearSunTimes(c, year));
      currentData.set(key, dataset);

      // 進捗を更新
      updateLoadingProgress(index + 1, cities.length);

      return { city: c.city, status: "success", data: dataset };
    } catch (error) {
      return { city: c.city, status: "error", error: error.message };
    }
  });

  const results = await Promise.all(tasks);

  // 結果を集計
  const successful = results.filter((r) => r.status === "success");

  // データソース状態表示を更新
  updateDataSourceStatus(successful);
}

/**
 * データソース状態表示を更新
 */
function updateDataSourceStatus(successfulResults) {
  const dataSourceEl = document.getElementById("dataSource");
  const dataStatusEl = document.getElementById("dataStatus");

  if (!dataSourceEl || !dataStatusEl) return;

  // データソースタイプを統計
  const sourceCounts = {};
  successfulResults.forEach((result) => {
    const source = result.data?.source || "unknown";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  // 主要データソースを決定
  const totalCities = successfulResults.length;
  const archiveCount = sourceCounts["open-meteo-archive"] || 0;
  const jsonFallbackCount = sourceCounts["json-fallback"] || 0;

  if (archiveCount > jsonFallbackCount) {
    dataSourceEl.textContent = "Open-Meteo Archive API";
    dataStatusEl.innerHTML = `🌐 リアルデータ使用中 (${archiveCount}/${totalCities} 都市)`;
    dataStatusEl.style.color = "#4ade80"; // green
  } else if (jsonFallbackCount > 0) {
    dataSourceEl.textContent = "JSONファイル";
    dataStatusEl.innerHTML = `📄 JSON fallback使用中 (${jsonFallbackCount}/${totalCities} 都市)`;
    dataStatusEl.style.color = "#06b6d4"; // cyan
  } else {
    dataSourceEl.textContent = "データなし";
    dataStatusEl.innerHTML = `❌ データ読み込み失敗`;
    dataStatusEl.style.color = "#ef4444"; // red
  }
}

/**
 * 読み込み進捗表示を更新
 */
function updateLoadingProgress(completed, total) {
  const dataStatusEl = document.getElementById("dataStatus");
  if (!dataStatusEl) return;

  const percentage = Math.round((completed / total) * 100);
  dataStatusEl.innerHTML = `📥 データ読み込み中... ${completed}/${total} (${percentage}%)`;
  dataStatusEl.style.color = "#fbbf24"; // yellow
}

/* ========= 6) レンダリング ========= */
function render() {
  const cc = countrySel.value;
  const year = +yearSel.value;
  const day = +daySlider.value; // 1..365
  const tMin = +timeSlider.value; // 0..1439

  // UI更新
  dayLabel.textContent = `Day ${day} (${ymdFromYearDay(year, day)})`;
  timeLabel.textContent = `${hhmm(tMin)} UTC`;

  const cities =
    cc === "ALL" ? CITY_BANK : CITY_BANK.filter((c) => c.country === cc);

  // レンダリング処理

  gCities.selectAll("g.cityG").each(function (d) {
    const node = d3.select(this);
    const dot = node.select("circle.city");
    const lab = node.select("text.cityLabel");

    if (!dot.size()) {
      return;
    }

    if (!cities.includes(d)) {
      // 非選択国 → 昼間時の小さなグレー点スタイル
      dot
        .classed("dim", true)
        .attr("r", 2.5)
        .attr("stroke", null)
        .attr("stroke-width", 0)
        .attr("fill", "#555")
        .style("fill", "#555");
      lab.attr("opacity", 0.12).attr("fill", "#666").style("fill", "#666");
      return;
    }

    const key = `${d.city}_${year}`;
    const dataset = currentData.get(key);

    if (!dataset) {
      // 簡易フォールバック
      dot.classed("dim", true).attr("r", 3.8).attr("stroke", null);
      lab.attr("opacity", 0.2);
      return;
    }

    // 日付インデックス（0-based）
    const idx = Math.max(0, Math.min(day - 1, dataset.daily.length - 1));
    const today = dataset.daily[idx];

    // 当日のsunrise/sunsetを取得
    if (!today || !today.sunrise || !today.sunset) {
      dot.classed("dim", true).attr("r", 3.8);
      lab.attr("opacity", 0.2);
      return;
    }

    const sunriseM = toUTCMinutes(today.sunrise, d.tz); // 0..1439 当日の日出時刻 (UTC)
    const sunsetM = toUTCMinutes(today.sunset, d.tz); // 0..1439 当日の日没時刻 (UTC)

    if (isNaN(sunriseM) || isNaN(sunsetM)) {
      dot.classed("dim", true).attr("r", 3.8);
      lab.attr("opacity", 0.2);
      return;
    }

    // 昼間判定：簡易ロジック - 日の出から日の入りの間のみ昼間、その他の時間は点灯
    // ただし日付をまたぐ場合は正しく処理
    let isDaytime;
    if (sunriseM > sunsetM) {
      // 日付跨ぎ状況：sunrise > sunset (例：東京 20:12 UTC > 09:10 UTC)
      // これは日の出が前日、日の入りが当日であることを意味する
      // 実際の昼間は：日の出から午夜まで、そして午夜から日の入りまで
      // つまり：tMin >= sunriseM (当日夜) または tMin <= sunsetM (翌日朝)
      isDaytime = tMin >= sunriseM || tMin <= sunsetM;
    } else {
      // 正常ケース：sunrise < sunset (例：ロンドン 05:30 < 18:30)
      // 昼間時刻：sunriseM <= tMin <= sunsetM
      isDaytime = tMin >= sunriseM && tMin <= sunsetM;
    }

    const isNight = !isDaytime; // デフォルト点灯、昼間のみ消灯

    if (isNight) {
      dot
        .classed("dim", false)
        .attr("r", 3.5)
        .attr("stroke", "#ffd700")
        .attr("stroke-width", 1.5)
        .attr("fill", "#ffd700")
        .style("fill", "#ffd700");
      lab.attr("opacity", 1).attr("fill", "#ffd700").style("fill", "#ffd700");
    } else {
      dot
        .classed("dim", true)
        .attr("r", 2.5)
        .attr("stroke", null)
        .attr("stroke-width", 0)
        .attr("fill", "#555")
        .style("fill", "#555");
      lab.attr("opacity", 0.25).attr("fill", "#888").style("fill", "#888");
    }
  });

  // アニメーション継続
  if (playing) {
    // 毎フレーム6分進める（4秒≈1時間）
    const next = (+timeSlider.value + 6) % 1440;
    timeSlider.value = next;
    frameReq = requestAnimationFrame(render);
  }
}

/**
 * 年間アニメーションレンダリング関数
 */
function renderYearAnimation() {
  const currentDay = +daySlider.value;
  const currentTime = +timeSlider.value;

  // 現在状態を正常にレンダリング
  render();

  if (yearPlaying) {
    // フレーム毎に1日進行、時刻は固定
    let nextDay = currentDay + 1;
    const currentYear = +yearSel.value;
    const maxDay = currentYear === 2025 ? 244 : 365; // 2025年は9月1日まで制限

    if (nextDay > maxDay) {
      nextDay = 1; // ループ再生
    }

    daySlider.value = nextDay;

    // アニメーション継続、毎秒約4日の速度
    yearFrameReq = setTimeout(() => {
      requestAnimationFrame(renderYearAnimation);
    }, 250); // 250ms = 毎秒4フレーム = 毎秒4日
  }
}

/* ========= 7) イベントハンドラ ========= */
function bindEventHandlers() {
  // 必要なすべてのDOM要素が存在するかチェック
  const elements = [
    { name: "countrySel", element: countrySel },
    { name: "yearSel", element: yearSel },
    { name: "daySlider", element: daySlider },
    { name: "timeSlider", element: timeSlider },
    { name: "playBtn", element: playBtn },
    { name: "yearPlayBtn", element: yearPlayBtn },
    { name: "clearCacheBtn", element: clearCacheBtn },
    { name: "exportDataBtn", element: exportDataBtn },
    { name: "testApiBtn", element: testApiBtn },
  ];

  for (const { name, element } of elements) {
    if (!element) {
      throw new Error(`Required DOM element not found: ${name}`);
    }
  }

  countrySel.addEventListener("change", async () => {
    await ensureDataLoaded();
    render();
  });

  yearSel.addEventListener("change", async () => {
    const selectedYear = +yearSel.value;
    const currentDay = +daySlider.value;

    // 年に基づいて日付範囲を設定
    if (selectedYear === 2025) {
      // 2025年：9月1日（第244日）まで
      daySlider.max = 244;
      if (currentDay > 244) {
        daySlider.value = 244;
      }
    } else {
      // その他の年：完全365日
      daySlider.max = 365;
    }

    await ensureDataLoaded();
    render();
  });

  daySlider.addEventListener("input", () => render());
  timeSlider.addEventListener("input", () => render());

  playBtn.addEventListener("click", () => {
    playing = !playing;
    playBtn.textContent = playing ? "⏸ 停止" : "▶ 再生";

    // 年間再生を停止（実行中の場合）
    if (playing && yearPlaying) {
      yearPlaying = false;
      clearTimeout(yearFrameReq);
      yearPlayBtn.textContent = "📅 年間再生";
    }

    if (playing) {
      render();
    } else {
      cancelAnimationFrame(frameReq);
    }
  });

  yearPlayBtn.addEventListener("click", () => {
    yearPlaying = !yearPlaying;
    yearPlayBtn.textContent = yearPlaying ? "⏸ 年間停止" : "📅 年間再生";

    // 日時再生を停止（実行中の場合）
    if (yearPlaying && playing) {
      playing = false;
      cancelAnimationFrame(frameReq);
      playBtn.textContent = "▶ 再生";
    }

    if (yearPlaying) {
      renderYearAnimation();
    } else {
      clearTimeout(yearFrameReq);
    }
  });

  clearCacheBtn.addEventListener("click", () => {
    if (confirm("キャッシュされたデータをすべてクリアしますか？")) {
      // LocalStorageをクリア
      const keys = Object.keys(localStorage);
      const removedKeys = [];

      keys.forEach((key) => {
        if (key.startsWith("archive_") || key === "countries_cities_cache") {
          localStorage.removeItem(key);
          removedKeys.push(key);
        }
      });

      // データマップもクリア
      currentData.clear();

      alert(`キャッシュをクリアしました (${removedKeys.length}件)`);

      // データを再読み込み
      ensureDataLoaded().then(() => render());
    }
  });

  exportDataBtn.addEventListener("click", async () => {
    await exportAllDataToJson();
  });

  testApiBtn.addEventListener("click", async () => {
    // テスト: 現在設定での夜間判定
    const currentYear = +yearSel.value;
    const currentDay = +daySlider.value;
    const currentTime = +timeSlider.value;

    // 各都市の夜間判定テスト（簡略版）
    const cities = CITY_BANK.slice(0, 5);

    for (const city of cities) {
      const key = `${city.city}_${currentYear}`;
      const dataset = currentData.get(key);

      if (!dataset || !dataset.daily) {
        continue;
      }

      const dayIndex = Math.max(
        0,
        Math.min(currentDay - 1, dataset.daily.length - 1)
      );
      const dayData = dataset.daily[dayIndex];

      if (!dayData) {
        continue;
      }

      const sunriseM = toUTCMinutes(dayData.sunrise, city.tz);
      const sunsetM = toUTCMinutes(dayData.sunset, city.tz);

      // 夜間判定ロジック
      const isNight =
        sunriseM > sunsetM
          ? currentTime <= sunsetM || currentTime >= sunriseM
          : currentTime < sunriseM || currentTime >= sunsetM;
    }

    // 強制再レンダリング
    render();

    alert(`🎯 夜間点灯テスト完了\n\n現在時刻: ${hhmm(currentTime)} UTC`);
  });

  // daySliderの最大値を初期化
  const initialYear = +yearSel.value;
  if (initialYear === 2025) {
    daySlider.max = 244;
    if (+daySlider.value > 244) {
      daySlider.value = 244;
    }
  } else {
    daySlider.max = 365;
  }
}

/* ========= 8) 初期化 ========= */
async function init() {
  try {
    // DOM要素を取得

    countrySel = document.getElementById("countrySel");
    yearSel = document.getElementById("yearSel");
    daySlider = document.getElementById("daySlider");
    timeSlider = document.getElementById("timeSlider");
    dayLabel = document.getElementById("dayLabel");
    timeLabel = document.getElementById("timeLabel");
    playBtn = document.getElementById("playBtn");
    yearPlayBtn = document.getElementById("yearPlayBtn");
    clearCacheBtn = document.getElementById("clearCacheBtn");
    exportDataBtn = document.getElementById("exportDataBtn");
    testApiBtn = document.getElementById("testApiBtn");

    // D3要素初期化
    svg = d3.select("#map");
    gMap = svg.append("g").attr("id", "countries");
    gCities = svg.append("g").attr("id", "cities-layer");
    projection = d3.geoNaturalEarth1().fitSize([1100, 600], { type: "Sphere" });
    geoPath = d3.geoPath(projection);

    // 地図描画
    await initMap();

    // 優先的にJSONファイルから都市リストを読み込み
    let countries, cities;

    try {
      const response = await fetch("./sun-data-fallback.json");
      if (response.ok) {
        const fallbackData = await response.json();
        // JSONデータをキャッシュ
        window.fallbackJsonData = fallbackData;

        // JSONファイル中の完全都市リストを使用
        cities = fallbackData.metadata.cities;

        // 国家リストを構築
        const countryMap = new Map();
        cities.forEach((city) => {
          if (!countryMap.has(city.country)) {
            countryMap.set(city.country, {
              cca2: city.country,
              name: { common: city.countryName },
              flag:
                city.country === "JP"
                  ? "🇯🇵"
                  : city.country === "CN"
                  ? "🇨🇳"
                  : city.country === "KR"
                  ? "🇰🇷"
                  : city.country === "US"
                  ? "🇺🇸"
                  : city.country === "GB"
                  ? "🇬🇧"
                  : city.country === "FR"
                  ? "🇫🇷"
                  : city.country === "DE"
                  ? "🇩🇪"
                  : city.country === "IT"
                  ? "🇮🇹"
                  : city.country === "ES"
                  ? "🇪🇸"
                  : city.country === "RU"
                  ? "🇷🇺"
                  : city.country === "IN"
                  ? "🇮🇳"
                  : city.country === "BR"
                  ? "🇧🇷"
                  : city.country === "CA"
                  ? "🇨🇦"
                  : city.country === "AU"
                  ? "🇦🇺"
                  : city.country === "ZA"
                  ? "🇿🇦"
                  : city.country === "AQ"
                  ? "🇦🇶"
                  : city.country === "GL"
                  ? "🇬🇱"
                  : "🌍",
            });
          }
        });
        countries = Array.from(countryMap.values());
      } else {
        throw new Error(`Failed to fetch JSON: ${response.status}`);
      }
    } catch (error) {
      // JSON読み込み失敗時は通常のAPI経由で取得
      const result = await fetchCountriesAndCities();
      countries = result.countries;
      cities = result.cities;
    }

    // グローバル変数に設定
    CITY_BANK = cities;
    // 国選択肢を更新
    updateCountryOptions(countries);

    // 都市マーカー描画
    drawCityMarkers(CITY_BANK);

    // イベントバインド
    bindEventHandlers();

    // 初期データ読み込みと描画
    await ensureDataLoaded();

    render();
  } catch (error) {
    // JSONフォールバックを直接使用
    try {
      const response = await fetch("./sun-data-fallback.json");
      if (response.ok) {
        const fallbackData = await response.json();
        window.fallbackJsonData = fallbackData;

        CITY_BANK = fallbackData.metadata.cities;
        countries = Array.from(
          new Set(CITY_BANK.map((city) => city.country))
        ).map((countryCode) => ({
          cca2: countryCode,
          name: {
            common:
              CITY_BANK.find((city) => city.country === countryCode)
                ?.countryName || countryCode,
          },
          flag:
            countryCode === "JP"
              ? "🇯🇵"
              : countryCode === "CN"
              ? "🇨🇳"
              : countryCode === "KR"
              ? "🇰🇷"
              : countryCode === "US"
              ? "🇺🇸"
              : countryCode === "GB"
              ? "🇬🇧"
              : countryCode === "FR"
              ? "🇫🇷"
              : countryCode === "DE"
              ? "🇩🇪"
              : countryCode === "IT"
              ? "🇮🇹"
              : countryCode === "ES"
              ? "🇪🇸"
              : countryCode === "RU"
              ? "🇷🇺"
              : countryCode === "IN"
              ? "🇮🇳"
              : countryCode === "BR"
              ? "🇧🇷"
              : countryCode === "CA"
              ? "🇨🇦"
              : countryCode === "AU"
              ? "🇦🇺"
              : countryCode === "ZA"
              ? "🇿🇦"
              : countryCode === "AQ"
              ? "🇦🇶"
              : countryCode === "GL"
              ? "🇬🇱"
              : "🌍",
        }));

        updateCountryOptions(countries);
        drawCityMarkers(CITY_BANK);
        bindEventHandlers();
      } else {
        throw new Error("JSON fallback failed");
      }
    } catch (jsonError) {
      // 最終フォールバック: MAJOR_CITIESを使用
      CITY_BANK = Object.values(MAJOR_CITIES)
        .flat()
        .map((city) => ({
          ...city,
          countryName: "Unknown",
          flag: "",
        }));

      const select = document.getElementById("countrySel");
      select.innerHTML = `
        <option value="ALL">ALL (6ヶ国)</option>
        <option value="JP">🇯🇵 Japan</option>
        <option value="CN">🇨🇳 China</option>
        <option value="KR">🇰🇷 South Korea</option>
        <option value="US">🇺🇸 United States</option>
        <option value="GB">🇬🇧 United Kingdom</option>
        <option value="FR">🇫🇷 France</option>
      `;

      drawCityMarkers(CITY_BANK);
      bindEventHandlers();
    }
    await ensureDataLoaded();
    render();
  }
}

/* ========= 9) アプリケーション開始 ========= */
// DOMContentLoadedイベントで初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/**
 * 現在の全APIデータをJSONファイルにエクスポート（フォールバックモード用）
 */
async function exportAllDataToJson() {
  try {
    // データが読み込まれていることを確認
    await ensureDataLoaded();

    if (currentData.size === 0) {
      alert(
        "❌ エラー: データが読み込まれていません。まず「🔍 API テスト」を実行してデータを取得してください。"
      );
      return;
    }

    // 全データを収集
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalEntries: currentData.size,
        cities: CITY_BANK.map((city) => ({
          country: city.country,
          countryName: city.countryName,
          city: city.city,
          lat: city.lat,
          lon: city.lon,
          tz: city.tz,
        })),
        description: "Complete API data export for fallback mode",
      },
      data: {},
    };

    // Mapをプレーンオブジェクトに変換
    for (let [key, dataset] of currentData) {
      exportData.data[key] = {
        city: dataset.city,
        year: dataset.year,
        source: dataset.source,
        daily: dataset.daily,
        lastUpdated: dataset.lastUpdated || new Date().toISOString(),
      };
    }

    // JSON文字列を作成
    const jsonString = JSON.stringify(exportData, null, 2);
    const jsonSize = (jsonString.length / 1024 / 1024).toFixed(2);

    // ダウンロードリンクを作成
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // ダウンロードファイル名を作成（現在の日付を含む）
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `sun-data-fallback-${dateStr}.json`;

    // ダウンロードを実行
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // URLをクリーンアップ
    URL.revokeObjectURL(url);

    alert(
      `✅ データ出力完了！\n\n` +
        `ファイル名: ${filename}\n` +
        `データ量: ${jsonSize}MB\n` +
        `都市数: ${CITY_BANK.length}\n` +
        `エントリー数: ${currentData.size}\n\n` +
        `このファイルはフォールバックモードで使用できます。`
    );
  } catch (error) {
    alert(`❌ データ出力でエラーが発生しました:\n${error.message}`);
  }
}

/**
 * sun-data-fallback.jsonファイルからフォールバックデータを読み込み
 */
async function loadFallbackJsonData() {
  try {
    const response = await fetch("./sun-data-fallback.json");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch fallback JSON: ${response.status} ${response.statusText}`
      );
    }

    const fallbackData = await response.json();

    if (!fallbackData.data || !fallbackData.metadata) {
      throw new Error("Invalid fallback JSON format: missing data or metadata");
    }

    return fallbackData;
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
      const response = await fetch("./sun-data-fallback.json");
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
