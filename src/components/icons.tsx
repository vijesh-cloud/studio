import type { SVGProps } from 'react';

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const FirstTimerBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M12.968.625c.094 0 .188.016.28.047l5.25 1.5c.313.094.532.375.532.703v1.25H2.968V2.875c0-.328.22-.609.532-.703l5.25-1.5c.094-.031.187-.047.28-.047zM18 6.375v9.25c0 .406-.328.75-.75.75H4.72c-.422 0-.75-.344-.75-.75v-9.25h14.03zM2.969 4.375h16.03a1.01 1.01 0 011 .969V16.5c0 1.188-.938 2-2 2h-14c-1.063 0-2-.812-2-2V5.344a1.01 1.01 0 011-.969z" fill="currentColor"/></g></svg>
);

export const StreakMasterBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M17.516 11.234c.313-1.406-1.016-2.484-2.28-1.781l-4.047 2.25a.754.754 0 01-.782 0L6.36 9.453c-1.265-.703-2.593.375-2.28 1.781l.797 3.594a.732.732 0 01-.219.688l-2.89 2.5c-1.062.922-.484 2.734.938 2.875l3.75.328a.76.76 0 01.64.485l1.454 3.42c.58 1.359 2.58 1.359 3.157 0l1.453-3.42a.76.76 0 01.64-.485l3.75-.328c1.422-.14 2-1.953.938-2.875l-2.89-2.5a.732.732 0 01-.219-.688l.797-3.594z" fill="currentColor"/></g></svg>
);

export const PaperSaverBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M16.5 21h-9A1.5 1.5 0 016 19.5v-15A1.5 1.5 0 017.5 3h9a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-9A3.504 3.504 0 004 3.5v15A3.504 3.504 0 007.5 22h9a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5z" fill="currentColor"/><path d="M19.5 3h-2.25a.25.25 0 00-.25.25v16.5a.25.25 0 00.25.25H19.5a1.5 1.5 0 001.5-1.5V4.5A1.5 1.5 0 0019.5 3z" fill="currentColor"/></g></svg>
);

export const TechRecyclerBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M18.75 3H5.25A2.253 2.253 0 003 5.25v13.5A2.253 2.253 0 005.25 21h13.5A2.253 2.253 0 0021 18.75V5.25A2.253 2.253 0 0018.75 3zM9 18H7.5v-1.5H9V18zm0-3H7.5v-1.5H9v1.5zm0-3H7.5V9H9v1.5zm3 6h-1.5v-1.5H12V18zm0-3h-1.5v-1.5H12v1.5zm0-3h-1.5V9H12v1.5zm3 6h-1.5v-1.5h1.5V18zm0-3h-1.5v-1.5h1.5v1.5zm0-3h-1.5V9h1.5v1.5zM12.75 7.5h-1.5A2.253 2.253 0 009 5.25V4.5h6v.75a2.253 2.253 0 00-2.25 2.25z" fill="currentColor"/></g></svg>
);

export const SocialSharerBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M18 14.5a3.5 3.5 0 10-3.264 4.794l-5.472-2.736a3.513 3.513 0 000-2.116l5.472-2.736A3.5 3.5 0 1018 7.5a3.4 3.4 0 00-.066.627L12.462 10.8a3.52 3.52 0 000 2.4l5.472 2.673A3.4 3.4 0 0018 14.5zM6 11a3.5 3.5 0 100 2a3.5 3.5 0 000-2z" fill="currentColor"/></g></svg>
);

export const CommunityLeaderBadge = (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" {...props}><g transform="translate(50 50) scale(2.5)"><path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/><path d="M12 11.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0-7.5a3 3 0 110 6 3 3 0 010-6zM12 14c-4.639 0-6.744 3.434-6.963 5.333a.75.75 0 00.745.667h12.436a.75.75 0 00.745-.667C18.744 17.434 16.639 14 12 14z" fill="currentColor"/></g></svg>
);
