/**
 * メインアプリケーション
 * 夜の灯（ともしび）— 年間・世界都市の日出日没アニメーション
 */

import { fetchCountriesAndCities } from "./data-manager.js";
import { updateCountryOptions } from "./utils.js";
import { initD3Elements, initMap, drawCityMarkers } from "./map-renderer.js";
import { render } from "./animation.js";
import {
  getDOMElements,
  bindEventHandlers,
  ensureDataLoaded,
} from "./ui-controller.js";

// アプリケーション状態
const appState = {
  CITY_BANK: [],
  currentData: new Map(), // key=city_year, val=dataset
};

/**
 * アプリケーション初期化
 */
async function init() {
  try {
    // DOM要素を取得
    const domElements = getDOMElements();

    // D3要素初期化
    initD3Elements();

    // 地図描画
    await initMap();

    // JSONファイルから都市データを読み込み
    const result = await fetchCountriesAndCities();
    const countries = result.countries;
    const cities = result.cities;

    // グローバル変数に設定
    appState.CITY_BANK = cities;

    // 国選択肢を更新
    updateCountryOptions(countries);

    // 都市マーカー描画
    drawCityMarkers(appState.CITY_BANK);

    // イベントバインド
    bindEventHandlers(domElements, appState);

    // 初期データ読み込みと描画
    await ensureDataLoaded(
      appState.CITY_BANK,
      appState.currentData,
      domElements.countrySel,
      domElements.yearSel
    );

    render(
      appState.CITY_BANK,
      appState.currentData,
      domElements.countrySel,
      domElements.yearSel,
      domElements.daySlider,
      domElements.timeSlider,
      domElements.dayLabel,
      domElements.timeLabel
    );
  } catch (error) {
    console.error("初期化エラー:", error);
    alert(
      `アプリケーションの初期化に失敗しました:\n${error.message}\n\nsun-data-fallback.jsonファイルが存在することを確認してください。`
    );
  }
}

/**
 * 現在の全APIデータをJSONファイルにエクスポート（フォールバックモード用）
 */
async function exportAllDataToJson() {
  try {
    // データが読み込まれていることを確認
    const domElements = getDOMElements();
    await ensureDataLoaded(
      appState.CITY_BANK,
      appState.currentData,
      domElements.countrySel,
      domElements.yearSel
    );

    if (appState.currentData.size === 0) {
      alert(
        "エラー: データが読み込まれていません。\n\n" +
          "以下をお試しください：\n" +
          "• ページをリロードしてデータの読み込みを再試行\n" +
          "• 'sun-data-fallback.json'ファイルが存在することを確認\n" +
          "• ネットワーク接続を確認"
      );
      return;
    }

    // 全データを収集
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalEntries: appState.currentData.size,
        cities: appState.CITY_BANK.map((city) => ({
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
    for (let [key, dataset] of appState.currentData) {
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
        `都市数: ${appState.CITY_BANK.length}\n` +
        `エントリー数: ${appState.currentData.size}\n\n` +
        `このファイルはフォールバックモードで使用できます。`
    );
  } catch (error) {
    alert(`データ出力でエラーが発生しました:\n${error.message}`);
  }
}

// グローバルスコープにエクスポート関数を公開（HTMLから呼び出し用）
window.exportAllDataToJson = exportAllDataToJson;

// DOMContentLoadedイベントで初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
