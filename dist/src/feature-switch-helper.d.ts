import { FeatureDefDto } from './dto/feature-switch-config.dto.js';
import { FeatureSwitchConfigDto } from './dto/feature-switch-config.dto.js';
import { PlainObject } from './types/plain-object.js';
export declare enum Environment {
    DEVELOPMENT = "development",
    TEST = "test",
    UAT = "uat",
    PRODUCTION = "production"
}
export interface ILogger {
    log: (message: string) => void;
}
export interface FeatureSwitchHelperOptions {
    logger?: ILogger;
}
export declare class FeatureSwitchHelper {
    private static _instance;
    private static canNew;
    /**
     * 初始化功能開關助手
     * @param environment 運行環境
     * @param config 功能開關配置
     * @param options 選項
     */
    static init(environment: Environment, config: FeatureSwitchConfigDto | PlainObject<FeatureSwitchConfigDto>, options?: FeatureSwitchHelperOptions): void;
    /**
     * 檢查功能是否啟用
     * @param featureName 功能名稱
     * @returns 是否啟用
     */
    static isFeatureEnabled<T extends string>(featureName: T): boolean;
    /**
     * 獲取功能開關的相關資訊
     * @param featureName 功能名稱
     * @returns 功能開關的相關資訊，若不存在則返回 null
     */
    static getFeatureDef<T extends string>(featureName: T): FeatureDefDto | null;
    private static get instance();
    private readonly environment;
    private readonly config;
    private readonly featureEnabledMap;
    private readonly logger;
    constructor(environment: Environment, config: FeatureSwitchConfigDto, options?: FeatureSwitchHelperOptions);
    /**
     * 檢查功能是否啟用
     * @param featureName 功能名稱
     * @returns 是否啟用
     */
    private isFeatureEnabled;
    /**
     * 獲取功能開關的相關資訊
     * @param featureName 功能名稱
     * @returns 功能開關的相關資訊，若不存在則返回 null
     */
    private getFeatureDef;
    private createFeatureEnabledMap;
    private logFeatureSwitchUsage;
}
