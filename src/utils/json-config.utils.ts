import { ClassConstructor, ClassTransformOptions } from "class-transformer";
import { ValidatorOptions } from "class-validator";
import fs from "fs";
import { toDto } from "@andrash/dto-utils";
import path from "path";

export interface LoadJsonConfigOptions {
  baseDir: string;
  validateOption?: ValidatorOptions;
  transformOption?: ClassTransformOptions;
}

export function loadJsonConfig<T extends Record<string, any>>(
  constructor: ClassConstructor<T>,
  filePath: string,
  options: LoadJsonConfigOptions
): T {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(options.baseDir, filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Configuration file not found: ${fullPath}`);
  }
  const fileContent = fs.readFileSync(fullPath, "utf-8");
  const plainObject = JSON.parse(fileContent);
  return toDto(constructor, plainObject, options.transformOption, true);
}
