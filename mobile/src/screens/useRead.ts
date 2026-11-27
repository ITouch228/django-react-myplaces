import { useEffect, useState } from 'react';

export function useRead<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setFailed(false);
    void load().then(
      (result) => { if (active) setData(result); },
      () => { if (active) setFailed(true); },
    );
    return () => { active = false; };
  }, [load, attempt]);

  return { data, failed, reload: () => setAttempt((value) => value + 1) };
}
