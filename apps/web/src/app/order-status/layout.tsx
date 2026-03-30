import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '查詢訂單狀態',
  description: '在全行銷 SMM Panel 查詢您的社群行銷服務訂單狀態。輸入訂單編號，即時追蹤粉絲、按讚、觀看等服務的執行進度。',
};

export default function OrderStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
