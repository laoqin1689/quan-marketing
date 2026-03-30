'use client';

const PLATFORM_ICONS: Record<string, { bg: string; label: string }> = {
  'Instagram': { bg: 'from-pink-500 to-purple-600', label: 'IG' },
  'Facebook': { bg: 'from-blue-600 to-blue-700', label: 'FB' },
  'YouTube': { bg: 'from-red-500 to-red-600', label: 'YT' },
  'TikTok': { bg: 'from-gray-900 to-gray-800', label: 'TT' },
  'Threads': { bg: 'from-gray-800 to-gray-900', label: 'Th' },
  'Twitter/X': { bg: 'from-gray-900 to-black', label: 'X' },
  'LINE': { bg: 'from-green-500 to-green-600', label: 'LN' },
  'Telegram': { bg: 'from-sky-400 to-sky-500', label: 'TG' },
  'Snapchat': { bg: 'from-yellow-400 to-yellow-500', label: 'SC' },
  'Spotify': { bg: 'from-green-400 to-green-600', label: 'SP' },
  'LinkedIn': { bg: 'from-blue-700 to-blue-800', label: 'LI' },
  'Twitch': { bg: 'from-purple-500 to-purple-700', label: 'TW' },
  'Google': { bg: 'from-blue-500 to-green-500', label: 'G' },
  'Google Maps': { bg: 'from-green-500 to-blue-500', label: 'GM' },
  'Website Traffic': { bg: 'from-indigo-500 to-indigo-600', label: 'WT' },
  'Crypto/NFT': { bg: 'from-orange-400 to-yellow-500', label: 'CR' },
  'SoundCloud': { bg: 'from-orange-500 to-orange-600', label: 'SC' },
  'Quora': { bg: 'from-red-600 to-red-700', label: 'Qu' },
  'Xiaohongshu': { bg: 'from-red-500 to-red-600', label: 'XH' },
  'Shopee': { bg: 'from-orange-500 to-red-500', label: 'SH' },
  'Reddit': { bg: 'from-orange-500 to-orange-600', label: 'RD' },
  'Taiwan Forums': { bg: 'from-teal-500 to-teal-600', label: 'TF' },
  'Clubhouse': { bg: 'from-yellow-600 to-amber-600', label: 'CH' },
  'Pinterest': { bg: 'from-red-500 to-red-600', label: 'Pi' },
  'Apple Music': { bg: 'from-pink-500 to-red-500', label: 'AM' },
  'Dcard': { bg: 'from-sky-500 to-sky-600', label: 'DC' },
  'Tumblr': { bg: 'from-indigo-600 to-indigo-700', label: 'Tu' },
  'Vimeo': { bg: 'from-cyan-500 to-blue-500', label: 'Vi' },
  'Discord': { bg: 'from-indigo-500 to-indigo-600', label: 'DS' },
  'Shazam': { bg: 'from-blue-500 to-blue-600', label: 'SZ' },
  'Deezer': { bg: 'from-purple-600 to-purple-700', label: 'DZ' },
  'Other': { bg: 'from-gray-400 to-gray-500', label: '...' },
};

interface PlatformIconProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PlatformIcon({ platform, size = 'md', className = '' }: PlatformIconProps) {
  const info = PLATFORM_ICONS[platform] || { bg: 'from-gray-400 to-gray-500', label: platform.slice(0, 2) };

  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px] rounded-md',
    md: 'w-8 h-8 text-xs rounded-lg',
    lg: 'w-10 h-10 text-sm rounded-lg',
    xl: 'w-14 h-14 text-lg rounded-xl',
  };

  return (
    <div
      className={`bg-gradient-to-br ${info.bg} flex items-center justify-center text-white font-bold shrink-0 ${sizeClasses[size]} ${className}`}
      title={platform}
    >
      {info.label}
    </div>
  );
}

export { PLATFORM_ICONS };
