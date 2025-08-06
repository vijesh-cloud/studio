
'use client';

import { Home, Trophy, Camera, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/leaderboard', icon: Trophy, label: 'Leaders' },
  { href: '/camera', icon: Camera, label: 'Recycle', isCentral: true },
  { href: '/market', icon: ShoppingBag, label: 'Market' },
  { href: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full h-20 bg-background/80 backdrop-blur-sm border-t">
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          if (item.isCentral) {
            return (
              <div key={item.href} className="flex items-center justify-center">
                <Link
                  href={item.href}
                  className="relative -top-6 flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 transform hover:scale-110"
                  aria-label={item.label}
                >
                  <item.icon className="w-8 h-8" />
                </Link>
              </div>
            );
          }
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex flex-col items-center justify-center px-5 hover:bg-accent/50 focus:bg-accent/50 group',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </footer>
  );
}
