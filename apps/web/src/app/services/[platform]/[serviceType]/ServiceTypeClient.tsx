'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * The new design consolidates everything into the platform page with tabs.
 * This page now redirects to the platform page.
 * We keep the route alive for SEO and existing links.
 */
export default function ServiceTypeClient() {
  const params = useParams();
  const router = useRouter();
  const platform = decodeURIComponent(params.platform as string);

  useEffect(() => {
    router.replace(`/services/${encodeURIComponent(platform)}/`);
  }, [platform, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 text-sm">正在載入...</p>
      </div>
    </div>
  );
}
