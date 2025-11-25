# Feature Switch Helper Documentation

This is a helper module for managing and checking feature switches. It allows you to enable or disable specific features in your application based on configuration.

中文版本請參閱：[Feature Switch Helper Documentation (Traditional Chinese)](./README_TC.md)

> Sponsor:
> This project is sponsored by [Havppen](https://www.havppen.com/): [Create your own "online course platform" and monetize your knowledge instantly!](https://www.havppen.com/)

# Table of Contents

- [Installation](#installation)
- [Usage](#usage)
  - [1. Initialization](#1-initialization)
  - [2. Setting and Using Feature Switches](#2-setting-and-using-feature-switches)
  - [3. Checking Feature Switches](#3-checking-feature-switches)
  - [4. Running the Project](#4-running-the-project)
  - [5. Committing Code](#5-committing-code)
- [Setting up the feature-switch.json Configuration File](#setting-up-the-feature-switchjson-configuration-file)
  - [The `features` Property](#the-features-property)
  - [Enabling Feature Switches in a Production Environment](#enabling-feature-switches-in-a-production-environment)
  - [The `validationOptions` Property](#the-validationoptions-property)
- [Using the `isFeatureEnabled` Function](#using-the-isfeatureenabled-function)
  - [Incorrect Usage of `isFeatureEnabled`](#incorrect-usage-of-isfeatureenabled)
  - [Avoid Commenting Out `isFeatureEnabled`](#avoid-commenting-out-isfeatureenabled)
- [Using the `getFeatureDef` Function](#using-the-getfeaturedef-function)
- [Conclusion](#conclusion)

## Installation

To install the `feature-switch-helper` module, use the following command:

```bash
npm install @andrash/feature-switch-helper
```

or

```bash
pnpm add @andrash/feature-switch-helper
```

## Usage

### 1. Initialization

Before using `FeatureSwitchHelper`, you must initialize it when your application starts. This is usually done in your main file (e.g., `main.ts`).

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";
import * as featureSwitchConfig from "./feature-switch.json";

// ...
const environment = process.env.NODE_ENV || "development";
FeatureSwitchHelper.init(environment, featureSwitchConfig);
// ...
```

### 2. Setting and Using Feature Switches:

- First, create a `feature-switch.json` configuration file in the project root directory and define your feature switches in it. See [Setting up the feature-switch.json Configuration File](#setting-up-the-feature-switchjson-configuration-file) for details.

- In your project where you need to use a feature switch, import `FeatureSwitchHelper` and use it to determine if a specific feature is enabled. See [Using the isFeatureEnabled Function](#using-the-isfeatureenabled-function) for details.

- It is recommended to follow these principles for naming feature switches:
  1. Use camelCase.
  2. Prefix the feature's status (like wip, deprecated, experimental) followed by an underscore, for example, `wip_`, `deprecated_`, `experimental_`.
  3. Ensure the feature name is descriptive and clearly expresses its purpose.
  4. For example: `wip_newDashboard`, `deprecated_oldApi`, `experimental_aiFeature`.

### 3. Checking Feature Switches:

- First, add the following script command to your `package.json`:

  ```json
  "scripts": {
    "feature-switch:validate": "NODE_ENV=development node node_modules/@andrash/feature-switch-helper/dist/scripts/validate.js"
  }
  ```

- Run the `pnpm feature-switch:validate` command to help check if the feature switches used in the code are consistent with the definitions in the configuration file. This command ensures that:
  - All feature switches used in the code are defined in the `feature-switch.json` configuration file.
  - All feature switches defined in the `feature-switch.json` configuration file are used in the code (i.e., there should be no idle, unused feature switches).
  - This also helps detect spelling mistakes in feature switch names and environment names used in the code and configuration file.

### 4. Running the Project:

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

### 5. Committing Code:

- It is recommanded to run the `pnpm feature-switch:validate` command automatically before committing with git to ensure that all feature switch usage complies with the definitions in the configuration file. You can achieve this by using tools like [Husky](https://typicode.github.io/husky/#/) to set up a pre-commit hook. This helps prevent issues related to feature switch usage from being introduced into the codebase.

## Setting up the feature-switch.json Configuration File

A `feature-switch.json` configuration file typically looks like this:

```json
{
  "features": {
    "wip_exampleFeature01": {
      "isForceEnabled": true,
      "environments": [],
      "note": "This is an example feature that is force enabled."
    },
    "wip_exampleFeature02": {
      "isForceEnabled": false,
      "environments": ["test", "uat"],
      "note": "This is an example feature for testing and UAT environments."
    }
  },
  "validationOptions": {
    "shouldNotUseUndefinedFeatureSwitches": true,
    "shouldUseAllDefinedFeatureSwitches": true,
    "filePatterns": ["src/**/*.{ts,tsx,js,jsx}"],
    "environment": "development",
    "validEnvironments": ["development", "test", "uat", "production"],
    "restrictedEnvironments": ["production"]
  }
}
```

※Note: The content of this document may not match the latest format due to a lack of maintenance. Please refer to the format defined in [`feature-switch-config.dto.ts`](src/dto/feature-switch-config.dto.ts).

### The `features` Property

The `features` object contains all feature switch definitions. Each property name of this object is the name of a feature switch, and its value is an object that defines the various properties of that feature switch:

- `isForceEnabled`: A boolean value indicating whether the feature is forcibly enabled. This means the feature will be enabled regardless of the environment the project is running in, including development, testing, UAT, and production. Optional, defaults to `false`.
- `environments`: An array of strings listing the environments where the feature is enabled.
- `note`: A string providing a note or description about the feature switch. Optional.

### Enabling Feature Switches in a Production Environment

To enable a feature in a production environment, you have two options:

1.  Add `"production"` to the `environments` array. This is not the recommended approach and is restricted by default since it may lead to features being enabled in production without prior testing in other environments.
2.  Set `isForceEnabled` to `true`. This will enable the feature in all environments, including production. This is the recommended approach since it will force the feature that is enabled in production to also be tested in development and testing environments.

Best Practice: In a normal workflow, when a feature is mature enough to be used in production, it should no longer be controlled by a feature switch. Instead, the feature's code should be directly integrated into the main codebase, and the relevant feature switch configuration should be removed. This reduces unnecessary complexity and ensures feature consistency across all environments.

Tech Leads should pay special attention to feature switches that use the `isForceEnabled` property during code reviews to check for misuse of feature switches and request their removal, integrating the feature directly into the main code.

### The `validationOptions` Property

The `validationOptions` object is used to configure feature switch validation options:

- `shouldNotUseUndefinedFeatureSwitches`: A boolean value indicating whether the use of undefined feature switches should be prohibited. Optional, defaults to `true`. It is not recommended to disable this option to avoid problems caused by typos.
- `shouldUseAllDefinedFeatureSwitches`: A boolean value indicating whether all defined feature switches should be required to be used. Optional, defaults to `true`. It is not recommended to disable this option, as too many idle feature switches increase maintenance costs.
- `filePatterns`: An array of strings specifying the file patterns to check. This is a required parameter and must not be an empty array.
- `environment`: A string specifying the environment to use for validation. Optional.
- `validEnvironments`: An array of strings specifying the acceptable environment names. Optional, defaults to `["development", "test", "production"]`.
- `restrictedEnvironments`: An array of strings specifying the environments where feature switches are not allowed. Optional, defaults to `["production"]`. In most cases, it is not recommended to use feature switches in a production environment. This can lead to the activation of untested features, affecting system stability. If a feature is ready for production, it should be integrated into the main codebase rather than being controlled by a feature switch.

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
  console.log(featureDef.environments); // Outputs the environments where the feature is enabled
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

# Finally

Now that you have a powerful tool to manage your feature switches, please use it wisely to help your colleagues (or future you) maintain and deploy the project more easily!

Developer: Andrash Yang 2025.11