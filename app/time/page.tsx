'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type TimeFilter = 'today' | 'tomorrow' | 'weekend' | 'custom';
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

type Person = {
  id: string;
  name: string;
  initial: string;
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

// Mock data
const mockTimeSlots: TimeSlotData[] = [
  {
    id: 'morning',
    label: 'Morning',
    timeRange: '6am - 12pm',
    free: [
      { id: '1', name: 'Alex', initial: 'A', status: 'available' },
      { id: '2', name: 'Sam', initial: 'S', status: 'available' },
    ],
    planning: [
      { person: { id: '3', name: 'Jordan', initial: 'J', status: 'maybe' }, text: 'Jordan might be free' },
    ],
    planned: [
      {
        id: '1',
        title: 'Morning Coffee',
        participants: [
          { id: '4', name: 'Taylor', initial: 'T', status: 'available' },
          { id: '5', name: 'Casey', initial: 'C', status: 'available' },
        ],
      },
    ],
  },
  {
    id: 'afternoon',
    label: 'Afternoon',
    timeRange: '12pm - 5pm',
    free: [
      { id: '6', name: 'Sam', initial: 'S', status: 'available' },
      { id: '7', name: 'Taylor', initial: 'T', status: 'available' },
    ],
    planning: [],
    planned: [],
  },
  {
    id: 'evening',
    label: 'Evening',
    timeRange: '5pm - 9pm',
    free: [
      { id: '8', name: 'Jordan', initial: 'J', status: 'available' },
    ],
    planning: [],
    planned: [
      {
        id: '2',
        title: 'Dinner Plans',
        participants: [
          { id: '9', name: 'Alex', initial: 'A', status: 'available' },
        ],
      },
    ],
  },
  {
    id: 'night',
    label: 'Night',
    timeRange: '9pm - 12am',
    free: [],
    planning: [],
    planned: [],
  },
];

export default function MyTimePage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [expandedSlot, setExpandedSlot] = useState<TimeSlot | null>(null);
  const [timeSlots] = useState<TimeSlotData[]>(mockTimeSlots);

  const timeFilters: { key: TimeFilter; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'tomorrow', label: 'Tomorrow' },
    { key: 'weekend', label: 'Weekend' },
    { key: 'custom', label: 'Custom' },
  ];

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
                              className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(person.status)} bg-bg-primary flex items-center justify-center text-xs text-text-tertiary`}
                            >
                              {person.initial}
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
                              <div className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(person.status)} bg-bg-primary flex items-center justify-center text-xs text-text-tertiary`}>
                                {person.initial}
                              </div>
                              <span className="text-sm text-text-primary">{person.name}</span>
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
                              <div className={`w-8 h-8 rounded-full border-2 ${getAvatarBorderColor(item.person.status)} bg-bg-primary flex items-center justify-center text-xs text-text-tertiary`}>
                                {item.person.initial}
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
                                    {p.initial}
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
