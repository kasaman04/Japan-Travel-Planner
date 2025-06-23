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

// Prefecture Selection Functionality - prefecture-cards-final.html仕様
document.addEventListener('DOMContentLoaded', function() {
    setupPrefectureSelection();
});

function setupPrefectureSelection() {
    const prefectureSection = document.querySelector('.prefecture-list-section');
    const prefectureList = document.querySelector('.prefecture_list');
    const scrollContainer = document.getElementById('prefecture-scroll-container');
    const scrollLeftBtn = document.getElementById('prefecture-scroll-left');
    const scrollRightBtn = document.getElementById('prefecture-scroll-right');
    
    let selectedPrefecture = null;
    let currentRegion = null;
    
    // Prefecture data by region
    const prefectureDataByRegion = {
        'Hokkaido': [
            { id: 'hokkaido', name: '北海道', attractions: '札幌、函館、小樽', image: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Tohoku': [
            { id: 'aomori', name: '青森県', attractions: '青森ねぶた祭、弘前城', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'iwate', name: '岩手県', attractions: '中尊寺金色堂、岩手山', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'miyagi', name: '宮城県', attractions: '仙台城、松島', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'akita', name: '秋田県', attractions: '角館、田沢湖', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'yamagata', name: '山形県', attractions: '山寺、蔵王', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'fukushima', name: '福島県', attractions: '会津若松、磐梯山', image: 'https://images.unsplash.com/photo-1568096889942-6eedde686635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Kanto': [
            { id: 'tokyo', name: '東京都', attractions: '浅草寺、東京タワー、スカイツリー', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kanagawa', name: '神奈川県', attractions: '鎌倉、横浜中華街、箱根', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'chiba', name: '千葉県', attractions: '成田空港、ディズニーランド、鴨川', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'saitama', name: '埼玉県', attractions: '川越、小江戸、秩父', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'ibaraki', name: '茨城県', attractions: '大洗、ひたち海浜公園、袋田の滝', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'tochigi', name: '栃木県', attractions: '日光東照宮、華厳滝、那須', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'gunma', name: '群馬県', attractions: '草津温泉、富岡製糸場、尾瀬', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Chubu': [
            { id: 'niigata', name: '新潟県', attractions: '佐渡島、越後湯沢', image: 'https://images.unsplash.com/photo-1578022761797-b8636ac1773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'toyama', name: '富山県', attractions: '立山黒部、富山湾', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'ishikawa', name: '石川県', attractions: '金沢、兼六園', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'fukui', name: '福井県', attractions: '永平寺、東尋坊', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'yamanashi', name: '山梨県', attractions: '富士山、河口湖', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'nagano', name: '長野県', attractions: '軽井沢、上高地', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'gifu', name: '岐阜県', attractions: '白川郷、高山', image: 'https://images.unsplash.com/photo-1568096889942-6eedde686635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'shizuoka', name: '静岡県', attractions: '富士山、伊豆半島', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'aichi', name: '愛知県', attractions: '名古屋城、熱田神宮', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Kinki': [
            { id: 'mie', name: '三重県', attractions: '伊勢神宮、熊野古道', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'shiga', name: '滋賀県', attractions: '琵琶湖、彦根城', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kyoto', name: '京都府', attractions: '清水寺、金閣寺、嵐山', image: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'osaka', name: '大阪府', attractions: '大阪城、道頓堀、USJ', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'hyogo', name: '兵庫県', attractions: '姫路城、神戸港', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'nara', name: '奈良県', attractions: '東大寺、奈良公園', image: 'https://images.unsplash.com/photo-1568096889942-6eedde686635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'wakayama', name: '和歌山県', attractions: '高野山、白浜', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Chugoku': [
            { id: 'tottori', name: '鳥取県', attractions: '鳥取砂丘、境港', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'shimane', name: '島根県', attractions: '出雲大社、石見銀山', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'okayama', name: '岡山県', attractions: '岡山城、後楽園', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'hiroshima', name: '広島県', attractions: '厳島神社、原爆ドーム', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'yamaguchi', name: '山口県', attractions: '錦帯橋、萩', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Shikoku': [
            { id: 'tokushima', name: '徳島県', attractions: '阿波踊り、鳴門', image: 'https://images.unsplash.com/photo-1568096889942-6eedde686635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kagawa', name: '香川県', attractions: '讃岐うどん、金刀比羅宮', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'ehime', name: '愛媛県', attractions: '松山城、道後温泉', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kochi', name: '高知県', attractions: '高知城、桂浜', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ],
        'Kyushu': [
            { id: 'fukuoka', name: '福岡県', attractions: '大宰府、博多', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'saga', name: '佐賀県', attractions: '有田焼、嬉野温泉', image: 'https://images.unsplash.com/photo-1551726899-1d5e38c6e014?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'nagasaki', name: '長崎県', attractions: 'グラバー園、軍艦島', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kumamoto', name: '熊本県', attractions: '熊本城、阿蘇山', image: 'https://images.unsplash.com/photo-1568096889942-6eedde686635?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'oita', name: '大分県', attractions: '別府温泉、湯布院', image: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'miyazaki', name: '宮崎県', attractions: '高千穂峡、青島', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'kagoshima', name: '鹿児島県', attractions: '桜島、屋久島', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
            { id: 'okinawa', name: '沖縄県', attractions: '首里城、美ら海水族館', image: 'https://images.unsplash.com/photo-1605883705077-8d3d3cebe78c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
        ]
    };
    
    // Listen for region selection from interactive map
    document.addEventListener('regionSelected', function(event) {
        const regionData = event.detail;
        showPrefecturesForRegion(regionData.region, regionData.name);
    });
    
    function showPrefecturesForRegion(regionKey, regionName) {
        currentRegion = regionKey;
        const prefectures = prefectureDataByRegion[regionKey];
        
        if (!prefectures) {
            console.warn(`No prefecture data found for region: ${regionKey}`);
            return;
        }
        
        // Show prefecture section
        prefectureSection.style.display = 'block';
        
        // Clear existing prefectures
        prefectureList.innerHTML = '';
        
        // Update section title
        const sectionTitle = prefectureSection.querySelector('h3');
        sectionTitle.textContent = `${regionName}の都道府県を選択してください`;
        
        // Generate prefecture cards
        prefectures.forEach(prefecture => {
            const card = createPrefectureCard(prefecture);
            prefectureList.appendChild(card);
        });
        
        // Initialize scroll functionality
        setupPrefectureScrollEvents();
        updatePrefectureScrollButtons();
        
        // Scroll prefecture section into view
        prefectureSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
    
    function createPrefectureCard(prefecture) {
        const li = document.createElement('li');
        li.className = 'prefecture_list__item o-card o-card--shadow-light';
        li.dataset.prefecture = prefecture.id;
        li.dataset.name = prefecture.name;
        
        li.innerHTML = `
            <div class="prefecture_list__item__image_wrap">
                <figure class="image image--ratio image--ratio-3-2">
                    <div class="image__mask">
                        <img class="image__img" src="${prefecture.image}" alt="${prefecture.name}">
                    </div>
                </figure>
            </div>
            
            <div class="prefecture_list__item__text_wrap">
                <div class="prefecture_list__item__text">
                    <div class="prefecture_list__item__main_info">
                        <a class="prefecture_list__item__name" href="#">
                            ${prefecture.name}
                        </a>
                        <div class="prefecture_list__item__desc s-typography--links">${prefecture.attractions}</div>
                    </div>
                </div>
            </div>
        `;
        
        // Add click event
        li.addEventListener('click', function() {
            selectPrefecture(this, prefecture.id, prefecture.name, prefecture.attractions);
        });
        
        // Add hover effects
        li.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
            }
        });
        
        li.addEventListener('mouseleave', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = '';
                this.style.boxShadow = '';
            }
        });
        
        return li;
    }
    
    function selectPrefecture(itemElement, prefectureId, prefectureName, attractions) {
        // Remove previous selection
        const allCards = prefectureList.querySelectorAll('.prefecture_list__item');
        allCards.forEach(card => {
            card.classList.remove('selected');
            card.style.transform = '';
        });
        
        // Add selection to clicked item
        itemElement.classList.add('selected');
        selectedPrefecture = prefectureId;
        
        // Update display
        updatePrefectureSelectionDisplay(prefectureId, prefectureName, attractions);
        
        // Update hidden form fields for compatibility
        const prefectureSelect = document.getElementById('prefecture');
        if (prefectureSelect) {
            prefectureSelect.value = prefectureId;
        }
        
        console.log(`Selected prefecture: ${prefectureName} (${prefectureId})`);
    }
    
    function updatePrefectureSelectionDisplay(prefectureId, prefectureName, attractions) {
        // Store selection info but don't display (since we removed the display section)
        console.log(`Prefecture selected: ${prefectureName} - ${attractions}`);
    }
    
    // Scroll Events Setup
    function setupPrefectureScrollEvents() {
        if (!scrollLeftBtn || !scrollRightBtn || !scrollContainer) {
            console.warn('Prefecture scroll elements not found');
            return;
        }
        
        // Left scroll button
        scrollLeftBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
        
        // Right scroll button
        scrollRightBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
        
        // Update button states on scroll
        function updateScrollButtons() {
            const isAtStart = scrollContainer.scrollLeft <= 0;
            const isAtEnd = scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth);
            
            scrollLeftBtn.disabled = isAtStart;
            scrollRightBtn.disabled = isAtEnd;
            
            // Visual feedback with opacity
            scrollLeftBtn.style.opacity = isAtStart ? '0.5' : '1';
            scrollRightBtn.style.opacity = isAtEnd ? '0.5' : '1';
        }
        
        // Initial button state
        updateScrollButtons();
        
        // Update buttons on scroll
        scrollContainer.addEventListener('scroll', updateScrollButtons);
        
        // Update buttons on window resize
        window.addEventListener('resize', updateScrollButtons);
        
        console.log('Prefecture scroll navigation initialized');
    }
    
    
    // Initialize scroll functionality immediately
    setupPrefectureScrollEvents();
    
    // Public API
    window.PrefectureSelection = {
        showRegion: showPrefecturesForRegion,
        getSelectedPrefecture: function() {
            return selectedPrefecture;
        },
        getCurrentRegion: function() {
            return currentRegion;
        }
    };
}