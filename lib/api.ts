import { GoogleGenerativeAI } from "@google/generative-ai";

// 環境変数から API キーを取得
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

// Gemini AI の初期化
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!);

// YouTube動画IDを抽出する関数
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// YouTube APIから動画情報を取得
export const fetchVideoDetails = async (videoId: string) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  
  if (!data.items?.length) {
    throw new Error('動画が見つかりませんでした');
  }

  return data.items[0].snippet;
};

// 字幕を取得する関数
export const fetchCaptions = async (videoId: string) => {
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  return data;
};

// Geminiで要約を生成
export const generateSummary = async (videoDetails: any, captions: any) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    以下のYouTube動画の内容を要約してください：
    
    タイトル: ${videoDetails.title}
    説明: ${videoDetails.description}
    
    要約のフォーマット:
    
    # 全体の概要
    (ここに1段落で概要を書いてください)
    
    # 主要なポイント
    - ポイント1
    - ポイント2
    - ポイント3
    - ポイント4
    - ポイント5
    
    # 結論
    (ここに結論を書いてください)
    
    必ず各セクション間に空行を入れ、箇条書きの前後にも空行を入れてください。
    日本語で出力してください。
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

// Geminiで質問に回答
export const generateAnswer = async (
  question: string,
  videoDetails: any,
  summary: string
) => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    以下のYouTube動画に関する質問に答えてください：
    
    動画情報：
    タイトル: ${videoDetails.title}
    要約: ${summary}
    
    質問: ${question}
    
    以下の形式で回答を作成してください：
    
    1. まず、質問に対する直接的な回答を1-2文で
    2. 続いて、詳細な説明を箇条書きで
    3. 最後に、補足情報があれば追加
    
    マークダウン形式を使用して回答を構造化してください：
    - 重要なポイントは **太字** で
    - 箇条書きには - を使用
    - 必要に応じて ### で小見出しを使用
    
    日本語で、わかりやすく具体的に回答してください。
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}; 