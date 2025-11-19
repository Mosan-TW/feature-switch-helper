type Constructor = new (...args: any[]) => any
type ClonerFunc<T = any> = (obj: T) => T
type TypeofValue = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object' | 'function'

export interface DeepCloneOptions {
  clonerMap?: Map<Constructor | TypeofValue | 'null', ClonerFunc>
  handleCircularReferences?: boolean
}

/**
 * Deep clones a value using a provided cloning map.
 *
 * By default (without a cloner map), it performs a deep clone for objects and arrays,
 * and returns primitive values as is.
 *
 * If the value is an instance of a class, it will be cloned by creating a
 * new instance and copying properties.
 *
 * If a cloner map is provided, it will use the corresponding cloner function
 * for the type or constructor.
 *
 * ## Cloner map for objects
 * Please note that Object (class) and 'object' (typeof) are treated differently
 * in the cloner map.
 *
 * Object only matches instances of the Object class (created via 'new Object()'
 * or object literals),
 *
 * while 'object' matches all objects (including arrays, null, instances of custom classes,
 * Object instances and object literals).
 *
 * It is recommended to use Object class cloner instead of 'object' type cloner
 * as it is less ambiguous.
 *
 * ## Cloner precedence
 * If there are more than one applicable cloner for a value, the one with narrower
 * scope is applied first.
 *
 * Here are some examples:
 * - For a plain object, if both Object class and 'object' type cloners are provided,
 *   the Object class cloner will be used.
 * - For a null value, if both 'null' type and 'object' type cloners are provided,
 *   the 'null' type cloner will be used.
 * - For an array, if both Array class and 'object' type cloners are provided,
 *   the Array class cloner will be used.
 *
 * @param value The value to clone.
 * @param options Cloning options.
 * - options.clonerMap: A map of cloner functions for specific types or constructors.
 * - options.handleCircularReferences: Whether to handle circular references. Defaults to true.
 * Disable this option to improve performance if you are sure there are no circular references.
 * @returns The cloned value.
 * @author Andrash Yang
 */
export function deepClone<T>(value: T, options?: DeepCloneOptions): T {
  const { clonerMap, handleCircularReferences = true } = options || {}
  return _deepClone(value, clonerMap, handleCircularReferences ? new Map() : null)
}

function _deepClone<T>(
  value: T,
  clonerMap: Map<Constructor | TypeofValue | 'null', ClonerFunc> | undefined,
  clonedObjMap: Map<object, object> | null,
): T {
  // Handle null
  if (value === null) {
    const nullClonerFunc = clonerMap?.get('null')
    if (nullClonerFunc) {
      return nullClonerFunc(value)
    }
    return value
  }
  // Handle primitive types
  if (typeof value !== 'object') {
    const primitiveClonerFunc = clonerMap?.get(typeof value)
    if (primitiveClonerFunc) {
      return primitiveClonerFunc(value)
    }
    return value
  }
  // Handle objects and arrays
  let clonedObj: Record<keyof T, any> | undefined
  // Check if already cloned to handle circular references
  clonedObj = clonedObjMap?.get(value) as Record<keyof T, any> | undefined
  if (clonedObj) {
    return clonedObj as T
  }
  const clonerFunc = clonerMap?.get(value.constructor as Constructor) || clonerMap?.get('object')
  if (clonerFunc) {
    clonedObj = clonerFunc(value)
  } else {
    // Default deep clone for objects and arrays
    clonedObj = Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))
    for (const key in value) {
      clonedObj![key] = _deepClone(value[key], clonerMap, clonedObjMap)
    }
  }
  clonedObjMap?.set(value, clonedObj!)
  return clonedObj as T
}

/**
 * Deep freezes an object recursively.
 *
 * Will not re-freeze already frozen objects.
 * Will return the original value if it's not an object.
 * @param obj Object to be frozen
 * @returns Frozen object
 * @author Andrash Yang
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }
  if (!Object.isFrozen(obj)) {
    Object.freeze(obj)
  }
  Object.getOwnPropertyNames(obj).forEach(prop => {
    const value = (obj as any)[prop]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  })
  return obj
}
