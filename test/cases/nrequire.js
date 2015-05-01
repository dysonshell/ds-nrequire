'use strict';
var path = require('path');
var tape = require('tape');
GLOBAL.APP_ROOT = path.resolve(__dirname, '..');

tape(function(test) {
    test.plan(6);
    require('../../');
    require('../hello');
    console.log('global', global);
    test.equal(global.z, 'z');
    test.equal(global.a, 'ma');
    test.equal(global.b, 'b');
    test.equal(global.c, 'mc');
    test.equal(global.d, 'md');
    test.equal(global.t.trim(), '<span>hello</span>');
});
