# Google Maps API セットアップ手順

## 1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成
3. プロジェクト名を入力（例: "Japan Travel Planner"）

## 2. 必要なAPIを有効化

以下のAPIを有効化してください：
- **Maps JavaScript API** （地図表示用）
- **Places API** （店舗検索用）
- **Directions API** （ルート作成用）
- **Geocoding API** （住所から座標変換用）

## 3. APIキーを作成

1. 「認証情報」→「認証情報を作成」→「APIキー」
2. APIキーが生成される
3. セキュリティのため、APIキーに制限を設定（推奨）

## 4. APIキーの制限設定（推奨）

### アプリケーションの制限
- **HTTPリファラー（ウェブサイト）** を選択
- 許可するリファラーを追加（例: `localhost/*`, `yourdomain.com/*`)

### API の制限  
- 「キーを制限」を選択
- 以下のAPIを選択：
  - Maps JavaScript API
  - Places API
  - Directions API
  - Geocoding API

## 5. ファイルの設定

### config.js の設定
```javascript
const CONFIG = {
    GOOGLE_MAPS_API_KEY: 'あなたのAPIキーをここに入力',
    // ...
};
```

### index.html の設定
```html
<script async defer src="https://maps.googleapis.com/maps/api/js?key=あなたのAPIキー&libraries=places&callback=initializeGoogleMaps"></script>
```

## 6. 料金について

- **無料枠**: 月間200ドル分
- **Maps JavaScript API**: 1000回まで無料、その後$7/1000回
- **Places API**: タイプによって異なる料金
- **Directions API**: 1000回まで無料、その後$5/1000回

## 7. 使用量の監視

Google Cloud Console で使用量を定期的に確認し、予期しない課金を防ぎましょう。

## 注意事項

- APIキーは公開リポジトリにコミットしないでください
- 本番環境では環境変数やサーバーサイドでAPIキーを管理してください
- APIキーの制限設定を必ず行ってください