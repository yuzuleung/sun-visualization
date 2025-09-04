/**
 * ユーティリティ関数集
 */

import { TIMEZONE_OFFSETS, FLAG_EMOJI_MAP } from "./config.js";

/**
 * 年と日から年月日文字列を生成
 */
export function ymdFromYearDay(year, day) {
  const d = new Date(Date.UTC(year, 0, 1));
  d.setUTCDate(day);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 分を時:分形式に変換
 */
export function hhmm(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * ローカル時刻文字列をUTC分数に変換
 * @param {string} localTimeIso - ローカル時刻のISO文字列 (例: "2024-09-01T06:30:00")
 * @param {string} timezone - タイムゾーン識別子 (例: "Asia/Tokyo")
 * @returns {number} UTC分数 (0-1439)
 */
export function localTimeToUTCMinutes(localTimeIso, timezone) {
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

    // タイムゾーンオフセット取得
    const utcOffsetHours = TIMEZONE_OFFSETS[timezone] || 0;

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
export function toUTCMinutes(hhmmIso, timezone = null) {
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
 * 国コードから国旗絵文字を取得
 */
export function getFlagEmoji(countryCode) {
  return FLAG_EMOJI_MAP[countryCode] || "🌍";
}

/**
 * 昼夜判定ロジック
 */
export function isDayTime(sunriseM, sunsetM, tMin, today) {
  // 極地特殊状況の確認
  const sunriseDate = today.sunrise;
  const sunsetDate = today.sunset;
  const sunriseDay = new Date(sunriseDate).getUTCDate();
  const sunsetDay = new Date(sunsetDate).getUTCDate();

  // 極地特殊状況の処理
  if (sunriseM === 0 && sunsetM === 0) {
    if (sunsetDay > sunriseDay) {
      // McMurdo型：sunrise 00:00, sunset 翌日00:00 = 白夜 (24時間昼間)
      return true;
    } else {
      // Ilulissat型：sunrise 00:00, sunset 同日00:00 = 極夜 (24時間夜間)
      return false;
    }
  } else if (sunriseM === sunsetM) {
    // その他の同値状況、データ異常の可能性、デフォルト点灯
    return false;
  } else if (sunriseM > sunsetM) {
    // 日付跨ぎ状況：sunrise > sunset (例：東京 20:12 UTC > 09:10 UTC)
    return tMin >= sunriseM || tMin <= sunsetM;
  } else {
    // 正常ケース：sunrise < sunset (例：ロンドン 05:30 < 18:30)
    // 昼間時刻：sunriseM <= tMin <= sunsetM
    return tMin >= sunriseM && tMin <= sunsetM;
  }
}

/**
 * 国選択肢を更新
 */
export function updateCountryOptions(countries) {
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
