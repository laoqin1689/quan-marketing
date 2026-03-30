'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAnonymousId, getUTMParams, getRefCode } from '@/lib/tracking';

/* ───── SEO content per service ───── */
const seoContent: Record<string, {
  h1: string;
  intro: string;
  h2Benefits: string;
  benefits: string;
  faqs: { q: string; a: string }[];
}> = {
  'LINE-Followers': {
    h1: 'LINE 官方帳號好友增加方案',
    intro: '全行銷提供專業的 LINE 官方帳號好友增加服務。LINE 是台灣最普及的通訊軟體，擁有超過 2,100 萬活躍用戶，透過增加 LINE OA 好友數，您可以直接觸及目標客群、發送優惠訊息、提升回購率。我們幫助您快速累積 LINE 官方帳號好友，掌握 LINE 官方帳號導流技巧，提升品牌曝光與行銷效益。',
    h2Benefits: '快速累積 LINE 官方帳號好友的實用方法',
    benefits: '除了傳統的 QR Code 導流、LINE Pay 連動加好友等方式，全行銷提供更快速有效的 LINE 好友增加方案。我們的服務幫助您在短時間內大幅提升 LINE 官方帳號好友數，讓您的品牌行銷起步更快、效果更好。買 LINE 好友台灣真人方案，讓您的好友列表更有價值。',
    faqs: [
      { q: 'LINE 官方帳號如何有效增加好友數？', a: '除了在門市放置 QR Code、透過 LINE Pay 連動加好友外，您也可以使用全行銷的 LINE 好友增加服務，快速累積好友數，搭配優質內容經營，達到最佳行銷效果。' },
      { q: '買 LINE 好友安全嗎？', a: '全行銷提供的 LINE 好友增加服務使用安全的方式進行，不需要提供帳號密碼，不會影響您的 LINE 官方帳號正常運作。' },
      { q: '增加 LINE 好友後可以發送訊息嗎？', a: '是的，新增的好友會出現在您的 LINE 官方帳號好友列表中，您可以正常發送群發訊息、優惠券等行銷內容。' },
      { q: 'LINE 好友增加需要多久？', a: '下單後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內開始執行，您可以即時看到好友數的增長。' },
    ],
  },
  'Facebook-Followers': {
    h1: 'Facebook 粉絲購買與粉專追蹤增加方案',
    intro: '全行銷提供專業的 Facebook 粉絲購買服務，幫助您快速增加 FB 粉專追蹤與人氣。購買 Facebook 粉絲專頁讚與追蹤，是提升品牌曝光度最直接有效的方式。我們提供台灣 FB 買粉絲推薦方案，從經濟方案到台灣真人粉絲，滿足不同預算和需求。',
    h2Benefits: '購買 Facebook 粉絲專頁讚與追蹤的優勢',
    benefits: '粉絲專頁的追蹤數直接影響品牌的可信度和觸及範圍。透過快速增加 FB 粉專人氣，您的品牌能夠獲得更多曝光機會，吸引更多潛在客戶。買 FB 真人粉絲台灣方案，讓您的粉絲專頁看起來更具公信力，臉書粉絲團增加追蹤數從此不再困難。',
    faqs: [
      { q: '購買 Facebook 粉絲安全嗎？會不會被鎖帳號？', a: '我們提供多種品質方案，高品質方案使用真人帳號互動，安全性極高。在我們過往經驗中，使用標準方案以上的服務不會有帳號安全問題。' },
      { q: 'FB 買粉絲多少錢？', a: '價格依粉絲來源與數量不同，全行銷提供多種方案，從經濟方案到台灣真人粉絲都有，可依需求彈性選擇。' },
      { q: '買 FB 粉絲會掉嗎？', a: '高品質方案和真人精選方案都含有保固服務，在保固期內掉落會自動補充，確保您的投資有保障。' },
    ],
  },
  'Facebook-Likes': {
    h1: 'Facebook 貼文讚購買與按讚提升方案',
    intro: '想要增加 FB 貼文讚數？全行銷提供 Facebook 貼文讚購買服務，幫助您快速增加按讚數，提升 Facebook 貼文觸及率。臉書貼文如何增加按讚數一直是品牌經營者的重要課題，透過我們的服務，您可以輕鬆解決這個問題。',
    h2Benefits: '提升 Facebook 貼文觸及率的關鍵',
    benefits: '貼文的按讚數是 Facebook 演算法判斷內容品質的重要指標。按讚數越高，貼文被推薦給更多人看到的機會就越大。購買 Facebook 貼文讚快速增加互動，能有效提升貼文的觸及率和曝光度。買 FB 真人按讚方案，安全穩定不掉讚。',
    faqs: [
      { q: 'FB 買讚會被鎖嗎？', a: '大部分買貼文按讚是不會被鎖的，會被鎖帳號通常是因為貼文違反社群守則。我們的服務安全可靠，可以放心使用。' },
      { q: '買 FB 讚多久會到？', a: '付款成功後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內完成。' },
      { q: '可以指定按讚的表情嗎？', a: '目前主要提供「讚」的服務，如需其他表情反應，請聯繫客服了解詳情。' },
    ],
  },
  'Facebook-Views': {
    h1: 'Facebook 影片觀看次數購買方案',
    intro: '全行銷提供專業的 Facebook 影片觀看次數購買服務，幫助您快速累積臉書影片流量。無論是短影音還是 FB 直播買觀看人數，我們都能有效提升 FB 影片曝光率與演算法推薦機會。增加臉書影片觀看人數方法，就選全行銷。',
    h2Benefits: '如何提升 Facebook 影片演算法推薦？',
    benefits: '影片觀看次數是 Facebook 演算法判斷影片品質的核心指標。觀看次數越高，影片被推薦給更多用戶的機會就越大。購買 Facebook 影片觀看快速累積次數，能有效提升 FB 影片曝光率，讓您的影片內容觸及更多目標受眾。',
    faqs: [
      { q: '買 FB 影片觀看安全嗎？', a: '我們的服務使用活躍的 FB 用戶實際觀看您的影片，安全可靠，不會影響您的帳號。' },
      { q: 'FB 直播也可以買觀看嗎？', a: '可以，我們提供 Facebook 直播觀看人數服務，幫助您的直播獲得更多即時觀眾。' },
    ],
  },
  'Google-Reviews': {
    h1: 'Google 地圖評論購買與五星評價增加方案',
    intro: '全行銷提供專業的 Google 地圖評論購買服務，幫助實體店家快速增加 Google 商家評論與五星評價。根據統計，超過 58% 的消費者表示 Google 地圖商家五星評價越多，越容易吸引他們到店消費。買 Google 商家五星評論留言，是提升商家星級評分最直接有效的方式。',
    h2Benefits: 'Google 我的商家評論提升方法',
    benefits: 'Google 商家評論不僅影響消費者的第一印象，更直接影響您在 Google 地圖搜尋結果中的排名。透過增加 Google Maps 在地嚮導評論，您的商家能夠獲得更高的可見度和信任度。買 Google 真人五星評價台灣方案，由真實帳號撰寫高品質評論內容，幫助您解決 Google 商家負評問題。',
    faqs: [
      { q: '餐廳 Google 評論怎麼增加？', a: '除了鼓勵顧客留下評論外，您也可以使用全行銷的 Google 商家評論服務，快速增加五星好評數量，提升整體星級評分。' },
      { q: '買 Google 真人五星評價安全嗎？', a: '我們的評論由真實帳號撰寫，包含在地嚮導帳號，內容自然且符合 Google 的評論規範，安全性高。' },
      { q: 'Google 評論可以指定內容嗎？', a: '可以，我們提供客製化評論內容服務，您可以指定評論的方向和重點，讓評論更符合您的商家特色。' },
      { q: 'Google 評論哪裡買？', a: '全行銷提供一站式 Google 商家評論購買服務，免註冊即可下單，支援新台幣付款，3 分鐘自動派單。' },
    ],
  },
  'YouTube-Followers': {
    h1: 'YouTube 訂閱購買與頻道成長方案',
    intro: '想要快速達到 YouTube 營利門檻？全行銷提供 YouTube 訂閱購買服務，幫助您快速增加 YT 訂閱者。YouTube 營利需要達到 1,000 訂閱者和 4,000 小時觀看時數的門檻，透過購買 YouTube 頻道訂閱人數，您可以更快達到營利資格。買 YouTube 真人訂閱台灣方案，提升頻道曝光率與影響力。',
    h2Benefits: '購買 YouTube 頻道訂閱人數助您達到營利門檻',
    benefits: '訂閱數越高，頻道的權威性和可信度也越高，有助於吸引更多自然訂閱者。快速增加 YT 訂閱者方法，就選全行銷的專業服務。我們提供從全球訂閱到台灣真人訂閱的多種方案，幫助您的頻道快速成長。增加 YouTube 粉絲推薦平台，全行銷是您的最佳選擇。',
    faqs: [
      { q: 'YT 買訂閱安全嗎？', a: '我們的高品質方案使用真實帳號訂閱，不會影響您的頻道安全。建議選擇標準方案以上的服務，確保最佳效果。' },
      { q: '買 YouTube 訂閱可以達到營利門檻嗎？', a: '可以，我們的訂閱服務能幫助您快速達到 1,000 訂閱者的門檻。搭配觀看次數服務，更能加速達成 4,000 小時觀看時數。' },
      { q: '買 YT 訂閱會掉嗎？', a: '高品質方案含有保固服務，在保固期內掉落會自動補充。真人精選方案提供永久保固，確保您的投資有保障。' },
    ],
  },
  'YouTube-Views': {
    h1: 'YouTube 觀看次數購買與流量提升方案',
    intro: '全行銷提供專業的 YouTube 觀看次數購買服務，幫助您快速衝 YouTube 影片人氣流量。購買 YouTube 影片觀看次數，是提升影片演算法推薦最直接的方式。提供買 YT 台灣觀看次數方案，有效提升 YouTube 影片演算法推薦與點擊率，輕鬆達成 4000 小時觀看門檻。',
    h2Benefits: '增加 YT 影片點擊率與流量方法',
    benefits: '觀看次數是 YouTube 演算法判斷影片品質的核心指標。觀看次數越高，影片被推薦給更多用戶的機會就越大。快速刷 YouTube 4000 小時觀看，搭配訂閱服務，更能加速達成營利資格。YouTube 買觀看人數推薦全行銷，衝 YouTube 影片人氣流量就是這麼簡單。',
    faqs: [
      { q: '買 YT 觀看可以達到 4000 小時嗎？', a: '可以，我們的觀看服務能幫助您快速累積觀看時數。搭配訂閱服務，更能加速達成 YouTube 營利門檻。' },
      { q: '買 YouTube 觀看會影響頻道嗎？', a: '我們的服務使用安全的方式增加觀看次數，不會影響您的頻道安全。高品質方案提供高留存率觀看，更有助於演算法推薦。' },
    ],
  },
  'YouTube-Likes': {
    h1: 'YouTube 影片按讚與互動提升方案',
    intro: '全行銷提供買 YouTube 按讚服務，幫助您快速增加 YT 影片讚數與喜歡。購買 YouTube 影片按讚喜歡，能有效提升 YouTube 影片排名權重與互動率。快速增加 YT 影片讚數方法，就選全行銷的專業服務。',
    h2Benefits: '購買 YouTube 影片按讚喜歡提升排名',
    benefits: '影片的按讚數是 YouTube 演算法判斷內容品質的重要指標。按讚數越高，影片在搜尋結果和推薦中的排名就越高。買 YouTube 真人按讚，能有效提升影片的互動率和排名權重，增加 YouTube 影片互動率從此不再困難。',
    faqs: [
      { q: '買 YT 按讚安全嗎？', a: '我們的服務使用安全的方式增加按讚數，不需要提供帳號密碼，不會影響您的頻道安全。' },
      { q: '按讚數會影響影片排名嗎？', a: '是的，按讚數是 YouTube 演算法的重要參考指標之一，按讚數越高，影片被推薦的機會就越大。' },
    ],
  },
  'Threads-Followers': {
    h1: 'Threads 粉絲購買與追蹤增加方案',
    intro: '搶先佈局 Threads 平台！全行銷提供 Threads 粉絲購買服務，幫助您快速累積追蹤數。Threads 作為 Meta 推出的新社群平台，正在快速成長中，現在正是累積粉絲、建立影響力的最佳時機。買 Threads 真人粉絲，有效增加 Threads 帳號曝光度，提升您的社群影響力。',
    h2Benefits: '搶先佈局 Threads 平台粉絲',
    benefits: '在平台發展初期搶先累積粉絲，能讓您在未來獲得更大的競爭優勢。台灣 Threads 買粉絲推薦全行銷，我們提供多種方案包含全球粉絲、華人粉絲和台灣真人粉絲。購買 Threads 粉絲快速累積追蹤數，搶佔社群新平台的先機。',
    faqs: [
      { q: 'Threads 粉絲購買安全嗎？', a: '我們的服務不需要提供帳號密碼，只需提供 Threads 主頁網址即可。使用安全的方式增加粉絲，不會影響您的帳號安全。' },
      { q: '買 Threads 粉絲會影響 Instagram 帳號嗎？', a: '不會，Threads 和 Instagram 雖然由同一家公司營運，但粉絲系統是獨立的。購買 Threads 粉絲不會影響您的 Instagram 帳號。' },
      { q: 'Threads 粉絲多久開始增加？', a: '下單後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內開始執行。' },
    ],
  },
  'Threads-Likes': {
    h1: 'Threads 愛心購買與互動提升方案',
    intro: '想要打造 Threads 高人氣貼文？全行銷提供 Threads 愛心購買服務，幫助您快速增加串文愛心數。購買 Threads 貼文愛心按讚，能有效提升 Threads 貼文觸及率與互動。買 Threads 台灣真人愛心，讓您的貼文獲得更多關注。',
    h2Benefits: '如何提升 Threads 貼文觸及率？',
    benefits: '愛心數是 Threads 演算法判斷內容品質的重要指標。愛心數越高，貼文被推薦給更多用戶的機會就越大。快速增加 Threads 串文愛心數，搭配優質內容創作，能有效提升您在 Threads 平台的影響力。Threads 買讚推薦平台，全行銷是您的最佳選擇。',
    faqs: [
      { q: '買 Threads 愛心安全嗎？', a: '我們的服務使用安全的方式增加愛心數，不需要提供帳號密碼，不會影響您的帳號安全。' },
      { q: 'Threads 愛心多久會到？', a: '付款成功後系統會在 3 分鐘內自動派單，大部分服務會在 1-24 小時內完成。' },
    ],
  },
};

