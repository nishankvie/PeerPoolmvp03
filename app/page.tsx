'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

// Mock data
const mockHangouts = [
  {
    id: '1',
    title: 'Coffee at Blue Bottle',
    creator: 'Alex Chen',
    participants: 3,
    time: 'Today, 3:00 PM',
  },
  {
    id: '2',
    title: 'Evening Walk',
    creator: 'Jordan Smith',
    participants: 2,
    time: 'Today, 6:00 PM',
  },
  {
    id: '3',
    title: 'Movie Night',
    creator: 'Sam Taylor',
    participants: 5,
    time: 'Tomorrow, 7:00 PM',
  },
];

const mockAvailable = [
  { id: '1', name: 'Sam', initial: 'S', period: 'Afternoon' },
  { id: '2', name: 'Taylor', initial: 'T', period: 'Afternoon' },
  { id: '3', name: 'Jordan', initial: 'J', period: 'Evening' },
];

export default function HomePage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const handleQuickHangout = (hangout: typeof quickHangouts[0]) => {
    router.push(`/create?title=${encodeURIComponent(hangout.label)}`);
  };

  const handleJoinHangout = (hangoutId: string) => {
    console.log('Join hangout:', hangoutId);
    // Mock action - in real app would show success message
  };

  const handleInterestedHangout = (hangoutId: string) => {
    console.log('Interested in hangout:', hangoutId);
    // Mock action
  };

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

  // Group available people by time period
  const groupedAvailable = mockAvailable.reduce((acc, person) => {
    const period = person.period;
    if (!acc[period]) acc[period] = [];
    acc[period].push(person);
    return acc;
  }, {} as Record<string, typeof mockAvailable>);

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
        {mockHangouts.length === 0 ? (
          <div className="bg-bg-card rounded-md p-8 border border-border text-center">
            <p className="text-text-tertiary text-sm">No hangouts happening {timeFilter === 'today' ? 'today' : timeFilter === 'tomorrow' ? 'tomorrow' : 'this weekend'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockHangouts.slice(0, 4).map((hangout) => (
              <div
                key={hangout.id}
                className="bg-bg-card rounded-md p-4 border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{hangout.creator}</p>
                    <h3 className="text-text-secondary text-sm">{hangout.title}</h3>
                    <p className="text-xs text-text-tertiary mt-1">{hangout.time}</p>
                  </div>
                  
                  {/* Avatar Stack */}
                  <div className="flex -space-x-2">
                    {Array(hangout.participants).fill(0).map((_, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary"
                      >
                        👤
                      </div>
                    ))}
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
                  {people.slice(0, 6).map((person) => (
                    <div
                      key={person.id}
                      className="w-10 h-10 rounded-full bg-success/10 border-2 border-success flex items-center justify-center text-sm text-success font-medium"
                      title={person.name}
                    >
                      {person.initial}
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
