'use strict';

const s3Uri = require('amazon-s3-uri');
const YAML = require('js-yaml');

module.exports = (s3, url) => {
    const { bucket, key } = s3Uri(url);
    
    return s3.getObject({
        Bucket: bucket,
        Key: key
    })
    .promise()
    .then(res => {
        const body = res.Body.toString('utf8');

        try {
            return JSON.parse(body);
        } catch (jsonErr) {
            try {
                return YAML.safeLoad(body);
            } catch (yamlErr) {
                throw new Error('Unable to parse TemplateBody');
            }
        }
    });
};