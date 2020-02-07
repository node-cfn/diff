'use strict';

const aws = require('aws-sdk');
const hash = require('object-hash');

const createChangeSet = require('./create-change-set');
const getChanges = require('./get-changes');
const getDetailedChanges = require('./get-detailed-changes');
const getStack = require('./get-stack');

module.exports = async function diff(opts = {}) {
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
  const s3 = new aws.S3(credentials);

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

  const [changeSet, stack] = await Promise.all([
    createChangeSet(cf, changeSetName, params),
    getStack(cf, stackName)
  ]);

  const basicChanges = getChanges(changeSet, stack);

  const changes = detailed
    ? await getDetailedChanges(s3, cf, basicChanges)
    : basicChanges;

  return { changeSetName, changeSetId: changeSet.ChangeSetId, changes };
};