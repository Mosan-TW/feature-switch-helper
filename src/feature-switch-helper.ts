import { FeatureDefDto } from "./dto/feature-switch-config.dto.js";
import { FeatureSwitchConfigDto } from "./dto/feature-switch-config.dto.js";
import { PlainObject } from "@andrash/dto-utils";
import { deepFreeze } from "./utils/deep-object.utils.js";
import { toDto } from "@andrash/dto-utils";

export interface ILogger {
  log: (message: string) => void;
  warn: (message: string | Error) => void;
}

export interface FeatureSwitchHelperOptions {
  logger?: ILogger;
  ignoreMultipleInit?: boolean;
}

export class FeatureSwitchHelper {
  private static _instance: FeatureSwitchHelper | null = null;
  private static canNew: boolean = false;

  /**
   * 初始化功能開關助手
   * @param environment 運行環境
   * @param config 功能開關配置
   * @param options 選項
   */
  static init(
    environment: string,
    config: FeatureSwitchConfigDto | PlainObject<FeatureSwitchConfigDto>,
    options?: FeatureSwitchHelperOptions
  ): void {
    const { ignoreMultipleInit = false } = options || {};
    if (this._instance) {
      const error = new Error(
        "FeatureSwitchHelper has already been initialized."
      );
      if (ignoreMultipleInit) {
        this._instance.logger.warn(error as Error);
        return;
      }
      throw error;
    }
    const configDto =
      config instanceof FeatureSwitchConfigDto
        ? config
        : toDto(FeatureSwitchConfigDto, config);
    this.canNew = true;
    this._instance = new FeatureSwitchHelper(environment, configDto, options);
    this.canNew = false;
  }

  /**
   * 檢查功能是否啟用
   * @param featureName 功能名稱
   * @returns 是否啟用
   */
  static isFeatureEnabled<T extends string>(featureName: T): boolean {
    return this.instance.isFeatureEnabled(featureName);
  }

  /**
   * 獲取功能開關的相關資訊
   * @param featureName 功能名稱
   * @returns 功能開關的相關資訊，若不存在則返回 null
   */
  static getFeatureDef<T extends string>(featureName: T): FeatureDefDto | null {
    return this.instance.getFeatureDef(featureName);
  }

  private static get instance(): FeatureSwitchHelper {
    if (!FeatureSwitchHelper._instance) {
      throw new Error(
        "FeatureSwitchHelper is not initialized. Please call FeatureSwitchHelper.init() first."
      );
    }
    return FeatureSwitchHelper._instance;
  }

  private readonly environment: string;
  private readonly config: FeatureSwitchConfigDto;
  private readonly featureEnabledMap: Record<string, boolean>;
  private readonly logger: ILogger;
  private readonly validEnvironmentSet?: Set<string>;
  private readonly restrictedEnvironmentSet?: Set<string>;

  constructor(
    environment: string,
    config: FeatureSwitchConfigDto,
    options?: FeatureSwitchHelperOptions
  ) {
    if (!FeatureSwitchHelper.canNew) {
      throw new Error(
        "FeatureSwitchHelper constructor is private. Please use FeatureSwitchHelper.init() to initialize."
      );
    }
    const { validationOptions } = config;
    if (validationOptions.validEnvironments) {
      this.validEnvironmentSet = new Set<string>(
        validationOptions.validEnvironments
      );
      this.assertIsValidEnvironment(environment);
    }
    if (validationOptions.restrictedEnvironments) {
      this.restrictedEnvironmentSet = new Set<string>(
        validationOptions.restrictedEnvironments
      );
      this.restrictedEnvironmentSet.forEach((restrictedEnv) => {
        this.assertIsValidEnvironment(restrictedEnv);
      });
    }
    this.environment = environment;
    this.config = deepFreeze(config);
    const { logger = console } = options || {};
    this.logger = logger;
    // 建立索引，以便快速查詢功能是否啟用
    this.featureEnabledMap = this.createFeatureEnabledMap(this.config.features);
    // 在模組加載時記錄功能開關的使用情況
    this.logger.log(`Current Environment: ${this.environment}`);
    this.logFeatureSwitchUsage(this.featureEnabledMap);
  }

  /**
   * 檢查功能是否啟用
   * @param featureName 功能名稱
   * @returns 是否啟用
   */
  private isFeatureEnabled<T extends string>(featureName: T): boolean {
    const isEnabled = this.featureEnabledMap[featureName];
    if (isEnabled === undefined) {
      const message = `Feature "${featureName}" is not defined in 'feature-switch.json'.`;
      if (this.config.validationOptions.shouldNotUseUndefinedFeatureSwitches) {
        throw new Error(message);
      }
      console.warn(message);
      return false;
    }
    if (isEnabled) {
      console.log(`Feature "${featureName}" is used.`);
    } else {
      console.log(`Feature "${featureName}" is skipped.`);
    }
    return isEnabled;
  }

  /**
   * 獲取功能開關的相關資訊
   * @param featureName 功能名稱
   * @returns 功能開關的相關資訊，若不存在則返回 null
   */
  private getFeatureDef<T extends string>(
    featureName: T
  ): FeatureDefDto | null {
    return this.config.features.get(featureName) || null;
  }

  private createFeatureEnabledMap(
    features: Map<string, FeatureDefDto>
  ): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    features.forEach((featureDef, featureName) => {
      let isEnabled = false;
      featureDef.environments.forEach((environment) => {
        try {
          this.assertIsValidEnvironment(environment);
          if (environment === this.environment) {
            isEnabled = true;
            this.assertIsNotRestrictedEnvironment(environment);
          }
        } catch (error) {
          throw new Error(
            `Feature "${featureName}": ${(error as Error).message}`
          );
        }
      });
      map[featureName] = isEnabled || featureDef.isForceEnabled;
    });
    return map;
  }

  private logFeatureSwitchUsage(featureEnabledMap: Record<string, boolean>) {
    const enabledFeatures: string[] = [];
    const disabledFeatures: string[] = [];
    for (const [featureName, isEnabled] of Object.entries(featureEnabledMap)) {
      if (isEnabled) {
        enabledFeatures.push(featureName);
      } else {
        disabledFeatures.push(featureName);
      }
    }
    this.logger.log(
      `Enabled Features: ${JSON.stringify(enabledFeatures, null, 2)}`
    );
    this.logger.log(
      `Disabled Features: ${JSON.stringify(disabledFeatures, null, 2)}`
    );
  }

  private assertIsValidEnvironment(environment: string): void {
    if (
      this.validEnvironmentSet &&
      !this.validEnvironmentSet.has(environment)
    ) {
      throw new Error(
        `Invalid environment: ${environment}. Valid environments are: ${Array.from(
          this.validEnvironmentSet
        ).join(", ")}`
      );
    }
  }

  private assertIsNotRestrictedEnvironment(environment: string): void {
    if (
      this.restrictedEnvironmentSet &&
      this.restrictedEnvironmentSet.has(environment)
    ) {
      throw new Error(
        `Cannot enable feature in restricted environment: ${environment}`
      );
    }
  }
}
