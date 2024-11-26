'use client'

import { useState, useCallback, useEffect } from 'react'
import { Github, Instagram, Twitter, X, Youtube, Facebook } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { extractVideoId, fetchVideoDetails, generateSummary, generateAnswer } from '@/lib/api';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

type ErrorState = {
  message: string;
  type: 'url' | 'api' | 'general';
}

type VideoSummary = {
  title: string;
  thumbnail: string;
  summary: string[];
}

type ApiResponse = {
  success: boolean;
  data?: VideoSummary;
  error?: string;
}

type VideoDetails = {
  title: string;
  description: string;
  thumbnails: {
    high: {
      url: string;
    };
  };
};

// マークダウンの設定をカスタマイズ
marked.setOptions({
  breaks: true,  // 改行を <br> に変換
  gfm: true      // GitHub Flavored Markdown を有効化
});

// テキストの前処理を行う関数
const preprocessText = (text: string) => {
  return text
    // 段落間の空行を確保
    .split('\n')
    .map(line => line.trim())
    .join('\n\n')
    // 箇条書きの前後に空行を追加
    .replace(/(?<=\n)([0-9]+\.|[-•])/g, '\n$1')
    // 見出しの前後に空行を追加
    .replace(/(?<=\n)(#{1,3})/g, '\n$1');
};

// マークダウンをHTMLに変換する関数
const renderMarkdown = async (text: string) => {
  const rawHtml = await marked(text);
  return DOMPurify.sanitize(rawHtml);
};

export default function App() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<any>(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState<string | ErrorState | null>(null);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [sanitizedHtml, setSanitizedHtml] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const [answerHtml, setAnswerHtml] = useState<{ __html: string }>({ __html: '' });

  useEffect(() => {
    setIsClient(true);
  }, []);

  const resetApp = useCallback(() => {
    setUrl('');
    setSummary(null);
    setVideoDetails(null);
    setQuestion('');
    setAnswer('');
    setError(null);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('無効なYouTube URLです');
      }

      const details = await fetchVideoDetails(videoId);
      setVideoDetails(details);

      const summaryText = await generateSummary(details, null);
      setSummary({
        title: details.title,
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        summary: summaryText.split('\n').filter(line => line.trim()),
      });
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : '予期せぬエラーが発生しました',
        type: 'api'
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !videoDetails || !summary) return;

    setLoading(true);
    try {
      const answer = await generateAnswer(question, videoDetails, summary.summary.join('\n'));
      setAnswer(answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期せぬエラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // useEffectの中で非同期処理を扱う
  useEffect(() => {
    const renderHtml = async () => {
      if (summary?.summary) {
        const html = await renderMarkdown(summary.summary.join('\n'));
        setSanitizedHtml(html);
      }
    };

    renderHtml();
  }, [summary, renderMarkdown]);

  const renderMarkdownSync = useCallback(async (markdown: string) => {
    try {
      const html = await renderMarkdown(markdown);
      return { __html: html };
    } catch (err) {
      console.error('Markdown rendering error:', err);
      return { __html: '' };
    }
  }, []);

  useEffect(() => {
    const updateAnswerHtml = async () => {
      if (answer) {
        const html = await renderMarkdownSync(answer);
        setAnswerHtml(html);
      }
    };
    updateAnswerHtml();
  }, [answer, renderMarkdownSync]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={resetApp}
            className="flex items-center gap-2 text-xl font-semibold hover:opacity-80 transition-opacity"
          >
            <Youtube className="h-6 w-6 text-sky-400" />
            <span>AI Youtube動画 要約アプリ</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {!summary ? (
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl font-semibold mb-8">
              内容をまとて欲しいYoutubeのURLを入力してください✨
            </h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                className="w-full bg-sky-400 hover:bg-sky-500 text-white" 
                disabled={loading}
              >
                {loading && isClient ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>まとめを作成中...</span>
                  </div>
                ) : (
                  <strong>まとめを実行する</strong>
                )}
              </Button>
            </form>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-8">
            <Card className="p-4">
              <div className="aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {summary.thumbnail ? (
                  <img
                    src={`https://img.youtube.com/vi/${extractVideoId(url)}/maxresdefault.jpg`}
                    alt={summary.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // maxresdefaultが存在しない場合、hqdefaultにフォールバック
                      const target = e.target as HTMLImageElement;
                      if (target.src.includes('maxresdefault')) {
                        target.src = target.src.replace('maxresdefault', 'hqdefault');
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                  </div>
                )}
              </div>
              <h2 className="text-xl font-semibold mb-4">{summary.title}</h2>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">以下、要約した内容です</h3>
                <div 
                  className="prose prose-gray max-w-none space-y-4 text-gray-600"
                  dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
                />
              </div>
            </Card>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-center">
                質問があればなんでも聞いてください
              </h3>
              <form onSubmit={handleQuestion} className="space-y-4">
                <Textarea
                  placeholder="動画について知りたいことを入力してください"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                <Button 
                  type="submit" 
                  className="w-full bg-sky-400 hover:bg-sky-500 text-white"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2 justify-center">
                      <span>回答を生成中...</span>
                    </div>
                  ) : (
                    '質問する'
                  )}
                </Button>
              </form>
              {answer && (
                <Card className="p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">質問</h3>
                      <p className="text-gray-600">{question}</p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-2">回答</h3>
                      <div 
                        className="prose prose-gray max-w-none text-gray-600"
                        dangerouslySetInnerHTML={answerHtml}
                      />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold mb-2">会社情報</h3>
              <p>株式会社MAKE A CHANGE</p>
              <p>102-0074 東京都千代田区九段南一丁目5番6号</p>
              <p>りそな九段ビル5F KSフロア</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">お問い合わせ</h3>
              <p>Email: info@makeachange.co.jp</p>
              <p>Web Site: <a href="https://makeachange.co.jp/" target="_blank" rel="noopener noreferrer">https://makeachange.co.jp/</a></p>
              
            </div>
            <div>
              <h3 className="font-semibold mb-2">SNS</h3>
              <div className="flex gap-4">
                {/* <a href="#" className="hover:text-white">
                  <Github className="h-6 w-6" />
                </a> */}
                <a href="https://www.facebook.com/masahiro.okamura.7524" className="hover:text-white" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-6 w-6" />
                </a>
                <a href="https://x.com/masa_oka108" className="hover:text-white" target="_blank">
                  <X className="h-6 w-6" />
                </a>
                {/* <a href="#" className="hover:text-white">
                  <Instagram className="h-6 w-6" />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}