import { ClassConstructor, ClassTransformOptions } from 'class-transformer';
import { ValidatorOptions } from 'class-validator';
export interface LoadJsonConfigOptions {
    baseDir: string;
    validateOption?: ValidatorOptions;
    transformOption?: ClassTransformOptions;
}
export declare function loadJsonConfig<T extends Record<string, any>>(constructor: ClassConstructor<T>, filePath: string, options: LoadJsonConfigOptions): T;
