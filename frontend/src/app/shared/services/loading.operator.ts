import { Observable, OperatorFunction, asyncScheduler, finalize, observeOn, timeout } from 'rxjs';

export function withLoading<T>(
  setLoading: (value: boolean) => void,
  timeoutMs = 15000
): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    setLoading(true);
    return source.pipe(
      observeOn(asyncScheduler),
      timeout(timeoutMs),
      finalize(() => setLoading(false))
    );
  };
}
