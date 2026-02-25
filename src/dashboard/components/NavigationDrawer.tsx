import React from 'react';
import { Icon } from '../../components/md3';
import { useDashboardStore } from '../store/dashboardStore';
import type { SubscriptionCategory } from '../../shared/types';

type NavItem = { id: string; label: string; icon: string };

const PRIMARY_NAV: NavItem[] = [
  { id: 'all',          label: 'All',          icon: 'inbox'         },
  { id: 'newsletter',   label: 'Newsletters',  icon: 'newspaper'     },
  { id: 'marketing',    label: 'Marketing',    icon: 'sell'          },
  { id: 'notification', label: 'Notifications',icon: 'notifications' },
  { id: 'other',        label: 'Other',        icon: 'mail'          },
];

const SECONDARY_NAV: NavItem[] = [
  { id: 'whitelisted',  label: 'Kept',         icon: 'bookmark'      },
  { id: 'unsubscribed', label: 'Unsubscribed', icon: 'unsubscribe'   },
];

function NavItem({ item }: { item: NavItem }) {
  const { activeCategory, setCategory, subscriptions } = useDashboardStore();
  const isActive = activeCategory === item.id;

  const count = subscriptions.filter((s) => {
    if (item.id === 'all')          return s.status === 'active';
    if (item.id === 'whitelisted')  return s.status === 'whitelisted';
    if (item.id === 'unsubscribed') return s.status === 'unsubscribed';
    return s.status === 'active' && s.category === item.id;
  }).length;

  return (
    <button
      onClick={() => setCategory(item.id as SubscriptionCategory | 'all' | 'whitelisted' | 'unsubscribed')}
      className={`
        w-full flex items-center gap-3 rounded-full px-4 py-2.5 text-left transition-colors duration-150
        ${isActive
          ? 'bg-secondary-container text-secondary-on-container'
          : 'text-surface-on hover:bg-surface-on/8'
        }
      `}
    >
      <Icon
        name={item.icon}
        size={20}
        filled={isActive}
        className={isActive ? 'text-secondary-on-container' : 'text-surface-on-variant'}
      />
      <span className="flex-1 text-label-lg">{item.label}</span>
      {count > 0 && (
        <span className={`text-label-md ${isActive ? 'text-secondary-on-container' : 'text-surface-on-variant'}`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function NavigationDrawer() {
  return (
    // surface-container-low creates visual separation from surface without any border
    <aside className="flex flex-col w-64 h-screen bg-surface-container-low shrink-0">
      {/* App identity */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container">
          <Icon name="mark_email_unread" size={20} filled className="text-primary" />
        </div>
        <div className="leading-tight">
          <p className="text-title-sm text-surface-on">Subscription</p>
          <p className="text-title-sm text-surface-on">Manager</p>
        </div>
      </div>

      {/* Section label */}
      <p className="px-5 pb-1 text-label-sm text-surface-on-variant uppercase tracking-widest">Inbox</p>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {PRIMARY_NAV.map((item) => <NavItem key={item.id} item={item} />)}

        <p className="pt-4 pb-1 px-4 text-label-sm text-surface-on-variant uppercase tracking-widest">Managed</p>

        {SECONDARY_NAV.map((item) => <NavItem key={item.id} item={item} />)}
      </nav>
    </aside>
  );
}
