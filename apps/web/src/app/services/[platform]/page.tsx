import PlatformClient from './PlatformClient';

export function generateStaticParams() {
  return [
    { platform: 'Instagram' },
    { platform: 'Facebook' },
    { platform: 'YouTube' },
    { platform: 'TikTok' },
    { platform: 'Google' },
    { platform: 'Threads' },
    { platform: 'LINE' },
  ];
}

export default function PlatformPage() {
  return <PlatformClient />;
}
