'use client';

import { useEffect, useState } from 'react';

export default function CosmicBadge({ bucketSlug }: { bucketSlug: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('cosmic-badge-dismissed');
      if (dismissed !== 'true') setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem('cosmic-badge-dismissed', 'true');
    } catch {
      /* localStorage unavailable */
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <a
        href={`https://www.cosmicjs.com?utm_source=bucket_${bucketSlug}&utm_medium=referral&utm_campaign=badge`}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-gray-700 transition-colors hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      >
        Built with Cosmic
      </a>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss badge"
        className="text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
      >
        &times;
      </button>
    </div>
  );
}
