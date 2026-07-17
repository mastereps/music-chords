/** Decorative metronome-and-plant vignette anchored to the bottom of the sidebar. */
export function SidebarArt() {
  return (
    <svg viewBox="0 0 220 200" aria-hidden="true" className="h-auto w-full">
      <g stroke="#C9BFA6" strokeWidth="1.4" fill="none" opacity="0.7">
        <path d="M8 44c34-14 62 10 96-4s58 6 96-8" />
        <path d="M8 56c34-14 62 10 96-4s58 6 96-8" />
      </g>
      <g fill="#8A7C6B" opacity="0.75">
        <circle cx="52" cy="40" r="4" />
        <rect x="55" y="24" width="1.6" height="17" />
        <circle cx="150" cy="34" r="4" />
        <rect x="153" y="18" width="1.6" height="17" />
        <path d="M153 18c6-1 10 1 12 4-3-1-8-1-12 1z" />
      </g>

      {/* shelf */}
      <rect x="0" y="176" width="220" height="10" fill="#B98F5E" />
      <rect x="0" y="186" width="220" height="6" fill="#9C7648" />

      {/* plant */}
      <g>
        <path d="M42 176v-26" stroke="#5F8F4E" strokeWidth="2.4" fill="none" />
        <path d="M42 158c-14-2-20-12-20-22 12 0 21 8 20 22z" fill="#6FA35C" />
        <path d="M42 150c12-3 18-13 17-24-11 1-19 10-17 24z" fill="#87B96F" />
        <path d="M42 164c-9 3-18-1-22-8 8-4 18-2 22 8z" fill="#5F8F4E" />
        <path d="M26 176h32l-3 22H29z" fill="#C98A5A" />
        <rect x="24" y="170" width="36" height="8" rx="2" fill="#D89A68" />
      </g>

      {/* metronome */}
      <g>
        <path d="M128 176 148 96h16l20 80z" fill="#A9714A" />
        <path d="M136 176 152 108h8l16 68z" fill="#C08A5E" />
        <rect x="150" y="112" width="12" height="56" rx="2" fill="#F3EAD8" />
        <path d="M156 166 168 116" stroke="#5A4632" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <rect x="162" y="128" width="8" height="6" rx="1" fill="#5A4632" transform="rotate(-13 166 131)" />
        <circle cx="156" cy="168" r="3" fill="#5A4632" />
        <rect x="124" y="176" width="64" height="6" rx="2" fill="#8A5C39" />
      </g>
    </svg>
  );
}
