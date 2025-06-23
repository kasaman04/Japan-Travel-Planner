// Prefecture Cards Final JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const prefectureItems = document.querySelectorAll('.prefecture_list__item');
    const scrollContainer = document.getElementById('prefecture-scroll-container');
    const scrollLeftBtn = document.getElementById('scroll-left');
    const scrollRightBtn = document.getElementById('scroll-right');
    
    // Selection Display Elements
    const selectedDisplay = document.getElementById('selected-prefecture-display');
    const selectedDetails = document.getElementById('selected-prefecture-details');
    const selectedTitle = document.getElementById('selected-prefecture-title');
    const prefectureNameDisplay = document.getElementById('prefecture-name-display');
    const attractionsDisplay = document.getElementById('attractions-display');
    
    // Prefecture Data
    const prefectureData = {
        tokyo: {
            name: '東京都',
            attractions: '浅草寺、東京タワー、スカイツリー',
            description: '日本の首都。伝統と現代が融合する魅力的な都市。'
        },
        kanagawa: {
            name: '神奈川県',
            attractions: '鎌倉、横浜中華街、箱根',
            description: '歴史ある鎌倉から国際都市横浜まで多彩な魅力。'
        },
        chiba: {
            name: '千葉県',
            attractions: '成田空港、ディズニーランド、鴨川',
            description: '東京ディズニーリゾートで有名な観光地。'
        },
        saitama: {
            name: '埼玉県',
            attractions: '川越、小江戸、秩父',
            description: '小江戸川越の歴史的な街並みが魅力。'
        },
        ibaraki: {
            name: '茨城県',
            attractions: '大洗、ひたち海浜公園、袋田の滝',
            description: 'ネモフィラで有名なひたち海浜公園。'
        },
        tochigi: {
            name: '栃木県',
            attractions: '日光東照宮、華厳滝、那須',
            description: '世界遺産日光東照宮と美しい自然。'
        },
        gunma: {
            name: '群馬県',
            attractions: '草津温泉、富岡製糸場、尾瀬',
            description: '名湯草津温泉と世界遺産富岡製糸場。'
        }
    };
    
    let selectedPrefecture = null;
    let isPC = window.innerWidth > 768;
    
    // Initialize
    init();
    
    function init() {
        setupPrefectureEvents();
        if (isPC) {
            setupScrollEvents();
            updateScrollButtons();
        }
        setupResizeHandler();
    }
    
    // Prefecture Events Setup
    function setupPrefectureEvents() {
        prefectureItems.forEach(item => {
            item.addEventListener('click', function() {
                const prefectureId = this.dataset.prefecture;
                const prefectureName = this.dataset.name;
                
                selectPrefecture(this, prefectureId, prefectureName);
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
    
    // Prefecture Selection
    function selectPrefecture(itemElement, prefectureId, prefectureName) {
        // Remove previous selection
        prefectureItems.forEach(item => {
            item.classList.remove('selected');
            item.style.transform = '';
        });
        
        // Add selection to clicked item
        itemElement.classList.add('selected');
        
        // Update selected prefecture
        selectedPrefecture = prefectureId;
        
        // Update display
        updateSelectionDisplay(prefectureId, prefectureName);
        
        // Selection animation
        itemElement.classList.add('animate-select');
        setTimeout(() => {
            itemElement.classList.remove('animate-select');
        }, 400);
        
        // PC版: 選択されたカードを中央に表示
        if (isPC) {
            scrollToCard(itemElement);
        }
        
        console.log(`Selected prefecture: ${prefectureName} (${prefectureId})`);
    }
    
    // Update Selection Display
    function updateSelectionDisplay(prefectureId, prefectureName) {
        const data = prefectureData[prefectureId];
        
        if (data) {
            selectedDisplay.textContent = `選択中: ${data.name}`;
            selectedTitle.textContent = data.name;
            prefectureNameDisplay.textContent = data.name;
            attractionsDisplay.textContent = data.attractions;
            
            // Show details
            selectedDetails.style.display = 'block';
        } else {
            selectedDisplay.textContent = `選択中: ${prefectureName}`;
            selectedDetails.style.display = 'none';
        }
    }
    
    // Scroll to Card (PC Only)
    function scrollToCard(cardElement) {
        if (!isPC) return;
        
        const containerRect = scrollContainer.getBoundingClientRect();
        const cardRect = cardElement.getBoundingClientRect();
        const scrollLeft = scrollContainer.scrollLeft;
        
        const cardCenter = cardRect.left + cardRect.width / 2 - containerRect.left + scrollLeft;
        const containerCenter = containerRect.width / 2;
        const targetScroll = cardCenter - containerCenter;
        
        scrollContainer.scrollTo({
            left: targetScroll,
            behavior: 'smooth'
        });
        
        setTimeout(updateScrollButtons, 300);
    }
    
    // Scroll Events Setup (PC Only)
    function setupScrollEvents() {
        if (!isPC || !scrollLeftBtn || !scrollRightBtn) return;
        
        scrollLeftBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: -350,
                behavior: 'smooth'
            });
            setTimeout(updateScrollButtons, 300);
        });
        
        scrollRightBtn.addEventListener('click', function() {
            scrollContainer.scrollBy({
                left: 350,
                behavior: 'smooth'
            });
            setTimeout(updateScrollButtons, 300);
        });
        
        // Update buttons on scroll
        scrollContainer.addEventListener('scroll', updateScrollButtons);
    }
    
    // Update Scroll Buttons State (PC Only)
    function updateScrollButtons() {
        if (!isPC || !scrollLeftBtn || !scrollRightBtn) return;
        
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
    
    // Keyboard Navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault();
            navigateWithKeyboard(e.key);
        }
    });
    
    function navigateWithKeyboard(key) {
        const currentIndex = selectedPrefecture ? 
            Array.from(prefectureItems).findIndex(item => item.dataset.prefecture === selectedPrefecture) : -1;
        
        let nextIndex;
        if (key === 'ArrowLeft') {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : 0;
        } else {
            nextIndex = currentIndex < prefectureItems.length - 1 ? currentIndex + 1 : prefectureItems.length - 1;
        }
        
        const nextItem = prefectureItems[nextIndex];
        if (nextItem) {
            selectPrefecture(nextItem, nextItem.dataset.prefecture, nextItem.dataset.name);
        }
    }
    
    // Touch Support for Mobile
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        if (isPC) return;
        
        const swipeThreshold = 50;
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // 横スワイプが縦スワイプより大きい場合のみ処理
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > swipeThreshold) {
            if (diffX > 0) {
                // 左にスワイプ - 次のカード
                selectNextCard(1);
            } else {
                // 右にスワイプ - 前のカード
                selectNextCard(-1);
            }
        }
    }
    
    function selectNextCard(direction) {
        const currentIndex = selectedPrefecture ? 
            Array.from(prefectureItems).findIndex(item => item.dataset.prefecture === selectedPrefecture) : -1;
        
        let nextIndex = currentIndex + direction;
        nextIndex = Math.max(0, Math.min(prefectureItems.length - 1, nextIndex));
        
        const nextItem = prefectureItems[nextIndex];
        if (nextItem && nextIndex !== currentIndex) {
            selectPrefecture(nextItem, nextItem.dataset.prefecture, nextItem.dataset.name);
        }
    }
    
    // Resize Handler
    function setupResizeHandler() {
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasPC = isPC;
                isPC = window.innerWidth > 768;
                
                if (wasPC !== isPC) {
                    // PC/モバイル切り替え時の処理
                    if (isPC) {
                        setupScrollEvents();
                        updateScrollButtons();
                    }
                    
                    // 選択状態をリセット
                    prefectureItems.forEach(item => {
                        item.style.transform = '';
                    });
                }
                
                if (isPC) {
                    updateScrollButtons();
                }
            }, 250);
        });
    }
    
    // Auto-select first prefecture on load
    setTimeout(() => {
        if (prefectureItems.length > 0) {
            const firstItem = prefectureItems[0];
            selectPrefecture(firstItem, firstItem.dataset.prefecture, firstItem.dataset.name);
        }
    }, 500);
    
    // Public API
    window.PrefectureSelection = {
        selectPrefecture: function(prefectureId) {
            const item = document.querySelector(`[data-prefecture="${prefectureId}"]`);
            if (item) {
                selectPrefecture(item, prefectureId, item.dataset.name);
            }
        },
        getSelectedPrefecture: function() {
            return selectedPrefecture;
        },
        getAllPrefectures: function() {
            return Object.keys(prefectureData);
        },
        getPrefectureData: function(prefectureId) {
            return prefectureData[prefectureId];
        }
    };
});