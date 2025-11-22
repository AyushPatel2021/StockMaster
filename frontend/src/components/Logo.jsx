import React from 'react';

const Logo = ({ className = "", size = 40 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <rect x="8" y="8" width="24" height="24" rx="4" fill="#2563EB" />
        <path d="M20 8L32 14V26L20 32L8 26V14L20 8Z" fill="white" fillOpacity="0.2" />
        <path d="M20 13V27M13 17L20 13L27 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 23L20 27L27 23" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5" />
    </svg>
);

export default Logo;
