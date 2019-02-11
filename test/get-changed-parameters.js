'use strict';

const test = require('ava');

const getChangedParameters = require('../get-changed-parameters');

test('handles empty changes/stack (no Resources)', t => {
    getChangedParameters({}, {});
    t.pass();
});