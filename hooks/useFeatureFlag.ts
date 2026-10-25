'use client';

import { useState, useEffect } from 'react';
import { FeatureKey, isFeatureAllowed, CommercialTier } from '@/lib/feature-flags';

export function useFeatureFlag(featureKey: FeatureKey) {
  const [tier, setTier] = useState<CommercialTier | 'DEMO_LIFETIME'>('TRIAL');
  const [loading, setLoading] = useState(true);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/subscription/status')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.subscription) {
          const currentTier = (data.subscription.tier || (data.subscription.isTrial ? 'TRIAL' : 'SOLO_GP')) as CommercialTier;
          setTier(data.subscription.plan === 'DEMO_LIFETIME' ? 'DEMO_LIFETIME' : currentTier);
        }
      })
      .catch((err) => console.error('Failed to load feature flag tier:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isAllowed = tier === 'DEMO_LIFETIME' ? true : isFeatureAllowed(tier, featureKey);

  const checkOrUpsell = (callback?: () => void) => {
    if (isAllowed) {
      if (callback) callback();
      return true;
    }
    setShowUpsell(true);
    return false;
  };

  return {
    isAllowed,
    loading,
    tier,
    showUpsell,
    setShowUpsell,
    checkOrUpsell,
  };
}
