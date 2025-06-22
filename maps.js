// Google Maps関連の機能
let map = null;
let placesService = null;
let geocoder = null;
let directionsService = null;
let directionsRenderer = null;
let currentMarkers = [];
let selectedPlaces = [];

// Google Maps APIが読み込まれた後に呼び出される関数
function initializeGoogleMaps() {
    console.log('Google Maps API初期化中...');
    
    if (!checkApiKey()) {
        showApiKeyWarning();
        return;
    }
    
    try {
        // 地図を初期化
        initMap();
        
        // Places ServiceとGeocoderを初期化
        placesService = new google.maps.places.PlacesService(map);
        geocoder = new google.maps.Geocoder();
        
        // Directions ServiceとRendererを初期化
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            draggable: true,
            suppressMarkers: false
        });
        directionsRenderer.setMap(map);
        
        console.log('Google Maps API初期化完了');
        console.log('PlacesService:', placesService);
        console.log('Geocoder:', geocoder);
        console.log('DirectionsService:', directionsService);
    } catch (error) {
        console.error('Google Maps API初期化エラー:', error);
        alert('Google Maps APIの初期化に失敗しました: ' + error.message);
    }
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
        const address = `${prefecture} ${city}, Japan`;
        console.log('Geocoding address:', address);
        
        geocoder.geocode({ 
            address: address,
            region: 'JP' // 日本に限定
        }, (results, status) => {
            console.log('Geocoding status:', status);
            console.log('Geocoding results:', results);
            
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
                const location = results[0].geometry.location;
                const coords = {
                    lat: location.lat(),
                    lng: location.lng()
                };
                console.log('Coordinates found:', coords);
                resolve(coords);
            } else {
                const errorMsg = `地域の座標を取得できませんでした: ${address} (Status: ${status})`;
                console.error(errorMsg);
                reject(new Error(errorMsg));
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

// ルート作成機能
function createRoute() {
    if (!directionsService || !directionsRenderer) {
        alert('Directions APIが初期化されていません');
        return;
    }
    
    if (selectedPlaces.length < 2) {
        alert('ルートを作成するには2つ以上の場所を選択してください');
        return;
    }
    
    console.log('ルート作成開始:', selectedPlaces);
    
    // 最初の場所を出発地、最後の場所を目的地とし、中間の場所を経由地とする
    const origin = selectedPlaces[0].position;
    const destination = selectedPlaces[selectedPlaces.length - 1].position;
    const waypoints = selectedPlaces.slice(1, -1).map(place => ({
        location: place.position,
        stopover: true
    }));
    
    // 移動手段を取得（フォームから）
    const transportMode = getSelectedTransportMode();
    
    const request = {
        origin: origin,
        destination: destination,
        waypoints: waypoints,
        travelMode: transportMode,
        optimizeWaypoints: true, // 経由地の順序を最適化
        unitSystem: google.maps.UnitSystem.METRIC
    };
    
    directionsService.route(request, (result, status) => {
        if (status === 'OK') {
            console.log('ルート計算成功:', result);
            
            // 既存のマーカーを非表示にしてルートを表示
            hideMarkers();
            directionsRenderer.setDirections(result);
            
            // ルート情報を表示
            displayRouteInfo(result);
            
            // Export セクションを表示
            const exportSection = document.getElementById('exportSection');
            if (exportSection) {
                exportSection.style.display = 'block';
                updateStepIndicator(4); // "PDF出力"をアクティブに
            }
            
        } else {
            console.error('ルート計算エラー:', status);
            alert('ルートの計算に失敗しました: ' + status);
        }
    });
}

// 選択された移動手段をGoogle Maps APIの形式に変換
function getSelectedTransportMode() {
    const transport = document.querySelector('.radio-group input[type="radio"]:checked')?.value;
    
    switch(transport) {
        case 'walking':
            return google.maps.TravelMode.WALKING;
        case 'driving':
            return google.maps.TravelMode.DRIVING;
        case 'transit':
            return google.maps.TravelMode.TRANSIT;
        default:
            return google.maps.TravelMode.WALKING;
    }
}

// 既存のマーカーを非表示
function hideMarkers() {
    currentMarkers.forEach(marker => {
        marker.setVisible(false);
    });
}

// マーカーを再表示
function showMarkers() {
    currentMarkers.forEach(marker => {
        marker.setVisible(true);
    });
}

// ルート情報を表示
function displayRouteInfo(directionsResult) {
    const route = directionsResult.routes[0];
    const leg = route.legs[0];
    
    // 合計距離と時間を計算
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // 距離をキロメートルに変換
    const distanceKm = (totalDistance / 1000).toFixed(1);
    
    // 時間を時間と分に変換
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const timeText = hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
    
    // ルート情報を表示
    const routeSection = document.getElementById('routeSection');
    const selectedPlacesDiv = document.getElementById('selectedPlaces');
    
    if (selectedPlacesDiv) {
        selectedPlacesDiv.innerHTML = `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                <h3 style="margin: 0 0 10px 0; color: #28a745;">📍 作成されたルート</h3>
                <div style="display: flex; gap: 20px; margin-bottom: 10px;">
                    <div><strong>総距離:</strong> ${distanceKm} km</div>
                    <div><strong>所要時間:</strong> ${timeText}</div>
                </div>
                <div><strong>経路:</strong></div>
                <ol style="margin: 10px 0; padding-left: 20px;">
                    ${selectedPlaces.map(place => `<li>${place.name}</li>`).join('')}
                </ol>
            </div>
            <div style="margin-top: 15px;">
                <button type="button" onclick="clearRoute()" class="btn-secondary" style="margin-right: 10px;">ルートをクリア</button>
                <button type="button" onclick="showMarkers()" class="btn-secondary">マーカーを表示</button>
            </div>
        `;
    }
}

// ルートをクリア
function clearRoute() {
    if (directionsRenderer) {
        directionsRenderer.setDirections({routes: []});
    }
    
    // マーカーを再表示
    showMarkers();
    
    // ルートセクションの表示を戻す
    updateRouteSection();
    
    // Export セクションを非表示
    const exportSection = document.getElementById('exportSection');
    if (exportSection) {
        exportSection.style.display = 'none';
    }
    
    console.log('ルートがクリアされました');
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