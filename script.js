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
            // 次の段階で実装予定
            alert('ルート作成機能は後の段階で実装予定です');
        });
    }
    
    // PDF出力ボタン
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            console.log('PDF出力ボタンがクリックされました');
            // 次の段階で実装予定
            alert('PDF出力機能は最後の段階で実装予定です');
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