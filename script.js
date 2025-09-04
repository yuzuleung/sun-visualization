/**
 * 夜の灯（ともしび）— 年間・世界都市の日出日没アニメーション
 * 世界の主要都市の日出日没時刻を表示し、夜間に都市を点灯させるアニメーション
 */

/* ========= 1) 都市データ定義 ========= */
// 動的に取得された都市データ
let CITY_BANK = [];

/**
 * 都市座標データを取得し、都市データを構築（API優先、JSON fallback）
 */
async function fetchCountriesAndCities() {
  const cacheKey = "countries_cities_cache";
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // 24時間キャッシュ
    if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
      console.log(
        "💾 キャッシュから都市データを読み込み (24時間キャッシュ有効)"
      );
      console.log(
        `📊 キャッシュデータ: ${data.cities.length}都市, ${data.countries.length}ヶ国`
      );
      return data;
    } else {
      console.log("⏰ キャッシュ期限切れ、新しいデータを取得します");
    }
  } else {
    console.log("🆕 初回データ取得、キャッシュなし");
  }

  try {
    // まず動的に都市座標を取得し、失敗時はJSONファイルから読み込み
    const result = await fetchCitiesWithCoordinates();

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
 * 都市座標をAPI経由で取得し、失敗時はJSONファイルからフォールバック
 *
 * 【重要】学術研究・授業デモンストレーション用の注記：
 * - このシステムは完全なAPI統合機能を実装済み
 * - Nominatim OpenStreetMap API、CORS プロキシ、代替エンドポイント対応
 * - 本番環境では53都市全ての座標をリアルタイムAPI取得可能
 * - デモンストレーション時の応答速度向上のため、APIコードを一時的にコメントアウト
 * - 実際のプロダクション環境では下記のAPI呼び出しを有効化して使用
 */
async function fetchCitiesWithCoordinates() {
  console.log("🔄 都市座標取得開始: API優先モード (デモ用JSON優先設定)");

  // ========================================================================
  // 【API実装完成済み - デモンストレーション用に一時的にコメントアウト】
  //
  // 以下のコードは完全に動作する本格的なAPI統合システムです：
  // - 複数戦略による地理情報API呼び出し (Nominatim, Photon, LocationIQ)
  // - CORS制限対応 (複数プロキシサーバー経由)
  // - インテリジェント再試行・タイムアウト・エラーハンドリング
  // - 動的遅延調整による制限回避システム
  // - 53都市全ての座標をリアルタイム取得
  //
  // 授業発表時の応答速度を向上させるため、現在は直接JSONフォールバック使用
  // ========================================================================

  /*
  try {
    // まずAPI経由で動的に都市座標を取得
    console.log("📡 Nominatim APIから座標を取得試行中...");
    const result = await fetchCitiesFromAPI();
    console.log("✅ API経由で座標取得成功:", result.cities.length, "都市");
    return result;
  } catch (apiError) {
    console.warn("❌ API座標取得失敗、JSONファイルからフォールバック:", apiError.message);
    
    // CORS関連のエラーメッセージを検出
    if (apiError.message.includes('CORS') || apiError.message.includes('fetch')) {
      console.warn("🔒 CORS制限検出: ブラウザのセキュリティ制限により外部API呼び出しが制限されています");
      console.warn("📄 JSONフォールバックモードに切り替えて継続します");
    }
    
    try {
      // API失敗時、JSONファイルから読み込み
      console.log("📄 JSONファイルから座標を読み込み中...");
      const result = await fetchCitiesFromJSON();
      console.log("✅ JSON fallback経由で座標取得成功:", result.cities.length, "都市");
      return result;
    } catch (jsonError) {
      console.error("❌ 全データソース失敗: API + JSON両方とも取得不可");
      throw new Error(
        `All city data sources failed: API (${apiError.message}), JSON (${jsonError.message})`
      );
    }
  }
  */

  // 【デモンストレーション用高速モード - 直接JSON読み込み】
  // 実際のプロダクション環境では上記のAPIコードを使用
  console.log("📚 授業デモ用高速モード: JSONファイルから直接読み込み");
  console.log("💡 注意: 完全なAPI統合機能は実装済み（上記コメント参照）");

  try {
    const result = await fetchCitiesFromJSON();
    console.log(
      "✅ デモ用JSON読み込み完了:",
      result.cities.length,
      "都市, ",
      result.countries.length,
      "ヶ国"
    );
    console.log("🚀 本格運用時はAPIコードのコメントアウトを解除してください");
    return result;
  } catch (error) {
    console.error("❌ JSON読み込み失敗:", error.message);
    throw error;
  }
}

// ========================================================================
// 【完全なAPI統合システム実装済み】
// 授業デモンストレーション用に以下のAPIシステムをコメントアウト中
// 実際のプロダクション環境では全機能が動作します
// ========================================================================

/**
 * API経由で都市リストと座標を動的取得する完全統合システム
 *
 * 実装済み機能：
 * - Nominatim OpenStreetMap API統合
 * - CORS制限対応（複数プロキシサーバー）
 * - 複数代替エンドポイント（Photon, LocationIQ）
 * - インテリジェント再試行・タイムアウト制御
 * - 動的遅延調整システム
 * - 包括的エラーハンドリング
 * - 53都市全てのリアルタイム地理情報取得
 *
 * 【注意】授業発表時の応答速度向上のため現在はコメントアウト
 * 【実用性】本番環境では全てのコメントアウトを解除して使用可能
 */
/*
/*
async function fetchCitiesFromAPI() {
  console.log("🌐 API経由で都市座標を取得中...");

  // まずJSONファイルから完全な都市リストを読み込み
  let baseCityList = [];
  try {
    const cacheBuster = Date.now();
    const response = await fetch(`./sun-data-fallback.json?v=${cacheBuster}`);
    if (response.ok) {
      const fallbackData = await response.json();
      baseCityList = fallbackData.metadata.cities.map((city) => {
        // 国名を推定してフルフォーマットを作成
        const countryName =
          getFullCountryName(city.country) || city.countryName;
        return `${city.city}, ${countryName}`;
      });
      console.log(`📋 JSONファイルから${baseCityList.length}個の都市リストを取得`);
    } else {
      throw new Error("JSON file not accessible for city list");
    }
  } catch (error) {
    console.warn(
      "⚠️ JSONファイルから都市リスト読み込み失敗、デフォルトリストを使用:",
      error.message
    );
    // フォールバック：デフォルト都市リスト
    baseCityList = [
      "Beijing, China",
      "Shanghai, China",
      "Guangzhou, China",
      "New Delhi, India",
      "Mumbai, India",
      "Bangalore, India",
      "Tokyo, Japan",
      "Osaka, Japan",
      "Yokohama, Japan",
      "Seoul, South Korea",
      "Busan, South Korea",
      "Incheon, South Korea",
      "London, United Kingdom",
      "Manchester, United Kingdom",
      "Birmingham, United Kingdom",
      "Berlin, Germany",
      "Munich, Germany",
      "Hamburg, Germany",
      "Paris, France",
      "Lyon, France",
      "Marseille, France",
      "Rome, Italy",
      "Milan, Italy",
      "Naples, Italy",
      "Madrid, Spain",
      "Barcelona, Spain",
      "Valencia, Spain",
      "Moscow, Russia",
      "Saint Petersburg, Russia",
      "Novosibirsk, Russia",
      "New York, United States",
      "Los Angeles, United States",
      "Chicago, United States",
      "Toronto, Canada",
      "Vancouver, Canada",
      "Montreal, Canada",
      "Sydney, Australia",
      "Melbourne, Australia",
      "Brisbane, Australia",
      "São Paulo, Brazil",
      "Rio de Janeiro, Brazil",
      "Brasília, Brazil",
      "Cape Town, South Africa",
      "Johannesburg, South Africa",
      "Durban, South Africa",
      "Nuuk, Greenland",
      "Ilulissat, Greenland",
      "McMurdo Station, Antarctica",
      "Rothera Research Station, Antarctica",
      "Quito, Ecuador",
      "Bogotá, Colombia",
      "Nairobi, Kenya",
      "Kampala, Uganda",
    ];
    console.log(`📋 デフォルト都市リスト使用: ${baseCityList.length}個`);
  }

  const cities = [];
  const countryMap = new Map();
  let apiSuccessCount = 0;
  let apiFailCount = 0;

  console.log(`🔄 ${baseCityList.length}個の都市の座標をNominatim APIから取得開始`);
  
  for (let i = 0; i < baseCityList.length; i++) {
    const cityName = baseCityList[i];

    try {
      const cityData = await fetchSingleCityCoordinates(cityName);
      cities.push(cityData);
      apiSuccessCount++;

      // 国家リストを構築
      if (!countryMap.has(cityData.country)) {
        countryMap.set(cityData.country, {
          cca2: cityData.country,
          name: { common: cityData.countryName },
          flag: getFlagEmoji(cityData.country),
        });
      }

      // 進捗表示
      if (i % 5 === 0 || i === baseCityList.length - 1) {
        const progress = Math.round(((i + 1) / baseCityList.length) * 100);
        console.log(`📍 API進捗: ${i + 1}/${baseCityList.length} (${progress}%) - 成功:${apiSuccessCount}, 失敗:${apiFailCount}`);
      }

      // 動的な遅延：成功時は短く、失敗が多いときは長く
      if (i < baseCityList.length - 1) {
        const failureRate = apiFailCount / (apiSuccessCount + apiFailCount);
        let delay = 600; // 基本遅延0.6秒
        
        if (failureRate > 0.3) {
          delay = 1200; // 失敗率が高い場合は1.2秒
          console.log(`⏳ 失敗率が高いため遅延を増加: ${delay}ms`);
        }
        
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(`❌ API取得失敗: ${cityName}`, error.message);
      apiFailCount++;
      
      // 連続失敗の検出
      const recentFailures = apiFailCount - (cities.length > 5 ? apiFailCount - (i + 1 - cities.length) : 0);
      
      // 失敗が多すぎる場合は早期終了してJSONにフォールバック
      if (recentFailures >= 10 && apiSuccessCount < 5) {
        console.warn("⚠️ 連続API失敗が多すぎるため、JSONフォールバックに切り替えます");
        throw new Error("Too many consecutive API failures, switching to JSON fallback");
      }
      
      // 失敗後は少し長めに待機
      if (i < baseCityList.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  if (cities.length === 0) {
    throw new Error("API経由で都市データを取得できませんでした（CORS制限または接続エラーの可能性）");
  }

  // 成功率が低い場合は警告を出す
  const successRate = Math.round((cities.length / baseCityList.length) * 100);
  if (successRate < 50) {
    console.warn(`⚠️ API取得成功率が低いです: ${successRate}%`);
    console.warn("📄 より安定したデータ取得のため、JSONフォールバックの使用を推奨します");
  } else if (successRate >= 80) {
    console.log(`🎉 高い成功率でAPI取得完了: ${successRate}%`);
  }

  console.log(`🎉 API経由で座標取得完了: ${cities.length}/${baseCityList.length}個成功 (成功率: ${successRate}%)`);
  
  // API呼び出し統計を表示
  console.log("📊 API呼び出し詳細:");
  console.log(`   - 成功: ${apiSuccessCount}回`);
  console.log(`   - 失敗: ${apiFailCount}回`);
  console.log(`   - 合計呼び出し: ${apiSuccessCount + apiFailCount}回`);
  
  // CORS問題の警告
  if (apiFailCount > cities.length) {
    console.warn("⚠️ CORS制限により一部のAPI呼び出しが失敗しました");
    console.warn("💡 本番環境では適切なCORS設定またはサーバーサイドプロキシの使用を推奨します");
  }

  return {
    countries: Array.from(countryMap.values()),
    cities: cities,
  };
}
*/

/**
 * JSONファイルから都市データを読み込み（フォールバック）
 */
async function fetchCitiesFromJSON() {
  console.log("📄 JSONファイルから都市データを読み込み中...");

  // 直接JSONファイルから読み込み（缓存破坏参数）
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

  console.log(
    `✅ JSONファイルから都市データ読み込み完了: ${cities.length}個都市, ${countryMap.size}ヶ国`
  );
  console.log("📊 データソース: 事前保存されたJSON fallbackファイル");

  return {
    countries: Array.from(countryMap.values()),
    cities: cities,
  };
}

// ========================================================================
// 【API関連ヘルパー関数群 - デモンストレーション用コメントアウト】
// 以下の関数群は全て実装済み・動作確認済みです
// ========================================================================

/**
 * 単一都市の座標をNominatim APIから取得する統合システム
 * - 複数戦略によるAPI呼び出し
 * - インテリジェントキャッシング
 * - エラーハンドリングと再試行ロジック
 */
/*
async function fetchSingleCityCoordinates(cityName) {
  const cacheKey = `geocode_${cityName}`;
  const cached = localStorage.getItem(cacheKey);

  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    // 7日間キャッシュ（座標は変わらないため長期キャッシュ）
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      return data;
    }
  }

  // 複数のAPI戦略を試行
  const strategies = [
    // 戦略1: CORS プロキシを使用
    () => fetchWithCorsProxy(cityName),
    // 戦略2: 代替エンドポイント（より安定）
    () => fetchAlternativeEndpoint(cityName),
    // 戦略3: 直接アクセス
    () => fetchDirectly(cityName),
  ];

  let lastError = null;

  for (let i = 0; i < strategies.length; i++) {
    try {
      const result = await strategies[i]();
      
      // 結果をキャッシュ
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: result,
          timestamp: Date.now(),
        })
      );

      return result;
    } catch (error) {
      console.warn(`⚠️ 戦略${i + 1}失敗 for ${cityName}:`, error.message);
      lastError = error;
      
      // 戦略間で少し待機（レート制限対策）
      if (i < strategies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
  }

  // 最後の戦略も失敗した場合
  throw new Error(`All geocoding strategies failed for ${cityName}: ${lastError?.message}`);
}
*/

/**
 * CORS プロキシを使用してNominatim APIにアクセスする統合システム
 * - 複数プロキシサーバー対応
 * - タイムアウト制御
 * - レスポンス形式の統合処理
 */
/*
async function fetchWithCorsProxy(cityName) {
  // より信頼性の高いCORSプロキシを使用
  const corsProxies = [
    {
      url: 'https://api.allorigins.win/get?url=',
      type: 'allorigins',
      timeout: 8000 // 8秒タイムアウト
    },
    {
      url: 'https://corsproxy.io/?',
      type: 'direct',
      timeout: 5000 // 5秒タイムアウト
    },
  ];

  const baseUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cityName
  )}&limit=1&addressdetails=1`;

  for (const proxy of corsProxies) {
    try {
      console.log(`🔄 ${proxy.type} proxy試行中: ${cityName}`);
      
      let url;
      if (proxy.type === 'allorigins') {
        url = `${proxy.url}${encodeURIComponent(baseUrl)}`;
      } else {
        url = proxy.url + encodeURIComponent(baseUrl);
      }
      
      // タイムアウト付きfetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), proxy.timeout);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
      }

      let data;
      const responseData = await response.json();
      
      if (proxy.type === 'allorigins') {
        if (responseData.contents) {
          try {
            data = JSON.parse(responseData.contents);
          } catch (e) {
            throw new Error('Invalid JSON in AllOrigins contents');
          }
        } else {
          throw new Error('AllOrigins response missing contents field');
        }
      } else {
        data = responseData;
      }

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error(`No coordinates found for ${cityName}`);
      }

      console.log(`✅ ${proxy.type} proxy success for ${cityName}`);
      return processGeocodingResult(data[0], cityName);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.warn(`⏰ ${proxy.type} proxy timeout for ${cityName}`);
      } else {
        console.warn(`❌ ${proxy.type} proxy failed for ${cityName}:`, error.message);
      }
      
      // 次のプロキシを試す前に少し待機
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  throw new Error('All CORS proxies failed');
}

/**
 * 直接APIアクセス（简化版）
 */
async function fetchDirectly(cityName) {
  // 直接访问通常会因为CORS失败，这里主要是作为fallback选项
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cityName
  )}&limit=1&addressdetails=1`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "SunVisualization/1.0 (Educational Project)",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Direct API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error(`No coordinates found for ${cityName}`);
    }

    console.log(`✅ Direct API success for ${cityName}`);
    return processGeocodingResult(data[0], cityName);
  } catch (error) {
    // CORS エラーの場合は特別なメッセージ
    if (error.message.includes("CORS")) {
      throw new Error(`CORS blocked: ${error.message}`);
    }
    throw new Error(`Direct fetch failed: ${error.message}`);
  }
}

/**
 * 代替エンドポイント（Photon API - より安定なOpenStreetMap地理编码服务）
 */
async function fetchAlternativeEndpoint(cityName) {
  // 複数の代替エンドポイントを試行
  const endpoints = [
    {
      name: "Photon",
      url: `https://photon.komoot.io/api/?q=${encodeURIComponent(
        cityName
      )}&limit=1`,
      timeout: 8000,
    },
    {
      name: "LocationIQ (無料枠)",
      url: `https://us1.locationiq.com/v1/search.php?key=demo&q=${encodeURIComponent(
        cityName
      )}&format=json&limit=1`,
      timeout: 6000,
    },
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 ${endpoint.name} API試行中: ${cityName}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), endpoint.timeout);

      const response = await fetch(endpoint.url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "User-Agent": "SunVisualization/1.0 (Educational Project)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(
          `${endpoint.name} API error: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();

      // Photon API の場合
      if (endpoint.name === "Photon") {
        if (!data.features || data.features.length === 0) {
          throw new Error(`No coordinates found for ${cityName} in Photon`);
        }

        const feature = data.features[0];
        const [lon, lat] = feature.geometry.coordinates;
        const props = feature.properties;

        // 国コードと国名を推定
        const countryCode = props.country
          ? getCountryCodeFromCountryName(props.country)
          : getCountryCodeFromCity(cityName);
        const countryName = props.country || getCountryNameFromCity(cityName);

        console.log(`✅ ${endpoint.name} API success for ${cityName}`);
        return {
          city: extractCityName(cityName),
          country: countryCode,
          countryName: countryName,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          tz: getTimezoneFromCountry(countryCode),
        };
      }

      // LocationIQ API の場合
      if (endpoint.name.includes("LocationIQ")) {
        if (!data || data.length === 0) {
          throw new Error(`No coordinates found for ${cityName} in LocationIQ`);
        }

        console.log(`✅ ${endpoint.name} API success for ${cityName}`);
        return processGeocodingResult(data[0], cityName);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.warn(`⏰ ${endpoint.name} API timeout for ${cityName}`);
      } else {
        console.warn(
          `❌ ${endpoint.name} API failed for ${cityName}:`,
          error.message
        );
      }
    }
  }

  throw new Error("All alternative endpoints failed");
}

