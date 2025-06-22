// 基本的なページ機能
document.addEventListener('DOMContentLoaded', function() {
    console.log('Japan Travel Planner initialized');
    
    // 都道府県データを読み込み
    loadPrefectures();
    
    // 基本的なイベントリスナーを設定
    setupEventListeners();
    
    // フォームバリデーション
    setupFormValidation();
});

function setupEventListeners() {
    // 検索ボタン
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            console.log('検索ボタンがクリックされました');
            
            // フォームバリデーション
            const errors = validateForm();
            if (errors.length > 0) {
                alert('入力エラー:\n' + errors.join('\n'));
                return;
            }
            
            // フォームデータを取得
            const formData = getFormData();
            console.log('検索条件:', formData);
            
            // Google Maps APIで店舗検索を実行
            searchPlaces(formData);
        });
    }
    
    // リセットボタン
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            resetForm();
        });
    }
    
    // ルート作成ボタン
    const createRouteBtn = document.getElementById('createRouteBtn');
    if (createRouteBtn) {
        createRouteBtn.addEventListener('click', function() {
            console.log('ルート作成ボタンがクリックされました');
            createRoute();
        });
    }
    
    // PDF出力ボタン
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            console.log('PDF出力ボタンがクリックされました');
            exportTravelPlanToPDF();
        });
    }
}

function setupFormValidation() {
    // 都道府県選択の変更時に市区町村を有効化
    const prefectureSelect = document.getElementById('prefecture');
    const citySelect = document.getElementById('city');
    
    if (prefectureSelect && citySelect) {
        prefectureSelect.addEventListener('change', function() {
            if (this.value) {
                loadCities(this.value);
                console.log('都道府県が選択されました:', this.value);
            } else {
                citySelect.disabled = true;
                citySelect.innerHTML = '<option value="">都道府県を選択してください</option>';
            }
        });
    }
    
    // チェックボックスの選択状態を監視
    const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            console.log('やりたいことが選択されました:', this.value, this.checked);
        });
    });
    
    // ラジオボタンの選択状態を監視
    const radioButtons = document.querySelectorAll('.radio-group input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('移動手段が選択されました:', this.value);
        });
    });
    
    // 予算入力の監視
    const budgetInput = document.getElementById('budget');
    if (budgetInput) {
        budgetInput.addEventListener('input', function() {
            console.log('予算が入力されました:', this.value);
        });
    }
}

function resetForm() {
    // フォームをリセット
    const forms = document.querySelectorAll('select, input');
    forms.forEach(element => {
        if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = false;
        } else {
            element.value = '';
        }
    });
    
    // 市区町村選択を無効化
    const citySelect = document.getElementById('city');
    if (citySelect) {
        citySelect.disabled = true;
        citySelect.innerHTML = '<option value="">都道府県を選択してください</option>';
    }
    
    // 結果セクションを非表示
    const resultsSection = document.getElementById('resultsSection');
    const routeSection = document.getElementById('routeSection');
    const exportSection = document.getElementById('exportSection');
    
    if (resultsSection) resultsSection.style.display = 'none';
    if (routeSection) routeSection.style.display = 'none';
    if (exportSection) exportSection.style.display = 'none';
    
    // ステップインジケーターをリセット
    const steps = document.querySelectorAll('.step');
    steps.forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index === 0) {
            step.classList.add('active');
        }
    });
    
    console.log('フォームがリセットされました');
}

// 都道府県データを読み込む関数
function loadPrefectures() {
    const prefectureSelect = document.getElementById('prefecture');
    if (!prefectureSelect || !regionsData) return;
    
    // 既存のオプションをクリア（デフォルトオプション以外）
    prefectureSelect.innerHTML = '<option value="">選択してください</option>';
    
    // 都道府県を追加
    Object.keys(regionsData).forEach(prefecture => {
        const option = document.createElement('option');
        option.value = prefecture;
        option.textContent = `${prefecture} (${regionsData[prefecture].name_en})`;
        prefectureSelect.appendChild(option);
    });
    
    console.log('都道府県データが読み込まれました');
}

// 市区町村データを読み込む関数
function loadCities(selectedPrefecture) {
    const citySelect = document.getElementById('city');
    if (!citySelect || !regionsData[selectedPrefecture]) return;
    
    // 市区町村選択を有効化
    citySelect.disabled = false;
    citySelect.innerHTML = '<option value="">市区町村を選択してください</option>';
    
    // 選択された都道府県の市区町村を追加
    const cities = regionsData[selectedPrefecture].cities;
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
    
    console.log(`${selectedPrefecture}の市区町村データが読み込まれました:`, cities.length + '件');
}

// フォーム入力値を取得する関数
function getFormData() {
    const prefecture = document.getElementById('prefecture').value;
    const city = document.getElementById('city').value;
    const budget = document.getElementById('budget').value;
    
    // やりたいことを取得
    const activities = [];
    document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked').forEach(checkbox => {
        activities.push(checkbox.value);
    });
    
    // 移動手段を取得
    const transport = document.querySelector('.radio-group input[type="radio"]:checked')?.value;
    
    return {
        prefecture,
        city,
        budget: parseInt(budget) || 0,
        activities,
        transport
    };
}

