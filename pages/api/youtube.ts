import { NextApiRequest, NextApiResponse } from 'next'

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.query

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' })
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    )

    if (!response.ok) {
      throw new Error('YouTube API request failed')
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: '動画が見つかりませんでした' })
    }

    const video = data.items[0].snippet
    return res.status(200).json({
      title: video.title,
      description: video.description,
      thumbnails: video.thumbnails,
    })
  } catch (error) {
    console.error('YouTube API Error:', error)
    return res.status(500).json({ error: '動画情報の取得に失敗しました' })
  }
} 