import React from 'react';
import { navGrid, navMap, navCalendar, navUser } from '../constants/figmaAssets';

export default function BottomNav({ currentScreen, setCurrentScreen, onOpenAccount }) {
  const tabs = [
    {
      label: 'Facilități',
      icon: navGrid,
      screens: ['facilities', 'facility_detail', 'choose_datetime', 'summary_payment', 'payment_failed'],
      onClick: () => setCurrentScreen('facilities')
    },
    {
      label: 'Hartă',
      icon: navMap,
      screens: ['map'],
      onClick: () => setCurrentScreen('map')
    },
    {
      label: 'Rezervările mele',
      icon: navCalendar,
      screens: ['my_bookings', 'confirmed_ticket'],
      onClick: () => setCurrentScreen('my_bookings')
    },
    {
      label: 'Cont',
      icon: navUser,
      screens: ['account', 'admin', 'reception'],
      onClick: onOpenAccount
    }
  ];

  return (
    <nav className="figma-bottom-nav sc-nav">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          className={`sc-nav-tab ${tab.screens.includes(currentScreen) ? 'active' : ''}`}
          onClick={tab.onClick}
        >
          <span className="sc-nav-pill">
            <span className="sc-nav-icon" style={{ '--icon': `url("${tab.icon}")` }} />
          </span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
