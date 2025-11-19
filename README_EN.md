# Feature Switch Helper Manual

This is a helper module for managing and checking feature switches. It allows you to enable or disable specific features in your application based on configuration.

中文版本請參閱：[Feature Switch Helper 說明書 (中文)](./README.md)

> Sponsor:
> This project is sponsored by [Havppen](https://www.havppen.com/): [Create your own "online course platform" and monetize your knowledge instantly!](https://www.havppen.com/)

# Table of Contents

- [How to Use](#how-to-use)
  - [Initialization](#initialization)
  - [Setting and Using Feature Switches](#setting-and-using-feature-switches)
  - [Checking Feature Switches](#checking-feature-switches)
  - [Running the Project](#running-the-project)
  - [Committing Code](#committing-code)
- [Setting up the feature-switch.json Configuration File](#setting-up-the-feature-switchjson-configuration-file)
  - [The `features` Property](#the-features-property)
  - [Enabling Feature Switches in a Production Environment](#enabling-feature-switches-in-a-production-environment)
  - [The `validationOptions` Property](#the-validationoptions-property)
- [Using the `isFeatureEnabled` Function](#using-the-isfeatureenabled-function)
  - [Incorrect Usage of `isFeatureEnabled`](#incorrect-usage-of-isfeatureenabled)
  - [Avoid Commenting Out `isFeatureEnabled`](#avoid-commenting-out-isfeatureenabled)
- [Using the `getFeatureDef` Function](#using-the-getfeaturedef-function)
- [Conclusion](#conclusion)

## How to Use

### Initialization

Before using `FeatureSwitchHelper`, you must initialize it when your application starts. This is usually done in your main file (e.g., `main.ts`).

```typescript
import { FeatureSwitchHelper, Environment } from "feature-switch-helper";
import * as featureSwitchConfig from "./feature-switch.json";

// ...
const environment =
  (process.env.NODE_ENV as Environment) || Environment.DEVELOPMENT;
FeatureSwitchHelper.init(environment, featureSwitchConfig);
// ...
```

### Setting and Using Feature Switches:

- First, create a `feature-switch.json` configuration file in the project root directory and define your feature switches in it. See [Setting up the feature-switch.json Configuration File](#setting-up-the-feature-switchjson-configuration-file) for details.

- In your project where you need to use a feature switch, import `FeatureSwitchHelper` and use it to determine if a specific feature is enabled. See [Using the isFeatureEnabled Function](#using-the-isfeatureenabled-function) for details.

- It is recommended to follow these principles for naming feature switches:
  1. Use camelCase.
  2. Prefix the feature's status (like wip, deprecated, experimental) followed by an underscore, for example, `wip_`, `deprecated_`, `experimental_`.
  3. Ensure the feature name is descriptive and clearly expresses its purpose.
  4. For example: `wip_newDashboard`, `deprecated_oldApi`, `experimental_aiFeature`.

### Checking Feature Switches:

- First, add the following script command to your `package.json`:

  ```json
  "scripts": {
    "feature-switch:validate": "NODE_ENV=development node node_modules/@andrash/feature-switch-helper/dist/scripts/validate.js"
  }
  ```

  - Please change the path to point to the `validate.js` script in the `feature-switch-helper` package.
  - Note: We intentionally use `node` to run the script because `tsx` does not support the decorators required by packages like `class-transformer`, which would cause the validation script to fail.

- Run the `pnpm feature-switch:validate` command to help check if the feature switches used in the code are consistent with the definitions in the configuration file. If the project has not been compiled, run `pnpm build` first. This command ensures that:
  - All feature switches used in the code are defined in the `feature-switch.json` configuration file.
  - All feature switches defined in the `feature-switch.json` configuration file are used in the code (i.e., there should be no idle, unused feature switches).
  - This also helps to find inconsistencies between the configuration file and the code due to typos.

### Running the Project:

- Start your NestJS project normally. The feature switches will enable or disable corresponding features based on the configuration in `feature-switch.json`.
- When the project starts, it will list all enabled and disabled feature switches in the console log, allowing you to confirm the current feature status. For example:
  ```
  Enabled Features: [
    "exampleFeature01"
  ]
  Disabled Features: [
    "exampleFeature02"
  ]
  ```
- When the `FeatureSwitchHelper.isFeatureEnabled` function is called, it will log the usage of that feature switch in the console. For example: `Feature "exampleFeature01" is used.` or `Feature "exampleFeature02" is skipped.`.
- Note: If an undefined feature switch is used while the project is running, an error will be thrown. If this error is not properly caught and handled, it may cause the project to terminate. Additionally, the project cannot detect "defined but unused feature switches" at runtime. Regularly running `pnpm feature-switch:validate` can help check for and avoid such issues.

### Committing Code:

- Before committing with git, the `pnpm feature-switch:validate` command will be automatically executed to ensure that all feature switch usage complies with the definitions in the configuration file. If the check fails, the commit will be blocked. Please fix the related issues before trying to commit again. (This is implemented using Husky).

## Setting up the feature-switch.json Configuration File

A `feature-switch.json` configuration file typically looks like this:

```json
{
  "features": {
    "wip_exampleFeature01": {
      "isForceEnabled": true,
      "isDevFeature": false,
      "isTestFeature": false,
      "isUatFeature": false,
      "note": "This is an example feature that is force enabled."
    },
    "wip_exampleFeature02": {
      "isForceEnabled": false,
      "isDevFeature": false,
      "isTestFeature": true,
      "isUatFeature": true,
      "note": "This is an example feature for testing and UAT environments."
    }
  },
  "validationOptions": {
    "shouldNotUseUndefinedFeatureSwitches": true,
    "shouldUseAllDefinedFeatureSwitches": true,
    "filePatterns": ["src/**/*.{ts,tsx,js,jsx}"]
  }
}
```

※Note: The content of this document may not match the latest format due to a lack of maintenance. Please refer to the format defined in [`feature-switch-config.dto.ts`](src/dto/feature-switch-config.dto.ts).

### The `features` Property

The `features` object contains all feature switch definitions. Each property name of this object is the name of a feature switch, and its value is an object that defines the various properties of that feature switch:

- `isForceEnabled`: A boolean value indicating whether the feature is forcibly enabled. This means the feature will be enabled regardless of the environment the project is running in, including development, testing, UAT, and production. Optional, defaults to `false`.
- `isDevFeature`: A boolean value indicating whether the feature is for the development environment only. Optional, defaults to `false`.
- `isTestFeature`: A boolean value indicating whether the feature is for the testing environment only. Optional, defaults to `false`.
- `isUatFeature`: A boolean value indicating whether the feature is for the UAT (User Acceptance Testing) environment only. Optional, defaults to `false`.
- `note`: A string providing a note or description about the feature switch. Optional.

※Note: The content of this document may not match the latest format due to a lack of maintenance. Please refer to the format defined in [`feature-switch-config.dto.ts`](src/dto/feature-switch-config.dto.ts).

### Enabling Feature Switches in a Production Environment

By design, I have intentionally not included an `isProdFeature` property. This is because it would allow certain features to be enabled only in the production environment, bypassing other environments. Such a design could lead to inadequate validation of these features during development and testing, increasing the risk of problems in production. Therefore, to enable a feature switch in a production environment, the `isForceEnabled` property must be used. This ensures that when a feature is enabled in production, it can also be fully validated during development and testing.

Furthermore, in a normal workflow, when a feature is mature enough to be used in production, it should no longer be controlled by a feature switch. Instead, the feature's code should be directly integrated into the main codebase, and the relevant feature switch configuration should be removed. This reduces unnecessary complexity and ensures feature consistency across all environments.

In other words, using a feature switch in a production environment is itself an unusual situation. That's why the word "Force" is used in the `isForceEnabled` property name—to emphasize the special nature of this case.

Tech Leads should pay special attention to feature switches that use the `isForceEnabled` property during code reviews to check for misuse of feature switches and request their removal, integrating the feature directly into the main code.

### The `validationOptions` Property

The `validationOptions` object is used to configure feature switch validation options:

- `shouldNotUseUndefinedFeatureSwitches`: A boolean value indicating whether the use of undefined feature switches should be prohibited. Optional, defaults to `true`. It is not recommended to disable this option to avoid problems caused by typos.
- `shouldUseAllDefinedFeatureSwitches`: A boolean value indicating whether all defined feature switches should be required to be used. Optional, defaults to `true`. It is not recommended to disable this option, as too many idle feature switches increase maintenance costs.
- `filePatterns`: An array of strings specifying the file patterns to check. This is a required parameter and must not be an empty array.

※Note: The content of this document may not match the latest format due to a lack of maintenance. Please refer to the format defined in [`feature-switch-config.dto.ts`](src/dto/feature-switch-config.dto.ts).

## Using the `isFeatureEnabled` Function

Please use the `FeatureSwitchHelper.isFeatureEnabled` function in your code to check the status of a feature switch. This allows you to wrap specific functionality under the control of a feature switch.

Example:

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";
import { WIP_ExampleService } from "./wip-example.service.js";
import { ExampleService } from "./example.service.js";

function getExampleFeature() {
  if (FeatureSwitchHelper.isFeatureEnabled("wip_exampleFeature")) {
    return WIP_ExampleService;
  } else {
    return ExampleService;
  }
}

// Or
const ExampleFeature = FeatureSwitchHelper.isFeatureEnabled(
  "wip_exampleFeature"
)
  ? WIP_ExampleService
  : ExampleService;

// To ensure correct spelling, you can define a type to restrict feature names:
type FeatureNames =
  | "wip_exampleFeature"
  | "wip_exampleFeature01"
  | "wip_exampleFeature02";
const ExampleFeature2 = FeatureSwitchHelper.isFeatureEnabled<FeatureNames>(
  "wip_exampleFeature"
)
  ? WIP_ExampleService
  : ExampleService;
```

### Incorrect Usage of `isFeatureEnabled`

Note that the following practices will prevent the feature switch validation tool from correctly identifying feature switches. Please do not:

- Wrap the `FeatureSwitchHelper.isFeatureEnabled` function in other functions or utilities.
- Use variables to pass feature switch names.

Here is an incorrect example, please do not follow it:

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";

// Do not wrap it in another function
function checkFeature(featureName: string) {
  // Do not use a variable to pass the feature switch name
  return FeatureSwitchHelper.isFeatureEnabled(featureName); // Using a variable prevents identification by the validation tool
}

function getExampleFeature() {
  // The different function name prevents identification by the validation tool
  if (checkFeature("wip_exampleFeature")) {
    return WIP_ExampleService;
  } else {
    return ExampleService;
  }
}
```

### Avoid Commenting Out `isFeatureEnabled`

Currently, the feature switch validation tool cannot distinguish between commented-out code and actual executed code. Therefore, if you comment out a call to `FeatureSwitchHelper.isFeatureEnabled`, the validation tool will still treat it as a validly used feature switch.

For example:

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";
// if (FeatureSwitchHelper.isFeatureEnabled('wip_exampleFeature')) { //<-- This will still be detected
//   return WIP_ExampleService
// }
```

This can lead to management and maintenance issues with feature switches. When there are many feature switches, it becomes difficult to track which ones are actually in use and which are no longer needed.

Therefore, please avoid commenting out the use of feature switches. If a feature is no longer needed, the relevant code and feature switch configuration should be removed completely.

## Using the `getFeatureDef` Function

The `getFeatureDef` function can be used to get the definition information of a feature switch, which is very helpful for understanding the purpose and status of a feature.

This function returns a `FeatureDef` object (or null if not found), which is the feature switch definition from the `features` section of the `feature-switch.json` configuration file.

Here is an example of how to use it:

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";

const featureDef = FeatureSwitchHelper.getFeatureDef("wip_exampleFeature01");
if (featureDef) {
  console.log(featureDef.isForceEnabled); // Outputs whether the feature is forcibly enabled
  console.log(featureDef.isDevFeature); // Outputs whether the feature is for the dev environment
  console.log(featureDef.isTestFeature); // Outputs whether the feature is for the test environment
  console.log(featureDef.isUatFeature); // Outputs whether the feature is for the UAT environment
  console.log(featureDef.note); // Outputs the note for the feature
}

// To ensure correct spelling, you can define a type to restrict feature names:
type FeatureNames = "wip_exampleFeature01" | "wip_exampleFeature02";
const featureDef2 = FeatureSwitchHelper.getFeatureDef<FeatureNames>(
  "wip_exampleFeature01"
);
if (featureDef2) {
  console.log(featureDef2.isForceEnabled);
}
```

Since this function is not checked by the feature switch validation tool, it does not have the same usage restrictions as the `isFeatureEnabled` function.

## Conclusion

I hope you have read this document carefully and can make good use of this feature switch helper tool to manage your application's features.

If not...

Be careful, Andrash might pop up at any time to nag you 😁

Please be sure to use feature switches correctly to make product development and maintenance simple and easy for everyone.
Thank you for your cooperation. If you have any suggestions for improvement, please feel free to bring them up!

2025.11 Andrash Yang
