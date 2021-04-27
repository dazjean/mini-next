# 搭配typescript
mini-next 默认使用`babel-loader`搭配插件`@babel/preset-typescript`进行ts编译,但不做类型校验，类型校验可以使用ts或者`vs code`编辑器工具

## 安装typescript
```
yarn add  typescript;
``

## 新增tsconfig.json

```js
{
    "compilerOptions": {
      "jsx": "react",
      // Target latest version of ECMAScript.
      "target": "esnext",
      // Search under node_modules for non-relative imports.
      "moduleResolution": "node",
      // Process & infer types from .js files.
      "allowJs": true,
      // Don't emit; allow Babel to transform files.
      "noEmit": true,
      // Enable strictest settings like strictNullChecks & noImplicitAny.
      "strict": true,
      // Disallow features that require cross-file information for emit.
      "isolatedModules": true,
      // Import non-ES modules as default imports.
      "esModuleInterop": true
    },
    "include": ["src"]
  }

```


## babelrc

```js
{
  "presets":["@babel/react",[
    "@babel/env",
    {
      "targets": {
        "browsers": ["last 2 versions", "ie >= 7"]
      }
    }
  ],"@babel/preset-typescript"],
  "plugins": [
    [
      "@babel/plugin-transform-runtime",
      { "helpers": false, "regenerator": true }
    ],
    "@babel/plugin-transform-modules-commonjs",
    "@babel/plugin-proposal-class-properties"
  ]
}

```