// フォームバリデーション
function validateForm() {
    const formData = getFormData();
    const errors = [];
    
    if (!formData.prefecture) {
        errors.push('都道府県を選択してください');
    }
    
    if (!formData.city) {
        errors.push('市区町村を選択してください');
    }
    
    if (formData.activities.length === 0) {
        errors.push('やりたいことを1つ以上選択してください');
    }
    
    if (!formData.transport) {
        errors.push('移動手段を選択してください');
    }
    
    if (formData.budget <= 0) {
        errors.push('予算を入力してください');
    }
    
    return errors;
}

// プラン出力機能（テキストファイル）
function exportTravelPlanToPDF() {
    console.log('旅行プラン出力を開始します');
    
    try {
        // 選択されたプランの情報を取得
        const formData = getFormData();
        const planData = getTravelPlanData();
        
        if (!planData.places || planData.places.length === 0) {
            alert('プラン出力するには、まず店舗を選択してルートを作成してください');
            return;
        }
        
        // テキストファイルを生成
        generateTravelPlanText(formData, planData);
        
    } catch (error) {
        console.error('プラン出力エラー:', error);
        alert('プラン出力中にエラーが発生しました: ' + error.message);
    }
}

// 旅行プランデータを取得
function getTravelPlanData() {
    const planData = {
        places: selectedPlaces || [],
        routeInfo: getRouteInfo()
    };
    
    console.log('旅行プランデータ:', planData);
    return planData;
}

// ルート情報を取得
function getRouteInfo() {
    // DirectionsRendererから現在のルート情報を取得
    if (typeof directionsRenderer !== 'undefined' && directionsRenderer) {
        const directions = directionsRenderer.getDirections();
        if (directions && directions.routes && directions.routes.length > 0) {
            const route = directions.routes[0];
            
            // 合計距離と時間を計算
            let totalDistance = 0;
            let totalDuration = 0;
            
            route.legs.forEach(leg => {
                totalDistance += leg.distance.value;
                totalDuration += leg.duration.value;
            });
            
            return {
                totalDistance: (totalDistance / 1000).toFixed(1) + ' km',
                totalDuration: formatDuration(totalDuration),
                hasRoute: true
            };
        }
    }
    
    return {
        totalDistance: '未計算',
        totalDuration: '未計算',
        hasRoute: false
    };
}

// 時間をフォーマット
function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}時間${minutes}分` : `${minutes}分`;
}

// テキストファイル生成メイン関数
function generateTravelPlanText(formData, planData) {
    // テキスト内容を作成
    let content = '';
    
    // タイトル
    content += '=====================================\n';
    content += '    JAPAN TRAVEL PLAN\n';
    content += '=====================================\n\n';
    
    // 基本情報
    content += '【基本情報 / Basic Information】\n';
    content += `場所 / Location: ${formData.prefecture} ${formData.city}\n`;
    content += `予算 / Budget: ${formData.budget} 円/日 (yen per day)\n`;
    content += `移動手段 / Transport: ${getTransportText(formData.transport)}\n`;
    content += `アクティビティ / Activities: ${getActivitiesText(formData.activities)}\n\n`;
    
    // ルート情報
    if (planData.routeInfo.hasRoute) {
        content += '【ルート情報 / Route Information】\n';
        content += `総距離 / Total Distance: ${planData.routeInfo.totalDistance}\n`;
        content += `所要時間 / Total Time: ${planData.routeInfo.totalDuration}\n\n`;
    }
    
    // 選択された場所のリスト
    content += '【選択した場所 / Selected Places】\n';
    planData.places.forEach((place, index) => {
        content += `${index + 1}. ${place.name}\n`;
    });
    content += '\n';
    
    // 生成日時
    const currentDate = new Date().toLocaleDateString('ja-JP');
    const currentTime = new Date().toLocaleTimeString('ja-JP');
    content += `生成日時 / Generated: ${currentDate} ${currentTime}\n`;
    content += 'Created by Japan Travel Planner\n';
    content += '=====================================\n';
    
    // ファイルをダウンロード
    const fileName = `Japan_Travel_Plan_${formData.prefecture}_${currentDate.replace(/\//g, '-')}.txt`;
    downloadTextFile(content, fileName);
    
    console.log('旅行プラン出力完了:', fileName);
    alert('旅行プランのテキストファイルを保存しました！');
}

// テキストファイルダウンロード機能
function downloadTextFile(content, fileName) {
    // BOMを追加してUTF-8で正しく表示されるようにする
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/plain;charset=utf-8' });
    
    // ダウンロードリンクを作成
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    
    // 一時的にページに追加してクリック
    document.body.appendChild(link);
    link.click();
    
    // リンクを削除
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

// 移動手段テキストを取得
function getTransportText(transport) {
    switch(transport) {
        case 'walking': return 'Walking';
        case 'driving': return 'Driving';
        case 'transit': return 'Public Transport';
        default: return transport || 'Not specified';
    }
}

// アクティビティテキストを取得
function getActivitiesText(activities) {
    const activityMap = {
        'restaurant': 'Dining',
        'tourist_attraction': 'Sightseeing',
        'amusement_park': 'Activities',
        'shopping_mall': 'Shopping',
        'spa': 'Hot Springs',
        'night_club': 'Nightlife'
    };
    
    return activities.map(activity => activityMap[activity] || activity).join(', ');
}