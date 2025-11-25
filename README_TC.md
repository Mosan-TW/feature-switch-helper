# Feature Switch Helper 說明書

這是一個用於管理和檢查功能開關（Feature Switch）的輔助工具模組。它允許你根據配置啟用或禁用應用程式中的特定功能。

This is a helper module for managing and checking feature switches. It allows you to enable or disable specific features in your application based on configuration.

For English version, please visit: [Feature Switch Helper Documentation (English)](./README.md)

> 贊助商：
> 本專案由 [Havppen](https://www.havppen.com/) 贊助開發：[創建你的專屬「線上課程平台」，即刻將知識變現！](https://www.havppen.com/)

# 目錄

- [使用方式](#使用方式)
  - [初始化](#初始化)
  - [設定與使用功能開關](#設定與使用功能開關)
  - [檢查功能開關](#檢查功能開關)
  - [執行專案](#執行專案)
  - [提交程式碼](#提交程式碼)
- [設置 feature-switch.json 設定檔](#設置-feature-switchjson-設定檔)
  - [features 屬性](#features-屬性)
  - [在生產環境中啟用功能開關](#在生產環境中啟用功能開關)
  - [validationOptions 屬性](#validationoptions-屬性)
- [使用 isFeatureEnabled 函數](#使用-isfeatureenabled-函數)
  - [錯誤的 isFeatureEnabled 用法](#錯誤的-isfeatureenabled-用法)
  - [避免將 isFeatureEnabled 註解掉](#避免將-isfeatureenabled-註解掉)
- [使用 getFeatureDef 函數](#使用-getfeaturedef-函數)
- [結語](#結語)

## 使用方式

### 初始化

在使用 `FeatureSwitchHelper` 之前，你必須先在你的應用程式啟動時進行初始化。這通常在你的主檔案（例如 `main.ts`）中完成。

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";
import * as featureSwitchConfig from "./feature-switch.json";

// ...
const environment = process.env.NODE_ENV || "development";
FeatureSwitchHelper.init(environment, featureSwitchConfig);
// ...
```

### 設定與使用功能開關：

- 先在專案根目錄建立一個 `feature-switch.json` 設定檔，並在其中定義你的功能開關。詳見[設置 feature-switch.json 設定檔](#設置-feature-switchjson-設定檔)。

- 在專案中需要使用功能開關的地方，匯入 `FeatureSwitchHelper`，並用它來判斷特定的功能是否已啟用。詳見[使用 isFeatureEnabled 函數](#使用-isfeatureenabled-函數)。

- 建議功能開關的命名遵循以下原則：
  1. 使用小寫駝峰式命名法（camelCase）。
  2. 將功能的狀態（如 wip、deprecated、experimental）作為前綴，並以底線分隔，例如 `wip_`、`deprecated_`、`experimental_`。
  3. 確保功能名稱具有描述性，能夠清楚表達其用途。
  4. 例如：`wip_newDashboard`、`deprecated_oldApi`、`experimental_aiFeature`。

### 檢查功能開關：

- 先在 `package.json` 中新增以下 script 指令：

  ```json
  "scripts": {
    "feature-switch:validate": "NODE_ENV=development node node_modules/@andrash/feature-switch-helper/dist/scripts/validate.js"
  }
  ```

  - 請自行更改路徑，以指向 `feature-switch-helper` 套件中的 `validate.js` 腳本。
  - 附註：這裡故意使用 `node` 來執行腳本，因為 `tsx` 不支援 `class-transformer` 等套件所需的裝飾器（decorators），會導致驗證腳本無法正常運行。

- 執行 `pnpm feature-switch:validate` 指令，可協助檢查程式碼中使用的功能開關是否符合設定檔中的定義。若專案尚未編譯，請先執行 `pnpm build` 再執行此指令。此指令會確保：
  - 程式碼中使用的功能開關，皆有在 `feature-switch.json` 設定檔中被定義。
  - `feature-switch.json` 設定檔中定義的功能開關，皆有在程式碼中被使用（即不應有閒置未使用的功能開關）。
  - 這也有助於發現因為拼寫錯誤導致設定檔與程式碼不一致的問題。

### 執行專案：

- 正常啟動你的 NestJS 專案，功能開關將根據 `feature-switch.json` 設定檔中的配置來啟用或禁用相應的功能。
- 專案啟動時，會在 console log 中列出所有已啟用及未啟用的功能開關，方便你確認目前的功能狀態。例如：
  ```
  Enabled Features: [
    "exampleFeature01"
  ]
  Disabled Features: [
    "exampleFeature02"
  ]
  ```
- 當呼叫了 `FeatureSwitchHelper.isFeatureEnabled` 函數，會在 console log 中紀錄該功能開關的使用情況。例如：`Feature "exampleFeature01" is used.`或`Feature "exampleFeature02" is skipped.`。
- 注意：專案運行時若使用了未定義的功能開關，將會拋出錯誤。若未妥善捕捉處理此錯誤，可能導致專案中止運行。另外，專案在執行階段並無法檢測出「設定檔中已定義，但未使用的功能開關」。經常執行 `pnpm feature-switch:validate` 指令，可協助檢查並避免此類問題。

### 提交程式碼：

- 建議在使用 git 提交 Commit 前，自動執行 `pnpm feature-switch:validate` 指令，確保所有功能開關的使用情況符合設定檔中的定義。可自行安裝/設定 [Husky](https://typicode.github.io/husky/#/) 套件來實現這個功能。

## 設置 feature-switch.json 設定檔

一個 `feature-switch.json` 設定檔的結構通常長得像這樣：

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

※注意：此文件內容有可能因為疏於維護而與最新版本的實際格式不符，請以 [`feature-switch-config.dto.ts`](src/dto/feature-switch-config.dto.ts) 中定義的格式為準。

### features 屬性

`features` 物件包含了所有的功能開關定義，該物件的每個屬性名稱即為功能開關的名稱，而其值則為一個物件，定義了該功能開關的各種屬性：

- `isForceEnabled`: 布林值，表示該功能是否被強制啟用。這意味著無論專案運行在哪個環境中，該功能都會被啟用。包含開發、測試、UAT 和生產環境。可省略，預設值為 `false`。
- `environments`: 字串陣列，列出啟用該功能的環境。
- `note`: 字串，提供關於該功能開關的備註或說明。可省略。

### 在生產環境中啟用功能開關

在生產環境中啟用功能開關有兩種方式：

1.  將 `"production"` 加入 `environments` 陣列中。但這是不建議的做法。因為這允許開發者只在生產環境中啟用某功能，而未在開發或測試環境中啟用。可能導致功能未經充分測試就直接在生產環境中使用，增加風險。因此這樣的行為預設是被禁止的。
2.  將 `isForceEnabled` 設為 `true`。這是建議的做法。因為這會強制在所有環境中啟用該功能，包括生產、開發及測試環境，確保所有在生產環境中使用的功能也會在開發及測試環境中被啟用並受到測試。

更好的做法：依照正常流程，當一個功能已經足夠成熟，可在生產環境中使用時，其實不應該繼續使用功能開關來控制它的啟用狀態。相反地，應該將該功能的程式碼直接整合到主程式碼庫中，並移除相關的功能開關設定。這樣可以減少不必要的複雜性，並確保所有環境中的功能一致性。

Tech Lead 在進行程式碼審查（Code Review）時，應特別注意使用了 `isForceEnabled` 屬性的功能開關，確認是否為功能開關的誤用，並要求移除功能開關，將功能直接整合到主程式碼中。

### validationOptions 屬性

`validationOptions` 物件用於設定功能開關驗證的選項：

- `shouldNotUseUndefinedFeatureSwitches`: 布林值，表示是否應該禁止使用未定義的功能開關。可省略，預設值為 `true`。不建議關閉此選項，以避免拼寫錯誤導致的問題。
- `shouldUseAllDefinedFeatureSwitches`: 布林值，表示是否應該要求所有定義的功能開關都被使用。可省略，預設值為 `true`。不建議關閉此選項，因為過多的閒置功能開關會增加維護成本。
- `filePatterns`: 字串陣列，指定要檢查的檔案模式。是必要參數，且不得為空陣列。
- `environment`: 字串，指定用於驗證的環境。可省略。
- `validEnvironments`: 字串陣列，指定可接受的環境名稱。可省略，預設值為 `["development", "test", "production"]`。
- `restrictedEnvironments`: 字串陣列，指定不允許使用功能開關的環境。可省略，預設為 `["production"]`。在大多數情況下，我們並不建議在生產環境中使用功能開關，因為這可能會導致未經充分測試的功能被啟用，從而影響系統的穩定性和可靠性。若一個功能已經足夠成熟並準備好在生產環境中使用，建議直接將該功能的程式碼整合到主程式碼庫中，而不是依賴功能開關來控制其啟用與否。

## 使用 isFeatureEnabled 函數

請在程式碼中使用 `FeatureSwitchHelper.isFeatureEnabled` 函數來檢查功能開關的狀態。藉此將特定功能包裝到功能開關的控制之下。

範例：

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

// 或者
const ExampleFeature = FeatureSwitchHelper.isFeatureEnabled(
  "wip_exampleFeature"
)
  ? WIP_ExampleService
  : ExampleService;

// 如果希望確保名稱拼寫正確，則可以定義一個型別來限制功能名稱：
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

### 錯誤的 isFeatureEnabled 用法

注意，以下做法會導致功能開關驗證工具無法正確識別功能開關，請勿：

- 將 `FeatureSwitchHelper.isFeatureEnabled` 函數包裝成其他函數或工具
- 使用變數來傳遞功能開關名稱

以下是錯誤範例，好寶寶不要學：

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";

// 不可以包裝成其他函數
function checkFeature(featureName: string) {
  // 不可以使用變數傳遞功能開關名稱
  return FeatureSwitchHelper.isFeatureEnabled(featureName); // 使用了變數傳遞功能開關名稱，導致無法被驗證工具識別
}

function getExampleFeature() {
  // 因為函數名稱不同，導致無法被驗證工具識別
  if (checkFeature("wip_exampleFeature")) {
    return WIP_ExampleService;
  } else {
    return ExampleService;
  }
}
```

### 避免將 isFeatureEnabled 註解掉

目前功能開關驗證工具並無法區別「註解掉的程式碼」與「實際執行的程式碼」。因此若將 `FeatureSwitchHelper.isFeatureEnabled` 函數呼叫轉為註解，功能開關驗證工具仍會將其視為有效使用的功能開關。

例如：

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";
// if (FeatureSwitchHelper.isFeatureEnabled('wip_exampleFeature')) { //<-- 還是會被發現
//   return WIP_ExampleService
// }
```

這可能導致功能開關在管理及維護上的問題。當功能開關變得很多時，我們會難以追蹤哪些功能開關是實際被使用的，哪些是已經不再需要的。

因此請避免將功能開關的使用註解掉，若某個功能不再需要，則應直接移除相關程式碼及功能開關設定。

## 使用 getFeatureDef 函數

`getFeatureDef` 函數可用於獲取功能開關的定義資訊，這對於瞭解功能的用途及狀態非常有幫助。

此函數會傳回一個 `FeatureDef` 物件（若找不到則傳回 null），它其實就是 `feature-switch.json` 設定檔中 `features` 底下的功能開關定義。

以下是使用範例：

```typescript
import { FeatureSwitchHelper } from "feature-switch-helper";

const featureDef = FeatureSwitchHelper.getFeatureDef("wip_exampleFeature01");
if (featureDef) {
  console.log(featureDef.isForceEnabled); // 輸出該功能是否被強制啟用
  console.log(featureDef.environments); // 輸出啟用該功能的環境
  console.log(featureDef.note); // 輸出該功能的備註說明
}

// 如果希望確保名稱拼寫正確，則可以定義一個型別來限制功能名稱：
type FeatureNames = "wip_exampleFeature01" | "wip_exampleFeature02";
const featureDef2 = FeatureSwitchHelper.getFeatureDef<FeatureNames>(
  "wip_exampleFeature01"
);
if (featureDef2) {
  console.log(featureDef2.isForceEnabled);
}
```

由於此函數不會被功能開關驗證工具檢查，因此它並沒有如同 `isFeatureEnabled` 函數那樣的使用限制。

## 最後

現在你有了一份有力的工具來管理你的功能開關，請善用它以幫助你的同事（或未來的你）更容易的維護和佈署專案！

2025.11 Andrash Yang
