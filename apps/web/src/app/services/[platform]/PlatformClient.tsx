'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const platformInfo: Record<string, { name: string; icon: string; color: string; description: string }> = {
  Instagram: { name: 'Instagram', icon: '📸', color: 'from-pink-500 to-purple-500', description: '提升你的 Instagram 影響力，從粉絲到互動全方位成長' },
  Facebook: { name: 'Facebook', icon: '👍', color: 'from-blue-500 to-blue-600', description: '增強你的 Facebook 粉專影響力，提升品牌曝光度' },
  YouTube: { name: 'YouTube', icon: '▶️', color: 'from-red-500 to-red-600', description: '加速你的 YouTube 頻道成長，增加訂閱與觀看' },
  TikTok: { name: 'TikTok', icon: '🎵', color: 'from-gray-900 to-gray-800', description: '讓你的 TikTok 短影音快速爆紅' },
  Google: { name: 'Google', icon: '⭐', color: 'from-green-500 to-blue-500', description: '提升 Google 商家評論，建立品牌信任度' },
  Threads: { name: 'Threads', icon: '🧵', color: 'from-gray-700 to-gray-900', description: '搶先佈局 Threads 平台，快速累積粉絲' },
  LINE: { name: 'LINE', icon: '💬', color: 'from-green-400 to-green-600', description: '增加 LINE 官方帳號好友數' },
};

const serviceTypes: Record<string, { type: string; label: string; desc: string }[]> = {
  Instagram: [
    { type: 'Followers', label: '粉絲', desc: '增加 Instagram 粉絲數，提升帳號影響力' },
    { type: 'Likes', label: '愛心', desc: '增加貼文愛心數，提升觸及率' },
    { type: 'Views', label: '觀看', desc: '增加 Reels 和影片觀看次數' },
    { type: 'Comments', label: '留言', desc: '增加貼文留言互動' },
  ],
  Facebook: [
    { type: 'Followers', label: '粉專追蹤', desc: '增加粉絲專頁追蹤人數' },
    { type: 'Likes', label: '貼文讚', desc: '增加貼文按讚數' },
    { type: 'Views', label: '影片觀看', desc: '增加影片觀看次數' },
  ],
  YouTube: [
    { type: 'Followers', label: '訂閱', desc: '增加頻道訂閱人數' },
    { type: 'Views', label: '觀看', desc: '增加影片觀看次數' },
    { type: 'Likes', label: '按讚', desc: '增加影片按讚數' },
  ],
  TikTok: [
    { type: 'Followers', label: '粉絲', desc: '增加 TikTok 粉絲數' },
    { type: 'Views', label: '觀看', desc: '增加短影音觀看次數' },
    { type: 'Likes', label: '愛心', desc: '增加短影音愛心數' },
  ],
  Google: [
    { type: 'Reviews', label: '商家評論', desc: '增加 Google 商家五星評論' },
  ],
  Threads: [
    { type: 'Followers', label: '粉絲', desc: '增加 Threads 粉絲數' },
    { type: 'Likes', label: '愛心', desc: '增加 Threads 愛心數' },
  ],
  LINE: [
    { type: 'Followers', label: '好友', desc: '增加 LINE 官方帳號好友數' },
  ],
};

export default function PlatformClient() {
  const params = useParams();
  const platform = decodeURIComponent(params.platform as string);
  const info = platformInfo[platform];
  const services = serviceTypes[platform] || [];

  if (!info) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900">平台不存在</h1>
          <Link href="/" className="text-primary-600 mt-4 inline-block">返回首頁</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className={`bg-gradient-to-br ${info.color} text-white py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-5xl mb-4">{info.icon}</div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{info.name} 服務</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">{info.description}</p>
        </div>
      </section>

      {/* Service Types */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">選擇服務類型</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {services.map((s) => (
              <Link
                key={s.type}
                href={`/services/${platform}/${s.type}/`}
                className="card group hover:scale-[1.02] text-center"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {s.label}
                </h3>
                <p className="text-gray-500 text-sm mb-4">{s.desc}</p>
                <span className="text-primary-600 text-sm font-medium">
                  查看方案 →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
