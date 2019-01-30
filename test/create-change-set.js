'use strict';

const test = require('ava');
const sinon = require('sinon');

const createChangeSet = require('../create-change-set');

test('starts with update', t => {
    const getTemplatePromise = sinon.stub().resolves({
        TemplateBody: '{}'
    });

    const cf = {
        createChangeSet: () => {
            return {
                promise:  sinon.stub().resolves()
            };
        },
        getTemplate: () => {
            return {
                promise: getTemplatePromise
            };
        },
        describeChangeSet: () => {
            return {
                promise: sinon.stub().resolves({
                    Status: 'CREATE_COMPLETE'
                })
            };
        }
    };

    return createChangeSet(cf, 'test-change-set', {})
        .then(() => {
            t.is(getTemplatePromise.callCount, 1);
        });
});

test('creates if update fails (because it does not exist)', t => {
    const cf = {
        createChangeSet: () => {
            return {
                promise: sinon.stub().resolves()
            };
        },
        getTemplate: () => {
            return {
                promise: sinon.stub().resolves({
                    TemplateBody: '{}'
                })
            };
        },
        describeChangeSet: () => {
            return {
                promise: sinon.stub().resolves({
                    Status: 'CREATE_COMPLETE'
                })
            };
        }
    };

    return createChangeSet(cf, 'test-change-set', {})
        .then(() => {
            t.pass();
        });
});

test('waits for complete', t => {
    const describeChangeSetPromise = sinon.stub()
        .onFirstCall().resolves({
            Status: 'CREATE_IN_PROGRESS'
        })
        .onSecondCall().resolves({
            Status: 'CREATE_PENDING'
        })
        .onThirdCall().resolves({
            Status: 'CREATE_COMPLETE'
        });

    const cf = {
        createChangeSet: () => {
            return {
                promise: sinon.stub().resolves()
            };
        },
        getTemplate: () => {
            return {
                promise: sinon.stub().resolves({
                    TemplateBody: '{}'
                })
            };
        },
        describeChangeSet: () => {
            return {
                promise: describeChangeSetPromise
            };
        }
    };

    return createChangeSet(cf, 'test-change-set', {})
        .then(() => {
            t.is(describeChangeSetPromise.callCount, 3);
        });
});