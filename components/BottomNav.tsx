'use client';

import { usePathname, useRouter } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide bottom nav on auth pages and create page
  const hiddenPaths = ['/login', '/create'];
  if (hiddenPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  const navItems = [
    { 
      id: 'home', 
      path: '/', 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill={isActive ? 'currentColor' : 'none'}
            fillOpacity={isActive ? '0.1' : '0'}
          />
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      id: 'time', 
      path: '/time', 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle 
            cx="12" 
            cy="12" 
            r="9" 
            stroke="currentColor" 
            strokeWidth="2"
            fill={isActive ? 'currentColor' : 'none'}
            fillOpacity={isActive ? '0.1' : '0'}
          />
          <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { id: 'create', path: null }, // Center button
    { 
      id: 'hangouts', 
      path: '/hangouts', 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill={isActive ? 'currentColor' : 'none'}
            fillOpacity={isActive ? '0.1' : '0'}
          />
          <circle 
            cx="9" 
            cy="7" 
            r="4" 
            stroke="currentColor" 
            strokeWidth="2"
            fill={isActive ? 'currentColor' : 'none'}
            fillOpacity={isActive ? '0.1' : '0'}
          />
          <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ) 
    },
    { 
      id: 'chat', 
      path: '/chat', 
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path 
            d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0034 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92176 4.44061 8.37485 5.27072 7.03255C6.10083 5.69025 7.28825 4.60557 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            fill={isActive ? 'currentColor' : 'none'}
            fillOpacity={isActive ? '0.1' : '0'}
          />
        </svg>
      ) 
    },
  ];

  const handleNavClick = (path: string | null) => {
    if (path) {
      router.push(path);
    } else {
      // Handle create action - for now just navigate to a create page
      router.push('/create');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-border h-16 z-50">
      <div className="max-w-lg mx-auto h-full flex items-center justify-around relative px-4">
        {navItems.map((item) => {
          if (item.id === 'create') {
            return (
              <div key={item.id} className="flex-1 flex justify-center">
                <button
                  onClick={() => handleNavClick(item.path)}
                  className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-subtle hover:bg-accent/90 transition-colors -mt-8"
                  aria-label="Create hangout"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            );
          }

          const isActive = pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={`flex-1 flex justify-center items-center h-full transition-colors ${
                isActive ? 'text-accent' : 'text-busy hover:text-text-secondary'
              }`}
              aria-label={item.id}
            >
              {item.icon && item.icon(isActive)}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

