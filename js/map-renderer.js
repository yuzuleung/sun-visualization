/**
 * 地図描画とビジュアライゼーション
 */

import { CONFIG, API_URLS } from "./config.js";

let svg, gMap, gCities, projection, geoPath;

/**
 * 地図初期化
 */
export async function initMap() {
  try {
    const world = await d3.json(API_URLS.WORLD_TOPO);
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
    console.warn("地図データの読み込みに失敗しました:", error);
  }
}

/**
 * D3要素を初期化
 */
export function initD3Elements() {
  svg = d3.select("#map");
  gMap = svg.append("g").attr("id", "countries");
  gCities = svg.append("g").attr("id", "cities-layer");
  projection = d3
    .geoNaturalEarth1()
    .fitSize(CONFIG.MAP_SIZE, { type: "Sphere" });
  geoPath = d3.geoPath(projection);

  return { svg, gMap, gCities, projection, geoPath };
}

/**
 * 都市マーカーを描画
 */
export function drawCityMarkers(cities) {
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

/**
 * D3要素のゲッター関数
 */
export function getD3Elements() {
  return { svg, gMap, gCities, projection, geoPath };
}
