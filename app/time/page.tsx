'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

type TimeFilter = 'today' | 'tomorrow' | 'weekend' | 'custom';
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

type Person = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  status: 'available' | 'busy' | 'maybe';
};

type PlannedHangout = {
  id: string;
  title: string;
  participants: Person[];
};

type TimeSlotData = {
  id: TimeSlot;
  label: string;
  timeRange: string;
  free: Person[];
  planning: { person: Person; text: string }[];
  planned: PlannedHangout[];
};

export default function MyTimePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [expandedSlot, setExpandedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
  const [loading, setLoading] = useState(true);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

  const defaultTimeSlots: Omit<TimeSlotData, 'free' | 'planning' | 'planned'>[] = [
    { id: 'morning', label: 'Morning', timeRange: '6am - 12pm' },
    { id: 'afternoon', label: 'Afternoon', timeRange: '12pm - 5pm' },
    { id: 'evening', label: 'Evening', timeRange: '5pm - 9pm' },
    { id: 'night', label: 'Night', timeRange: '9pm - 12am' },
  ];

  useEffect(() => {
    // Always show the UI, even without Supabase configured
    // Initialize with empty time slots
    const emptySlots: TimeSlotData[] = defaultTimeSlots.map(slot => ({
      ...slot,
      free: [],
      planning: [],
      planned: [],
    }));
    setTimeSlots(emptySlots);
    setLoading(false);
    
    if (user) {
      fetchTimeSlotData();
    }
  }, [user, timeFilter]);

  const getDateForFilter = () => {
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return now;
      case 'tomorrow':
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return tomorrow;
      case 'weekend':
        const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
        const saturday = new Date(now);
        saturday.setDate(now.getDate() + daysUntilSaturday);
        return saturday;
      default:
        return now;
    }
  };

  const getTimeRangeForSlot = (slot: TimeSlot, baseDate: Date) => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);
    
    switch (slot) {
      case 'morning':
        start.setHours(6, 0, 0, 0);
        end.setHours(12, 0, 0, 0);
        break;
      case 'afternoon':
        start.setHours(12, 0, 0, 0);
        end.setHours(17, 0, 0, 0);
        break;
      case 'evening':
        start.setHours(17, 0, 0, 0);
        end.setHours(21, 0, 0, 0);
        break;
      case 'night':
        start.setHours(21, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    
    return { start, end };
  };

  const fetchTimeSlotData = async () => {
    try {
      const baseDate = getDateForFilter();
      
      // Fetch friends
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', user?.id)
        .eq('status', 'accepted');

      const friendIds = friendships?.map(f => f.friend_id) || [];
      
      const slots: TimeSlotData[] = await Promise.all(
        defaultTimeSlots.map(async (slot) => {
          const { start, end } = getTimeRangeForSlot(slot.id, baseDate);
          
          // Fetch availability blocks for this time slot
          const { data: availabilityData } = await supabase
            .from('availability_blocks')
            .select(`
              user_id,
              status,
              profiles:user_id (id, full_name, email, avatar_url)
            `)
            .in('user_id', [...friendIds, user?.id])
            .lte('start_time', end.toISOString())
            .gte('end_time', start.toISOString());

          const free: Person[] = [];
          const planning: { person: Person; text: string }[] = [];

          (availabilityData || []).forEach((block: any) => {
            if (block.profiles && block.user_id !== user?.id) {
              const person: Person = {
                id: block.profiles.id,
                full_name: block.profiles.full_name,
                email: block.profiles.email,
                avatar_url: block.profiles.avatar_url,
                status: block.status,
              };

              if (block.status === 'available') {
                free.push(person);
              } else if (block.status === 'maybe') {
                planning.push({
                  person,
                  text: `${person.full_name || person.email.split('@')[0]} might be free`,
                });
              }
            }
          });

          // Fetch hangouts for this time slot
          const { data: hangoutsData } = await supabase
            .from('hangouts')
            .select(`
              id,
              title,
              hangout_participants (
                user_id,
                profiles:user_id (id, full_name, email, avatar_url)
              )
            `)
            .in('status', ['planning', 'confirmed'])
            .lte('start_time', end.toISOString())
            .gte('start_time', start.toISOString());

          const planned: PlannedHangout[] = (hangoutsData || []).map((h: any) => ({
            id: h.id,
            title: h.title,
            participants: h.hangout_participants?.map((p: any) => ({
              id: p.profiles?.id,
              full_name: p.profiles?.full_name,
              email: p.profiles?.email,
              avatar_url: p.profiles?.avatar_url,
              status: 'available' as const,
            })) || [],
          }));

          return {
            ...slot,
            free,
            planning,
            planned,
          };
        })
      );

      setTimeSlots(slots);
    } catch (error) {
      console.error('Error fetching time slot data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlot = (slotId: TimeSlot) => {
    setExpandedSlot(expandedSlot === slotId ? null : slotId);
  };

  const getAvatarBorderColor = (status: 'available' | 'busy' | 'maybe') => {
    switch (status) {
      case 'available':
        return 'border-success';
      case 'maybe':
        return 'border-warning';
      case 'busy':
        return 'border-busy';
      default:
        return 'border-border';
    }
  };

  const handlePlanAtTime = (slot: TimeSlotData) => {
    router.push(`/create?time=${slot.id}`);
  };

  if (loading) {
    return (
      <div className="px-4 py-6 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-bg-card rounded w-32"></div>
          <div className="h-4 bg-bg-card rounded w-48"></div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 w-20 bg-bg-card rounded-full"></div>
            ))}
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-bg-card rounded-md"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-bg-primary z-10 px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-text-primary">My Time</h1>
        <p className="text-sm text-text-secondary">See when people are free</p>
      </div>

      <div className="px-4 py-4">
        {/* Time Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto -mx-4 px-4">
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

        {/* Time Slots */}
        <div className="space-y-3">
          {timeSlots.map((slot) => {
            const isExpanded = expandedSlot === slot.id;
            const totalPeople = slot.free.length + slot.planning.length;
            
            return (
              <div key={slot.id} className="bg-bg-card rounded-md border border-border overflow-hidden">
                {/* Collapsed State */}
                <button
                  onClick={() => toggleSlot(slot.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-bg-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-text-primary text-left">{slot.label}</p>
                    <p className="text-xs text-text-tertiary">{slot.timeRange}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {/* Avatar Row */}
                    {totalPeople > 0 && (
                      <div className="flex -space-x-2">
                        {[...slot.free, ...slot.planning.map(p => p.person)]
                          .slice(0, 6)
                          .map((person, idx) => (
                            <div
                              key={person.id || idx}
                              className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(person.status)} bg-bg-primary flex items-center justify-center text-xs`}
                            >
                              {person.avatar_url ? (
                                <img src={person.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-text-tertiary">
                                  {(person.full_name || person.email)?.[0]?.toUpperCase()}
                                </span>
                              )}
                            </div>
                          ))}
                        {totalPeople > 6 && (
                          <div className="w-8 h-8 rounded-full bg-bg-primary border-2 border-border flex items-center justify-center text-xs text-text-tertiary">
                            +{totalPeople - 6}
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Expand Icon */}
                    <svg
                      className={`w-5 h-5 text-text-tertiary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded State */}
                {isExpanded && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* Free Section */}
                    {slot.free.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Free</p>
                        <div className="space-y-2">
                          {slot.free.map((person) => (
                            <div key={person.id} className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(person.status)} bg-bg-primary flex items-center justify-center text-xs`}>
                                {person.avatar_url ? (
                                  <img src={person.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-text-tertiary">
                                    {(person.full_name || person.email)?.[0]?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-text-primary">
                                {person.full_name || person.email.split('@')[0]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Planning Section */}
                    {slot.planning.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Planning</p>
                        <div className="space-y-2">
                          {slot.planning.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(item.person.status)} bg-bg-primary flex items-center justify-center text-xs`}>
                                {item.person.avatar_url ? (
                                  <img src={item.person.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  <span className="text-text-tertiary">
                                    {(item.person.full_name || item.person.email)?.[0]?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-text-secondary">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Planned Section */}
                    {slot.planned.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wide mb-2">Planned</p>
                        <div className="space-y-2">
                          {slot.planned.map((hangout) => (
                            <div key={hangout.id} className="flex items-center justify-between">
                              <span className="text-sm text-text-primary">{hangout.title}</span>
                              <div className="flex -space-x-2">
                                {hangout.participants.slice(0, 3).map((p, idx) => (
                                  <div
                                    key={idx}
                                    className="w-6 h-6 rounded-full bg-bg-primary border border-bg-card flex items-center justify-center text-xs text-text-tertiary"
                                  >
                                    {p.avatar_url ? (
                                      <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                      (p.full_name || p.email)?.[0]?.toUpperCase()
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {slot.free.length === 0 && slot.planning.length === 0 && slot.planned.length === 0 && (
                      <p className="text-sm text-text-tertiary text-center py-2">No one available</p>
                    )}

                    {/* Plan Button */}
                    <button
                      onClick={() => handlePlanAtTime(slot)}
                      className="w-full px-4 py-2 border border-accent text-accent text-sm font-semibold rounded-sm hover:bg-accent/5 transition-all"
                    >
                      Plan something at this time
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
