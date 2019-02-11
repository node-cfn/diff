'use strict';

const test = require('ava');

const getChangedResources = require('../get-changed-resources');

test('handles empty changes/stack (no Resources)', t => {
    getChangedResources({ Changes: [], ProcessedTemplate: {} }, { ProcessedTemplate: {} }, {});
    t.pass();
});