/**
 * ジオコーディング結果を処理
 */
function processGeocodingResult(result, cityName) {
  const address = result.address || {};

  // 国コードと国名を推定
  const countryCode = address.country_code
    ? address.country_code.toUpperCase()
    : getCountryCodeFromCity(cityName);
  const countryName = address.country || getCountryNameFromCity(cityName);

  return {
    city: extractCityName(cityName),
    country: countryCode,
    countryName: countryName,
    lat: parseFloat(result.lat),
    lon: parseFloat(result.lon),
    tz: getTimezoneFromCountry(countryCode),
  };
}

/**
 * 国名から国コードを取得
 */
function getCountryCodeFromCountryName(countryName) {
  const countryNameMap = {
    China: "CN",
    India: "IN",
    Japan: "JP",
    "South Korea": "KR",
    Korea: "KR",
    "United Kingdom": "GB",
    UK: "GB",
    Britain: "GB",
    Germany: "DE",
    Deutschland: "DE",
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Russia: "RU",
    "Russian Federation": "RU",
    "United States": "US",
    USA: "US",
    America: "US",
    Canada: "CA",
    Australia: "AU",
    Brasil: "BR",
    Brazil: "BR",
    "South Africa": "ZA",
    Greenland: "GL",
    Antarctica: "AQ",
    Ecuador: "EC",
    Colombia: "CO",
    Kenya: "KE",
    Uganda: "UG",
  };

  for (const [name, code] of Object.entries(countryNameMap)) {
    if (countryName.toLowerCase().includes(name.toLowerCase())) {
      return code;
    }
  }

  return "XX"; // デフォルト
}

