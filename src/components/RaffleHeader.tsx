import { raffleInfo } from "@/lib/raffle";

export function RaffleHeader() {
  return (
    <div className="w-full max-w-md mx-auto mt-6 px-2 pt-1 pb-0 text-center relative overflow-hidden bg-gradient-to-b from-[#1A63B8] via-[#2F86D2] to-[#7ECFE6]">
      <div className="pointer-events-none absolute inset-0 -rotate-[25deg] opacity-[0.12] mix-blend-soft-light z-0" aria-hidden="true">
        <svg className="h-full w-full" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="igPattern" width="80" height="80" patternUnits="userSpaceOnUse">
              <rect width="80" height="80" fill="transparent" />
              <g fill="rgba(255,255,255,1)" fontFamily="Montserrat, Arial" fontWeight={900}>
                <text x="6" y="26" fontSize="20">IG</text>
                <text x="38" y="62" fontSize="20">IG</text>
              </g>

              <g fill="#FFF5AD" opacity="0.95">
                <path
                  d="M18 46c0 6 5 11 11 11s11-5 11-11c0-5-3-9-8-10v-8h3a2 2 0 0 0 0-4h-3v-3a3 3 0 1 0-6 0v3h-3a2 2 0 0 0 0 4h3v8c-5 1-8 5-8 10zm11 7c-4 0-7-3-7-7 0-4 3-7 7-7s7 3 7 7c0 4-3 7-7 7z"
                />
                <path d="M29 57c-6 8-16 9-21 3" stroke="#FFF5AD" strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M29 57c6 8 16 9 21 3" stroke="#FFF5AD" strokeWidth="3" fill="none" strokeLinecap="round" />

                <path
                  d="M60 18c-3.5 0-6.5 2.9-6.5 6.4 0 3.2 2.4 5.8 5.4 6.3-1.7 1.3-2.8 3.3-2.8 5.6 0 3.8 3.1 6.8 6.9 6.8 2.2 0 4.2-1 5.5-2.7 1.3 1.7 3.3 2.7 5.5 2.7 3.8 0 6.9-3 6.9-6.8 0-2.3-1.1-4.3-2.8-5.6 3-.5 5.4-3.1 5.4-6.3 0-3.5-3-6.4-6.5-6.4-2.4 0-4.5 1.3-5.8 3.2-1.3-1.9-3.4-3.2-5.8-3.2z"
                />
              </g>
            </pattern>
          </defs>
          <rect x="0" y="0" width="400" height="400" fill="url(#igPattern)" />
        </svg>
      </div>

      <div className="relative z-10 mt-0 flex items-center justify-center gap-2 text-yellow-200/90 text-xs font-bold tracking-wider">
        <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.45)]">🏆</span>
        <span>PARTICIPA Y GANA</span>
        <span className="text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.45)]">🏆</span>
      </div>

      <div className="relative -mt-2">
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-8 top-6 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-4 top-10 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-10 top-2 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-14 top-7 h-2 w-2 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />

          <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-10 top-8 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-5 top-11 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-14 top-4 h-1.5 w-1.5 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-20 top-9 h-2 w-2 rounded-full bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />

          <div className="absolute left-4 bottom-3 h-[10px] w-[4px] rotate-[18deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-6 bottom-4 h-[12px] w-[4px] -rotate-[22deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-10 bottom-5 h-[12px] w-[4px] -rotate-[10deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-12 bottom-6 h-[10px] w-[4px] rotate-[16deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute left-16 bottom-2 h-[9px] w-[3px] rotate-[24deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
          <div className="absolute right-20 bottom-3 h-[9px] w-[3px] -rotate-[20deg] rounded-[2px] bg-[#FFD700] blur-[1.5px] opacity-[0.12]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/6 via-transparent to-black/6 pointer-events-none" />
        <div className="relative z-10 text-[32px] sm:text-4xl font-black tracking-[-0.5px] text-yellow-300 [text-shadow:0_3px_2px_rgba(0,0,0,0.70),0_6px_6px_rgba(0,0,0,0.35),0_1px_0_rgba(250,204,21,0.20)]">
          {raffleInfo.prizeText}
        </div>
      </div>
    </div>
  );
}
