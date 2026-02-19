import { Observable, OperatorFunction, finalize, timeout } from 'rxjs';

export function withLoading<T>(
  setLoading: (value: boolean) => void,
  timeoutMs = 15000
): OperatorFunction<T, T> {
  return (source: Observable<T>) => {
    setLoading(true);
    return source.pipe(
      timeout(timeoutMs),
      finalize(() => setLoading(false))
    );
  };
}
