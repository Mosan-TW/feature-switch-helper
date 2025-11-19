import { FeatureSwitchConfigDto } from './dto/feature-switch-config.dto.js';
import { deepFreeze } from './utils/deep-object.utils.js';
import { toDto } from './utils/dto.utils.js';
export var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "development";
    Environment["TEST"] = "test";
    Environment["UAT"] = "uat";
    Environment["PRODUCTION"] = "production";
})(Environment || (Environment = {}));
export class FeatureSwitchHelper {
    static _instance = null;
    static canNew = false;
    /**
     * 初始化功能開關助手
     * @param environment 運行環境
     * @param config 功能開關配置
     * @param options 選項
     */
    static init(environment, config, options) {
        if (this._instance) {
            throw new Error('FeatureSwitchHelper has already been initialized.');
        }
        const configDto = config instanceof FeatureSwitchConfigDto ? config : toDto(FeatureSwitchConfigDto, config);
        this.canNew = true;
        this._instance = new FeatureSwitchHelper(environment, configDto, options);
        this.canNew = false;
    }
    /**
     * 檢查功能是否啟用
     * @param featureName 功能名稱
     * @returns 是否啟用
     */
    static isFeatureEnabled(featureName) {
        return this.instance.isFeatureEnabled(featureName);
    }
    /**
     * 獲取功能開關的相關資訊
     * @param featureName 功能名稱
     * @returns 功能開關的相關資訊，若不存在則返回 null
     */
    static getFeatureDef(featureName) {
        return this.instance.getFeatureDef(featureName);
    }
    static get instance() {
        if (!FeatureSwitchHelper._instance) {
            throw new Error('FeatureSwitchHelper is not initialized. Please call FeatureSwitchHelper.init() first.');
        }
        return FeatureSwitchHelper._instance;
    }
    environment;
    config;
    featureEnabledMap;
    logger;
    constructor(environment, config, options) {
        if (!FeatureSwitchHelper.canNew) {
            throw new Error('FeatureSwitchHelper constructor is private. Please use FeatureSwitchHelper.init() to initialize.');
        }
        const { logger = console } = options || {};
        this.environment = environment;
        this.config = deepFreeze(config);
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
    isFeatureEnabled(featureName) {
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
        }
        else {
            console.log(`Feature "${featureName}" is skipped.`);
        }
        return isEnabled;
    }
    /**
     * 獲取功能開關的相關資訊
     * @param featureName 功能名稱
     * @returns 功能開關的相關資訊，若不存在則返回 null
     */
    getFeatureDef(featureName) {
        return this.config.features.get(featureName) || null;
    }
    createFeatureEnabledMap(features) {
        const map = {};
        features.forEach((featureDef, featureName) => {
            const isEnabled = featureDef.isForceEnabled ||
                (Environment.DEVELOPMENT === this.environment && featureDef.isDevFeature) ||
                (Environment.TEST === this.environment && featureDef.isTestFeature) ||
                (Environment.UAT === this.environment && featureDef.isUatFeature);
            map[featureName] = isEnabled;
        });
        return map;
    }
    logFeatureSwitchUsage(featureEnabledMap) {
        const enabledFeatures = [];
        const disabledFeatures = [];
        for (const [featureName, isEnabled] of Object.entries(featureEnabledMap)) {
            if (isEnabled) {
                enabledFeatures.push(featureName);
            }
            else {
                disabledFeatures.push(featureName);
            }
        }
        this.logger.log(`Enabled Features: ${JSON.stringify(enabledFeatures, null, 2)}`);
        this.logger.log(`Disabled Features: ${JSON.stringify(disabledFeatures, null, 2)}`);
    }
}
//# sourceMappingURL=feature-switch-helper.js.map