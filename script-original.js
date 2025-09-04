/**
 * 夜の灯（ともしび）— 年間・世界都市の日出日没アニメーション
 * 世界の主要都市の日出日没時刻を表示し、夜間に都市を点灯させるアニメーション
 */

/* ========= 1) 都市データ定義 ========= */

// 動的に取得された都市データ
let CITY_BANK = [];

/**
 * JSONファイルから国データを取得し、都市データを構築
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
 * 国コードから国旗絵文字を取得
 */
function getFlagEmoji(countryCode) {
  const flagMap = {
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
  return flagMap[countryCode] || "🌍";
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
  yearPlayBtn;
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
    // 一時的にAPI呼び出しをコメントアウト - API制限回避のため直接JSON使用
    // return await fetchRealSunTimes(city, year);

    // 直接JSONファイルデータを使用
    return await fetchFromJsonFallback(city, year);
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

  // 一時的なJSONテストモード使用 - API機能はコメントアウト中
  dataSourceEl.textContent = "JSONファイル (テスト中)";
  dataStatusEl.innerHTML = `🧪 JSONテストモード使用中 (${jsonFallbackCount}/${totalCities} 都市)`;
  dataStatusEl.style.color = "#f97316"; // orange

  /* 元のAPI状態表示コードは一時的に無効化
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
  */
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

    // 極地特殊状況の確認
    const sunriseDate = today.sunrise;
    const sunsetDate = today.sunset;
    const sunriseDay = new Date(sunriseDate).getUTCDate();
    const sunsetDay = new Date(sunsetDate).getUTCDate();

    // 極地特殊状況の処理
    if (sunriseM === 0 && sunsetM === 0) {
      if (sunsetDay > sunriseDay) {
        // McMurdo型：sunrise 00:00, sunset 翌日00:00 = 白夜 (24時間昼間)
        isDaytime = true;
      } else {
        // Ilulissat型：sunrise 00:00, sunset 同日00:00 = 極夜 (24時間夜間)
        isDaytime = false;
      }
    } else if (sunriseM === sunsetM) {
      // その他の同値状況、データ異常の可能性、デフォルト点灯
      isDaytime = false;
    } else if (sunriseM > sunsetM) {
      // 日付跨ぎ状況：sunrise > sunset (例：東京 20:12 UTC > 09:10 UTC)
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
    const maxDay = currentYear === 2025 ? 243 : 365; // 2025年は8月31日まで制限

    if (nextDay > maxDay) {
      nextDay = 1; // ループ再生
    }

    daySlider.value = nextDay;

    // アニメーション継続、毎秒約12日の速度
    yearFrameReq = setTimeout(() => {
      requestAnimationFrame(renderYearAnimation);
    }, 80); // 80ms = 毎秒12フレーム = 毎秒12日
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
      // 2025年：8月31日（第243日）まで
      daySlider.max = 243;
      if (currentDay > 243) {
        daySlider.value = 243;
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

  // daySliderの最大値を初期化
  const initialYear = +yearSel.value;
  if (initialYear === 2025) {
    daySlider.max = 243;
    if (+daySlider.value > 243) {
      daySlider.value = 243;
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

    // D3要素初期化
    svg = d3.select("#map");
    gMap = svg.append("g").attr("id", "countries");
    gCities = svg.append("g").attr("id", "cities-layer");
    projection = d3.geoNaturalEarth1().fitSize([1100, 600], { type: "Sphere" });
    geoPath = d3.geoPath(projection);

    // 地図描画
    await initMap();

    // JSONファイルから都市データを読み込み
    const result = await fetchCountriesAndCities();
    const countries = result.countries;
    const cities = result.cities;

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
    console.error("初期化エラー:", error);
    alert(
      `アプリケーションの初期化に失敗しました:\n${error.message}\n\nsun-data-fallback.jsonファイルが存在することを確認してください。`
    );
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
    const cacheBuster = Date.now();
    const response = await fetch(`./sun-data-fallback.json?v=${cacheBuster}`);
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
