/**
 * イベントハンドラとユーザーインターフェース制御
 */

import { CONFIG } from "./config.js";
import { updateCountryOptions } from "./utils.js";
import { fetchYearSunTimes, queueApiRequest } from "./data-manager.js";
import { render, toggleAnimation, toggleYearAnimation } from "./animation.js";

/**
 * データソース状態表示を更新
 */
export function updateDataSourceStatus(successfulResults) {
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
    dataStatusEl.innerHTML = `リアルデータ使用中 (${archiveCount}/${totalCities} 都市)`;
    dataStatusEl.style.color = "#4ade80"; // green
  } else if (jsonFallbackCount > 0) {
    dataSourceEl.textContent = "JSONファイル";
    dataStatusEl.innerHTML = `JSON fallback使用中 (${jsonFallbackCount}/${totalCities} 都市)`;
    dataStatusEl.style.color = "#06b6d4"; // cyan
  } else {
    dataSourceEl.textContent = "データなし";
    dataStatusEl.innerHTML = `データ読み込み失敗`;
    dataStatusEl.style.color = "#ef4444"; // red
  }
}

/**
 * 読み込み進捗表示を更新
 */
export function updateLoadingProgress(completed, total) {
  const dataStatusEl = document.getElementById("dataStatus");
  if (!dataStatusEl) return;

  const percentage = Math.round((completed / total) * 100);
  dataStatusEl.innerHTML = `データ読み込み中... ${completed}/${total} (${percentage}%)`;
  dataStatusEl.style.color = "#fbbf24"; // yellow
}

/**
 * データ読み込み確保
 */
export async function ensureDataLoaded(
  CITY_BANK,
  currentData,
  countrySel,
  yearSel
) {
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
 * イベントハンドラをバインド
 */
export function bindEventHandlers(domElements, appState) {
  const {
    countrySel,
    yearSel,
    daySlider,
    timeSlider,
    dayLabel,
    timeLabel,
    playBtn,
    yearPlayBtn,
  } = domElements;

  const { CITY_BANK, currentData } = appState;

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
    await ensureDataLoaded(CITY_BANK, currentData, countrySel, yearSel);
    render(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel
    );
  });

  yearSel.addEventListener("change", async () => {
    const selectedYear = +yearSel.value;
    const currentDay = +daySlider.value;

    // 年に基づいて日付範囲を設定
    if (selectedYear === 2025) {
      // 2025年：8月31日（第243日）まで
      daySlider.max = CONFIG.YEAR_2025_MAX_DAY;
      if (currentDay > CONFIG.YEAR_2025_MAX_DAY) {
        daySlider.value = CONFIG.YEAR_2025_MAX_DAY;
      }
    } else {
      // その他の年：完全365日
      daySlider.max = CONFIG.NORMAL_YEAR_MAX_DAY;
    }

    await ensureDataLoaded(CITY_BANK, currentData, countrySel, yearSel);
    render(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel
    );
  });

  daySlider.addEventListener("input", () =>
    render(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel
    )
  );

  timeSlider.addEventListener("input", () =>
    render(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel
    )
  );

  playBtn.addEventListener("click", () => {
    toggleAnimation(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel,
      playBtn,
      yearPlayBtn
    );
  });

  yearPlayBtn.addEventListener("click", () => {
    toggleYearAnimation(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel,
      playBtn,
      yearPlayBtn
    );
  });

  // daySliderの最大値を初期化
  const initialYear = +yearSel.value;
  if (initialYear === 2025) {
    daySlider.max = CONFIG.YEAR_2025_MAX_DAY;
    if (+daySlider.value > CONFIG.YEAR_2025_MAX_DAY) {
      daySlider.value = CONFIG.YEAR_2025_MAX_DAY;
    }
  } else {
    daySlider.max = CONFIG.NORMAL_YEAR_MAX_DAY;
  }
}

/**
 * DOM要素を取得
 */
export function getDOMElements() {
  return {
    countrySel: document.getElementById("countrySel"),
    yearSel: document.getElementById("yearSel"),
    daySlider: document.getElementById("daySlider"),
    timeSlider: document.getElementById("timeSlider"),
    dayLabel: document.getElementById("dayLabel"),
    timeLabel: document.getElementById("timeLabel"),
    playBtn: document.getElementById("playBtn"),
    yearPlayBtn: document.getElementById("yearPlayBtn"),
  };
}
