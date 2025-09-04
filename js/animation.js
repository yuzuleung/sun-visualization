/**
 * アニメーション制御とレンダリング
 */

import { CONFIG } from "./config.js";
import { ymdFromYearDay, hhmm, toUTCMinutes, isDayTime } from "./utils.js";
import { getD3Elements } from "./map-renderer.js";

// アニメーション状態
let playing = false;
let yearPlaying = false;
let frameReq = null;
let yearFrameReq = null;

/**
 * メインレンダリング関数
 */
export function render(
  CITY_BANK,
  currentData,
  countrySel,
  yearSel,
  daySlider,
  timeSlider,
  dayLabel,
  timeLabel
) {
  const cc = countrySel.value;
  const year = +yearSel.value;
  const day = +daySlider.value; // 1..365
  const tMin = +timeSlider.value; // 0..1439

  // UI更新
  dayLabel.textContent = `Day ${day} (${ymdFromYearDay(year, day)})`;
  timeLabel.textContent = `${hhmm(tMin)} UTC`;

  const cities =
    cc === "ALL" ? CITY_BANK : CITY_BANK.filter((c) => c.country === cc);

  const { gCities } = getD3Elements();

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

    // 昼夜判定
    const isDaytime = isDayTime(sunriseM, sunsetM, tMin, today);
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
    const next = (+timeSlider.value + CONFIG.TIME_STEP) % 1440;
    timeSlider.value = next;
    frameReq = requestAnimationFrame(() =>
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
  }
}

/**
 * 年間アニメーションレンダリング関数
 */
export function renderYearAnimation(
  CITY_BANK,
  currentData,
  countrySel,
  yearSel,
  daySlider,
  timeSlider,
  dayLabel,
  timeLabel
) {
  const currentDay = +daySlider.value;

  // 現在状態を正常にレンダリング
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

  if (yearPlaying) {
    // フレーム毎に1日進行、時刻は固定
    let nextDay = currentDay + 1;
    const currentYear = +yearSel.value;
    const maxDay =
      currentYear === 2025
        ? CONFIG.YEAR_2025_MAX_DAY
        : CONFIG.NORMAL_YEAR_MAX_DAY;

    if (nextDay > maxDay) {
      nextDay = 1; // ループ再生
    }

    daySlider.value = nextDay;

    // アニメーション継続、毎秒約12日の速度
    yearFrameReq = setTimeout(() => {
      requestAnimationFrame(() =>
        renderYearAnimation(
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
    }, CONFIG.YEAR_ANIMATION_SPEED);
  }
}

/**
 * アニメーション制御関数
 */
export function toggleAnimation(
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
) {
  playing = !playing;
  playBtn.textContent = playing ? "⏸ 停止" : "▶ 再生";

  // 年間再生を停止（実行中の場合）
  if (playing && yearPlaying) {
    yearPlaying = false;
    clearTimeout(yearFrameReq);
    yearPlayBtn.textContent = "📅 年間再生";
  }

  if (playing) {
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
  } else {
    cancelAnimationFrame(frameReq);
  }
}

/**
 * 年間アニメーション制御関数
 */
export function toggleYearAnimation(
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
) {
  yearPlaying = !yearPlaying;
  yearPlayBtn.textContent = yearPlaying ? "⏸ 年間停止" : "📅 年間再生";

  // 日時再生を停止（実行中の場合）
  if (yearPlaying && playing) {
    playing = false;
    cancelAnimationFrame(frameReq);
    playBtn.textContent = "▶ 再生";
  }

  if (yearPlaying) {
    renderYearAnimation(
      CITY_BANK,
      currentData,
      countrySel,
      yearSel,
      daySlider,
      timeSlider,
      dayLabel,
      timeLabel
    );
  } else {
    clearTimeout(yearFrameReq);
  }
}

/**
 * アニメーション状態のゲッター
 */
export function getAnimationState() {
  return { playing, yearPlaying };
}
