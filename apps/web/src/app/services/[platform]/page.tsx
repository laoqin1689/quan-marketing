import PlatformClient from './PlatformClient';

import { Metadata } from 'next';

const platformSEO: Record<string, { title: string; description: string }> = {
  Instagram: {
    title: 'Instagram 粉絲購買與按讚服務 | 提升 IG 品牌曝光度',
    description: '專業 Instagram 粉絲購買與按讚服務，幫助您快速增加 IG 粉絲與貼文愛心。提升 Instagram 品牌曝光度與社群互動率，打造高人氣 IG 帳號。',
  },
  Facebook: {
    title: 'Facebook 粉絲購買與粉專追蹤增加 | 提升 FB 品牌曝光度',
    description: '專業 Facebook 粉絲購買服務，幫助您快速增加 FB 粉專追蹤與人氣。提供台灣 FB 買粉絲推薦方案，有效提升 Facebook 品牌曝光度與粉絲專頁互動。',
  },
  YouTube: {
    title: 'YouTube 訂閱購買與觀看次數增加 | 快速提升 YT 頻道流量',
    description: '想要快速達到 YouTube 營利門檻？全行銷提供 YouTube 訂閱購買與觀看次數增加服務，幫助您快速增加 YT 訂閱者與影片流量，提升頻道曝光率。',
  },
  TikTok: {
    title: 'TikTok 粉絲購買與觀看次數增加 | 打造高人氣抖音帳號',
    description: '專業 TikTok 粉絲購買與觀看次數增加服務，幫助您的短影音快速爆紅。提升 TikTok 演算法推薦機會，輕鬆打造高人氣抖音帳號。',
  },
  Google: {
    title: 'Google 地圖評論購買與五星評價增加 | 提升商家星級評分',
    description: '專業 Google 地圖評論購買服務，幫助實體店家快速增加 Google 商家評論與五星評價。有效提升 Google 地圖星級評分，建立品牌信任度。',
  },
  Threads: {
    title: 'Threads 粉絲購買與愛心按讚 | 快速增加 Threads 追蹤與影響力',
    description: '搶先佈局 Threads 平台！全行銷提供 Threads 粉絲購買與愛心按讚服務，幫助您快速累積追蹤數與貼文互動，提升您的社群影響力。',
  },
  LINE: {
    title: 'LINE 官方帳號好友增加服務 | 快速累積 LINE OA 好友數',
    description: '想要有效增加 LINE 官方帳號好友數？全行銷提供專業的 LINE 好友增加服務，幫助您快速累積 LINE OA 好友，提升品牌曝光與行銷效益。',
  },
};

export function generateMetadata({ params }: { params: { platform: string } }): Metadata {
  const platform = decodeURIComponent(params.platform);
  const seo = platformSEO[platform] || {
    title: `${platform} 服務 | 全行銷 SMM Panel`,
    description: `全行銷提供專業的 ${platform} 社群行銷服務，幫助您快速提升品牌曝光度與社群影響力。`,
  };

  return {
    title: seo.title,
    description: seo.description,
  };
}

export function generateStaticParams() {
  return [
    { platform: 'Instagram' },
    { platform: 'Facebook' },
    { platform: 'YouTube' },
    { platform: 'TikTok' },
    { platform: 'Google' },
    { platform: 'Threads' },
    { platform: 'LINE' },
  ];
}

export default function PlatformPage() {
  return <PlatformClient />;
}
