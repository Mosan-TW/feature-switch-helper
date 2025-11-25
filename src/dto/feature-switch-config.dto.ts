import { Expose, Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInstance,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";

export const DEFAULT_VALID_ENVIRONMENTS = ["development", "test", "production"];

export class FeatureDefDto<Environment extends string = string> {
  /**
   * 是否強制啟用功能
   *
   * 若設置為 true，則無論環境如何，功能均被啟用，包含 PRODUCTION 環境！
   */
  @Expose()
  @IsBoolean()
  @IsOptional()
  isForceEnabled: boolean = false;

  /**
   * 功能可啟用的環境列表
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  environments!: Environment[];
  /**
   * 功能備註
   */
  @Expose()
  @IsString()
  @IsOptional()
  note?: string;
}

export class FeatureSwitchValidationOptionsDto {
  /**
   * 是否禁止使用未定義的功能開關
   *
   * 若設置為 true，則在嘗試在程式碼中使用 `isFeatureEnabled` 查詢未在 `feature-switch.json` 中定義的功能開關時，會拋出錯誤！
   */
  @Expose()
  @IsBoolean()
  @IsOptional()
  shouldNotUseUndefinedFeatureSwitches: boolean = true;

  /**
   * 是否強制所有在 `feature-switch.json` 中定義的功能開關均被使用
   *
   * 若設置為 true，則在驗證階段會檢查所有在 `feature-switch.json` 中定義的功能開關是否至少被使用一次，若有未被使用的功能開關，則會拋出錯誤！
   */
  @Expose()
  @IsBoolean()
  @IsOptional()
  shouldUseAllDefinedFeatureSwitches: boolean = true;

  /**
   * 用於驗證的檔案路徑模式
   *
   * 通常為一個或多個 glob 模式，用於指定哪些 TypeScript 檔案需要被掃描以驗證功能開關的使用情況
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  filePatterns!: string[];

  /**
   * 執行驗證時所使用的環境值
   */
  @Expose()
  @IsString()
  @IsOptional()
  environment?: string;

  /**
   * 可接受的環境列表
   *
   * 若未指定，預設為 ["development", "test", "production"]
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  validEnvironments: Array<string> = DEFAULT_VALID_ENVIRONMENTS;

  /**
   * 不允許使用功能開關的環境列表
   *
   * 預設為 ["production"]。
   *
   * 在大多數情況下，我們並不建議在生產環境中使用功能開關，因為這可能會導致未經充分測試的功能被啟用，從而影響系統的穩定性和可靠性。
   * 若一個功能已經足夠成熟並準備好在生產環境中使用，建議直接將該功能的程式碼整合到主程式碼庫中，而不是依賴功能開關來控制其啟用與否。
   */
  @Expose()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  restrictedEnvironments?: Array<string> = ["production"];
}

export class FeatureSwitchConfigDto {
  /**
   * 功能開關的定義
   */
  @Expose()
  @Type(() => FeatureDefDto)
  @IsInstance(FeatureDefDto, { each: true })
  @ValidateNested({ each: true })
  features!: Map<string, FeatureDefDto>;

  /**
   * 功能開關的驗證選項
   */
  @Expose()
  @Type(() => FeatureSwitchValidationOptionsDto)
  @IsInstance(FeatureSwitchValidationOptionsDto)
  @ValidateNested()
  validationOptions!: FeatureSwitchValidationOptionsDto;
}
