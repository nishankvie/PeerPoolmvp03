'use client';

import { useState } from 'react';
import Link from 'next/link';

type TimeFilter = 'today' | 'tomorrow' | 'weekend' | 'custom';

type Hangout = {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  status: 'planning' | 'confirmed' | 'cancelled' | 'completed';
  is_public: boolean;
  creator: string;
  participants: number;
};

// Mock data
const mockPlannedByMe: Hangout[] = [
  {
    id: '1',
    title: 'Coffee at Blue Bottle',
    description: "Let's grab coffee and catch up",
    start_time: '2024-01-15T15:00:00',
    status: 'confirmed',
    is_public: false,
    creator: 'You',
    participants: 3,
  },
];

const mockJoinedHangouts: Hangout[] = [
  {
    id: '2',
    title: 'Evening Walk',
    description: 'Walking around the park',
    start_time: '2024-01-15T18:00:00',
    status: 'confirmed',
    is_public: false,
    creator: 'Alex Chen',
    participants: 2,
  },
];

const mockPublicHangouts: Hangout[] = [
  {
    id: '3',
    title: 'Movie Night',
    description: 'Watching the latest release',
    start_time: '2024-01-16T19:00:00',
    status: 'planning',
    is_public: true,
    creator: 'Sam Taylor',
    participants: 5,
  },
];

export default function HangoutsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Time TBD';
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday)
      return `Today, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;

    if (isTomorrow)
      return `Tomorrow, ${date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })}`;

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
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

  const HangoutCard = ({
    hangout,
    showCreator = false,
  }: {
    hangout: Hangout;
    showCreator?: boolean;
  }) => (
    <div className="bg-bg-card rounded-md p-4 border border-border">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary">{hangout.title}</h3>
          <p className="text-xs text-text-tertiary mt-1">
            {formatDate(hangout.start_time)}
          </p>
        </div>
        <span
          className={`px-2 py-1 rounded text-xs font-semibold border ${getStatusStyle(
            hangout.status
          )}`}
        >
          {hangout.status}
        </span>
      </div>

      {hangout.description && (
        <p className="text-sm text-text-secondary mb-3 line-clamp-2">
          {hangout.description}
        </p>
      )}

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {Array(Math.min(hangout.participants, 4))
            .fill(0)
            .map((_, idx) => (
              <div
                key={idx}
                className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary"
              >
                👤
              </div>
            ))}
          {hangout.participants > 4 && (
            <div className="w-7 h-7 rounded-full bg-bg-primary border-2 border-bg-card flex items-center justify-center text-xs text-text-tertiary">
              +{hangout.participants - 4}
            </div>
          )}
        </div>

        {showCreator && (
          <p className="text-xs text-text-tertiary">by {hangout.creator}</p>
        )}

        {hangout.is_public && (
          <span className="text-xs text-accent font-medium">Public</span>
        )}
      </div>
    </div>
  );

  const Section = ({
    title,
    hangouts,
    showCreator = false,
    emptyMessage,
  }: {
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
            <HangoutCard
              key={hangout.id}
              hangout={hangout}
              showCreator={showCreator}
            />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-bg-primary z-10 px-4 py-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">
          Hangouts
        </h1>

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
        <Section
          title="Planned by You"
          hangouts={mockPlannedByMe}
          emptyMessage="You haven't planned any hangouts yet"
        />

        <Section
          title="Joined Hangouts"
          hangouts={mockJoinedHangouts}
          showCreator
          emptyMessage="You haven't joined any hangouts"
        />

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-3">
            Find More Hangouts
          </h2>
          {mockPublicHangouts.length === 0 ? (
            <div className="bg-bg-card rounded-md p-8 border border-border text-center">
              <p className="text-text-tertiary text-sm mb-4">
                No public hangouts available
              </p>
              <Link
                href="/create"
                className="inline-block px-6 py-2 bg-accent text-white font-semibold rounded-sm hover:bg-accent/90 transition-all"
              >
                Create one
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {mockPublicHangouts.map((hangout) => (
                <HangoutCard
                  key={hangout.id}
                  hangout={hangout}
                  showCreator
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}