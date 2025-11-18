import { ClassConstructor, ClassTransformOptions, plainToInstance } from 'class-transformer'
import { validateSync, ValidationError } from 'class-validator'
import { PlainObject } from '../types/plain-object.js'

export function toDto<T extends Record<string, any>>(
  constructor: ClassConstructor<T>,
  plainObject: PlainObject<T>,
  transformOption?: ClassTransformOptions,
  validate?: boolean,
): T {
  const instance = plainToInstance(constructor, plainObject, transformOption)
  if (validate) {
    const errors: ValidationError[] = validateSync(instance)
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`)
    }
  }
  return instance
}
