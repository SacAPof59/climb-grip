// src/app/components/NavigationDock.tsx
'use client';

import Link from 'next/link';
import { BarChart3Icon, ClockIcon, LineChartIcon, UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function NavigationDock() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <div className="dock">
      <Link href="/workout" className={isActive('/workout') ? 'dock-active' : ''}>
        <BarChart3Icon className="h-5 w-5" />
        <span className="btm-nav-label">Workout</span>
      </Link>
      <Link href="/timer" className={isActive('/timer') ? 'dock-active' : ''}>
        <ClockIcon className="h-5 w-5" />
        <span className="btm-nav-label">Timer</span>
      </Link>
      <Link href="/measurement-test" className={isActive('/measurement-test') ? 'dock-active' : ''}>
        <LineChartIcon className="h-5 w-5" />
        <span className="btm-nav-label">Measure</span>
      </Link>
      <Link href="/profile" className={isActive('/profile') ? 'dock-active' : ''}>
        <UserIcon className="h-5 w-5" />
        <span className="btm-nav-label">Profile</span>
      </Link>
    </div>
  );
}
