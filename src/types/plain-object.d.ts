/**
 * Recursively converts a type `T` into a "plain object" type:
 * - Removes methods (functions).
 * - Converts `Map<K, V>` to `Record<K, PlainObject<V>>`.
 * - Applies these transformations to all nested objects.
 */
export type PlainObject<T> = T extends Map<infer K, infer V>
  ? Record<Extract<K, string | number | symbol>, PlainObject<V>> // Recursion on Map values
  : T extends object
  ? { [P in keyof T as T[P] extends Function ? never : P]: PlainObject<T[P]> } // Recursion on object properties
  : T
