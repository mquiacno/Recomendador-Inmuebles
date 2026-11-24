import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as repo from "../data/repository";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const actual = await repo.getSession();
      setUser(actual);
      const items = actual ? await repo.getCart(actual.id) : [];
      setCartCount(items.length);
    } catch {
      setUser(null);
      setCartCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const escuchar = () => refresh();
    window.addEventListener("ri:changed", escuchar);
    return () => window.removeEventListener("ri:changed", escuchar);
  }, [refresh]);

  return (
    <AppContext.Provider
      value={{ user, cartCount, loading, refresh, mode: repo.MODE, esDemo: repo.ES_DEMO }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const contexto = useContext(AppContext);
  if (!contexto) throw new Error("useApp debe usarse dentro de AppProvider");
  return contexto;
}
