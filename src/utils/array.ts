export function makeArrayUniq<T>(arr: ReadonlyArray<T>) {
  return Array.from(new Set(arr));
}
