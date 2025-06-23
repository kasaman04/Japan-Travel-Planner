// 基本的なページ機能
document.addEventListener('DOMContentLoaded', function() {
    console.log('Japan Travel Planner initialized');
    
    // 地域データを読み込み
    loadRegions();
    
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
    // 地域選択の変更時に都道府県を有効化
    const regionSelect = document.getElementById('region');
    const prefectureSelect = document.getElementById('prefecture');
    const citySelect = document.getElementById('city');
    
    if (regionSelect && prefectureSelect) {
        regionSelect.addEventListener('change', function() {
            if (this.value) {
                loadPrefecturesFromRegion(this.value);
                console.log('地域が選択されました:', this.value);
            } else {
                prefectureSelect.disabled = true;
                prefectureSelect.innerHTML = '<option value="">地域を選択してください</option>';
                citySelect.disabled = true;
                citySelect.innerHTML = '<option value="">都道府県を選択してください</option>';
            }
        });
    }
    
    // 都道府県選択の変更時に市区町村を有効化
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
    
    // 都道府県と市区町村選択を無効化
    const prefectureSelect = document.getElementById('prefecture');
    const citySelect = document.getElementById('city');
    
    if (prefectureSelect) {
        prefectureSelect.disabled = true;
        prefectureSelect.innerHTML = '<option value="">地域を選択してください</option>';
    }
    
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

// 地域データを読み込む関数
function loadRegions() {
    const regionSelect = document.getElementById('region');
    if (!regionSelect || !regionsData) return;
    
    // 既存のオプションをクリア（デフォルトオプション以外）
    regionSelect.innerHTML = '<option value="">選択してください</option>';
    
    // 地域を追加
    Object.keys(regionsData).forEach(regionKey => {
        const region = regionsData[regionKey];
        const option = document.createElement('option');
        option.value = regionKey;
        option.textContent = `${region.name_ja} (${region.name_en})`;
        regionSelect.appendChild(option);
    });
    
    console.log('地域データが読み込まれました');
}

// 選択された地域から都道府県を読み込む関数
function loadPrefecturesFromRegion(selectedRegion) {
    const prefectureSelect = document.getElementById('prefecture');
    const citySelect = document.getElementById('city');
    
    if (!prefectureSelect || !regionsData[selectedRegion]) return;
    
    // 都道府県選択を有効化
    prefectureSelect.disabled = false;
    prefectureSelect.innerHTML = '<option value="">都道府県を選択してください</option>';
    
    // 市区町村選択を無効化
    citySelect.disabled = true;
    citySelect.innerHTML = '<option value="">都道府県を選択してください</option>';
    
    // 選択された地域の都道府県を追加
    const prefectures = regionsData[selectedRegion].prefectures;
    Object.keys(prefectures).forEach(prefecture => {
        const option = document.createElement('option');
        option.value = prefecture;
        option.textContent = `${prefecture} (${prefectures[prefecture].name_en})`;
        prefectureSelect.appendChild(option);
    });
    
    console.log(`${selectedRegion}の都道府県データが読み込まれました:`, Object.keys(prefectures).length + '件');
}

// 市区町村データを読み込む関数
function loadCities(selectedPrefecture) {
    const citySelect = document.getElementById('city');
    if (!citySelect) return;
    
    // 選択された都道府県のデータを探す
    let prefectureData = null;
    for (const regionKey in regionsData) {
        const region = regionsData[regionKey];
        if (region.prefectures && region.prefectures[selectedPrefecture]) {
            prefectureData = region.prefectures[selectedPrefecture];
            break;
        }
    }
    
    if (!prefectureData) return;
    
    // 市区町村選択を有効化
    citySelect.disabled = false;
    citySelect.innerHTML = '<option value="">市区町村を選択してください</option>';
    
    // 選択された都道府県の市区町村を追加
    const cities = prefectureData.cities;
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
    const region = document.getElementById('region').value;
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
        region,
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
    
    if (!formData.region) {
        errors.push('地域を選択してください');
    }
    
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
    content += `地域 / Region: ${getRegionDisplayName(formData.region)}\n`;
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

// 地域表示名を取得
function getRegionDisplayName(regionKey) {
    if (!regionKey || !regionsData[regionKey]) return regionKey || 'Not specified';
    const region = regionsData[regionKey];
    return `${region.name_ja} (${region.name_en})`;
}

// Activity Cards Functionality - prefecture-cards-final.html仕様
document.addEventListener('DOMContentLoaded', function() {
    setupActivityCards();
});

function setupActivityCards() {
    const activityItems = document.querySelectorAll('.activity_list__item');
    const scrollContainer = document.getElementById('activity-scroll-container');
    const scrollLeftBtn = document.getElementById('activity-scroll-left');
    const scrollRightBtn = document.getElementById('activity-scroll-right');
    
    let selectedActivities = [];
    let isPC = window.innerWidth > 768;
    
    // Initialize
    initActivityCards();
    
    function initActivityCards() {
        setupActivityEvents();
        if (isPC) {
            setupActivityScrollEvents();
            updateActivityScrollButtons();
        }
        setupActivityResizeHandler();
    }
    
    // Activity Events Setup
    function setupActivityEvents() {
        activityItems.forEach(item => {
            item.addEventListener('click', function() {
                const activityId = this.dataset.activity;
                toggleActivitySelection(this, activityId);
            });
            
            // Hover effects
            item.addEventListener('mouseenter', function() {
                if (!this.classList.contains('selected')) {
                    if (isPC) {
                        this.style.transform = 'translateY(-4px) scale(1.01)';
                    } else {
                        this.style.transform = 'translateY(-1px)';
                    }
                }
            });
            
            item.addEventListener('mouseleave', function() {
                if (!this.classList.contains('selected')) {
                    this.style.transform = '';
                }
            });
        });
    }
    
    // Activity Selection Toggle
    function toggleActivitySelection(itemElement, activityId) {
        const isSelected = itemElement.classList.contains('selected');
        
        if (isSelected) {
            // Remove selection
            itemElement.classList.remove('selected');
            selectedActivities = selectedActivities.filter(id => id !== activityId);
            
            // Remove from checkbox
            const checkbox = document.querySelector(`input[value="${activityId}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
        } else {
            // Add selection
            itemElement.classList.add('selected');
            selectedActivities.push(activityId);
            
            // Add to checkbox
            const checkbox = document.querySelector(`input[value="${activityId}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
        
        console.log(`Activity ${activityId} ${isSelected ? 'deselected' : 'selected'}`);
        console.log('Selected activities:', selectedActivities);
    }
    
    // Scroll Events Setup (PC Only)
    function setupActivityScrollEvents() {
        if (!isPC || !scrollLeftBtn || !scrollRightBtn) return;
        
        scrollLeftBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: -350,
                behavior: 'smooth'
            });
            setTimeout(updateActivityScrollButtons, 300);
        });
        
        scrollRightBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: 350,
                behavior: 'smooth'
            });
            setTimeout(updateActivityScrollButtons, 300);
        });
        
        // Update buttons on scroll
        if (scrollContainer) {
            scrollContainer.addEventListener('scroll', updateActivityScrollButtons);
        }
    }
    
    // Update Scroll Buttons State (PC Only)
    function updateActivityScrollButtons() {
        if (!isPC || !scrollLeftBtn || !scrollRightBtn || !scrollContainer) return;
        
        const scrollLeft = scrollContainer.scrollLeft;
        const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        
        // Left button
        if (scrollLeft <= 0) {
            scrollLeftBtn.disabled = true;
            scrollLeftBtn.style.opacity = '0.5';
        } else {
            scrollLeftBtn.disabled = false;
            scrollLeftBtn.style.opacity = '1';
        }
        
        // Right button
        if (scrollLeft >= maxScroll - 1) {
            scrollRightBtn.disabled = true;
            scrollRightBtn.style.opacity = '0.5';
        } else {
            scrollRightBtn.disabled = false;
            scrollRightBtn.style.opacity = '1';
        }
    }
    
    // Resize Handler
    function setupActivityResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasPC = isPC;
                isPC = window.innerWidth > 768;
                
                if (wasPC !== isPC) {
                    // PC/モバイル切り替え時の処理
                    if (isPC) {
                        setupActivityScrollEvents();
                        updateActivityScrollButtons();
                    }
                    
                    // 選択状態をリセット
                    activityItems.forEach(item => {
                        item.style.transform = '';
                    });
                }
                
                if (isPC) {
                    updateActivityScrollButtons();
                }
            }, 250);
        });
    }
    
    // Sync with existing checkboxes
    function syncWithCheckboxes() {
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const activityId = this.value;
                const item = document.querySelector(`[data-activity="${activityId}"]`);
                
                if (item) {
                    if (this.checked) {
                        item.classList.add('selected');
                        if (!selectedActivities.includes(activityId)) {
                            selectedActivities.push(activityId);
                        }
                    } else {
                        item.classList.remove('selected');
                        selectedActivities = selectedActivities.filter(id => id !== activityId);
                    }
                }
            });
        });
    }
    
    // Initialize checkbox sync
    syncWithCheckboxes();
    
    // Public API
    window.ActivitySelection = {
        getSelectedActivities: function() {
            return selectedActivities;
        },
        selectActivity: function(activityId) {
            const item = document.querySelector(`[data-activity="${activityId}"]`);
            if (item && !item.classList.contains('selected')) {
                toggleActivitySelection(item, activityId);
            }
        },
        deselectActivity: function(activityId) {
            const item = document.querySelector(`[data-activity="${activityId}"]`);
            if (item && item.classList.contains('selected')) {
                toggleActivitySelection(item, activityId);
            }
        },
        clearAll: function() {
            activityItems.forEach(item => {
                if (item.classList.contains('selected')) {
                    toggleActivitySelection(item, item.dataset.activity);
                }
            });
        }
    };
}