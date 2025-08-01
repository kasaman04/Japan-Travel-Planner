// インタラクティブ日本地図テスト用JavaScript

// グローバル変数
let currentHoveredRegion = null;
let selectedRegion = null;
let debugMode = false;
let showAreas = false;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('インタラクティブ地図テスト初期化開始');
    
    // インタラクティブ地図の初期化
    initializeInteractiveMap();
    
    // テストコントロールの初期化
    initializeTestControls();
    
    // マウス座標の追跡（デバッグ用）
    initializeMouseTracking();
    
    console.log('インタラクティブ地図テスト初期化完了');
});

// インタラクティブ地図の初期化
function initializeInteractiveMap() {
    const regionAreas = document.querySelectorAll('.region-area');
    const hoverInfo = document.getElementById('hover-info');
    const regionName = document.getElementById('region-name');
    
    regionAreas.forEach(area => {
        // マウスホバー開始
        area.addEventListener('mouseenter', function() {
            const region = this.getAttribute('data-region');
            const name = this.getAttribute('data-name');
            
            currentHoveredRegion = region;
            
            // ホバー情報を表示
            showHoverInfo(name);
            
            // デバッグ情報を更新
            updateDebugInfo('hover', region);
            
            console.log('ホバー開始:', region);
        });
        
        // マウスホバー終了
        area.addEventListener('mouseleave', function() {
            currentHoveredRegion = null;
            
            // ホバー情報を非表示
            hideHoverInfo();
            
            // デバッグ情報を更新
            updateDebugInfo('hover', null);
            
            console.log('ホバー終了');
        });
        
        // クリック選択
        area.addEventListener('click', function() {
            const region = this.getAttribute('data-region');
            const imagePath = this.getAttribute('data-image');
            const name = this.getAttribute('data-name');
            
            // 選択状態を更新
            selectRegion(region, imagePath, name, this);
            
            console.log('地域選択:', region);
        });
    });
}

// ベース地図の変更
function changeBaseMap(imagePath) {
    const baseMapImage = document.getElementById('base-map-image');
    baseMapImage.src = imagePath;
    baseMapImage.alt = imagePath.split('/').pop().replace('.png', '');
}

// ベース地図を元に戻す
function resetBaseMap() {
    const baseMapImage = document.getElementById('base-map-image');
    baseMapImage.src = '日本地図/全体.png';
    baseMapImage.alt = '日本地図';
}

// ホバー情報の表示
function showHoverInfo(name) {
    const hoverInfo = document.getElementById('hover-info');
    const regionName = document.getElementById('region-name');
    
    regionName.textContent = name;
    hoverInfo.classList.add('visible');
}

// ホバー情報の非表示
function hideHoverInfo() {
    const hoverInfo = document.getElementById('hover-info');
    hoverInfo.classList.remove('visible');
}

// 地域選択
function selectRegion(regionKey, imagePath, name, areaElement) {
    const regionAreas = document.querySelectorAll('.region-area');
    
    // 他のエリアの選択状態をリセット
    regionAreas.forEach(area => area.classList.remove('selected'));
    
    // クリックされたエリアを選択状態にする
    areaElement.classList.add('selected');
    
    // ベース地図を色付き地域画像に変更
    changeBaseMap(imagePath);
    
    // ホバー情報を隠す
    hideHoverInfo();
    
    // 選択された地域の情報を表示
    showSelectedRegionInfo(regionKey, imagePath, name);
    
    // グローバル変数を更新
    selectedRegion = regionKey;
    
    // デバッグ情報を更新
    updateDebugInfo('selected', regionKey);
}

// 選択された地域の情報表示
function showSelectedRegionInfo(regionKey, imagePath, name) {
    const selectedRegionDisplay = document.getElementById('selected-region-display');
    const selectedRegionDetails = document.getElementById('selected-region-details');
    const selectedRegionTitle = document.getElementById('selected-region-title');
    const selectedRegionImage = document.getElementById('selected-region-image');
    const prefectureCount = document.getElementById('prefecture-count');
    const prefectureList = document.getElementById('prefecture-list');
    
    // 基本情報を表示
    selectedRegionDisplay.textContent = `選択された地域: ${name}`;
    selectedRegionTitle.textContent = name;
    selectedRegionImage.src = imagePath;
    selectedRegionImage.alt = name;
    
    // 詳細情報を表示
    selectedRegionDetails.style.display = 'block';
    
    // 地域データが利用可能な場合の詳細情報
    if (typeof regionsData !== 'undefined' && regionsData[regionKey]) {
        const regionData = regionsData[regionKey];
        const prefectures = regionData.prefectures;
        const prefectureNames = Object.keys(prefectures);
        
        // 都道府県数を表示
        prefectureCount.textContent = prefectureNames.length;
        
        // 都道府県リストを生成
        prefectureList.innerHTML = '';
        prefectureNames.forEach(prefectureName => {
            const item = document.createElement('div');
            item.className = 'prefecture-item';
            item.textContent = prefectureName;
            prefectureList.appendChild(item);
        });
        
        console.log(`${name}の詳細情報を表示:`, prefectureNames.length + '都道府県');
    } else {
        // 地域データが利用できない場合
        prefectureCount.textContent = '情報なし';
        prefectureList.innerHTML = '<div class="prefecture-item">データを読み込み中...</div>';
    }
}

