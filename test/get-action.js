'use strict';

const test = require('ava');
const sinon = require('sinon');

const getAction = require('../get-action');

test('add when no previous value', t => {
    t.is(getAction(undefined, {}), 'Add');
});

test('remove when empty current value', t => {
    t.is(getAction({ something: 'test' }, {}), 'Remove');
});

test('modify when both values', t => {
    t.is(getAction({ something: 'test' }, { something: 'test' }), 'Modify');
});