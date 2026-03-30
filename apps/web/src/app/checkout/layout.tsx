import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '確認訂單與結帳',
  description: '全行銷 SMM Panel 安全結帳頁面。支援多種新台幣付款方式，包含信用卡、ATM 轉帳與超商代碼，付款後 3 分鐘自動派單，快速啟動您的社群成長計畫。',
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
