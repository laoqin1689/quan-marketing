import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://kravdo.lol'),
  title: {
    default: '全行銷 — 台灣首選社群行銷平台 | 專業品牌曝光與社群成長引擎',
    template: '%s | 全行銷 SMM Panel',
  },
  description: '全行銷是台灣最受信賴的社群行銷服務平台（SMM Panel）。提供全方位的社群媒體行銷服務，幫助您快速增加粉絲、提升品牌曝光度與社群互動率。免註冊即可下單，支援新台幣付款，3 分鐘自動派單。',
  keywords: 'SMM Panel 台灣, 社群行銷平台, 買粉絲, 買讚, 社群媒體行銷服務, 品牌曝光提升, 增加粉絲方法, 社群成長引擎',
  openGraph: {
    title: '全行銷 — 台灣首選社群行銷平台 | 專業品牌曝光與社群成長引擎',
    description: '全行銷是台灣最受信賴的社群行銷服務平台（SMM Panel）。提供全方位的社群媒體行銷服務，幫助您快速增加粉絲、提升品牌曝光度與社群互動率。',
    type: 'website',
    locale: 'zh_TW',
    siteName: '全行銷 SMM Panel',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  );
}
