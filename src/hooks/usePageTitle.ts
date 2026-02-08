import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    const base = "Ce Soir";
    document.title = title ? `${base} · ${title}` : `${base} Naples · Menu Library`;
    return () => { document.title = `${base} Naples · Menu Library`; };
  }, [title]);
}
