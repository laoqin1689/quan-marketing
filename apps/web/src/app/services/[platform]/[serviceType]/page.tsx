import ServiceTypeClient from './ServiceTypeClient';

import { Metadata } from 'next';

const serviceSEO: Record<string, { title: string; description: string }> = {
  'Instagram-Followers': {
    title: 'Instagram 粉絲購買 | 快速增加 IG 粉絲與品牌曝光度',
    description: '專業 Instagram 粉絲購買服務，幫助您快速增加 IG 粉絲數。提供台灣真人粉絲方案，有效提升 Instagram 品牌曝光度與社群影響力。',
  },
  'Instagram-Likes': {
    title: '買 IG 按讚與愛心 | 提升 Instagram 貼文觸及率',
    description: '想要增加 IG 貼文愛心數？全行銷提供 Instagram 按讚購買服務，幫助您快速增加貼文愛心，提升 Instagram 貼文觸及率與互動。',
  },
  'Instagram-Views': {
    title: 'Instagram 觀看次數購買 | 提升 IG Reels 影片流量',
    description: '專業 Instagram 觀看次數購買服務，幫助您快速累積 IG Reels 和影片流量。有效提升 Instagram 演算法推薦機會，打造高人氣短影音。',
  },
  'Instagram-Comments': {
    title: 'Instagram 留言購買 | 增加 IG 貼文互動率',
    description: '全行銷提供 Instagram 留言購買服務，幫助您快速增加 IG 貼文留言互動。提供台灣中文留言方案，看起來最自然，有效提升社群活躍度。',
  },
  'Facebook-Followers': {
    title: 'Facebook 粉絲購買與粉專追蹤增加 | 提升 FB 品牌曝光度',
    description: '專業 Facebook 粉絲購買服務，幫助您快速增加 FB 粉專追蹤與人氣。提供台灣 FB 買粉絲推薦方案，有效提升 Facebook 品牌曝光度與粉絲專頁互動。',
  },
  'Facebook-Likes': {
    title: '買 FB 按讚與 Facebook 貼文讚購買 | 提升臉書貼文觸及率',
    description: '想要增加 FB 貼文讚數？全行銷提供 Facebook 貼文讚購買服務，幫助您快速增加按讚數，提升 Facebook 貼文觸及率。提供買 FB 真人按讚方案。',
  },
  'Facebook-Views': {
    title: 'Facebook 影片觀看次數購買 | 提升 FB 影片曝光率與流量',
    description: '專業 Facebook 影片觀看次數購買服務，幫助您快速累積臉書影片流量。無論是短影音還是 FB 直播買觀看人數，我們都能有效提升 FB 影片曝光率。',
  },
  'YouTube-Followers': {
    title: 'YouTube 訂閱購買 | 快速增加 YT 訂閱與頻道成長',
    description: '想要快速達到 YouTube 營利門檻？全行銷提供 YouTube 訂閱購買服務，幫助您快速增加 YT 訂閱者。買 YouTube 真人訂閱台灣方案，提升頻道曝光率。',
  },
  'YouTube-Views': {
    title: 'YouTube 觀看次數購買 | 提升 YT 影片流量與演算法推薦',
    description: '專業 YouTube 觀看次數購買服務，幫助您快速衝 YouTube 影片人氣流量。提供買 YT 台灣觀看次數方案，輕鬆達成 4000 小時觀看門檻。',
  },
  'YouTube-Likes': {
    title: '買 YouTube 按讚與喜歡 | 增加 YT 影片互動率與排名',
    description: '全行銷提供買 YouTube 按讚服務，幫助您快速增加 YT 影片讚數與喜歡。透過購買 YouTube 影片按讚，有效提升 YouTube 影片排名權重與互動率。',
  },
  'TikTok-Followers': {
    title: 'TikTok 粉絲購買 | 快速增加抖音粉絲與影響力',
    description: '專業 TikTok 粉絲購買服務，幫助您快速增加抖音粉絲數。提升 TikTok 帳號權重與曝光度，輕鬆打造高人氣短影音創作者。',
  },
  'TikTok-Views': {
    title: 'TikTok 觀看次數購買 | 提升抖音短影音流量與推薦',
    description: '想要讓 TikTok 影片上推薦？全行銷提供 TikTok 觀看次數購買服務，幫助您快速累積短影音流量，提升演算法推薦機會。',
  },
  'TikTok-Likes': {
    title: 'TikTok 愛心購買 | 增加抖音影片按讚與互動',
    description: '專業 TikTok 愛心購買服務，幫助您快速增加抖音影片按讚數。提升 TikTok 影片互動率，讓您的短影音更容易被看見。',
  },
  'Google-Reviews': {
    title: 'Google 地圖評論購買與五星評價增加 | 提升商家星級評分',
    description: '專業 Google 地圖評論購買服務，幫助實體店家快速增加 Google 商家評論與五星評價。提供買 Google 真人五星評價台灣方案，建立品牌信任度。',
  },
  'Threads-Followers': {
    title: 'Threads 粉絲購買 | 快速增加 Threads 追蹤與社群影響力',
    description: '搶先佈局 Threads 平台！全行銷提供 Threads 粉絲購買服務，幫助您快速累積追蹤數。買 Threads 真人粉絲，有效增加 Threads 帳號曝光度。',
  },
  'Threads-Likes': {
    title: 'Threads 愛心購買與按讚 | 提升 Threads 貼文觸及率',
    description: '想要打造 Threads 高人氣貼文？全行銷提供 Threads 愛心購買服務，幫助您快速增加串文愛心數。買 Threads 台灣真人愛心，提升貼文觸及率。',
  },
  'LINE-Followers': {
    title: 'LINE 官方帳號好友增加服務 | 快速累積 LINE OA 好友數',
    description: '想要有效增加 LINE 官方帳號好友數？全行銷提供專業的 LINE 好友增加服務，幫助您快速累積 LINE OA 好友，掌握 LINE 官方帳號導流技巧。',
  },
};

