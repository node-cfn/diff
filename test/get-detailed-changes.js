'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('passes non-resource changes through', t => {
    const getTemplate = sinon.stub();

    const getDetailedChanges = proxyquire('../get-detailed-changes', {
        './get-template': getTemplate
    });

    const change = { Type: 'Output' };

    return getDetailedChanges(sinon.stub(), [change])
        .then(result => {
            t.is(getTemplate.callCount, 0);

            t.true(Array.isArray(result));
            t.is(result.length, 1);
        });
});

test('pass non-cloudformation stack resources through', t => {
    const getTemplate = sinon.stub();

    const getDetailedChanges = proxyquire('../get-detailed-changes', {
        './get-template': getTemplate
    });

    const change = {
        Type: 'Resource',
        ResourceChange: { Action: 'Modify', ResourceType: 'AWS::Some::Thing' }
    };

    return getDetailedChanges(sinon.stub(), [change])
        .then(result => {
            t.is(getTemplate.callCount, 0);

            t.true(Array.isArray(result));
            t.is(result.length, 1);
        });
});

test('gets template for stacks', t => {
    const getTemplate = sinon.stub();

    const getDetailedChanges = proxyquire('../get-detailed-changes', {
        './get-template': getTemplate
    });

    const change = {
        Type: 'Resource',
        TemplateURL: {
            From: 'test',
            To: 'test2'
        },
        ResourceChange: {
            Action: 'Add',
            ResourceType: 'AWS::CloudFormation::Stack'
        }
    };

    return getDetailedChanges(sinon.stub(), [change])
        .then(result => {
            t.is(getTemplate.callCount, 2);

            t.true(Array.isArray(result));
            t.is(result.length, 1);
        });
});