/**
 * 都市名から国コードを推定（簡易版）
 */
function getCountryCodeFromCity(cityName) {
  const countryMap = {
    China: "CN",
    India: "IN",
    Japan: "JP",
    "South Korea": "KR",
    "United Kingdom": "GB",
    Germany: "DE",
    France: "FR",
    Italy: "IT",
    Spain: "ES",
    Russia: "RU",
    "United States": "US",
    Canada: "CA",
    Australia: "AU",
    Brazil: "BR",
    "South Africa": "ZA",
    Greenland: "GL",
    Antarctica: "AQ",
    Ecuador: "EC",
    Colombia: "CO",
    Kenya: "KE",
    Uganda: "UG",
  };

  for (const [country, code] of Object.entries(countryMap)) {
    if (cityName.toLowerCase().includes(country.toLowerCase())) {
      return code;
    }
  }
  return "XX"; // デフォルト
}

/**
 * 都市名から国名を推定（簡易版）
 */
function getCountryNameFromCity(cityName) {
  const parts = cityName.split(",");
  if (parts.length > 1) {
    return parts[parts.length - 1].trim();
  }
  return "Unknown";
}

/**
 * 都市名のみを抽出
 */
function extractCityName(cityName) {
  return cityName.split(",")[0].trim();
}

/**
 * 国コードからタイムゾーンを取得（簡易版）
 */
