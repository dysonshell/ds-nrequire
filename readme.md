# @ds/nrequire

用于 hack node.js 的 require，让 `/dsc/` `/node_modules/@dsc/` 下面的文件能够相互替代

## usage

```js
require('ds-nrequire');
```

在代码一开始添加这一行即可，引入该模块后，再 `require('dsc/xxx/yyy.js')` 就会先找 `${APP_ROOT}/dsc/xxx/yyy.js` 文件，如果没有则找 `${APP_ROOT}/node_modules/@dsc/xxx/yyy.js`

在这行之前需加入 DSCONFIG 全局变量配置或环境变量配置，具体参考 [DysonShell](https://www.npmjs.com/package/dysonshell) 的文档。

### 关于 Babel

如果需要使用 babel，建议用 babel-core/register 的方式，在引入 ds-nrequire 之前 `require('babel-core/register')` 即可。

## watchRequiredFilesToRestart

如果设置了

```js
require('ds-nrequire').watchRequiredFilesToRestart = true;
```

会在开发环境监视所有之后 require 过的文件改动，有任何文件改动时就停止进程，与进程的 watcher 配合就可以精确地区分是 node 代码改动（需重启）还是浏览器端 js 改动（不需重启）。在生产环境，只会监视 `touch_to_restart.js` 这个文件，因此在生产环境需重启时只需运行 `touch touch_to_restart.js` 即可。
