var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Expose, Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsBoolean, IsInstance, IsOptional, IsString, ValidateNested } from 'class-validator';
export class FeatureDefDto {
    /**
     * 是否強制啟用功能
     *
     * 若設置為 true，則無論環境如何，功能均被啟用，包含 PRODUCTION 環境！
     */
    isForceEnabled = false;
    /**
     * 是否為開發環境專用功能
     *
     * 若設置為 true，則該功能僅在開發環境 (development) 中啟用
     */
    isDevFeature = false;
    /**
     * 是否為測試環境專用功能
     *
     * 若設置為 true，則該功能僅在測試環境 (test) 中啟用
     */
    isTestFeature = false;
    /**
     * 是否為 UAT 環境專用功能
     *
     * 若設置為 true，則該功能僅在 UAT 環境中啟用
     */
    isUatFeature = false;
    /**
     * 功能備註
     */
    note;
}
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureDefDto.prototype, "isForceEnabled", void 0);
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureDefDto.prototype, "isDevFeature", void 0);
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureDefDto.prototype, "isTestFeature", void 0);
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureDefDto.prototype, "isUatFeature", void 0);
__decorate([
    Expose(),
    IsString(),
    IsOptional(),
    __metadata("design:type", String)
], FeatureDefDto.prototype, "note", void 0);
export class FeatureSwitchValidationOptionsDto {
    /**
     * 是否禁止使用未定義的功能開關
     *
     * 若設置為 true，則在嘗試在程式碼中使用 `isFeatureEnabled` 查詢未在 `feature-switch.json` 中定義的功能開關時，會拋出錯誤！
     */
    shouldNotUseUndefinedFeatureSwitches = true;
    /**
     * 是否強制所有在 `feature-switch.json` 中定義的功能開關均被使用
     *
     * 若設置為 true，則在驗證階段會檢查所有在 `feature-switch.json` 中定義的功能開關是否至少被使用一次，若有未被使用的功能開關，則會拋出錯誤！
     */
    shouldUseAllDefinedFeatureSwitches = true;
    /**
     * 用於驗證的檔案路徑模式
     *
     * 通常為一個或多個 glob 模式，用於指定哪些 TypeScript 檔案需要被掃描以驗證功能開關的使用情況
     */
    filePatterns;
}
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureSwitchValidationOptionsDto.prototype, "shouldNotUseUndefinedFeatureSwitches", void 0);
__decorate([
    Expose(),
    IsBoolean(),
    IsOptional(),
    __metadata("design:type", Boolean)
], FeatureSwitchValidationOptionsDto.prototype, "shouldUseAllDefinedFeatureSwitches", void 0);
__decorate([
    Expose(),
    IsArray(),
    IsString({ each: true }),
    ArrayMinSize(1),
    __metadata("design:type", Array)
], FeatureSwitchValidationOptionsDto.prototype, "filePatterns", void 0);
export class FeatureSwitchConfigDto {
    /**
     * 功能開關的定義
     */
    features;
    /**
     * 功能開關的驗證選項
     */
    validationOptions;
}
__decorate([
    Expose(),
    Type(() => FeatureDefDto),
    IsInstance(FeatureDefDto, { each: true }),
    ValidateNested({ each: true }),
    __metadata("design:type", Map)
], FeatureSwitchConfigDto.prototype, "features", void 0);
__decorate([
    Expose(),
    Type(() => FeatureSwitchValidationOptionsDto),
    IsInstance(FeatureSwitchValidationOptionsDto),
    ValidateNested(),
    __metadata("design:type", FeatureSwitchValidationOptionsDto)
], FeatureSwitchConfigDto.prototype, "validationOptions", void 0);
//# sourceMappingURL=feature-switch-config.dto.js.map