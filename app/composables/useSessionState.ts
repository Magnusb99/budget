// composables/useSessionState.ts
export function useSessionState<T>(key: string, defaultValue: () => T) {
  const state = useState<T>(key, defaultValue);

  // Läs från sessionStorage när vi är på clienten
  if (process.client) {
    const raw = sessionStorage.getItem(key);
    if (raw != null) {
      try {
        state.value = JSON.parse(raw) as T;
      } catch {
        // om JSON är trasig, ignorera
      }
    }

    // Skriv till sessionStorage när state ändras
    watch(
      state,
      (val) => {
        try {
          sessionStorage.setItem(key, JSON.stringify(val));
        } catch {
          // kan faila om storage är fullt / blockat
        }
      },
      { deep: true }
    );
  }

  return state;
}
