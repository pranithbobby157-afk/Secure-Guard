import React, { ReactNode } from 'react';

export type IconName =
  | "alert" | "arrow" | "building" | "calendar" | "check" | "chevron"
  | "clock" | "cloud" | "document" | "external" | "eye" | "globe"
  | "home" | "hospital" | "info" | "layers" | "location" | "lock"
  | "mail" | "menu" | "minus" | "phone" | "plus" | "rain" | "route"
  | "search" | "settings" | "shield" | "user" | "users" | "warning" | "x";

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const icons: Record<IconName, ReactNode> = {
    alert: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/></>,
    arrow: <path d="m9 18 6-6-6-6"/>, building: <><path d="M3 21h18M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-3h4v3"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/></>, check: <path d="m5 12 4 4L19 6"/>,
    chevron: <path d="m6 9 6 6 6-6"/>, clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    cloud: <path d="M17.5 19H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h6"/></>,
    external: <><path d="M14 3h7v7M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
    eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    home: <><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-6h6v6"/></>, hospital: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 7v10M7 12h10"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>, layers: <><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></>,
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>, mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, minus: <path d="M5 12h14"/>, phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.4 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4 13 13 0 0 0 2.9.7 2 2 0 0 1 1.6 1.9Z"/>,
    plus: <path d="M12 5v14M5 12h14"/>, rain: <><path d="M17.5 15H9a7 7 0 1 1 6.7-9h1.8a4.5 4.5 0 1 1 0 9Z"/><path d="m8 19-1 2m6-2-1 2m6-2-1 2"/></>,
    route: <><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h3a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>, settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l.1.1-2.8 2.8-.1-.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.2 1.8V22H10v-.2A2 2 0 0 0 8.7 20a2 2 0 0 0-2.2.4l-.1.1-2.8-2.8.1-.1a2 2 0 0 0 .4-2.2 2 2 0 0 0-1.8-1.2H2v-4h.2A2 2 0 0 0 4 9a2 2 0 0 0-.4-2.2l-.1-.1 2.8-2.8.1.1a2 2 0 0 0 2.2.4A2 2 0 0 0 9.8 2.6V2h4v.2A2 2 0 0 0 15 4a2 2 0 0 0 2.2-.4l.1-.1 2.8 2.8-.1.1a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.2h.6v4h-.2A2 2 0 0 0 19.4 15Z"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></>,
    warning: <><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.7 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.7a2 2 0 0 0-3.4 0Z"/></>,
    x: <path d="m18 6-12 12M6 6l12 12"/>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{icons[name]}</svg>;
}

