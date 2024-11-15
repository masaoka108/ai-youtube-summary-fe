# AI YouTube 動画まとめアプリ

YouTubeの動画内容をAIが要約・解説してくれるWebアプリケーションです。

## 機能

- YouTube動画URLから内容を自動要約
- 要約内容は以下の形式で表示：
  - 全体の概要
  - 主要なポイント（箇条書き）
  - 結論
- 要約内容に対して質問が可能
- マークダウン形式での表示対応

## 技術スタック

- **フロントエンド**
  - Next.js 15.0.3
  - React 19
  - TypeScript
  - Tailwind CSS
  - shadcn/ui

- **AI/ML**
  - Google Gemini Pro API

## 必要要件

- Node.js 18.0.0以上
- Google Cloud Platformのアカウントとプロジェクト
- Gemini Pro APIのAPIキー

## セットアップ

1. リポジトリのクローン
bash
git clone [repository-url]
cd ai-youtube-summary-fe


2. 依存パッケージのインストール
bash
npm install


3. 環境変数の設定
bash
cp .env.example .env.local


`.env.local`に以下の環境変数を設定：
NEXT_PUBLIC_YOUTUBE_API_KEY={your_youtube_api_key}
NEXT_PUBLIC_GEMINI_API_KEY={your_gemini_api_key}

4. 開発サーバーの起動
bash
npm run dev


アプリケーションは http://localhost:3000 で起動します。

## 使い方

1. トップページでYouTube動画のURLを入力
2. 「まとめを実行する」ボタンをクリック
3. AIが動画の内容を要約
4. 要約内容に対して質問が可能
5. 「新しい動画を要約する」で別の動画の要約が可能

## 開発者向け情報

### ビルド
bash
npm run build

### テスト
bash
npm run test


### デプロイ

デプロイ
bash
npm run build
npm run start


## ライセンス

MIT License

## 作者

[Your Name]

## 謝辞

- [Next.js](https://nextjs.org/)
- [Google Gemini Pro](https://deepmind.google/technologies/gemini/)
- [shadcn/ui](https://ui.shadcn.com/)