export function generateMetadata({ params }: { params: { platform: string; serviceType: string } }): Metadata {
  const platform = decodeURIComponent(params.platform);
  const serviceType = decodeURIComponent(params.serviceType);
  const key = `${platform}-${serviceType}`;
  
  const seo = serviceSEO[key] || {
    title: `${platform} ${serviceType} 服務 | 全行銷 SMM Panel`,
    description: `全行銷提供專業的 ${platform} ${serviceType} 服務，幫助您快速提升品牌曝光度與社群影響力。`,
  };

  return {
    title: seo.title,
    description: seo.description,
  };
}

export function generateStaticParams() {
  return [
    { platform: 'Instagram', serviceType: 'Followers' },
    { platform: 'Instagram', serviceType: 'Likes' },
    { platform: 'Instagram', serviceType: 'Views' },
    { platform: 'Instagram', serviceType: 'Comments' },
    { platform: 'Facebook', serviceType: 'Followers' },
    { platform: 'Facebook', serviceType: 'Likes' },
    { platform: 'Facebook', serviceType: 'Views' },
    { platform: 'YouTube', serviceType: 'Followers' },
    { platform: 'YouTube', serviceType: 'Views' },
    { platform: 'YouTube', serviceType: 'Likes' },
    { platform: 'TikTok', serviceType: 'Followers' },
    { platform: 'TikTok', serviceType: 'Views' },
    { platform: 'TikTok', serviceType: 'Likes' },
    { platform: 'Google', serviceType: 'Reviews' },
    { platform: 'Threads', serviceType: 'Followers' },
    { platform: 'Threads', serviceType: 'Likes' },
    { platform: 'LINE', serviceType: 'Followers' },
  ];
}

export default function ServiceTypePage() {
  return <ServiceTypeClient />;
}
