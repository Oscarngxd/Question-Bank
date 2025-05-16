import React from 'react';

export default function MathLogo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="22" fill="#2563eb" />
      {/* Left eye: plus sign */}
      <text x="13" y="22" fontSize="14" fill="#fff" fontWeight="bold">+</text>
      {/* Right eye: pi symbol */}
      <text x="29" y="22" fontSize="14" fill="#fff" fontWeight="bold">π</text>
      {/* Mouth: square root symbol */}
      <text x="16" y="36" fontSize="18" fill="#fff" fontWeight="bold">√</text>
    </svg>
  );
} 