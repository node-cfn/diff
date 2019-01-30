'use strict';

const test = require('ava');
const proxyquire = require('proxyquire');
const sinon = require('sinon');

test('works with JSON', t => {
    const s3Uri = sinon.stub().returns( {
        bucket: 'test-bucket',
        key: 'test-key'
    });
    const promise = sinon.stub().resolves({
        Body: Buffer.from('{"test":true}')
    });
    const getObject = sinon.stub().returns({ promise });
    const s3 = {
        getObject
    };

    const uri = 'https://s3.amazonaws.com/test-bucket/test-prefix/test-key.test-ext';

    const getTemplate = proxyquire('../get-template', {
        'amazon-s3-uri': s3Uri
    });

    return getTemplate(s3, uri)
        .then(res => {
            t.is(getObject.callCount, 1);
            t.is(s3Uri.callCount, 1);
            
            t.deepEqual(s3Uri.firstCall.args[0], uri);
            t.deepEqual(getObject.firstCall.args[0].Bucket, 'test-bucket');
            t.deepEqual(getObject.firstCall.args[0].Key, 'test-key');
            t.deepEqual(res, { test: true });
        });
});

test('works with YAML', t => {
    const s3Uri = sinon.stub().returns( {
        bucket: 'test-bucket',
        key: 'test-key'
    });
    const promise = sinon.stub().resolves({
        Body: Buffer.from('test: true')
    });
    const getObject = sinon.stub().returns({ promise });
    const s3 = {
        getObject
    };

    const uri = 'https://s3.amazonaws.com/test-bucket/test-prefix/test-key.test-ext';

    const getTemplate = proxyquire('../get-template', {
        'amazon-s3-uri': s3Uri
    });

    return getTemplate(s3, uri)
        .then(res => {
            t.is(getObject.callCount, 1);
            t.is(s3Uri.callCount, 1);
            
            t.deepEqual(s3Uri.firstCall.args[0], uri);
            t.deepEqual(getObject.firstCall.args[0].Bucket, 'test-bucket');
            t.deepEqual(getObject.firstCall.args[0].Key, 'test-key');
            t.deepEqual(res, { test: true });
        });
});

test('throws on malformed stuff', t => {
    const s3Uri = sinon.stub().returns( {
        bucket: 'test-bucket',
        key: 'test-key'
    });
    const promise = sinon.stub().resolves({
        Body: Buffer.from('{not:json')
    });
    const getObject = sinon.stub().returns({ promise });
    const s3 = {
        getObject
    };

    const uri = 'https://s3.amazonaws.com/test-bucket/test-prefix/test-key.test-ext';

    const getTemplate = proxyquire('../get-template', {
        'amazon-s3-uri': s3Uri
    });

    return getTemplate(s3, uri)
        .then(() => {
            t.fail('should not reach here;');
        })
        .catch(e => {
            t.is(e.message, 'Unable to parse TemplateBody');
        });
});