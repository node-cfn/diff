'use strict';

const getTemplate = require('./get-template');

module.exports = (s3, changes) => {
    return Promise.all(changes.map(change => {
        if (change.Type === 'Resource') {
          const { ResourceChange } = change;
          const { Action, ResourceType } = ResourceChange;

          if (ResourceType === 'AWS::CloudFormation::Stack' && (Action === 'Modify' || Action === 'Add')) {
            const { From, To } = change.TemplateURL;

            return Promise.all([From, To].map(url => {
              return url ? getTemplate(s3, url) : {};
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