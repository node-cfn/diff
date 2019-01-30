'use strict';;

const MAX_RETRIES = 100;
const WAIT_MS = 5000;

module.exports = function createChangeSet(cf, name, params) {
    return changeSet(cf, 'UPDATE', name, params)
        .catch(e => {
            if (e.message.match(/does not exist/)) {
                return changeSet(cf, 'CREATE', name, params);
            }
            throw e;
        });
};

function wait(cf, StackName, ChangeSetName, attempt = 1, NextToken) {
  if (attempt > MAX_RETRIES) {
    throw new Error(`Too many attempts waiting for ChangeSet ${ChangeSet} to create for ${StackName}`);
  }

  return cf.describeChangeSet({
    StackName,
    ChangeSetName,
    NextToken
  })
  .promise()
  .then(res => {
    switch (res.Status) {
      case 'CREATE_PENDING':
      case 'CREATE_IN_PROGRESS':
        return new Promise(resolve => {
          setTimeout(resolve, WAIT_MS);
        })
        .then(() => {
          return wait(cf, StackName, ChangeSetName, attempt + 1, res.NextToken);
        });
      case 'CREATE_COMPLETE':
      case 'FAILED':
        return res;
      default:
        throw new Error(`ChangeSet ${ChangeSetName} in unexpected Status ${res.Status} for Stack ${StackName}`);
    }
  })
}

function changeSet(cf, ChangeSetType, ChangeSetName, params) {
    const { StackName } = params;

    return cf.createChangeSet(Object.assign({ ChangeSetName, ChangeSetType }, params))
      .promise()
      .then(() => {
        return wait(cf, StackName, ChangeSetName);
      })
      .then(changeSet => {
        return cf.getTemplate({ StackName, ChangeSetName, TemplateStage: 'Processed' })
          .promise()
          .then(res => {
            changeSet.ProcessedTemplate = JSON.parse(res.TemplateBody);
            return changeSet;
          });
      });
};