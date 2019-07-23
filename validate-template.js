'use strict';

module.exports = (cf, url) => {
    return cf.validateTemplate({
        TemplateURL: url,
    })
    .promise();
};