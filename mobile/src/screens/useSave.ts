import { useRef, useState } from 'react';

export function useSave() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();

  async function save(operation: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);

    try {
      await operation();
    } catch (failure) {
      setError(failure instanceof FormError ? failure.message : 'Не удалось сохранить изменения. Попробуй ещё раз.');
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return { busy, error, save };
}

export class FormError extends Error {}
