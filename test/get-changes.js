'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('throws when status is not complete', t => {
    const getChangedParameters = sinon.stub();
    const getChangedConditions = sinon.stub();
    const getChangedOutputs = sinon.stub();
    const getChangedResources = sinon.stub();

    const getChanges = proxyquire('../get-changes', {
        './get-changed-parameters': getChangedParameters,
        './get-changed-conditions': getChangedConditions,
        './get-changed-outputs': getChangedOutputs,
        './get-changed-resources': getChangedResources
    });

    const e = t.throws(() => getChanges({}, {}));

    t.is(e.message, 'Expected changeSet.Status to be CREATE_COMPLETE but got undefined');
});

test('throws when status is failed', t => {
    const getChangedParameters = sinon.stub();
    const getChangedConditions = sinon.stub();
    const getChangedOutputs = sinon.stub();
    const getChangedResources = sinon.stub();

    const getChanges = proxyquire('../get-changes', {
        './get-changed-parameters': getChangedParameters,
        './get-changed-conditions': getChangedConditions,
        './get-changed-outputs': getChangedOutputs,
        './get-changed-resources': getChangedResources
    });

    const e = t.throws(() => getChanges({ Status: 'FAILED', StatusReason: `Network error` }, {}));

    t.is(e.message, 'createChangeSet FAILED: Network error');
});

test('returns no changes when there were none in the change set', t => {
    const getChangedParameters = sinon.stub();
    const getChangedConditions = sinon.stub();
    const getChangedOutputs = sinon.stub();
    const getChangedResources = sinon.stub();

    const getChanges = proxyquire('../get-changes', {
        './get-changed-parameters': getChangedParameters,
        './get-changed-conditions': getChangedConditions,
        './get-changed-outputs': getChangedOutputs,
        './get-changed-resources': getChangedResources
    });

    const changes = getChanges({ Status: 'FAILED', StatusReason: `The submitted information didn't contain changes` }, {});

    t.true(Array.isArray(changes));
    t.is(changes.length, 0);
});

test('combines changes together', t => {
    const getChangedParameters = sinon.stub().returns({ test: {} });
    const getChangedConditions = sinon.stub().returns({ test: {}, test2: {} });
    const getChangedOutputs = sinon.stub().returns({ test: {}, test2: {} });
    const getChangedResources = sinon.stub().returns({ test: {} });

    const getChanges = proxyquire('../get-changes', {
        './get-changed-parameters': getChangedParameters,
        './get-changed-conditions': getChangedConditions,
        './get-changed-outputs': getChangedOutputs,
        './get-changed-resources': getChangedResources
    });

    const changes = getChanges({ Status: 'CREATE_COMPLETE' }, {});

    t.is(getChangedParameters.callCount, 1);
    t.is(getChangedConditions.callCount, 1);
    t.is(getChangedOutputs.callCount, 1);
    t.is(getChangedResources.callCount, 1);

    t.true(Array.isArray(changes));
    t.is(changes.length, 6);
});
