import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '全行銷 — 社群成長引擎 | IG/FB/YT/TikTok 粉絲、讚、觀看',
  description: '全行銷是台灣最受信賴的社群行銷服務平台。免註冊即可下單，支援新台幣付款，3 分鐘自動派單。提供 Instagram、Facebook、YouTube、TikTok 等平台的粉絲、讚、觀看等服務。',
  keywords: '買粉絲, IG粉絲, 社群行銷, SMM Panel, 買讚, 買觀看, 社群成長',
  openGraph: {
    title: '全行銷 — 你的社群成長引擎',
    description: '免註冊、支援新台幣、3 分鐘自動派單的社群行銷服務平台',
    type: 'website',
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
