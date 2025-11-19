import 'reflect-metadata';
import chalk from 'chalk';
import * as fs from 'fs';
import { globbySync } from 'globby';
import * as path from 'path';
import { FeatureSwitchConfigDto } from '../src/dto/feature-switch-config.dto.js';
import { Environment, FeatureSwitchHelper } from '../src/feature-switch-helper.js';
import { loadJsonConfig } from '../src/utils/json-config.utils.js';
console.log(chalk.blue(`\n=== Feature Switch Validator ===\nProudly developed by Andrash for Havppen 😁\n`));
const FEATURE_SWITCH_CONFIG_NAME = 'feature-switch.json';
const FEATURE_USAGE_REGEXP = /isFeatureEnabled(?:<[\w\-]+>)?\(\s*['"`]([\w\-]+)['"`]\s*\)/g;
main();
function main() {
    console.log(chalk.yellow('Loading feature switch configuration...'));
    // 讀取並解析功能開關配置
    const config = loadJsonConfig(FeatureSwitchConfigDto, FEATURE_SWITCH_CONFIG_NAME, {
        baseDir: process.cwd(),
        transformOption: {
            exposeDefaultValues: true,
        },
    });
    FeatureSwitchHelper.init(Environment.DEVELOPMENT, config);
    const { features, validationOptions } = config;
    const tsFilePaths = globbySync(config.validationOptions.filePatterns, { cwd: process.cwd(), absolute: true });
    const unusedFeatures = new Set(features.keys());
    console.log(chalk.yellow(`Starting feature switch validation on ${tsFilePaths.length} TypeScript files...`));
    let errorCount = 0;
    for (const filePath of tsFilePaths) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        errorCount += validateFileContent(fileContent, filePath, config, unusedFeatures);
    }
    if (validationOptions.shouldUseAllDefinedFeatureSwitches) {
        unusedFeatures.forEach(unusedFeature => {
            console.error(chalk.red(`Error: Feature switch "${unusedFeature}" is defined but never used.`));
            errorCount++;
        });
    }
    if (errorCount > 0) {
        console.error(chalk.red(`Feature switch validation failed with ${errorCount} error(s). Checked ${tsFilePaths.length} files.`));
        process.exit(1);
    }
    else {
        console.log(chalk.green(`Feature switch validation passed without errors. Checked ${tsFilePaths.length} files.`));
    }
}
function validateFileContent(fileContent, filePath, config, unusedFeatures) {
    let errorCount = 0;
    const featureUsages = findFeatureUsages(fileContent, config.features);
    const relativeFilePath = path.relative(process.cwd(), filePath);
    // 檢查功能開關使用情況
    for (const usage of featureUsages) {
        if (usage.isDefined) {
            unusedFeatures.delete(usage.featureName);
        }
        else if (config.validationOptions.shouldNotUseUndefinedFeatureSwitches) {
            console.error(chalk.red(`Error: Undefined feature switch "${usage.featureName}" used in ${relativeFilePath}:${usage.lineNumber}`));
            errorCount++;
        }
    }
    return errorCount;
}
function findFeatureUsages(content, features) {
    let currentIndex = 0;
    let currentLine = 1;
    const results = [];
    const matches = Array.from(content.matchAll(FEATURE_USAGE_REGEXP));
    // Use String.prototype.matchAll() to get an iterator of all matches
    matches.forEach((match) => {
        const featureName = match[1];
        const matchIndex = match.index;
        const precedingText = content.substring(currentIndex, matchIndex);
        const lineBreakMatches = precedingText.match(/\n/g);
        const lineNumber = (lineBreakMatches ? lineBreakMatches.length : 0) + currentLine;
        const isDefined = features.has(featureName);
        currentIndex = matchIndex;
        currentLine = lineNumber;
        results.push({
            featureName,
            lineNumber,
            isDefined,
        });
    });
    return results;
}
//# sourceMappingURL=validate.js.map