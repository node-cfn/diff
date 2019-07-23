'use strict';

const getTemplate = require('./get-template');
const validateTemplate = require('./validate-template');

function shouldGetTemplate(ResourceType, Action, change) {
  return ResourceType === 'AWS::CloudFormation::Stack'
    && (Action === 'Modify' || Action === 'Add')
    && change.TemplateURL;
}

module.exports = (s3, cf, changes) => {
    return Promise.all(changes.map(change => {
        if (change.Type === 'Resource') {
          const { ResourceChange } = change;
          const { Action, LogicalResourceId, ResourceType } = ResourceChange;

          if (shouldGetTemplate(ResourceType, Action, change)) {
            const { From, To } = change.TemplateURL;

            return Promise.all([From, To].map(url => {
              if (url) {
                return validateTemplate(cf, url)
                  .catch(err => {
                    throw new Error(`Nested Stack template for ${LogicalResourceId} is invalid: ${err.message}`);
                  })
                  .then(() => {
                    return getTemplate(s3, url);
                  });
              }
              return {};
            }))
            .then(([from, to]) => {
              ResourceChange.Template = {
                From: from,
                To: to
              };

              return change;
            });
          }
        }

        return change;
      }));
};