// 選択のリセット
function resetSelection() {
    const regionAreas = document.querySelectorAll('.region-area');
    const selectedRegionDisplay = document.getElementById('selected-region-display');
    const selectedRegionDetails = document.getElementById('selected-region-details');
    
    // 選択状態をリセット
    regionAreas.forEach(area => area.classList.remove('selected'));
    
    // 表示をリセット
    selectedRegionDisplay.textContent = 'まだ地域が選択されていません';
    selectedRegionDetails.style.display = 'none';
    
    // ベース地図を元に戻す
    resetBaseMap();
    
    // ホバー情報を隠す
    hideHoverInfo();
    
    // グローバル変数をリセット
    selectedRegion = null;
    currentHoveredRegion = null;
    
    // デバッグ情報を更新
    updateDebugInfo('selected', null);
    updateDebugInfo('hover', null);
    
    console.log('選択をリセットしました');
}

// エリア境界の表示切り替え
function toggleAreaVisibility() {
    const regionAreas = document.querySelectorAll('.region-area');
    const showAreasBtn = document.getElementById('show-all-areas');
    
    showAreas = !showAreas;
    
    regionAreas.forEach(area => {
        if (showAreas) {
            area.classList.add('debug-visible');
        } else {
            area.classList.remove('debug-visible');
        }
    });
    
    // ボタンの状態を更新
    if (showAreas) {
        showAreasBtn.classList.add('active');
        showAreasBtn.textContent = 'エリア境界を非表示';
    } else {
        showAreasBtn.classList.remove('active');
        showAreasBtn.textContent = 'エリア境界を表示';
    }
    
    console.log('エリア境界表示:', showAreas ? 'ON' : 'OFF');
}

// デバッグモードの切り替え
function toggleDebugMode() {
    const debugInfo = document.getElementById('debug-info');
    const debugBtn = document.getElementById('debug-mode');
    
    debugMode = !debugMode;
    
    if (debugMode) {
        debugInfo.style.display = 'block';
        debugBtn.classList.add('active');
        debugBtn.textContent = 'デバッグモード OFF';
    } else {
        debugInfo.style.display = 'none';
        debugBtn.classList.remove('active');
        debugBtn.textContent = 'デバッグモード';
    }
    
    console.log('デバッグモード:', debugMode ? 'ON' : 'OFF');
}

// テストコントロールの初期化
function initializeTestControls() {
    const resetBtn = document.getElementById('reset-selection');
    const showAreasBtn = document.getElementById('show-all-areas');
    const debugBtn = document.getElementById('debug-mode');
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSelection);
    }
    
    if (showAreasBtn) {
        showAreasBtn.addEventListener('click', toggleAreaVisibility);
    }
    
    if (debugBtn) {
        debugBtn.addEventListener('click', toggleDebugMode);
    }
}

// マウス座標の追跡（デバッグ用）
function initializeMouseTracking() {
    const mapContainer = document.querySelector('.map-container');
    const debugCoords = document.getElementById('debug-coords');
    
    if (mapContainer && debugCoords) {
        mapContainer.addEventListener('mousemove', function(event) {
            const rect = mapContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const xPercent = ((x / rect.width) * 100).toFixed(1);
            const yPercent = ((y / rect.height) * 100).toFixed(1);
            
            debugCoords.textContent = `x: ${x}px (${xPercent}%), y: ${y}px (${yPercent}%)`;
        });
    }
}

// デバッグ情報の更新
function updateDebugInfo(type, value) {
    if (type === 'hover') {
        const debugHover = document.getElementById('debug-hover');
        if (debugHover) {
            debugHover.textContent = value || 'なし';
        }
    } else if (type === 'selected') {
        const debugSelected = document.getElementById('debug-selected');
        if (debugSelected) {
            debugSelected.textContent = value || 'なし';
        }
    }
}