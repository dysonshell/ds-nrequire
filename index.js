'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var config = require('config');
assert(config.dsAppRoot);
var xtend = require('xtend');
var str2js = require('string-to-js');
var chokidar = require('chokidar');

// config
var APP_ROOT = config.dsAppRoot;
var DSC = config.dsComponentPrefix || 'dsc';
DSC = DSC.replace(/^\/+/, '').replace(/\/+$/, '') + '/';

var Module = module.constructor;
var _resolveFilename = Module._resolveFilename;
Module._resolveFilename = function () {
    return _resolveFilename.apply(this, arguments);
}

Module._resolveFilename = function (request, parent) {
    if (!parent.paths ||
            parent.filename.indexOf('/'+DSC) === -1 &&
            parent.filename.indexOf('/node_modules/@'+DSC) === -1 &&
            request.indexOf(DSC) !== 0 ) {
        return _resolveFilename.apply(this, arguments);
    }
    var result;
    if (parent.filename.indexOf('/node_modules/@'+DSC) > -1) {
        // 从 @dsc 里面 require 的，先尝试在 /dsc/ 里面找对应的
        try {
            var newFileName = parent.filename.replace('/node_modules/@'+DSC, '/'+DSC);
            result = _resolveFilename.call(this, request, xtend(parent, {
                filename: newFileName,
                paths: Module._nodeModulePaths(path.dirname(newFileName)),
            }));
        } catch (err) {
            try {
                result = _resolveFilename.call(this, request.replace(new RegExp('^'+DSC), '@'+DSC), parent);
            } catch (_err) {
                throw err;
            }
        }
        return result;
    } else {
        // 从 `/dsc/` 里面 require 或者普通路径 require dsc/ 下面的，先直接找，再以 @dsc 下面为 fallback
        try {
            result = _resolveFilename.call(this, request, parent);
        } catch (err) {
            var newFileName = parent.filename.replace('/'+DSC, '/node_modules/@'+DSC);
            if (request.indexOf(DSC) !== 0 && !fs.existsSync(newFileName)) {
                throw err;
            }
            if (!APP_ROOT) {
                return findInNodeModules();
            }
            try {
                result = _resolveFilename.call(this, request, xtend(parent, {
                    paths: [APP_ROOT]
                }));
            } catch (_err) {
                findInNodeModules();
            }

            function findInNodeModules() {
                try {
                    var paths = Module._nodeModulePaths(path.dirname(newFileName));
                    var appRootModulesPath;
                    if (APP_ROOT && paths.indexOf((appRootModulesPath = path.join(APP_ROOT, 'node_modules'))) === -1) {
                        paths.unshift(appRootModulesPath);
                    }
                    result = _resolveFilename.call(this, request.replace(new RegExp('^'+DSC), '@'+DSC), xtend(parent, {
                        filename: newFileName,
                        paths: paths,
                    }));
                } catch (_err) {
                    throw err;
                }
            }
        }
        return result;
    }
}

'.html .css'.split(' ').forEach(function (ext) {
    Module._extensions[ext] = function (module, filename) {
        var content = fs.readFileSync(filename, 'utf8');
        module._compile(str2js(content), filename);
    };
});

Module._extensions['.js'] = (function(origCompiler) {
    var env = process.env.NODE_ENV || 'development';
    return function(module, filename) {
        origCompiler.apply(this, arguments);
        if (exports.watchRequiredFilesToRestart) {
            if (env === 'development' || path.basename(module.id) === 'touch_to_restart.js') {
                chokidar.watch(module.id, {
                    persistent: true,
                    usePolling: true,
                    followSymlinks: true,
                }).on('change', function(filename) {
                    console.log((new Date).toISOString(), filename, 'changed, exiting. (should be restarted)');
                    setTimeout(function () {
                        process.exit(0);
                    }, Number(process.env.RESTART_DELAY) || 0);
                });
            }
        }
    };
}(Module._extensions['.js']));
