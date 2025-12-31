'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Vibe = 'chill' | 'active' | 'social' | 'quiet' | 'adventure';
type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'tonight' | 'custom';
type Visibility = 'selected' | 'all_friends' | 'public';

const vibes: { id: Vibe; label: string; icon: string }[] = [
  { id: 'chill', label: 'Chill', icon: '😌' },
  { id: 'active', label: 'Active', icon: '🏃' },
  { id: 'social', label: 'Social', icon: '🎉' },
  { id: 'quiet', label: 'Quiet', icon: '📚' },
  { id: 'adventure', label: 'Adventure', icon: '🗺️' },
];

const timeSlots: { id: TimeSlot; label: string }[] = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'tonight', label: 'Tonight' },
  { id: 'custom', label: 'Custom' },
];

const visibilityOptions: { id: Visibility; label: string; description: string }[] = [
  { id: 'selected', label: 'Selected friends', description: 'Only people you choose' },
  { id: 'all_friends', label: 'All friends', description: 'Any of your friends can join' },
  { id: 'public', label: 'Public', description: 'Anyone can find and join' },
];

function CreateHangoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Screen state
  const [screen, setScreen] = useState<1 | 2>(1);

  // Form state
  const [selectedVibe, setSelectedVibe] = useState<Vibe | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [customTime, setCustomTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxPeople, setMaxPeople] = useState(4);
  const [visibility, setVisibility] = useState<Visibility>('all_friends');
  const [personalMessage, setPersonalMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill from URL params
  useEffect(() => {
    const prefillTitle = searchParams.get('title');
    const prefillTime = searchParams.get('time');
    
    if (prefillTitle) setTitle(prefillTitle);
    if (prefillTime && timeSlots.find(t => t.id === prefillTime)) {
      setSelectedTime(prefillTime as TimeSlot);
    }
  }, [searchParams]);

  const handleContinue = () => {
    if (!title.trim()) {
      setError('Please add a title');
      return;
    }
    setError(null);
    
    if (visibility === 'selected') {
      setScreen(2);
    } else {
      handleCreate();
    }
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      router.push('/hangouts');
    }, 500);
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-bg-primary z-10 px-4 py-4 border-b border-border flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Create Hangout</h1>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-bg-card transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {screen === 1 ? (
        <div className="px-4 py-6 space-y-6">
          {/* Vibe (optional) */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Vibe <span className="font-normal text-text-tertiary">(optional)</span>
            </label>
            <div className="flex gap-2 overflow-x-auto -mx-4 px-4">
              {vibes.map((vibe) => (
                <button
                  key={vibe.id}
                  onClick={() => setSelectedVibe(selectedVibe === vibe.id ? null : vibe.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    selectedVibe === vibe.id
                      ? 'bg-accent text-white'
                      : 'border border-border text-text-secondary hover:border-accent/30'
                  }`}
                >
                  <span>{vibe.icon}</span>
                  <span className="text-sm font-medium">{vibe.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              What do you want to do? <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Coffee, lunch, movie night..."
              className="w-full px-4 py-3 rounded-sm border border-border bg-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Details <span className="font-normal text-text-tertiary">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any details..."
              rows={2}
              maxLength={200}
              className="w-full px-4 py-3 rounded-sm border border-border bg-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              When?
            </label>
            <div className="flex gap-2 flex-wrap">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedTime(selectedTime === slot.id ? null : slot.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTime === slot.id
                      ? 'bg-accent text-white'
                      : 'border border-border text-text-secondary hover:border-accent/30'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {selectedTime === 'custom' && (
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="mt-3 w-full px-4 py-3 rounded-sm border border-border bg-bg-card text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Location <span className="font-normal text-text-tertiary">(optional)</span>
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location..."
              className="w-full px-4 py-3 rounded-sm border border-border bg-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
          </div>

          {/* Max People */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Max people
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMaxPeople(Math.max(2, maxPeople - 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-accent/30 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              <span className="text-xl font-semibold text-text-primary w-8 text-center">{maxPeople}</span>
              <button
                onClick={() => setMaxPeople(Math.min(20, maxPeople + 1))}
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:border-accent/30 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-3">
              Who can see this?
            </label>
            <div className="space-y-2">
              {visibilityOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center p-4 rounded-sm border-2 cursor-pointer transition-all ${
                    visibility === option.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border bg-bg-card hover:border-accent/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={visibility === option.id}
                    onChange={() => setVisibility(option.id)}
                    className="w-4 h-4 text-accent focus:ring-accent focus:ring-2"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-text-primary">{option.label}</div>
                    <div className="text-xs text-text-tertiary">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            disabled={loading || !title.trim()}
            className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Continue'}
          </button>
        </div>
      ) : (
        /* Screen 2: Personal Message (for selected friends) */
        <div className="px-4 py-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-2">Add a personal note</h2>
            <p className="text-sm text-text-secondary mb-4">
              Send a message to your selected friends (optional)
            </p>
            <textarea
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              placeholder="Hey! Thought you might want to join..."
              rows={4}
              className="w-full px-4 py-3 rounded-sm border border-border bg-bg-card text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-sm bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setScreen(1)}
              className="flex-1 px-4 py-3 border border-border bg-bg-card text-text-primary font-semibold rounded-sm hover:bg-bg-primary transition-all"
            >
              Back
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-accent text-white font-semibold rounded-sm hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Hangout'}
            </button>
          </div>

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full text-text-tertiary text-sm font-medium hover:text-text-secondary transition-colors"
          >
            Skip and create
          </button>
        </div>
      )}
    </div>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-8 bg-bg-card rounded w-48"></div>
        </div>
      </div>
    }>
      <CreateHangoutContent />
    </Suspense>
  );
}
