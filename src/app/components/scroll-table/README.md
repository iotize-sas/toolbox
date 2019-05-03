# app-scroll-table Component

A 2-dimensional scrollable table component 

## dataArray

| Description | Array of objects. Properties `key` and `value` may be named differently (see [keyName](#keyName) and [valueName](#valueName))|
|-------------|---|
| Type        | {key:string, value: any}[] |

## keyName

| Description | Actual name of the dataArray element property to display in the first column. Default value is `'key'`  |
|-------------|---|
| Type        |`string | undefined`|

## valueName

| Description | Actual name of the dataArray element property to display in the second column. Default value is `'value'`  |
|-------------|---|
| Type        |`string | undefined`|

## keyAlias
| Description | Title of the first column. Default value is `keyName`  |
|-------------|---|
| Type        |`string | undefined`|
## valueAlias
| Description | Title of the first column. Default value is `valueName`  |
|-------------|---|
| Type        |`string | undefined`|
## formatFn
| Description | Formatting function to call on each element in `dataArray` . By default, displays every element unmodified |
|-------------|---|
| Type        |`(data) => string | undefined`|
## columnSize
| Description | Size of each columns according to 12-col ion-grid system. Default value is `{key: 6, value: 6}` |
|-------------|---|
| Type        |`{key: number, value: number} | undefined`|