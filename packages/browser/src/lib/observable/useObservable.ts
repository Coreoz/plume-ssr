import { useEffect, useLayoutEffect, useState } from 'react';
import { Observable } from 'micro-observables';

// TODO delete all this once https://github.com/BeTomorrow/micro-observables/issues/32 is accepted
const useSsrCompatibleLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useObservable<T>(observable: Observable<T>): T {
  const [, forceRender] = useState({});
  const val = observable.get();

  useSsrCompatibleLayoutEffect(() => observable.subscribe(() => forceRender({})), [observable]);

  return val;
}
