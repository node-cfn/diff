'use strict';

const aws = require('aws-sdk');
const hash = require('object-hash');

const createChangeSet = require('./create-change-set');
const getChanges = require('./get-changes');
const getStack = require('./get-stack');
const getTemplate = require('./get-template');

module.exports = function diff(opts = {}) {
  const {
    credentials,
    stackName,
    template,
    description,
    prefix,
    roleArn,
    parameters,
    capabilities,
    detailed = false
  } = opts;

  const cf = new aws.CloudFormation(credentials);
  
  const templateBody = JSON.stringify(template);
  
  if (templateBody.indexOf('Fn::Import') !== -1) {
    throw new Error('Sorry, Fn::Import support is not implemented!');
  }

  const changeSetName = `${prefix}${hash({ templateBody, parameters })}`;

  const params = {
    StackName: stackName,
    ChangeSetName: changeSetName,
    Capabilities: capabilities,
    Description: description,
    RoleARN: roleArn,
    TemplateBody: templateBody
  };

  if (parameters) {
    params.Parameters = parameters;
  }

  return Promise.all([
    createChangeSet(cf, changeSetName, params),
    getStack(cf, stackName)
  ])
    .then(([changeSet, stack]) => {
      return getChanges(changeSet, stack);
    })
    .then(changes => {
      if (detailed) {
        const s3 = new aws.S3(credentials);

        return Promise.all(changes.map(change => {
          if (change.Type !== 'Resource') {
            return change;
          }

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
        }));
      }

      return changes;
    })
    .then(changes => {
      return { changeSetName, changes };
    });
};