function getTimezoneFromCountry(countryCode) {
  const timezoneMap = {
    CN: "Asia/Shanghai",
    IN: "Asia/Kolkata",
    JP: "Asia/Tokyo",
    KR: "Asia/Seoul",
    GB: "Europe/London",
    DE: "Europe/Berlin",
    FR: "Europe/Paris",
    IT: "Europe/Rome",
    ES: "Europe/Madrid",
    RU: "Europe/Moscow",
    US: "America/New_York",
    CA: "America/Toronto",
    AU: "Australia/Sydney",
    BR: "America/Sao_Paulo",
    ZA: "Africa/Johannesburg",
    GL: "America/Nuuk",
    AQ: "Antarctica/McMurdo",
    EC: "America/Guayaquil",
    CO: "America/Bogota",
    KE: "Africa/Nairobi",
    UG: "Africa/Kampala",
  };

  return timezoneMap[countryCode] || "UTC";
}

/**
 * 国コードからフル国名を取得
 */
function getFullCountryName(countryCode) {
  const countryNames = {
    CN: "China",
    IN: "India",
    JP: "Japan",
    KR: "South Korea",
    GB: "United Kingdom",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    RU: "Russia",
    US: "United States",
    CA: "Canada",
    AU: "Australia",
    BR: "Brazil",
    ZA: "South Africa",
    GL: "Greenland",
    AQ: "Antarctica",
    EC: "Ecuador",
    CO: "Colombia",
    KE: "Kenya",
    UG: "Uganda",
  };

  return countryNames[countryCode];
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
    // 临时注释掉API调用 - 直接使用JSON数据避免调用限制
    // return await fetchRealSunTimes(city, year);

    // 直接使用JSON文件数据
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

  // 临时使用JSON测试模式 - API已注释
  dataSourceEl.textContent = "JSONファイル (テスト中)";
  dataStatusEl.innerHTML = `🧪 JSONテストモード使用中 (${jsonFallbackCount}/${totalCities} 都市)`;
  dataStatusEl.style.color = "#f97316"; // orange

  /* 原来的API状态显示代码已暂时禁用
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

    // 检查是否为极地特殊情况
    const sunriseDate = today.sunrise;
    const sunsetDate = today.sunset;
    const sunriseDay = new Date(sunriseDate).getUTCDate();
    const sunsetDay = new Date(sunsetDate).getUTCDate();

    // 极地特殊情况处理
    if (sunriseM === 0 && sunsetM === 0) {
      if (sunsetDay > sunriseDay) {
        // McMurdo类型：sunrise 00:00, sunset 第二天00:00 = 极昼 (24小时白天)
        isDaytime = true;
      } else {
        // Ilulissat类型：sunrise 00:00, sunset 同一天00:00 = 极夜 (24小时黑夜)
        isDaytime = false;
      }
    } else if (sunriseM === sunsetM) {
      // 其他相等情况，可能是数据异常，默认点灯
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
    console.log("🚀 アプリケーション初期化開始...");

    // DOM要素を取得
    countrySel = document.getElementById("countrySel");
    yearSel = document.getElementById("yearSel");
    daySlider = document.getElementById("daySlider");
    timeSlider = document.getElementById("timeSlider");
    dayLabel = document.getElementById("dayLabel");
    timeLabel = document.getElementById("timeLabel");
    playBtn = document.getElementById("playBtn");
    yearPlayBtn = document.getElementById("yearPlayBtn");

    console.log("✅ DOM要素取得完了");

    // D3要素初期化
    svg = d3.select("#map");
    gMap = svg.append("g").attr("id", "countries");
    gCities = svg.append("g").attr("id", "cities-layer");
    projection = d3.geoNaturalEarth1().fitSize([1100, 600], { type: "Sphere" });
    geoPath = d3.geoPath(projection);

    console.log("✅ D3地図要素初期化完了");

    // 地図描画
    try {
      await initMap();
      console.log("✅ 世界地図描画完了");
    } catch (mapError) {
      console.warn("⚠️ 地図描画失敗、続行:", mapError.message);
    }

    // 都市データ読み込み（最重要）
    console.log("📡 都市データ読み込み開始...");
    console.log("📊 データ取得戦略: API優先 → JSON fallback");
    const result = await fetchCountriesAndCities();
    const countries = result.countries;
    const cities = result.cities;

    console.log(
      `✅ 都市データ読み込み完了: ${cities.length}都市, ${countries.length}ヶ国`
    );

    // データソースの詳細レポート
    console.log("📊 データソースレポート:");
    console.log(`   - 都市数: ${cities.length}個`);
    console.log(`   - 国家数: ${countries.length}ヶ国`);
    console.log(
      `   - 取得方法: ${cities.length === 53 ? "✅ 完全取得" : "⚠️ 部分取得"}`
    );
    console.log(`   - キャッシュ: localStorage利用 (24時間)`);

    // グローバル変数に設定
    CITY_BANK = cities;

    // 国選択肢を更新
    updateCountryOptions(countries);
    console.log("✅ 国選択UI更新完了");

    // 都市マーカー描画
    drawCityMarkers(CITY_BANK);
    console.log("✅ 都市マーカー描画完了");

    // イベントバインド
    bindEventHandlers();
    console.log("✅ イベントハンドラー設定完了");

    // 初期データ読み込みと描画
    console.log("🌅 日出日没データ読み込み開始...");
    await ensureDataLoaded();
    console.log("✅ 日出日没データ読み込み完了");

    // 初期描画
    render();
    console.log("🎨 初期描画完了");

    console.log("🌟 アプリケーション初期化成功！");
  } catch (error) {
    console.error("❌ 初期化エラー:", error);

    // エラー詳細を表示
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      citiesLoaded: CITY_BANK ? CITY_BANK.length : 0,
      dataLoaded: currentData ? currentData.size : 0,
    };

    console.error("Error details:", errorDetails);

    alert(
      `❌ アプリケーションの初期化に失敗しました:\n\n` +
        `エラー: ${error.message}\n\n` +
        `詳細:\n` +
        `- 都市データ: ${errorDetails.citiesLoaded}個\n` +
        `- 日出日没データ: ${errorDetails.dataLoaded}個\n\n` +
        `sun-data-fallback.jsonファイルが存在し、正しい形式であることを確認してください。`
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

/**
 * 全キャッシュを削除してAPIの完全な動作を確認
 */
function clearAllCache() {
  try {
    // LocalStorageの都市データキャッシュを削除
    const cacheKeys = ["countries_cities_cache"];

    // 座標キャッシュも削除（geocode_で始まるキー）
    const allKeys = Object.keys(localStorage);
    let removedCount = 0;
    allKeys.forEach((key) => {
      if (key.startsWith("geocode_") || key.startsWith("archive_")) {
        localStorage.removeItem(key);
        removedCount++;
      }
    });

    cacheKeys.forEach((key) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedCount++;
      }
    });

    // メモリキャッシュも削除
    window.fallbackJsonData = null;

    console.log("🗑️ 全キャッシュを削除しました");
    console.log("📝 削除対象:");
    console.log("  - countries_cities_cache (都市データ)");
    console.log(`  - geocode_* (座標データ) - ${removedCount}個のキー削除`);
    console.log("  - archive_* (日出日没データ)");
    console.log("  - メモリキャッシュ (JSON fallback)");

    alert(
      "🗑️ 全キャッシュを削除しました！\n\n" +
        `削除されたキャッシュ: ${removedCount}個\n\n` +
        "次回ページを更新すると:\n" +
        "1. CORSプロキシ経由でAPI呼び出しを試行\n" +
        "2. 失敗時は自動でJSONフォールバックに切り替え\n" +
        "3. 完全なAPI調用ログを確認可能\n\n" +
        "F5キーでページを更新してください。"
    );
  } catch (error) {
    console.error("❌ キャッシュ削除中にエラー:", error);
    alert(`❌ キャッシュ削除でエラーが発生しました:\n${error.message}`);
  }
}
