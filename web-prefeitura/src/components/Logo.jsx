export default function Logo({ tamanho = "m" }) {
  return <span className={`wordmark ${tamanho}`}>IluminaAê</span>;
}

// Poste com cone de luz (tela de entrada)
export function PosteComLuz() {
  return (
    <svg viewBox="0 0 340 190" role="img" aria-label="Poste de rua aceso">
      <defs>
        <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fde68a" stopOpacity=".95" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points="116,50 134,50 205,190 45,190" fill="url(#cone)" />
      <rect x="168" y="40" width="5" height="150" rx="2" fill="#2b3a52" />
      <path d="M170 40 Q 140 24 118 42 L 126 48 Q 144 38 170 48 Z" fill="#cbd5e1" />
      <ellipse cx="124" cy="48" rx="10" ry="4" fill="#fde68a" />
    </svg>
  );
}
