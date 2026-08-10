'use client';

import { useEffect, useState } from 'react';

interface CosmicBadgeProps {
  bucketSlug: string;
}

export default function CosmicBadge({ bucketSlug }: CosmicBadgeProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const href = `https://www.cosmicjs.com?utm_source=bucket_${bucketSlug}&utm_medium=referral&utm_campaign=buildedwithcosmic`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-md transition-shadow hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200"
    >
      Built with Cosmic
    </a>
  );
}