/* ───── Quality plans ───── */
const qualityPlans: Record<string, { id: number; quality: string; label: string; price: number; desc: string; features: string[] }[]> = {
  'Instagram-Followers': [
    { id: 1, quality: 'Economy', label: '經濟方案', price: 15, desc: '快速增加粉絲數', features: ['快速交付', '適合預算有限', '無保固'] },
    { id: 2, quality: 'Standard', label: '標準方案', price: 35, desc: '穩定的粉絲增長', features: ['混合帳號', '性價比最高', '穩定不掉'] },
    { id: 3, quality: 'HQ', label: '高品質方案', price: 65, desc: '真實帳號粉絲', features: ['有頭像和貼文', '30 天保固', '真實帳號'] },
    { id: 4, quality: 'Premium', label: '真人精選', price: 150, desc: '100% 真人活躍帳號', features: ['永久保固', '最高品質', '真人活躍'] },
    { id: 5, quality: 'Premium-TW', label: '台灣真人', price: 350, desc: '台灣本地真人帳號', features: ['台灣帳號', '永久保固', '在地品牌最佳'] },
  ],
  'Instagram-Likes': [
    { id: 6, quality: 'Economy', label: '經濟方案', price: 8, desc: '快速增加愛心', features: ['快速交付', '適合預算有限'] },
    { id: 7, quality: 'Standard', label: '標準方案', price: 18, desc: '穩定的愛心增長', features: ['不掉落', '性價比高'] },
    { id: 8, quality: 'HQ', label: '高品質方案', price: 35, desc: '真實帳號愛心', features: ['提升觸及率', '真實帳號'] },
    { id: 9, quality: 'Premium-TW', label: '台灣真人', price: 250, desc: '台灣真人按讚', features: ['台灣帳號', '最自然'] },
  ],
  'Instagram-Views': [
    { id: 10, quality: 'Standard', label: '標準方案', price: 5, desc: '增加觀看次數', features: ['快速交付', '高性價比'] },
    { id: 11, quality: 'HQ', label: '高品質方案', price: 12, desc: '高留存率觀看', features: ['提升演算法推薦', '高留存'] },
  ],
  'Instagram-Comments': [
    { id: 12, quality: 'Standard', label: '標準方案', price: 80, desc: '增加留言互動', features: ['英文留言', '快速交付'] },
    { id: 13, quality: 'HQ-TW', label: '台灣中文', price: 500, desc: '台灣帳號中文留言', features: ['中文留言', '看起來最自然'] },
  ],
};

