const mk = (d, extra) => (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {d}
    {extra}
  </svg>
);

export const IcHome = mk(<><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></>);
export const IcLista = mk(<><path d="M8 6h13M8 12h13M8 18h13" /><circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" /></>);
export const IcUser = mk(<><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>);
export const IcPlus = mk(<path d="M12 5v14M5 12h14" />);
export const IcVoltar = mk(<path d="M15 5l-7 7 7 7" />);
export const IcPin = mk(<><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.5" /></>);
export const IcBusca = mk(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></>);
export const IcAlvo = mk(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /><circle cx="12" cy="12" r="8" /></>);
export const IcCamera = mk(<><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>);
export const IcLixo = mk(<><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13h10l1-13M9 7V4h6v3" /></>);
export const IcCheck = mk(<path d="M5 12.5l4.5 4.5L19 7" />);
export const IcSeta = mk(<path d="M9 5l7 7-7 7" />);
export const IcLampada = mk(<><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z" /></>);
export const IcAviso = mk(<><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18h.01" /></>);
