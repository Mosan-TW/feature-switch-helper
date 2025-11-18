import fs from 'fs';
import { toDto } from './dto.utils.js';
import path from 'path';
export function loadJsonConfig(constructor, filePath, options) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(options.baseDir, filePath);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Configuration file not found: ${fullPath}`);
    }
    const fileContent = fs.readFileSync(fullPath, 'utf-8');
    const plainObject = JSON.parse(fileContent);
    return toDto(constructor, plainObject, options.transformOption, true);
}
//# sourceMappingURL=json-config.utils.js.map