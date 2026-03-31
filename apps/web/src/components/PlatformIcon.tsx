'use client';

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaTiktok,
  FaThreads,
  FaXTwitter,
  FaLine,
  FaTelegram,
  FaSnapchat,
  FaSpotify,
  FaLinkedinIn,
  FaTwitch,
  FaGoogle,
  FaMapLocationDot,
  FaGlobe,
  FaRedditAlien,
  FaPinterestP,
  FaApple,
  FaDiscord,
  FaTumblr,
  FaVimeoV,
  FaSoundcloud,
  FaQuora,
  FaShopify,
} from 'react-icons/fa6';

import {
  SiSnapchat,
  SiShazam,
  SiClubhouse,
} from 'react-icons/si';

import type { IconType } from 'react-icons';

// ==================== Platform Icon Config ====================

interface PlatformConfig {
  icon: IconType | null;
  bg: string;
  label: string; // fallback text when no icon
  iconColor?: string; // override icon color (default white)
}

const PLATFORM_ICONS: Record<string, PlatformConfig> = {
  'Instagram': {
    icon: FaInstagram,
    bg: 'bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]',
    label: 'IG',
  },
  'Facebook': {
    icon: FaFacebookF,
    bg: 'bg-[#1877F2]',
    label: 'FB',
  },
  'YouTube': {
    icon: FaYoutube,
    bg: 'bg-[#FF0000]',
    label: 'YT',
  },
  'TikTok': {
    icon: FaTiktok,
    bg: 'bg-black',
    label: 'TT',
  },
  'Threads': {
    icon: FaThreads,
    bg: 'bg-black',
    label: 'Th',
  },
  'Twitter/X': {
    icon: FaXTwitter,
    bg: 'bg-black',
    label: 'X',
  },
  'LINE': {
    icon: FaLine,
    bg: 'bg-[#06C755]',
    label: 'LN',
  },
  'Telegram': {
    icon: FaTelegram,
    bg: 'bg-[#26A5E4]',
    label: 'TG',
  },
  'Snapchat': {
    icon: FaSnapchat,
    bg: 'bg-[#FFFC00]',
    label: 'SC',
    iconColor: 'text-black',
  },
  'Spotify': {
    icon: FaSpotify,
    bg: 'bg-[#1DB954]',
    label: 'SP',
  },
  'LinkedIn': {
    icon: FaLinkedinIn,
    bg: 'bg-[#0A66C2]',
    label: 'LI',
  },
  'Twitch': {
    icon: FaTwitch,
    bg: 'bg-[#9146FF]',
    label: 'TW',
  },
  'Google': {
    icon: FaGoogle,
    bg: 'bg-[#4285F4]',
    label: 'G',
  },
  'Google Maps': {
    icon: FaMapLocationDot,
    bg: 'bg-[#34A853]',
    label: 'GM',
  },
  'Website Traffic': {
    icon: FaGlobe,
    bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
    label: 'WT',
  },
  'Crypto/NFT': {
    icon: null,
    bg: 'bg-gradient-to-br from-orange-400 to-yellow-500',
    label: 'CR',
  },
  'SoundCloud': {
    icon: FaSoundcloud,
    bg: 'bg-[#FF5500]',
    label: 'SC',
  },
  'Quora': {
    icon: FaQuora,
    bg: 'bg-[#B92B27]',
    label: 'Qu',
  },
  'Xiaohongshu': {
    icon: null,
    bg: 'bg-[#FE2C55]',
    label: '小红书',
  },
  'Shopee': {
    icon: null,
    bg: 'bg-[#EE4D2D]',
    label: '蝦皮',
  },
  'Reddit': {
    icon: FaRedditAlien,
    bg: 'bg-[#FF4500]',
    label: 'RD',
  },
  'Taiwan Forums': {
    icon: null,
    bg: 'bg-gradient-to-br from-teal-500 to-teal-600',
    label: '論壇',
  },
  'Clubhouse': {
    icon: SiClubhouse,
    bg: 'bg-[#F3E6D3]',
    label: 'CH',
    iconColor: 'text-black',
  },
  'Pinterest': {
    icon: FaPinterestP,
    bg: 'bg-[#E60023]',
    label: 'Pi',
  },
  'Apple Music': {
    icon: FaApple,
    bg: 'bg-gradient-to-br from-[#FA2D48] to-[#A334FA]',
    label: 'AM',
  },
  'Dcard': {
    icon: null,
    bg: 'bg-[#006AA6]',
    label: 'Dcard',
  },
  'Tumblr': {
    icon: FaTumblr,
    bg: 'bg-[#36465D]',
    label: 'Tu',
  },
  'Vimeo': {
    icon: FaVimeoV,
    bg: 'bg-[#1AB7EA]',
    label: 'Vi',
  },
  'Discord': {
    icon: FaDiscord,
    bg: 'bg-[#5865F2]',
    label: 'DS',
  },
  'Shazam': {
    icon: SiShazam,
    bg: 'bg-[#0088FF]',
    label: 'SZ',
  },
  'Deezer': {
    icon: null,
    bg: 'bg-black',
    label: 'DZ',
  },
  'Other': {
    icon: null,
    bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
    label: '...',
  },
};

// ==================== Component ====================

interface PlatformIconProps {
  platform: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PlatformIcon({ platform, size = 'md', className = '' }: PlatformIconProps) {
  const config = PLATFORM_ICONS[platform] || {
    icon: null,
    bg: 'bg-gradient-to-br from-gray-400 to-gray-500',
    label: platform.slice(0, 2),
  };

  const sizeClasses = {
    sm: 'w-6 h-6 rounded-md',
    md: 'w-8 h-8 rounded-lg',
    lg: 'w-10 h-10 rounded-lg',
    xl: 'w-14 h-14 rounded-xl',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
  };

  const textSizes = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  const IconComponent = config.icon;
  const colorClass = config.iconColor || 'text-white';

  return (
    <div
      className={`${config.bg} flex items-center justify-center shrink-0 ${sizeClasses[size]} ${className}`}
      title={platform}
    >
      {IconComponent ? (
        <IconComponent size={iconSizes[size]} className={colorClass} />
      ) : (
        <span className={`${colorClass} font-bold ${textSizes[size]}`}>
          {config.label}
        </span>
      )}
    </div>
  );
}

export { PLATFORM_ICONS };
