'use strict';

const test = require('ava');
const sinon = require('sinon');

const getStack = require('../get-stack');

test('works with template', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().resolves({
            Stacks: [{}]
        })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().resolves({
            TemplateBody: JSON.stringify({
                Resources: {
                    Foo: 'test'
                }
            })
        })
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(res => {
            t.is(describeStacks.callCount, 1);
            t.is(getTemplate.callCount, 1);
            t.deepEqual(getTemplate.firstCall.args[0].StackName, 'stack-name');
            t.deepEqual(getTemplate.firstCall.args[0].TemplateStage, 'Processed');
            t.deepEqual(res, {
                ProcessedTemplate: {
                    Resources: {
                        Foo: 'test'
                    }
                }
            });
        });
});

test('works with no template', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().resolves({
            Stacks: [{}]
        })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().resolves({})
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(res => {
            t.is(describeStacks.callCount, 1);
            t.is(getTemplate.callCount, 1);
            t.deepEqual(res, {
                ProcessedTemplate: {}
            });
        });
});

test('when stack does not exist', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().rejects({
            code: 'ValidationError',
            message: 'The stack does not exist'
        })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().resolves({})
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(res => {
            t.is(describeStacks.callCount, 1);
            t.is(getTemplate.callCount, 1);
            t.deepEqual(res, {
                ProcessedTemplate: {}
            });
        });
});

test('when stack does not exist (template)', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().resolves({
            Stacks: [{}]
        })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().rejects({
            code: 'ValidationError',
            message: 'The stack does not exist'
        })
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(res => {
            t.is(describeStacks.callCount, 1);
            t.is(getTemplate.callCount, 1);
            t.deepEqual(res, {
                ProcessedTemplate: {}
            });
        });
});

test('when get stack throws', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().rejects({
            code: 'SomeOtherError',
            message: 'Bezos is angry'
        })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().resolves({})
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(() => {
            t.fail('should not reach here');
        })
        .catch(e => {
            t.is(e.code, 'SomeOtherError');
        });
});

test('when get template throws', t => {
    const describeStacks = sinon.stub().returns({
        promise: sinon.stub().resolves({ Stacks: [] })
    });
    const getTemplate = sinon.stub().returns({
        promise: sinon.stub().rejects({
            code: 'SomeOtherError',
            message: 'Vogels is disappointed'
        })
    });
    const cf = {
        describeStacks,
        getTemplate
    };

    return getStack(cf, 'stack-name')
        .then(() => {
            t.fail('should not reach here');
        })
        .catch(e => {
            t.is(e.code, 'SomeOtherError');
        });
});