const defaultPlans = [
  { id: 100, quality: 'Standard', label: '標準方案', price: 30, desc: '穩定品質', features: ['穩定交付', '性價比高'] },
  { id: 101, quality: 'HQ', label: '高品質方案', price: 60, desc: '高品質服務', features: ['真實帳號', '含保固'] },
];

/* ───── Service label map ───── */
const serviceLabels: Record<string, string> = {
  Followers: '粉絲',
  Likes: '按讚',
  Views: '觀看',
  Comments: '留言',
  Reviews: '評論',
};

export default function ServiceTypeClient() {
  const params = useParams();
  const router = useRouter();
  const platform = decodeURIComponent(params.platform as string);
  const serviceType = decodeURIComponent(params.serviceType as string);

  const plans = qualityPlans[`${platform}-${serviceType}`] || defaultPlans;
  const seo = seoContent[`${platform}-${serviceType}`];

  const [selectedPlan, setSelectedPlan] = useState(plans[1] || plans[0]);
  const [quantity, setQuantity] = useState(1000);
  const [socialAccount, setSocialAccount] = useState('');
  const [email, setEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pricePerUnit = selectedPlan.price / 1000;
  const totalPrice = Math.round(pricePerUnit * quantity);

  useEffect(() => {
    getAnonymousId();
    getUTMParams();
    getRefCode();
  }, []);

  const handleOrder = async () => {
    if (!socialAccount.trim()) {
      alert('請輸入你的社群帳號或連結');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      alert('請輸入有效的 Email');
      return;
    }

    setIsSubmitting(true);

    const utm = getUTMParams();
    const anonymousId = getAnonymousId();
    const refCode = getRefCode();

    const orderData = {
      social_account: socialAccount,
      social_platform: platform,
      email,
      items: [{ category_id: selectedPlan.id, quantity }],
      coupon_code: couponCode || undefined,
      ref_code: refCode || undefined,
      anonymous_id: anonymousId,
      ...utm,
    };

    sessionStorage.setItem('qm_order', JSON.stringify(orderData));
    sessionStorage.setItem('qm_order_display', JSON.stringify({
      platform,
      serviceType,
      plan: selectedPlan.label,
      quantity,
      totalPrice,
      socialAccount,
      email,
    }));

    router.push('/checkout/');
  };

  /* ── JSON-LD ── */
  const serviceLabel = serviceLabels[serviceType] || serviceType;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: seo?.h1 || `${platform} ${serviceLabel}服務`,
    description: seo?.intro || `全行銷提供專業的 ${platform} ${serviceLabel}服務`,
    brand: { '@type': 'Brand', name: '全行銷' },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'TWD',
      lowPrice: plans[0]?.price || 30,
      highPrice: plans[plans.length - 1]?.price || 350,
      offerCount: plans.length,
    },
  };

  const faqJsonLd = seo?.faqs ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seo.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center text-sm text-gray-500">
              <li><Link href="/" className="hover:text-primary-600">首頁</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><Link href={`/services/${platform}/`} className="hover:text-primary-600">{platform}</Link></li>
              <li><span className="mx-2">/</span></li>
              <li><span className="text-gray-900 font-medium">{serviceLabel}</span></li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Plans */}
          <div className="lg:col-span-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {seo?.h1 || `${platform} ${serviceLabel} 方案`}
            </h1>

            {seo && (
              <p className="text-gray-600 leading-relaxed mb-6">{seo.intro}</p>
            )}

            <h2 className="text-xl font-bold text-gray-900 mb-4">選擇品質方案</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {plans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  className={`card text-left transition-all ${
                    selectedPlan.id === plan.id
                      ? 'ring-2 ring-primary-500 border-primary-500 bg-primary-50/50'
                      : 'hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-900">{plan.label}</h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">NT${plan.price}</div>
                      <div className="text-xs text-gray-400">/ 每千</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">{plan.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map((f) => (
                      <span key={f} className="badge-info text-xs">{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Quantity slider */}
            <div className="card mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                數量：<span className="text-primary-600 font-bold">{quantity.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min={100}
                max={50000}
                step={100}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>100</span>
                <span>50,000</span>
              </div>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(100, Math.min(50000, parseInt(e.target.value) || 100)))}
                className="input-field mt-3"
                placeholder="輸入自訂數量"
              />
            </div>

            {/* SEO Benefits Section */}
            {seo && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">{seo.h2Benefits}</h2>
                <p className="text-gray-600 leading-relaxed">{seo.benefits}</p>
              </div>
            )}
          </div>

          {/* Right: Order Form */}
          <div className="lg:col-span-1">
            <div className="card sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-4">下單資訊</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {platform} 帳號或連結 *
                  </label>
                  <input
                    type="text"
                    value={socialAccount}
                    onChange={(e) => setSocialAccount(e.target.value)}
                    placeholder={`輸入你的 ${platform} 帳號`}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-400 mt-1">用於接收訂單通知</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    優惠碼（選填）
                  </label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="輸入優惠碼"
                    className="input-field"
                  />
                </div>

                {/* Order Summary */}
                <div className="border-t border-gray-100 pt-4 mt-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>{selectedPlan.label}</span>
                    <span>x {quantity.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>合計</span>
                    <span className="text-primary-600">NT${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleOrder}
                  disabled={isSubmitting}
                  className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? '處理中...' : '前往結帳'}
                </button>

                <div className="text-center text-xs text-gray-400 space-y-1">
                  <p>免註冊即可下單</p>
                  <p>支援新台幣付款</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        {seo?.faqs && seo.faqs.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">{platform} {serviceLabel}服務常見問題</h2>
            <div className="space-y-4">
              {seo.faqs.map((faq, i) => (
                <details key={i} className="card group cursor-pointer">
                  <summary className="font-semibold text-gray-900 list-none flex justify-between items-center">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
                  </summary>
                  <p className="mt-3 text-gray-600 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
