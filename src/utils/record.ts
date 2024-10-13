/**
 * @description An Object.entries wrapper that does not loose key/value types (typescript 5.5.3)
 */
export function objectEntries<KeyType extends keyof any, ValueType>(record: Record<KeyType, ValueType>) {
  return Object.entries(record) as Array<[KeyType, ValueType]>;
}
