import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">全</span>
              </div>
              <span className="text-xl font-bold text-white">全行銷</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">
              全行銷是台灣最受信賴的社群行銷服務平台。我們提供 Instagram、Facebook、YouTube、TikTok
              等主流社群平台的粉絲、讚、觀看等服務，幫助你快速提升社群影響力。
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">服務項目</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/Instagram/" className="hover:text-white transition-colors">Instagram 服務</Link></li>
              <li><Link href="/services/Facebook/" className="hover:text-white transition-colors">Facebook 服務</Link></li>
              <li><Link href="/services/YouTube/" className="hover:text-white transition-colors">YouTube 服務</Link></li>
              <li><Link href="/services/TikTok/" className="hover:text-white transition-colors">TikTok 服務</Link></li>
              <li><Link href="/services/Google/" className="hover:text-white transition-colors">Google 評論</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">客戶支援</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/order-status/" className="hover:text-white transition-colors">查詢訂單</Link></li>
              <li><Link href="#faq" className="hover:text-white transition-colors">常見問題</Link></li>
              <li><a href="mailto:support@quan-marketing.com" className="hover:text-white transition-colors">聯絡我們</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} 全行銷. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">隱私政策</Link>
            <Link href="#" className="hover:text-white transition-colors">服務條款</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
