import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { PlainObject } from '../types/plain-object.js';
export declare function toDto<T extends Record<string, any>>(constructor: ClassConstructor<T>, plainObject: PlainObject<T>, transformOption?: ClassTransformOptions, validate?: boolean): T;
