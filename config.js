// Google Maps API設定
// 注意: 実際の運用時は環境変数や安全な方法でAPIキーを管理してください
const CONFIG = {
    // あなたのGoogle Maps APIキーをここに入力してください
    GOOGLE_MAPS_API_KEY: 'AIzaSyA80IAlN1T4X418R1-k0zvjeU1w3q2RDTY',
    
    // デフォルト設定
    DEFAULT_CENTER: {
        lat: 35.6762,  // 東京駅
        lng: 139.6503
    },
    
    // 移動手段別の検索半径（メートル）
    SEARCH_RADIUS: {
        walking: 5000,    // 5km
        driving: 10000,   // 10km
        transit: 20000    // 20km
    },
    
    // Places APIの設定
    PLACES_CONFIG: {
        minRating: 3.6,
        minReviews: 50
    }
};

// APIキーが設定されているかチェック
function checkApiKey() {
    if (CONFIG.GOOGLE_MAPS_API_KEY === 'YOUR_API_KEY_HERE') {
        console.warn('Google Maps APIキーが設定されていません。config.jsでAPIキーを設定してください。');
        return false;
    }
    return true;
}