import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
export function toDto(constructor, plainObject, transformOption, validate) {
    const instance = plainToInstance(constructor, plainObject, transformOption);
    if (validate) {
        const errors = validateSync(instance);
        if (errors.length > 0) {
            throw new Error(`Validation failed: ${errors.map(e => Object.values(e.constraints || {}).join(', ')).join('; ')}`);
        }
    }
    return instance;
}
//# sourceMappingURL=dto.utils.js.map