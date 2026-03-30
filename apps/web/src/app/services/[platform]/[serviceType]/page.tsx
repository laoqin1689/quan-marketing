import ServiceTypeClient from './ServiceTypeClient';

export function generateStaticParams() {
  return [
    { platform: 'Instagram', serviceType: 'Followers' },
    { platform: 'Instagram', serviceType: 'Likes' },
    { platform: 'Instagram', serviceType: 'Views' },
    { platform: 'Instagram', serviceType: 'Comments' },
    { platform: 'Facebook', serviceType: 'Followers' },
    { platform: 'Facebook', serviceType: 'Likes' },
    { platform: 'Facebook', serviceType: 'Views' },
    { platform: 'YouTube', serviceType: 'Followers' },
    { platform: 'YouTube', serviceType: 'Views' },
    { platform: 'YouTube', serviceType: 'Likes' },
    { platform: 'TikTok', serviceType: 'Followers' },
    { platform: 'TikTok', serviceType: 'Views' },
    { platform: 'TikTok', serviceType: 'Likes' },
    { platform: 'Google', serviceType: 'Reviews' },
    { platform: 'Threads', serviceType: 'Followers' },
    { platform: 'Threads', serviceType: 'Likes' },
    { platform: 'LINE', serviceType: 'Followers' },
  ];
}

export default function ServiceTypePage() {
  return <ServiceTypeClient />;
}
