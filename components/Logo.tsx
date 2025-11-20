
import React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="256"
    height="256"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#10B981" />
        <stop offset="100%" stopColor="#3B82F6" />
      </linearGradient>
    </defs>
    <path
        d="M6.5 10a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
    <path
        d="M17.5 19a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
    <path
        d="M9 7.5h6"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
    <path
        d="M9 16.5h6"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
    <path
        d="M15 7.5v9"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
    <path
        d="M9 7.5v9"
        stroke="url(#logo-gradient)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    />
  </svg>
);
