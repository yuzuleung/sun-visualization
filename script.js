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
      console.log("Using cached countries data");
      return data;
    }
  }

  try {
    console.log("Fetching countries data from REST Countries API...");
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

    console.log(
      `Loaded ${result.countries.length} countries with ${result.cities.length} cities`
    );
    return result;
  } catch (error) {
    console.error("Error fetching countries data:", error);
    console.log("Using fallback city data");

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
      cities: FALLBACK_CITIES.map((city) => ({
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
let yearPlaying = false; // 年度播放状态
let frameReq = null;
let yearFrameReq = null; // 年度播放动画请求ID
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
 * Open-Meteo Archive API - 获取真实的365天日出日落数据
 */
const OPEN_METEO_ARCHIVE_URL = (lat, lon, startDate, endDate, timezone) => {
  const baseUrl = `https://archive-api.open-meteo.com/v1/archive`;
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate, // YYYY-MM-DD format
    end_date: endDate, // YYYY-MM-DD format
    daily: "sunrise,sunset",
    timezone: timezone, // 使用当地时区获取真实本地时间
  });
  return `${baseUrl}?${params.toString()}`;
};

/**
 * 代替API: Sunrise-Sunset API (1日ずつ取得) - コメントアウト
 */
// const SUNRISE_SUNSET_URL = (lat, lon, date) => {
//   const baseUrl = `https://api.sunrise-sunset.org/json`;
//   const params = new URLSearchParams({
//     lat: lat.toString(),
//     lng: lon.toString(),
//     date: date, // YYYY-MM-DD format
//     formatted: 0, // UTC時刻で取得
//   });
//   return `${baseUrl}?${params.toString()}`;
// };

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
 * 本地时间字符串转换为UTC分钟数
 * @param {string} localTimeIso - 本地时间ISO字符串 (如: "2024-09-01T06:30:00")
 * @param {string} timezone - 时区标识符 (如: "Asia/Tokyo")
 * @returns {number} UTC分钟数 (0-1439)
 */
function localTimeToUTCMinutes(localTimeIso, timezone) {
  console.log(
    `Converting local time: ${localTimeIso} in timezone: ${timezone}`
  );

  try {
    // 创建本地时间的Date对象
    const localDate = new Date(localTimeIso);
    if (isNaN(localDate.getTime())) {
      console.error(`Invalid date format: ${localTimeIso}`);
      return 0;
    }

    // 获取UTC时间的小时和分钟
    const utcHours = localDate.getUTCHours();
    const utcMinutes = localDate.getUTCMinutes();
    const totalUTCMinutes = utcHours * 60 + utcMinutes;

    console.log(
      `Local ${localTimeIso} -> UTC ${Math.floor(
        totalUTCMinutes / 60
      )}:${String(totalUTCMinutes % 60).padStart(
        2,
        "0"
      )} (${totalUTCMinutes} minutes)`
    );

    return totalUTCMinutes; // 0..1439
  } catch (error) {
    console.error(`Error converting time ${localTimeIso}:`, error);
    return 0;
  }
}

/**
 * ISO時刻文字列をUTC分に変換（旧版本，保留用于向后兼容）
 */
function toUTCMinutes(hhmmIso, timezone = null) {
  if (timezone) {
    return localTimeToUTCMinutes(hhmmIso, timezone);
  }

  console.log(`Converting time: ${hhmmIso}`);
  const t = new Date(hhmmIso);
  if (isNaN(t.getTime())) {
    console.error(`Invalid date format: ${hhmmIso}`);
    return 0;
  }
  const minutes = t.getUTCHours() * 60 + t.getUTCMinutes();
  console.log(
    `Converted to ${minutes} minutes (${Math.floor(minutes / 60)}:${String(
      minutes % 60
    ).padStart(2, "0")})`
  );
  return minutes; // 0..1439
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
 * 簡易的な日出日没時刻計算（フォールバック用）
 * 正確性は劣るが、APIが使えない場合の代替手段
 */
function calculateSimpleSunTimes(lat, lon, year, dayOfYear) {
  // 簡易的な太陽時計算（近似値）
  const p = Math.asin(
    0.39795 * Math.cos((0.98563 * (dayOfYear - 173) * Math.PI) / 180)
  );
  const arg = -Math.tan((lat * Math.PI) / 180) * Math.tan(p);

  if (Math.abs(arg) >= 1) {
    // 極夜または白夜
    if (arg > 0) {
      return { sunrise: null, sunset: null }; // 極夜
    } else {
      return { sunrise: "00:00", sunset: "23:59" }; // 白夜（近似）
    }
  }

  const hourAngle = Math.acos(arg);
  const sunriseHour = 12 - (hourAngle * 12) / Math.PI;
  const sunsetHour = 12 + (hourAngle * 12) / Math.PI;

  // 経度による時差補正（簡易版）
  const timeZoneOffset = Math.round(lon / 15); // 大まかなタイムゾーン
  const correctedSunrise = sunriseHour - timeZoneOffset;
  const correctedSunset = sunsetHour - timeZoneOffset;

  return {
    sunrise: hhmm(Math.max(0, Math.min(1439, correctedSunrise * 60))),
    sunset: hhmm(Math.max(0, Math.min(1439, correctedSunset * 60))),
  };
}

/**
 * 从Open-Meteo Archive API获取真实的365天日出日落数据
 */
async function fetchRealSunTimes(city, year) {
  console.log(`� Fetching real sun times for ${city.city} from Archive API...`);

  // 计算日期范围（从当年9月1日到次年8月31日，覆盖365天）
  const startDate = `2024-01-01`;
  const endDate = `2025-08-31`;

  console.log(`Date range: ${startDate} to ${endDate}`);

  const cacheKey = `archive_${city.city}_${year}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    console.log(`📦 Using cached Archive API data for ${city.city}`);
    return JSON.parse(cached);
  }

  const url = OPEN_METEO_ARCHIVE_URL(
    city.lat,
    city.lon,
    startDate,
    endDate,
    city.tz
  );
  console.log(`🌐 Archive API URL for ${city.city} (${city.tz}):`, url);

  try {
    const response = await fetch(url);

    console.log(
      `📡 Archive API response status for ${city.city}: ${response.status} ${response.statusText}`
    );

    if (!response.ok) {
      const errorText = await response.text();

      // 特殊处理速率限制错误
      if (response.status === 429) {
        console.warn(
          `⏳ Rate limited for ${city.city}, will use fallback data`
        );
        throw new Error(
          `Rate limit exceeded for ${city.city} - using fallback`
        );
      }

      console.error(`❌ Archive API error for ${city.city}:`, {
        status: response.status,
        statusText: response.statusText,
        url: url,
        response: errorText,
      });
      throw new Error(
        `Archive API error ${response.status}: ${response.statusText} @ ${city.city}`
      );
    }

    const json = await response.json();

    // 验证API响应结构
    if (
      !json.daily ||
      !json.daily.time ||
      !json.daily.sunrise ||
      !json.daily.sunset
    ) {
      console.error(
        `❌ Invalid Archive API response structure for ${city.city}:`,
        json
      );
      throw new Error(
        `Invalid Archive API response structure for ${city.city}`
      );
    }

    console.log(`✅ Archive API response for ${city.city}:`, {
      timezone: json.timezone,
      totalDays: json.daily.time.length,
      dateRange: `${json.daily.time[0]} to ${
        json.daily.time[json.daily.time.length - 1]
      }`,
      firstFewDays: json.daily.time.slice(0, 3).map((date, i) => ({
        date,
        sunrise: json.daily.sunrise[i],
        sunset: json.daily.sunset[i],
      })),
    });

    // 转换数据格式
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

    // 缓存结果（24小时有效）
    localStorage.setItem(cacheKey, JSON.stringify(result));
    console.log(
      `💾 Cached Archive API data for ${city.city}: ${result.daily.length} days`
    );

    return result;
  } catch (error) {
    console.error(`❌ Archive API failed for ${city.city}:`, error);
    throw error;
  }
}

/**
 * 从JSON fallback文件获取日出日落数据
 */
/**
 * 主数据获取函数 - 优先使用Archive API，失败时使用JSON数据
 */
async function fetchYearSunTimes(city, year) {
  try {
    // 首先尝试使用Archive API获取真实数据
    return await fetchRealSunTimes(city, year);
  } catch (error) {
    console.error(
      `❌ Failed to get real sun times for ${city.city}:`,
      error.message
    );

    // 如果Archive API失败，直接从JSON文件获取数据
    console.log(`🔄 Loading data from JSON fallback for ${city.city}...`);
    return await fetchFromJsonFallback(city, year);
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
    console.error("Error loading world map:", error);
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

  // 标签智能定位避免重叠
  adjustLabelPositions(cityGroups);
}

/**
 * 调整城市标签位置以避免重叠
 */
function adjustLabelPositions(cityGroups) {
  const minDistance = 25; // 最小距离
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

    // 为每个标签尝试不同位置
    positions.forEach((pos) => {
      const labelX = group.x + pos.dx;
      const labelY = group.y + pos.dy;

      // 计算与其他标签的距离
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

      // 评分：距离其他标签越远越好，优先选择上方位置
      const score = minDistToOthers + (pos.dy < 0 ? 5 : 0);

      if (score > bestScore) {
        bestScore = score;
        bestPosition = pos;
      }
    });

    // 应用最佳位置
    label
      .attr("dx", bestPosition.dx)
      .attr("dy", bestPosition.dy)
      .attr(
        "text-anchor",
        bestPosition.dx > 0 ? "start" : bestPosition.dx < 0 ? "end" : "middle"
      );

    // 保存位置信息供下次计算使用
    group.labelPos = bestPosition;
  });
}

/* ========= 5) データ読み込み ========= */

// API请求限制管理
let apiRequestQueue = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 2; // 最大并发请求数
const REQUEST_DELAY = 500; // 请求间延迟（毫秒）

/**
 * 添加API请求到队列中，控制并发数
 */
async function queueApiRequest(requestFunc) {
  return new Promise((resolve, reject) => {
    apiRequestQueue.push({ requestFunc, resolve, reject });
    processQueue();
  });
}

/**
 * 处理API请求队列
 */
async function processQueue() {
  if (isProcessingQueue || apiRequestQueue.length === 0) return;

  isProcessingQueue = true;
  const activeRequests = [];

  while (apiRequestQueue.length > 0 || activeRequests.length > 0) {
    // 启动新的请求（不超过最大并发数）
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

      // 添加延迟避免API速率限制
      if (apiRequestQueue.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY));
      }
    }

    // 等待至少一个请求完成
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

  console.log(
    `🔄 Loading data for ${cities.length} cities (${cc}) for year ${year}`
  );

  // 显示加载进度
  updateLoadingProgress(0, cities.length);

  const tasks = cities.map(async (c, index) => {
    const key = `${c.city}_${year}`;

    // 使用请求队列控制并发
    console.log(`🌅 Queuing request for ${c.city}...`);
    try {
      const dataset = await queueApiRequest(() => fetchYearSunTimes(c, year));
      currentData.set(key, dataset);

      // 更新进度
      updateLoadingProgress(index + 1, cities.length);

      // データ検証
      if (dataset.daily && dataset.daily.length > 0) {
        const firstDay = dataset.daily[0];
        console.log(`🌅 ${c.city} verified data:`, {
          city: c.city,
          totalDays: dataset.daily.length,
          source: dataset.source,
          firstDay: {
            date: firstDay.date,
            sunrise: firstDay.sunrise,
            sunset: firstDay.sunset,
            sunriseMinutes: toUTCMinutes(firstDay.sunrise, c.tz),
            sunsetMinutes: toUTCMinutes(firstDay.sunset, c.tz),
          },
        });
      } else {
        console.error(`❌ Invalid dataset for ${c.city}:`, dataset);
      }

      return { city: c.city, status: "success", data: dataset };
    } catch (error) {
      console.error(`❌ Failed to load data for ${c.city}:`, error.message);
      return { city: c.city, status: "error", error: error.message };
    }
  });

  const results = await Promise.all(tasks);

  // 結果を집计
  const successful = results.filter((r) => r.status === "success");
  const failed = results.filter((r) => r.status === "error");

  console.log(
    `📊 Data loading complete: ${successful.length}/${cities.length} cities loaded successfully`
  );

  // 更新数据源状态显示
  updateDataSourceStatus(successful);

  if (successful.length > 0) {
    console.log(
      "✅ Successfully loaded cities:",
      successful.map((r) => r.city)
    );
  }

  if (failed.length > 0) {
    console.warn(
      `⚠️ Failed to load data for ${failed.length} cities:`,
      failed.map((f) => f.city)
    );
  }

  // currentData 상태 확인
  console.log(`🗂️ Current data cache has ${currentData.size} entries:`);
  for (let [key, value] of currentData) {
    console.log(
      `  ${key}: ${value?.daily?.length || 0} days (${
        value?.source || "unknown"
      })`
    );
  }
}

/**
 * 更新数据源状态显示
 */
function updateDataSourceStatus(successfulResults) {
  const dataSourceEl = document.getElementById("dataSource");
  const dataStatusEl = document.getElementById("dataStatus");

  if (!dataSourceEl || !dataStatusEl) return;

  // 统计数据源类型
  const sourceCounts = {};
  successfulResults.forEach((result) => {
    const source = result.data?.source || "unknown";
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  console.log("📊 Data sources:", sourceCounts);

  // 确定主要数据源
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
 * 更新加载进度显示
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

  console.log(
    `🎯 RENDER START: ${cities.length} cities for ${cc} on day ${day} at ${hhmm(
      tMin
    )} UTC`
  );

  let litCities = 0;
  let totalCities = 0;

  console.log(
    `📍 Total city markers on map: ${gCities.selectAll("g.cityG").size()}`
  );

  gCities.selectAll("g.cityG").each(function (d) {
    console.log(`🏙️ Processing city: ${d?.city || "unknown"}`);

    const node = d3.select(this);
    const dot = node.select("circle.city");
    const lab = node.select("text.cityLabel");

    if (!dot.size()) {
      console.warn(
        `❌ No circle element found for city ${d?.city || "unknown"}`
      );
      return;
    }

    if (!cities.includes(d)) {
      // 非選択国家 → 白天时的小灰点样式
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

    totalCities++;
    console.log(`✅ Processing selected city: ${d.city}`);

    const key = `${d.city}_${year}`;
    const dataset = currentData.get(key);

    if (!dataset) {
      console.warn(`❌ No dataset for ${d.city} ${year}`);

      // 簡易フォールバック
      dot.classed("dim", true).attr("r", 3.8).attr("stroke", null);
      lab.attr("opacity", 0.2);
      return;
    }

    console.log(
      `✅ Found dataset for ${d.city}: ${dataset.daily?.length || 0} days`
    );

    // 日付インデックス（0-based）
    const idx = Math.max(0, Math.min(day - 1, dataset.daily.length - 1));
    const today = dataset.daily[idx];

    console.log(`📅 Day ${day} (index ${idx}): ${today?.date || "no date"}`);

    // 当日のsunrise/sunsetを取得
    if (!today || !today.sunrise || !today.sunset) {
      console.warn(
        `❌ Invalid sun data for ${d.city} on ${
          today?.date || "unknown date"
        }:`,
        today
      );
      dot.classed("dim", true).attr("r", 3.8);
      lab.attr("opacity", 0.2);
      return;
    }

    console.log(
      `🌅 Raw sun times for ${d.city}: sunrise=${today.sunrise}, sunset=${today.sunset} (timezone: ${d.tz})`
    );

    const sunriseM = toUTCMinutes(today.sunrise, d.tz); // 0..1439 当日の日出時刻 (UTC)
    const sunsetM = toUTCMinutes(today.sunset, d.tz); // 0..1439 当日の日没時刻 (UTC)

    if (isNaN(sunriseM) || isNaN(sunsetM)) {
      console.error(
        `❌ Invalid time conversion for ${d.city}: sunrise=${sunriseM}, sunset=${sunsetM}`
      );
      dot.classed("dim", true).attr("r", 3.8);
      lab.attr("opacity", 0.2);
      return;
    }

    // 夜間判定：需要考虑跨日期的情况
    // 对于东京等城市，日出时间（如20:30 UTC前一天）会大于日落时间（如09:00 UTC当天）
    let isNight;
    if (sunriseM > sunsetM) {
      // 跨日期情况：sunrise > sunset (例如：东京 20:30 > 09:00)
      // 夜间时间：00:00-09:00 和 20:30-23:59
      isNight = tMin <= sunsetM || tMin >= sunriseM;
    } else {
      // 正常情况：sunrise < sunset (例如：伦敦 05:30 < 18:30)
      // 夜间时间：00:00-05:30 和 18:30-23:59
      isNight = tMin < sunriseM || tMin >= sunsetM;
    }

    console.log(
      `🌅 ${d.city}: sunrise=${hhmm(sunriseM)} (${sunriseM}min), sunset=${hhmm(
        sunsetM
      )} (${sunsetM}min), current=${hhmm(tMin)} (${tMin}min), crossDate=${
        sunriseM > sunsetM
      }, isNight=${isNight}`
    );

    if (isNight) {
      console.log(`🔥 LIGHTING UP ${d.city}!`);
      dot
        .classed("dim", false)
        .attr("r", 3.5)
        .attr("stroke", "#ffd700")
        .attr("stroke-width", 1.5)
        .attr("fill", "#ffd700")
        .style("fill", "#ffd700");
      lab.attr("opacity", 1).attr("fill", "#ffd700").style("fill", "#ffd700");
      litCities++;
    } else {
      console.log(`☀️ ${d.city} is in daylight`);
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

  console.log(
    `🌃 RENDER COMPLETE: ${litCities}/${totalCities} cities are lit (night time)`
  );

  // 强制更新所有城市标记的视觉状态
  gCities.selectAll("circle.city").each(function () {
    const element = d3.select(this);
    const currentFill = element.attr("fill");
    console.log(`Final visual check - Circle fill: ${currentFill}`);
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
 * 年度动画渲染函数
 */
function renderYearAnimation() {
  const currentDay = +daySlider.value;
  const currentTime = +timeSlider.value;

  // 正常渲染当前状态
  render();

  if (yearPlaying) {
    // 每帧推进一天，时间保持固定
    let nextDay = currentDay + 1;
    const currentYear = +yearSel.value;
    const maxDay = currentYear === 2025 ? 244 : 365; // 2025年限制到9月1日

    if (nextDay > maxDay) {
      nextDay = 1; // 循环播放
    }

    daySlider.value = nextDay;

    // 继续动画，每秒约4天的速度
    yearFrameReq = setTimeout(() => {
      requestAnimationFrame(renderYearAnimation);
    }, 250); // 250ms = 每秒4帧 = 每秒4天
  }
}

/* ========= 7) イベントハンドラ ========= */
function bindEventHandlers() {
  // 检查所有必需的DOM元素是否存在
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
      console.error(`❌ DOM element not found: ${name}`);
      throw new Error(`Required DOM element not found: ${name}`);
    }
  }

  console.log("✅ All required DOM elements found, binding events...");

  countrySel.addEventListener("change", async () => {
    await ensureDataLoaded();
    render();
  });

  yearSel.addEventListener("change", async () => {
    const selectedYear = +yearSel.value;
    const currentDay = +daySlider.value;

    // 根据年份设置日期范围
    if (selectedYear === 2025) {
      // 2025年：只能到9月1日（第244天）
      daySlider.max = 244;
      if (currentDay > 244) {
        daySlider.value = 244;
      }
    } else {
      // 其他年份：完整365天
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

    // 停止年度播放如果正在进行
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

    // 停止日时播放如果正在进行
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
        if (
          key.startsWith("om_") ||
          key.startsWith("ow_") ||
          key.startsWith("hardcoded_") ||
          key === "countries_cities_cache"
        ) {
          localStorage.removeItem(key);
          removedKeys.push(key);
        }
      });

      // データマップもクリア
      currentData.clear();

      console.log(`Cache cleared: ${removedKeys.length} items removed`);
      alert(`キャッシュをクリアしました (${removedKeys.length}件)`);

      // データを再読み込み
      ensureDataLoaded().then(() => render());
    }
  });

  exportDataBtn.addEventListener("click", async () => {
    await exportAllDataToJson();
  });

  testApiBtn.addEventListener("click", async () => {
    console.log("🎯 Night Lighting Test starting...");

    // テスト: 현재 설정으로 야간 판정 로직 확인
    const currentYear = +yearSel.value;
    const currentDay = +daySlider.value;
    const currentTime = +timeSlider.value;

    console.log(
      `Current settings: Year=${currentYear}, Day=${currentDay}, Time=${hhmm(
        currentTime
      )} UTC`
    );

    // 각 도시에 대해 야간 판정 테스트
    const cities = CITY_BANK.slice(0, 5); // 처음 5개 도시만

    console.log("🌃 Testing night judgment for each city:");

    for (const city of cities) {
      const key = `${city.city}_${currentYear}`;
      const dataset = currentData.get(key);

      if (!dataset || !dataset.daily) {
        console.log(`❌ ${city.city}: No data available`);
        continue;
      }

      const dayIndex = Math.max(
        0,
        Math.min(currentDay - 1, dataset.daily.length - 1)
      );
      const dayData = dataset.daily[dayIndex];

      if (!dayData) {
        console.log(`❌ ${city.city}: No data for day ${currentDay}`);
        continue;
      }

      const sunriseM = toUTCMinutes(dayData.sunrise, city.tz);
      const sunsetM = toUTCMinutes(dayData.sunset, city.tz);

      // 使用与主渲染函数相同的夜间判断逻辑
      const isNight =
        sunriseM > sunsetM
          ? currentTime <= sunsetM || currentTime >= sunriseM // 跨日期情况
          : currentTime < sunriseM || currentTime >= sunsetM; // 正常情况

      console.log(
        `${isNight ? "🌙" : "☀️"} ${city.city}: sunrise=${hhmm(
          sunriseM
        )}, sunset=${hhmm(sunsetM)}, current=${hhmm(currentTime)}, crossDate=${
          sunriseM > sunsetM
        }, isNight=${isNight}`
      );
    }

    // 실제 지도상에서 점등된 도시 개수 확인
    let mapLitCount = 0;
    let mapTotalCount = 0;

    gCities.selectAll("g.cityG").each(function (d) {
      if (CITY_BANK.includes(d)) {
        mapTotalCount++;
        const dot = d3.select(this).select("circle.city");
        if (!dot.classed("dim")) {
          mapLitCount++;
        }
      }
    });

    console.log(
      `🗺️ Map status: ${mapLitCount}/${mapTotalCount} cities are visually lit`
    );

    // 강제 리렌더링 테스트
    console.log("🔄 Force re-rendering...");
    render();

    alert(
      `🎯 夜間点灯テスト完了\n\n現在時刻: ${hhmm(
        currentTime
      )} UTC\n地図上点灯都市: ${mapLitCount}/${mapTotalCount}\n\n詳細はコンソールをご確認ください。`
    );
  });

  /* testAltApiBtn は HTML にないのでコメントアウト
  testAltApiBtn.addEventListener("click", async () => {
    console.log("� Display Test starting...");

    try {
      // 現在の設定を取得
      const currentCountry = countrySel.value;
      const currentYear = +yearSel.value;
      const currentDay = +daySlider.value;
      const currentTime = +timeSlider.value;

      console.log(
        `Current settings: Country=${currentCountry}, Year=${currentYear}, Day=${currentDay}, Time=${hhmm(
 currentTime)}`
      );

      // 選択された都市のデータを確認
      const cities =
        currentCountry === "ALL"
          ? CITY_BANK
          : CITY_BANK.filter((c) => c.country === currentCountry);

      console.log(
        `Selected cities (${cities.length}):`,
        cities.map((c) => c.city)
      );

      let dataStatus = [];

      for (const city of cities.slice(0, 5)) {
        // 最初の5都市をテスト
        const key = `${city.city}_${currentYear}`;
        const dataset = currentData.get(key);

        if (dataset && dataset.daily && dataset.daily.length > 0) {
          const dayIndex = Math.max(
            0,
            Math.min(currentDay - 1, dataset.daily.length - 1)
          );
          const dayData = dataset.daily[dayIndex];

          if (dayData && dayData.sunrise && dayData.sunset) {
            const sunriseM = toUTCMinutes(dayData.sunrise, city.tz);
            const sunsetM = toUTCMinutes(dayData.sunset, city.tz);
            const isNight =
              sunriseM < sunsetM
                ? currentTime < sunriseM || currentTime >= sunsetM
                : currentTime >= sunsetM && currentTime < sunriseM;

            dataStatus.push({
              city: city.city,
              status: "✅ Data OK",
              source: dataset.source || "unknown",
              dayData: {
                date: dayData.date,
                sunrise: hhmm(sunriseM),
                sunset: hhmm(sunsetM),
                isNight: isNight,
              },
            });
          } else {
            dataStatus.push({
              city: city.city,
              status: "⚠️ Invalid day data",
              dayData: dayData,
            });
          }
        } else {
          dataStatus.push({
            city: city.city,
            status: "❌ No data",
            dataset: !!dataset,
          });
        }
      }

      // 結果を表示
      console.log("\n📊 Display Test Results:");
      dataStatus.forEach((status) => {
        console.log(`${status.status} ${status.city}:`);
        if (status.dayData && typeof status.dayData === "object") {
          console.log(`  Date: ${status.dayData.date}`);
          console.log(`  Sunrise: ${status.dayData.sunrise}`);
          console.log(`  Sunset: ${status.dayData.sunset}`);
          console.log(`  Is Night: ${status.dayData.isNight}`);
          console.log(`  Source: ${status.source || "unknown"}`);
        } else if (status.dayData) {
          console.log(`  Day data:`, status.dayData);
        }
      });

      // 地図上の都市状態を確認
      let mapCityCount = 0;
      let litCityCount = 0;

      gCities.selectAll("g.cityG").each(function (d) {
        if (cities.includes(d)) {
          mapCityCount++;
          const dot = d3.select(this).select("circle.city");
          const isLit = !dot.classed("dim");
          if (isLit) litCityCount++;
        }
      });

      console.log(
        `\n🗺️ Map Status: ${litCityCount}/${mapCityCount} cities are lit (night time)`
      );

      const successCount = dataStatus.filter((s) =>
        s.status.startsWith("✅")
      ).length;
      const message =
        `表示テスト結果:\n\n` +
        `✅ データ正常: ${successCount}/${dataStatus.length} 都市\n` +
        `🗺️ 地図表示: ${mapCityCount} 都市中 ${litCityCount} 都市が点灯\n` +
        `⏰ 現在時刻: ${hhmm(currentTime)} UTC\n` +
        `📅 現在日付: Day ${currentDay} (${ymdFromYearDay(
          currentYear,
          currentDay
        )})\n\n` +
        `詳細はコンソールを確認してください。`;

      alert(message);
    } catch (error) {
      console.error("❌ Display test failed:", error);
      alert(`❌ 表示テストでエラーが発生しました:\n${error.message}`);
    }
  }); */

  console.log("✅ All event handlers bound successfully");

  // 初始化daySlider的最大值
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
    // DOM要素取得
    console.log("🔍 Getting DOM elements...");

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

    console.log("✅ All DOM elements found successfully");

    // D3要素初期化
    svg = d3.select("#map");
    gMap = svg.append("g").attr("id", "countries");
    gCities = svg.append("g").attr("id", "cities-layer");
    projection = d3.geoNaturalEarth1().fitSize([1100, 600], { type: "Sphere" });
    geoPath = d3.geoPath(projection);

    // 地図描画
    console.log("Initializing world map...");
    await initMap();

    // 优先尝试从JSON文件加载城市列表
    console.log("Loading countries and cities data...");
    let countries, cities;

    try {
      console.log("🔄 Trying to load city list from JSON fallback...");
      const response = await fetch("./sun-data-fallback.json");
      if (response.ok) {
        const fallbackData = await response.json();
        // 缓存JSON数据
        window.fallbackJsonData = fallbackData;

        // 使用JSON文件中的完整城市列表
        cities = fallbackData.metadata.cities;
        console.log(`✅ Loaded ${cities.length} cities from JSON fallback`);

        // 构建国家列表
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
      console.warn(
        "⚠️ Failed to load from JSON, falling back to MAJOR_CITIES:",
        error.message
      );
      const result = await fetchCountriesAndCities();
      countries = result.countries;
      cities = result.cities;
    }

    // グローバル変数に設定
    CITY_BANK = cities;
    console.log("Cities loaded:", cities.length);

    // 国選択肢を更新
    updateCountryOptions(countries);

    // 都市マーカー描画
    drawCityMarkers(CITY_BANK);

    // イベントバインド
    bindEventHandlers();

    // 强制清除所有缓存以使用新的API
    console.log("🧹 Clearing all cache to ensure fresh Archive API data...");
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (
        key.startsWith("om_") ||
        key.startsWith("ow_") ||
        key.startsWith("archive_") ||
        key.startsWith("hardcoded_") ||
        key === "countries_cities_cache"
      ) {
        localStorage.removeItem(key);
      }
    });
    currentData.clear(); // 清除内存缓存

    // 初期データ読み込みと描画
    console.log("Loading initial sun data...");
    await ensureDataLoaded();

    console.log("Performing initial render...");
    render();

    console.log(
      `✅ Night Lights Map initialized successfully with ${cities.length} cities from ${countries.length} countries`
    );
  } catch (error) {
    console.error("❌ Initialization failed:", error);

    // 直接使用JSON fallback，不再尝试复杂的错误处理
    console.log("🔄 Directly loading from JSON fallback...");

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

        console.log(`✅ Loaded ${CITY_BANK.length} cities from JSON fallback`);

        updateCountryOptions(countries);
        drawCityMarkers(CITY_BANK);
        bindEventHandlers();
      } else {
        throw new Error("JSON fallback failed");
      }
    } catch (jsonError) {
      console.error("❌ JSON fallback also failed:", jsonError);

      // 最终fallback: 使用FALLBACK_CITIES
      CITY_BANK = FALLBACK_CITIES.map((city) => ({
        ...city,
        countryName: "Unknown",
        flag: "",
      }));

      console.log(
        `⚠️ Using hardcoded fallback with ${CITY_BANK.length} cities`
      );

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

    console.log("✅ Fallback initialization complete");
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
 * 导出当前所有API数据到JSON文件（用于フォールバック模式）
 */
async function exportAllDataToJson() {
  try {
    console.log("📁 Starting data export...");

    // 确保数据已加载
    await ensureDataLoaded();

    if (currentData.size === 0) {
      alert(
        "❌ エラー: データが読み込まれていません。まず「🔍 API テスト」を実行してデータを取得してください。"
      );
      return;
    }

    // 收集所有数据
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

    // 转换Map到普通对象
    for (let [key, dataset] of currentData) {
      exportData.data[key] = {
        city: dataset.city,
        year: dataset.year,
        source: dataset.source,
        daily: dataset.daily,
        lastUpdated: dataset.lastUpdated || new Date().toISOString(),
      };
    }

    // 创建JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    const jsonSize = (jsonString.length / 1024 / 1024).toFixed(2);

    console.log(`📊 Export data prepared: ${jsonSize}MB`);

    // 创建下载链接
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    // 创建下载文件名（包含当前日期）
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const filename = `sun-data-fallback-${dateStr}.json`;

    // 触发下载
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // 清理URL
    URL.revokeObjectURL(url);

    console.log(`✅ Data export completed: ${filename}`);
    alert(
      `✅ データ出力完了！\n\n` +
        `ファイル名: ${filename}\n` +
        `データ量: ${jsonSize}MB\n` +
        `都市数: ${CITY_BANK.length}\n` +
        `エントリー数: ${currentData.size}\n\n` +
        `このファイルはフォールバックモードで使用できます。`
    );
  } catch (error) {
    console.error("❌ Export failed:", error);
    alert(`❌ データ出力でエラーが発生しました:\n${error.message}`);
  }
}

/**
 * 示例：如何使用导出的JSON数据作为fallback
 * 这个函数展示了如何将导出的JSON文件重新加载为fallback数据
 */
async function loadBackupDataExample() {
  // 示例：从文件加载并使用备份数据
  // 实际使用时，您可以将导出的JSON文件内容复制到代码中
  const exampleBackupData = {
    Tokyo_2024: {
      city: "Tokyo",
      year: 2024,
      source: "Open-Meteo Archive API",
      daily: [
        {
          date: "2024-01-01",
          sunrise: "06:50:23",
          sunset: "16:38:02",
        },
        // ... 更多数据
      ],
    },
    // ... 更多城市数据
  };

  console.log("📁 Example: How to use exported backup data");
  console.log("1. Export data using '📁 データ出力' button");
  console.log("2. Save the JSON file as backup");
  console.log("3. In fallback mode, load the JSON data like this:");
  console.log("   - Replace FALLBACK_CITIES with data from JSON");
  console.log("   - Use loadFallbackDataFromJson() function");

  return exampleBackupData;
}

/**
 * 从sun-data-fallback.json文件加载fallback数据
 */
async function loadFallbackJsonData() {
  try {
    console.log("📁 Loading fallback data from sun-data-fallback.json...");

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

    console.log(
      `📊 Loaded fallback JSON with ${
        Object.keys(fallbackData.data).length
      } entries`
    );
    console.log(
      `📊 Cities in fallback: ${fallbackData.metadata.cities?.length || 0}`
    );
    console.log(`📊 Export date: ${fallbackData.metadata.exportDate}`);

    return fallbackData;
  } catch (error) {
    console.error("❌ Failed to load fallback JSON:", error);
    throw error;
  }
}

/**
 * 使用JSON fallback数据初始化系统
 */
async function initializeWithFallbackJson() {
  try {
    console.log("🔄 Initializing with JSON fallback data...");

    const fallbackData = await loadFallbackJsonData();

    // 从JSON数据中提取城市信息
    if (
      fallbackData.metadata.cities &&
      fallbackData.metadata.cities.length > 0
    ) {
      CITY_BANK = fallbackData.metadata.cities.map((city) => ({
        country: city.country,
        countryName: city.countryName,
        city: city.city,
        lat: city.lat,
        lon: city.lon,
        tz: city.tz,
        flag: city.flag || "",
      }));
    } else {
      // 如果metadata中没有城市信息，从数据键中提取
      const cities = new Set();
      Object.keys(fallbackData.data).forEach((key) => {
        const parts = key.split("_");
        if (parts.length >= 2) {
          cities.add(parts[0]); // 城市名
        }
      });

      CITY_BANK = Array.from(cities).map((cityName) => ({
        country: "UNKNOWN",
        countryName: "Unknown",
        city: cityName,
        lat: 0,
        lon: 0,
        tz: "UTC",
        flag: "",
      }));
    }

    // 加载所有fallback数据到currentData
    currentData.clear();
    for (const [key, dataset] of Object.entries(fallbackData.data)) {
      // 确保数据格式正确
      const processedDataset = {
        ...dataset,
        source: "json-fallback",
        lastUpdated: dataset.lastUpdated || fallbackData.metadata.exportDate,
      };

      currentData.set(key, processedDataset);
    }

    console.log(`✅ JSON fallback initialization complete:`);
    console.log(`   - Cities: ${CITY_BANK.length}`);
    console.log(`   - Data entries: ${currentData.size}`);
    console.log(`   - Data source: JSON fallback`);

    return {
      success: true,
      cities: CITY_BANK.length,
      dataEntries: currentData.size,
    };
  } catch (error) {
    console.error("❌ JSON fallback initialization failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 从JSON备用文件中获取城市数据
 */
async function fetchFromJsonFallback(city, year) {
  try {
    // 尝试从缓存中获取JSON数据
    let fallbackData = window.fallbackJsonData;

    if (!fallbackData) {
      console.log("🔄 Loading fallback JSON data...");
      const response = await fetch("./sun-data-fallback.json");
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON fallback: ${response.status}`);
      }

      fallbackData = await response.json();
      // 缓存到内存中以避免重复加载
      window.fallbackJsonData = fallbackData;
      console.log(
        `✅ JSON fallback data loaded: ${fallbackData.metadata.totalEntries} entries`
      );
    }

    // 查找对应城市和年份的数据
    const dataKey = `${city.city}_${year}`;
    console.log(`🔍 Looking for data key: "${dataKey}"`);

    let cityData = fallbackData.data[dataKey];

    // 如果精确匹配失败，尝试查找包含城市名称的键
    if (!cityData) {
      const availableKeys = Object.keys(fallbackData.data);
      const matchingKey = availableKeys.find((key) => {
        const keyCity = key.split("_")[0];
        return keyCity === city.city;
      });

      if (matchingKey) {
        console.log(
          `🔄 Found alternative key: "${matchingKey}" for ${city.city}`
        );
        cityData = fallbackData.data[matchingKey];
      } else {
        // 尝试调试：列出可能相关的键
        const similarKeys = availableKeys.filter(
          (key) =>
            key.toLowerCase().includes(city.city.toLowerCase()) ||
            city.city.toLowerCase().includes(key.split("_")[0].toLowerCase())
        );
        console.warn(
          `❌ No JSON data found for "${dataKey}". Similar keys:`,
          similarKeys.slice(0, 5)
        );
        throw new Error(`No JSON data found for ${city.city} in ${year}`);
      }
    }

    console.log(`✅ Found JSON data for ${city.city}`); // 返回与API格式一致的数据结构
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
    console.error(
      `❌ Failed to load from JSON fallback for ${city.city}:`,
      error.message
    );
    throw error;
  }
}
