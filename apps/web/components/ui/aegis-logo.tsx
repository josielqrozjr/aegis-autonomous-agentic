"use client";

import React from "react";

export function AegisShieldLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Escudo Exterior */}
      <path
        d="M60 142C96 116 112 76 112 24L60 8L8 24C8 76 24 116 60 142Z"
        stroke="#B8843A"
        strokeWidth="4.5"
        strokeLinejoin="round"
        fill="#171B1F"
      />
      {/* Escudo Interno Suave */}
      <path
        d="M60 134C90 110 104 74 104 28L60 14L16 28C16 74 30 110 60 134Z"
        stroke="#B8843A"
        strokeWidth="1.5"
        strokeOpacity="0.3"
        fill="#0D1013"
      />

      {/* Linhas de Conexão do Grafo (Arestas) */}
      <g stroke="#B8843A" strokeWidth="2.5" strokeLinecap="round" opacity="0.85">
        <line x1="60" y1="75" x2="38" y2="44" />
        <line x1="60" y1="75" x2="82" y2="44" />
        <line x1="60" y1="75" x2="28" y2="82" />
        <line x1="60" y1="75" x2="92" y2="82" />
        <line x1="60" y1="75" x2="44" y2="114" />
        <line x1="60" y1="75" x2="76" y2="114" />
      </g>

      {/* Nós do Grafo (Vértices com Anel) */}
      {/* Centro */}
      <circle cx="60" cy="75" r="7" fill="#B8843A" stroke="#0D1013" strokeWidth="2" />
      
      {/* Superior Esquerdo */}
      <circle cx="38" cy="44" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="38" cy="44" r="2.5" fill="#B8843A" />

      {/* Superior Direito */}
      <circle cx="82" cy="44" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="82" cy="44" r="2.5" fill="#B8843A" />

      {/* Meio Esquerdo */}
      <circle cx="28" cy="82" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="28" cy="82" r="2.5" fill="#B8843A" />

      {/* Meio Direito */}
      <circle cx="92" cy="82" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="92" cy="82" r="2.5" fill="#B8843A" />

      {/* Inferior Esquerdo */}
      <circle cx="44" cy="114" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="44" cy="114" r="2.5" fill="#B8843A" />

      {/* Inferior Direito */}
      <circle cx="76" cy="114" r="5.5" fill="#0D1013" stroke="#B8843A" strokeWidth="2.5" />
      <circle cx="76" cy="114" r="2.5" fill="#B8843A" />
    </svg>
  );
}

export function AegisBrandHeader() {
  return (
    <div className="flex items-center gap-3.5">
      <AegisShieldLogo className="w-10 h-12 shrink-0 drop-shadow-[0_2px_10px_rgba(184,132,58,0.3)]" />
      <div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-xl tracking-wider text-[#B8843A] font-serif">
            AEGIS
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#171B1F] text-[#9096A0] border border-[#2A3038]">
            v2.4
          </span>
        </div>
        <p className="text-[11px] text-[#9096A0] tracking-tight">
          Um escudo forjado a partir de evidências conectadas.
        </p>
      </div>
    </div>
  );
}
