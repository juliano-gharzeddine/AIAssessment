export function HeadsetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M4 13a8 8 0 0 1 16 0" />
      <rect x="2.5" y="12" width="4" height="8" rx="2" />
      <rect x="17.5" y="12" width="4" height="8" rx="2" />
      <path d="M20 20c0 1.1-.9 2-2 2h-3" />
    </svg>
  );
}

export function MenuIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M4 6h16M4 12h16M4 18h16"/></svg>; }
export function LogoutIcon(props) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>; }
