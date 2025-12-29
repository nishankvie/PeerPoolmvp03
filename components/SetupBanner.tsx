'use client';

import { useAuth } from './AuthProvider';

export function SetupBanner() {
  const { isConfigured } = useAuth();

  if (isConfigured) return null;

  return (
    <div className="bg-warning/10 border-b border-warning/20 px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="text-warning">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Supabase not configured</p>
          <p className="text-xs text-text-secondary mt-1">
            Add your Supabase credentials to <code className="bg-bg-card px-1 rounded">.env.local</code> to enable authentication and database features.
            See <code className="bg-bg-card px-1 rounded">SETUP.md</code> for instructions.
          </p>
        </div>
      </div>
    </div>
  );
}

