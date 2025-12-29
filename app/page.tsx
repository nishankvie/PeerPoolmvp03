'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Quick hangout options
const quickHangouts = [
  { id: 'gym', icon: '🏋️', label: 'Gym' },
  { id: 'walk', icon: '🚶', label: 'Walk' },
  { id: 'coffee', icon: '☕', label: 'Coffee' },
  { id: 'library', icon: '📚', label: 'Library' },
  { id: 'chill', icon: '😌', label: 'Chill' },
  { id: 'lunch', icon: '🍽️', label: 'Lunch' },
  { id: 'movie', icon: '🎬', label: 'Movie' },
  { id: 'games', icon: '🎮', label: 'Games' },
  { id: 'study', icon: '📖', label: 'Study' },
];

type TimeFilter = 'today' | 'tomorrow' | 'weekend' | 'custom';

type Hangout = {
  id: string;
  title: string;
  creator_id: string;
  start_time: string | null;
  status: string;
  profiles: { full_name: string | null; email: string; avatar_url: string | null };
  hangout_participants: Array<{ user_id: string; status: string }>;
};

type AvailablePerson = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  time_period: string;
};

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [publicHangouts, setPublicHangouts] = useState<Hangout[]>([]);
  const [availablePeople, setAvailablePeople] = useState<AvailablePerson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Always show the UI, even without Supabase configured
    setLoading(false);
    if (user) {
      fetchData();
    }
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
      case 'weekend':
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
        start.setDate(now.getDate() + daysUntilSaturday);
        start.setHours(0, 0, 0, 0);
        end.setDate(start.getDate() + 1);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate() + 7);
        end.setHours(23, 59, 59, 999);
    }
    
    return { start, end };
  };

  const fetchData = async () => {
    try {
      const { start, end } = getTimeRange();
      
      // Fetch public hangouts
      const { data: hangouts } = await supabase
        .from('hangouts')
        .select(`
          *,
          profiles:creator_id (full_name, email, avatar_url),
          hangout_participants (user_id, status)
        `)
        .eq('is_public', true)
        .in('status', ['planning', 'confirmed'])
        .gte('start_time', start.toISOString())
        .lte('start_time', end.toISOString())
        .order('start_time', { ascending: true })
        .limit(4);

      setPublicHangouts(hangouts || []);

      // Fetch available people (friends who are free around now)
      const now = new Date();
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      if (friendships && friendships.length > 0) {
        const friendIds = friendships.map(f => f.friend_id);
        
        const { data: availableBlocks } = await supabase
          .from('availability_blocks')
          .select(`
            user_id,
            start_time,
            end_time,
            profiles:user_id (id, full_name, email, avatar_url)
          `)
          .in('user_id', friendIds)
          .eq('status', 'available')
          .lte('start_time', now.toISOString())
          .gte('end_time', now.toISOString());

        const available: AvailablePerson[] = (availableBlocks || []).map((block: any) => ({
          ...block.profiles,
          time_period: getTimePeriod(new Date(block.start_time)),
        }));

        setAvailablePeople(available);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimePeriod = (date: Date) => {
    const hour = date.getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  const handleQuickHangout = (hangout: typeof quickHangouts[0]) => {
    router.push(`/create?title=${encodeURIComponent(hangout.label)}`);
  };

  const handleJoinHangout = async (hangoutId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('hangout_participants')
        .insert({
          hangout_id: hangoutId,
          user_id: user.id,
          status: 'accepted',
        });
      
      fetchData();
    } catch (error) {
      console.error('Error joining hangout:', error);
    }
  };

  const handleInterestedHangout = async (hangoutId: string) => {
    if (!user) return;
    
    try {
      await supabase
        .from('hangout_participants')
        .insert({
          hangout_id: hangoutId,
          user_id: user.id,
          status: 'maybe',
        });
      
      fetchData();
    } catch (error) {
      console.error('Error expressing interest:', error);
    }
  };

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

  // Group available people by time period
  const groupedAvailable = availablePeople.reduce((acc, person) => {
    const period = person.time_period;
    if (!acc[period]) acc[period] = [];
    acc[period].push(person);
    return acc;
  }, {} as Record<string, AvailablePerson[]>);

  if (loading) {
    return (
      <div className="px-4 py-6 pb-24">
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-bg-card rounded w-32"></div>
          <div className="flex gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-20 h-20 bg-bg-card rounded-md"></div>
            ))}
          </div>
          <div className="h-6 bg-bg-card rounded w-48"></div>
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-bg-card rounded-md"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-24">
      {/* SECTION 1: Quick Hangout */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Quick Hangout</h2>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3" style={{ width: 'max-content' }}>
            {quickHangouts.map((hangout) => (
              <button
                key={hangout.id}
                onClick={() => handleQuickHangout(hangout)}
                className="w-20 h-20 bg-bg-card border border-border rounded-md flex flex-col items-center justify-center gap-1 hover:border-accent/30 transition-all flex-shrink-0"
              >
                <span className="text-2xl">{hangout.icon}</span>
                <span className="text-xs text-text-primary font-medium">{hangout.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Happening Around You */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Happening Around You</h2>
        
        {/* Time Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4">
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

        {/* Hangout Cards */}
        {publicHangouts.length === 0 ? (
          <div className="bg-bg-card rounded-md p-8 border border-border text-center">
            <p className="text-text-tertiary text-sm">No hangouts happening {timeFilter === 'today' ? 'today' : timeFilter === 'tomorrow' ? 'tomorrow' : 'this weekend'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {publicHangouts.slice(0, 4).map((hangout) => (
              <div
                key={hangout.id}
                className="bg-bg-card rounded-md p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {hangout.profiles?.full_name || hangout.profiles?.email?.split('@')[0]}
                    </p>
                    <h3 className="text-text-secondary text-sm">{hangout.title}</h3>
                  </div>
                  
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    {hangout.hangout_participants.slice(0, 3).map((p, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary"
                      >
                        👤
                      </div>
                    ))}
                    {hangout.hangout_participants.length > 3 && (
                      <div className="w-8 h-8 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary">
                        +{hangout.hangout_participants.length - 3}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleJoinHangout(hangout.id)}
                    className="px-4 py-2 bg-accent text-white text-sm font-semibold rounded-sm hover:bg-accent/90 transition-all"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => handleInterestedHangout(hangout.id)}
                    className="px-4 py-2 border border-accent text-accent text-sm font-semibold rounded-sm hover:bg-accent/5 transition-all"
                  >
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

      {/* SECTION 3: Availability Highlights */}
      <section>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Free around now</h2>
        
        {Object.keys(groupedAvailable).length === 0 ? (
          <div className="bg-bg-card rounded-md p-8 border border-border text-center">
            <p className="text-text-tertiary text-sm">No friends available right now</p>
            <Link
              href="/time"
              className="inline-block mt-3 text-accent text-sm font-medium hover:underline"
            >
              Check availability →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedAvailable).map(([period, people]) => (
              <div key={period} className="bg-bg-card rounded-md p-4 border border-border">
                <p className="text-xs text-text-tertiary mb-2">{period}</p>
                <div className="flex -space-x-2">
                  {people.slice(0, 6).map((person, idx) => (
                    <div
                      key={person.id}
                      className="w-10 h-10 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-sm"
                      title={person.full_name || person.email}
                    >
                      {person.avatar_url ? (
                        <img src={person.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-success">
                          {(person.full_name || person.email)?.[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  ))}
                  {people.length > 6 && (
                    <div className="w-10 h-10 rounded-full bg-bg-primary border-2 border-border flex items-center justify-center text-xs text-text-tertiary">
                      +{people.length - 6}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
