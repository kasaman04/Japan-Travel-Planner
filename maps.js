// Google Maps関連の機能
let map = null;
let placesService = null;
let geocoder = null;
let currentMarkers = [];
let selectedPlaces = [];

// Google Maps APIが読み込まれた後に呼び出される関数
function initializeGoogleMaps() {
    console.log('Google Maps API初期化中...');
    
    if (!checkApiKey()) {
        showApiKeyWarning();
        return;
    }
    
    // 地図を初期化
    initMap();
    
    // Places ServiceとGeocoderを初期化
    placesService = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
    
    console.log('Google Maps API初期化完了');
}

// 地図を初期化
function initMap() {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;
    
    map = new google.maps.Map(mapElement, {
        center: CONFIG.DEFAULT_CENTER,
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });
}

// 店舗を検索する関数
async function searchPlaces(formData) {
    if (!placesService || !geocoder) {
        alert('Google Maps APIが初期化されていません');
        return;
    }
    
    try {
        // 地域の座標を取得
        const location = await getLocationCoordinates(formData.prefecture, formData.city);
        if (!location) {
            throw new Error('指定された地域の座標を取得できませんでした');
        }
        
        // 地図の中心を移動
        map.setCenter(location);
        map.setZoom(14);
        
        // 既存のマーカーをクリア
        clearMarkers();
        
        // 各カテゴリで検索を実行
        const allPlaces = [];
        const searchRadius = CONFIG.SEARCH_RADIUS[formData.transport] || 5000;
        
        for (const activity of formData.activities) {
            const places = await searchPlacesByType(location, activity, searchRadius);
            allPlaces.push(...places);
        }
        
        // 重複を削除
        const uniquePlaces = removeDuplicatePlaces(allPlaces);
        
        // レビュー条件でフィルタリング
        const filteredPlaces = filterPlacesByReviews(uniquePlaces);
        
        // 結果を表示
        displaySearchResults(filteredPlaces);
        
        console.log(`検索完了: ${filteredPlaces.length}件の店舗が見つかりました`);
        
    } catch (error) {
        console.error('検索エラー:', error);
        alert('検索中にエラーが発生しました: ' + error.message);
    }
}

// 地域の座標を取得
function getLocationCoordinates(prefecture, city) {
    return new Promise((resolve, reject) => {
        const address = `${prefecture} ${city}`;
        
        geocoder.geocode({ address: address }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                resolve({
                    lat: location.lat(),
                    lng: location.lng()
                });
            } else {
                reject(new Error(`地域の座標を取得できませんでした: ${address}`));
            }
        });
    });
}

// タイプ別に店舗を検索
function searchPlacesByType(location, type, radius) {
    return new Promise((resolve, reject) => {
        const request = {
            location: location,
            radius: radius,
            type: type,
            openNow: false
        };
        
        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                resolve(results || []);
            } else {
                console.warn(`${type}の検索でエラー:`, status);
                resolve([]); // エラーでも空配列を返して継続
            }
        });
    });
}

// 重複する店舗を削除
function removeDuplicatePlaces(places) {
    const uniqueMap = new Map();
    
    places.forEach(place => {
        if (!uniqueMap.has(place.place_id)) {
            uniqueMap.set(place.place_id, place);
        }
    });
    
    return Array.from(uniqueMap.values());
}

// レビュー条件でフィルタリング
function filterPlacesByReviews(places) {
    return places.filter(place => {
        const rating = place.rating || 0;
        const reviewCount = place.user_ratings_total || 0;
        
        return rating >= CONFIG.PLACES_CONFIG.minRating && 
               reviewCount >= CONFIG.PLACES_CONFIG.minReviews;
    });
}

// 検索結果を表示
function displaySearchResults(places) {
    // 結果セクションを表示
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'block';
    }
    
    // ステップインジケーターを更新
    updateStepIndicator(2); // "店舗検索"をアクティブに
    
    // 地図にマーカーを追加
    addMarkersToMap(places);
    
    // 店舗リストを表示
    displayPlacesList(places);
}

// 地図にマーカーを追加
function addMarkersToMap(places) {
    clearMarkers();
    
    places.forEach((place, index) => {
        const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            label: String(index + 1)
        });
        
        // マーカークリック時の情報ウィンドウ
        const infoWindow = new google.maps.InfoWindow({
            content: createInfoWindowContent(place)
        });
        
        marker.addListener('click', () => {
            infoWindow.open(map, marker);
        });
        
        currentMarkers.push(marker);
    });
}

