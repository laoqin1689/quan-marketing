import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">全</span>
              </div>
              <span className="text-xl font-bold text-white">全行銷</span>
            </div>
            <p className="text-sm leading-relaxed">
              全行銷是台灣首選的社群行銷服務平台（SMM Panel）。提供全方位的社群媒體行銷服務，幫助品牌快速增加粉絲、提升曝光度與社群互動率。免註冊即可下單，支援新台幣付款。
            </p>
          </div>

          {/* Priority Platforms */}
          <div>
            <h3 className="text-white font-semibold mb-4">熱門服務</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/LINE/" className="hover:text-white transition-colors">LINE 好友增加</Link></li>
              <li><Link href="/services/LINE/Followers/" className="hover:text-white transition-colors">LINE 官方帳號好友</Link></li>
              <li><Link href="/services/Facebook/" className="hover:text-white transition-colors">Facebook 粉絲服務</Link></li>
              <li><Link href="/services/Facebook/Followers/" className="hover:text-white transition-colors">FB 粉專追蹤增加</Link></li>
              <li><Link href="/services/Facebook/Likes/" className="hover:text-white transition-colors">FB 貼文按讚</Link></li>
              <li><Link href="/services/Google/" className="hover:text-white transition-colors">Google 商家評論</Link></li>
              <li><Link href="/services/Google/Reviews/" className="hover:text-white transition-colors">Google 五星評價</Link></li>
            </ul>
          </div>

          {/* More Platforms */}
          <div>
            <h3 className="text-white font-semibold mb-4">更多平台</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/services/YouTube/" className="hover:text-white transition-colors">YouTube 訂閱與觀看</Link></li>
              <li><Link href="/services/YouTube/Followers/" className="hover:text-white transition-colors">YT 訂閱購買</Link></li>
              <li><Link href="/services/Threads/" className="hover:text-white transition-colors">Threads 粉絲服務</Link></li>
              <li><Link href="/services/Threads/Followers/" className="hover:text-white transition-colors">Threads 追蹤增加</Link></li>
              <li><Link href="/services/Instagram/" className="hover:text-white transition-colors">Instagram 粉絲服務</Link></li>
              <li><Link href="/services/TikTok/" className="hover:text-white transition-colors">TikTok 粉絲服務</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">客戶支援</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/order-status/" className="hover:text-white transition-colors">查詢訂單狀態</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition-colors">社群行銷常見問題</Link></li>
              <li><a href="mailto:support@quan-marketing.com" className="hover:text-white transition-colors">聯絡我們</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>&copy; {new Date().getFullYear()} 全行銷 SMM Panel. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">隱私政策</Link>
            <Link href="#" className="hover:text-white transition-colors">服務條款</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
