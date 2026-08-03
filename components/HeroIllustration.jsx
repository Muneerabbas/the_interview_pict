/* Flat interview-scene illustration for the landing hero.
   Self-contained SVG; colors read on both light and dark backgrounds. */
export default function HeroIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 640 520"
      className={className}
      role="img"
      aria-label="Two students in an interview conversation"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* ── soft backdrop ── */}
      <ellipse cx="360" cy="235" rx="285" ry="215" className="fill-[#E8EEFF] dark:fill-[#141d33]" />
      <ellipse cx="520" cy="120" rx="70" ry="70" className="fill-[#DCE6FF] dark:fill-[#1b2740]" />
      <circle cx="120" cy="120" r="10" className="fill-[#BFD0FB] dark:fill-[#2a3a5e]" />
      <circle cx="588" cy="300" r="7" className="fill-[#BFD0FB] dark:fill-[#2a3a5e]" />
      <circle cx="70" cy="330" r="6" className="fill-[#BFD0FB] dark:fill-[#2a3a5e]" />

      {/* floor shadow */}
      <ellipse cx="325" cy="470" rx="255" ry="26" className="fill-[#D2DEF8] dark:fill-[#0c1424]" opacity="0.7" />

      {/* ── speech bubble (top-left) ── */}
      <g>
        <rect x="70" y="80" width="112" height="70" rx="20" fill="#FFFFFF" stroke="#E2E8F5" />
        <path d="M96 148 L96 172 L120 150 Z" fill="#FFFFFF" stroke="#E2E8F5" />
        <circle cx="100" cy="115" r="7" fill="#93A9E8" />
        <circle cx="126" cy="115" r="7" fill="#6E8BE0" />
        <circle cx="152" cy="115" r="7" fill="#2563EB" />
      </g>

      {/* ── resume / profile card (top-right) ── */}
      <g>
        <rect x="430" y="70" width="170" height="118" rx="16" fill="#FFFFFF" stroke="#E2E8F5" />
        <circle cx="462" cy="102" r="16" fill="#DCE6FF" />
        <circle cx="462" cy="97" r="6" fill="#2563EB" />
        <path d="M452 112 a10 9 0 0 1 20 0 Z" fill="#2563EB" />
        <rect x="488" y="92" width="92" height="8" rx="4" fill="#C9D6F0" />
        <rect x="488" y="106" width="66" height="8" rx="4" fill="#E1E8F6" />
        <rect x="448" y="134" width="134" height="7" rx="3.5" fill="#E1E8F6" />
        <rect x="448" y="150" width="134" height="7" rx="3.5" fill="#E1E8F6" />
        <rect x="448" y="166" width="86" height="7" rx="3.5" fill="#E1E8F6" />
      </g>

      {/* ═══ LEFT PERSON (interviewer, facing right) ═══ */}
      <g>
        {/* chair back */}
        <rect x="120" y="250" width="104" height="150" rx="26" className="fill-[#C6D5F7] dark:fill-[#27334f]" />
        {/* seat cushion */}
        <rect x="108" y="356" width="132" height="52" rx="20" className="fill-[#B4C7F2] dark:fill-[#2e3b5a]" />
        {/* legs */}
        <rect x="186" y="336" width="18" height="86" rx="9" fill="#243154" />
        <rect x="150" y="392" width="80" height="18" rx="9" fill="#243154" />
        <rect x="212" y="398" width="34" height="16" rx="8" fill="#18233f" />
        {/* torso / blazer */}
        <path d="M150 300 q28 -18 56 0 l10 74 q-38 16 -76 0 Z" fill="#3B6FE0" />
        {/* gesturing arm */}
        <path d="M204 316 q46 6 60 34" stroke="#3B6FE0" strokeWidth="20" fill="none" strokeLinecap="round" />
        <circle cx="266" cy="352" r="12" fill="#F0C4A0" />
        {/* neck + head */}
        <rect x="170" y="284" width="16" height="18" rx="7" fill="#EBB892" />
        <circle cx="178" cy="272" r="26" fill="#F0C4A0" />
        {/* hair */}
        <path d="M152 272 q-4 -34 30 -34 q30 0 30 30 q0 8 -4 14 q0 -22 -20 -24 q-8 22 -34 26 q-2 -6 -2 -12 Z" fill="#2A3346" />
        <path d="M150 270 q-6 24 4 44 q-14 -6 -14 -26 q0 -14 10 -18 Z" fill="#2A3346" />
      </g>

      {/* ═══ RIGHT PERSON (candidate, facing left) ═══ */}
      <g>
        {/* chair back */}
        <rect x="416" y="250" width="104" height="150" rx="26" className="fill-[#C6D5F7] dark:fill-[#27334f]" />
        {/* seat cushion */}
        <rect x="400" y="356" width="132" height="52" rx="20" className="fill-[#B4C7F2] dark:fill-[#2e3b5a]" />
        {/* legs */}
        <rect x="436" y="336" width="18" height="86" rx="9" fill="#243154" />
        <rect x="410" y="392" width="80" height="18" rx="9" fill="#243154" />
        <rect x="394" y="398" width="34" height="16" rx="8" fill="#18233f" />
        {/* torso / hoodie */}
        <path d="M434 300 q28 -18 56 0 l10 74 q-38 16 -76 0 Z" fill="#2450C8" />
        {/* thumbs-up arm */}
        <path d="M436 318 q-40 4 -50 28" stroke="#2450C8" strokeWidth="20" fill="none" strokeLinecap="round" />
        <circle cx="386" cy="350" r="12" fill="#F0C4A0" />
        <rect x="380" y="330" width="7" height="14" rx="3.5" fill="#F0C4A0" />
        {/* neck + head */}
        <rect x="454" y="284" width="16" height="18" rx="7" fill="#EBB892" />
        <circle cx="462" cy="272" r="26" fill="#F0C4A0" />
        {/* hair */}
        <path d="M438 268 q-2 -30 26 -30 q30 0 32 30 q1 10 -4 16 q-2 -20 -14 -24 q-24 2 -34 -2 q-4 4 -6 10 q-2 -14 -4 -22 Z" fill="#222A3b" />
      </g>

      {/* ── small round table + plant + mug ── */}
      <g>
        <rect x="300" y="392" width="16" height="40" rx="6" fill="#B7C8EE" />
        <ellipse cx="308" cy="392" rx="46" ry="14" fill="#CBD9F7" />
        <ellipse cx="308" cy="388" rx="46" ry="14" fill="#DCE6FF" />
        {/* plant */}
        <rect x="296" y="360" width="24" height="24" rx="5" fill="#E79A3C" />
        <path d="M308 360 q-18 -6 -20 -30 q18 4 20 30" fill="#34C77B" />
        <path d="M308 360 q18 -6 20 -30 q-18 4 -20 30" fill="#2FB56E" />
        <path d="M308 360 q-2 -22 0 -36 q4 16 0 36" fill="#3AD488" />
        {/* mug */}
        <rect x="330" y="372" width="18" height="16" rx="4" fill="#FFFFFF" stroke="#D6E0F2" />
        <path d="M348 376 h4 a4 4 0 0 1 0 8 h-4" fill="none" stroke="#D6E0F2" strokeWidth="2" />
      </g>
    </svg>
  );
}