// 情報ウィンドウの内容を作成
function createInfoWindowContent(place) {
    const rating = place.rating || 'N/A';
    const reviewCount = place.user_ratings_total || 0;
    const priceLevel = '¥'.repeat(place.price_level || 1);
    
    return `
        <div style="max-width: 200px;">
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">${place.name}</h3>
            <p style="margin: 5px 0; font-size: 12px;">⭐ ${rating} (${reviewCount}件のレビュー)</p>
            <p style="margin: 5px 0; font-size: 12px;">💰 ${priceLevel}</p>
            <p style="margin: 5px 0; font-size: 11px; color: #666;">${place.vicinity}</p>
        </div>
    `;
}

// 店舗リストを表示
function displayPlacesList(places) {
    const placesList = document.getElementById('placesList');
    if (!placesList) return;
    
    placesList.innerHTML = '';
    
    places.forEach((place, index) => {
        const card = createPlaceCard(place, index);
        placesList.appendChild(card);
    });
}

// 店舗カードを作成
function createPlaceCard(place, index) {
    const card = document.createElement('div');
    card.className = 'place-card';
    
    const rating = place.rating || 'N/A';
    const reviewCount = place.user_ratings_total || 0;
    const priceLevel = '¥'.repeat(place.price_level || 1);
    const photos = place.photos && place.photos.length > 0 ? place.photos[0].getUrl({ maxWidth: 200 }) : '';
    
    card.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 15px;">
            ${photos ? `<img src="${photos}" alt="${place.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">` : ''}
            <div style="flex: 1;">
                <h3>${place.name}</h3>
                <div class="rating">⭐ ${rating} (${reviewCount}件のレビュー)</div>
                <div style="margin: 5px 0; color: #666;">💰 ${priceLevel}</div>
                <div class="address">${place.vicinity}</div>
                <label style="display: flex; align-items: center; margin-top: 10px; cursor: pointer;">
                    <input type="checkbox" value="${place.place_id}" onchange="togglePlaceSelection(this, ${index})">
                    <span style="margin-left: 8px;">ルートに追加</span>
                </label>
            </div>
        </div>
    `;
    
    return card;
}

// 店舗選択の切り替え
function togglePlaceSelection(checkbox, index) {
    const placeId = checkbox.value;
    
    if (checkbox.checked) {
        // 店舗を選択リストに追加
        const place = currentMarkers[index];
        selectedPlaces.push({
            placeId: placeId,
            name: place.title,
            position: place.position
        });
    } else {
        // 店舗を選択リストから削除
        selectedPlaces = selectedPlaces.filter(place => place.placeId !== placeId);
    }
    
    console.log('選択された店舗:', selectedPlaces);
    
    // ルート作成セクションの表示/非表示
    updateRouteSection();
}

// ルートセクションの更新
function updateRouteSection() {
    const routeSection = document.getElementById('routeSection');
    const selectedPlacesDiv = document.getElementById('selectedPlaces');
    
    if (selectedPlaces.length > 0) {
        routeSection.style.display = 'block';
        updateStepIndicator(3); // "ルート作成"をアクティブに
        
        selectedPlacesDiv.innerHTML = `
            <p>選択された店舗 (${selectedPlaces.length}件):</p>
            <ul>
                ${selectedPlaces.map(place => `<li>${place.name}</li>`).join('')}
            </ul>
        `;
    } else {
        routeSection.style.display = 'none';
    }
}

// 既存のマーカーをクリア
function clearMarkers() {
    currentMarkers.forEach(marker => {
        marker.setMap(null);
    });
    currentMarkers = [];
}

// ステップインジケーターを更新
function updateStepIndicator(activeStep) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index < activeStep) {
            step.classList.add('completed');
        } else if (index === activeStep) {
            step.classList.add('active');
        }
    });
}

// APIキー未設定の警告を表示
function showApiKeyWarning() {
    const mapElement = document.getElementById('map');
    if (mapElement) {
        mapElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 8px;">
                <div style="text-align: center; padding: 20px;">
                    <h3 style="color: #dc3545; margin-bottom: 10px;">⚠️ APIキーが必要です</h3>
                    <p style="color: #666; margin: 10px 0;">Google Maps APIを使用するには、以下の手順でAPIキーを設定してください:</p>
                    <ol style="text-align: left; color: #666; max-width: 400px;">
                        <li>Google Cloud Consoleでプロジェクトを作成</li>
                        <li>Maps JavaScript API、Places API、Directions APIを有効化</li>
                        <li>APIキーを生成</li>
                        <li>config.jsファイルでAPIキーを設定</li>
                    </ol>
                    <p style="color: #28a745; font-weight: 600; margin-top: 15px;">月間200ドルの無料枠があります</p>
                </div>
            </div>
        `;
    }
}