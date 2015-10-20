# @ds/nrequire

用于 hack node.js 的 require，让 `/ccc/` `/node_modules/@ccc/` 下面的文件能够相互替代

## usage

```js
require('@ds/nrequire');
```

在代码一开始添加这一行即可，引入该模块后，再 `require('ccc/xxx/yyy.js')` 就会先找 `{GLOBAL.APP_ROOT}/ccc/xxx/yyy.js` 文件，如果没有则找 `node_modules/@ccc/xxx/yyy.js`

### 集成 Babel

1.4 之后集成了 `babel-core/register`，引用之后可以使用 babel 的所有默认支持语法加上 es7.functionBind 这个特定语法。在 `require('@ds/nrequire')` 的这个文件还不能直接立即使用，应该将 index.js 的主要内容移到新文件 server.js, index.js 只是 require('@ds/nrequire'); require('./server');`

## watchRequiredFilesToRestart

如果设置了

```js
require('@ds/nrequire').watchRequiredFilesToRestart = true;
```

会在开发环境监视所有之后 require 过的文件改动，有任何文件改动时就停止进程，与进程的 watcher 配合就可以精确地区分是 node 代码改动（需重启）还是浏览器端 js 改动（不需重启）。在生产环境，只会监视 `touch_to_restart.js` 这个文件，因此在生产环境需重启时只需运行 `touch touch_to_restart.js` 即可。
