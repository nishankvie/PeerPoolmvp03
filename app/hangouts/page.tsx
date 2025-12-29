'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';

type TimeFilter = 'today' | 'tomorrow' | 'weekend' | 'custom';

type HangoutParticipant = {
  user_id: string;
  status: string;
};

type Profile = {
  full_name: string | null;
  email: string;
  avatar_url: string | null;
};

type Hangout = {
  id: string;
  title: string;
  description: string | null;
  creator_id: string;
  start_time: string | null;
  end_time: string | null;
  status: 'planning' | 'confirmed' | 'cancelled' | 'completed';
  is_public: boolean;
  created_at: string;
  profiles: Profile;
  hangout_participants: HangoutParticipant[];
};

type HangoutParticipantRow = {
  hangout_id: string;
};

export default function HangoutsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [plannedByMe, setPlannedByMe] = useState<Hangout[]>([]);
  const [joinedHangouts, setJoinedHangouts] = useState<Hangout[]>([]);
  const [pastHangouts, setPastHangouts] = useState<Hangout[]>([]);
  const [publicHangouts, setPublicHangouts] = useState<Hangout[]>([]);
  const [loading, setLoading] = useState(true);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

  useEffect(() => {
    if (user) fetchHangouts();
    else setLoading(false);
  }, [user, timeFilter]);

  const getTimeRange = () => {
    const now = new Date();
    const start = new Date();
    const end = new Date();

    switch (timeFilter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'tomorrow':
        start.setDate(now.getDate() + 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekend': {
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
        start.setDate(now.getDate() + daysUntilSaturday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      }
      default:
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + 7);
        end.setHours(23, 59, 59, 999);
    }

    return { start, end };
  };

  const fetchHangouts = async () => {
    try {
      const { start, end } = getTimeRange();

      const { data: myHangouts } = await supabase
        .from('hangouts')
        .select(`
          *,
          profiles:creator_id (full_name, email, avatar_url),
          hangout_participants (user_id, status)
        `)
        .eq('creator_id', user!.id)
        .in('status', ['planning', 'confirmed']) as {
          data: Hangout[] | null;
        };

      setPlannedByMe(myHangouts ?? []);

      const { data: participatingData } = await supabase
        .from('hangout_participants')
        .select('hangout_id')
        .eq('user_id', user!.id)
        .in('status', ['accepted', 'maybe']) as {
          data: HangoutParticipantRow[] | null;
        };

      const participatingIds =
        participatingData?.map(p => p.hangout_id) ?? [];

      if (participatingIds.length > 0) {
        const { data: joined } = await supabase
          .from('hangouts')
          .select(`
            *,
            profiles:creator_id (full_name, email, avatar_url),
            hangout_participants (user_id, status)
          `)
          .in('id', participatingIds)
          .neq('creator_id', user!.id)
          .in('status', ['planning', 'confirmed']) as {
            data: Hangout[] | null;
          };

        setJoinedHangouts(joined ?? []);
      }

      const { data: past } = await supabase
        .from('hangouts')
        .select(`
          *,
          profiles:creator_id (full_name, email, avatar_url),
          hangout_participants (user_id, status)
        `)
        .or(`creator_id.eq.${user!.id}`)
        .in('status', ['completed', 'cancelled'])
        .order('start_time', { ascending: false })
        .limit(5) as {
          data: Hangout[] | null;
        };

      setPastHangouts(past ?? []);

      const { data: discover } = await supabase
        .from('hangouts')
        .select(`
          *,
          profiles:creator_id (full_name, email, avatar_url),
          hangout_participants (user_id, status)
        `)
        .eq('is_public', true)
        .neq('creator_id', user!.id)
        .in('status', ['planning', 'confirmed'])
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time', { ascending: true })
        .limit(4) as {
          data: Hangout[] | null;
        };

      const filteredDiscover =
        discover?.filter(h => !participatingIds.includes(h.id)) ?? [];

      setPublicHangouts(filteredDiscover);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Time TBD';
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (isTomorrow) return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'cancelled':
        return 'bg-red-50 text-red-500 border-red-200';
      case 'completed':
        return 'bg-text-tertiary/10 text-text-tertiary border-text-tertiary/20';
      default:
        return 'bg-bg-card text-text-tertiary border-border';
    }
  };

  const HangoutCard = ({ hangout, showCreator = false }: { hangout: Hangout; showCreator?: boolean }) => (
    <div className="bg-bg-card rounded-md p-4 border border-border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{hangout.title}</h3>
          <p className="text-xs text-text-tertiary mt-1">{formatDate(hangout.start_time)}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusStyle(hangout.status)}`}>
          {hangout.status}
        </span>
      </div>
      
      {hangout.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{hangout.description}</p>
      )}

      <div className="flex items-center justify-between">
        {/* Avatar Stack */}
        <div className="flex -space-x-2">
          {hangout.hangout_participants.slice(0, 4).map((p, idx) => (
            <div
              key={idx}
              className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary"
            >
              👤
            </div>
          ))}
          {hangout.hangout_participants.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary">
              +{hangout.hangout_participants.length - 4}
            </div>
          )}
        </div>

        {showCreator && (
          <p className="text-xs text-text-tertiary">
            by {hangout.profiles?.full_name || hangout.profiles?.email?.split('@')[0]}
          </p>
        )}

        {hangout.is_public && (
          <span className="text-xs text-accent font-medium">Public</span>
        )}
      </div>
    </div>
  );

  const Section = ({ title, hangouts, showCreator = false, emptyMessage }: { 
    title: string; 
    hangouts: Hangout[];
    showCreator?: boolean;
    emptyMessage: string;
  }) => (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-text-primary mb-3">{title}</h2>
      {hangouts.length === 0 ? (
        <div className="bg-bg-card rounded-md p-6 border border-border text-center">
          <p className="text-text-tertiary text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {hangouts.map((hangout) => (
            <HangoutCard key={hangout.id} hangout={hangout} showCreator={showCreator} />
          ))}
        </div>
      )}
    </section>
  );

  if (loading) {
    return (
      <div className="px-4 py-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-bg-card rounded w-32"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-20 bg-bg-card rounded-full"></div>
            ))}
          </div>
          {[1, 2, 3].map(i => (
            <div key={i}>
              <div className="h-6 bg-bg-card rounded w-40 mb-3"></div>
              <div className="h-24 bg-bg-card rounded-md"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-bg-primary z-10 px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">Hangouts</h1>
        
        {/* Time Filters */}
        <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
          {timeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTimeFilter(filter.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                timeFilter === filter.key
                  ? 'bg-accent text-white'
                  : 'border border-border text-text-secondary hover:border-accent/30'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Section 1: Planned by You */}
        <Section 
          title="Planned by You" 
          hangouts={plannedByMe}
          emptyMessage="You haven't planned any hangouts yet"
        />

        {/* Section 2: Joined Hangouts */}
        <Section 
          title="Joined Hangouts" 
          hangouts={joinedHangouts}
          showCreator
          emptyMessage="You haven't joined any hangouts"
        />

        {/* Section 3: Past Hangouts */}
        {pastHangouts.length > 0 && (
          <Section 
            title="Past Hangouts" 
            hangouts={pastHangouts}
            emptyMessage=""
          />
        )}

        {/* Section 4: Find More Hangouts */}
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">Find More Hangouts</h2>
          {publicHangouts.length === 0 ? (
            <div className="bg-bg-card rounded-md p-8 border border-border text-center">
              <p className="text-text-tertiary text-sm mb-4">No public hangouts available</p>
              <Link
                href="/create"
                className="inline-block px-6 py-2 bg-accent text-white font-semibold rounded-sm hover:bg-accent/90 transition-all"
              >
                Create one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {publicHangouts.map((hangout) => (
                <div key={hangout.id} className="bg-bg-card rounded-md p-4 border border-border">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-xs text-text-tertiary mb-1">
                        {hangout.profiles?.full_name || hangout.profiles?.email?.split('@')[0]}
                      </p>
                      <h3 className="font-semibold text-text-primary">{hangout.title}</h3>
                      <p className="text-xs text-text-tertiary mt-1">{formatDate(hangout.start_time)}</p>
                    </div>
                    
                    {/* Avatar Stack */}
                    <div className="flex -space-x-2">
                      {hangout.hangout_participants.slice(0, 3).map((p, idx) => (
                        <div
                          key={idx}
                          className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary"
                        >
                          👤
                        </div>
                      ))}
                      {hangout.hangout_participants.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary">
                          +{hangout.hangout_participants.length - 3}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-3">
                    <button className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-sm hover:bg-accent/90 transition-all">
                      Join
                    </button>
                    <button className="px-4 py-2 border border-accent text-accent text-sm font-semibold rounded-sm hover:bg-accent/5 transition-all">
                      Interested
                    </button>
                    <button className="px-4 py-2 text-text-tertiary text-sm font-medium hover:text-text-secondary transition-all">
                      Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
