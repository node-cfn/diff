'use strict';

const getChangedParameters = require('./get-changed-parameters');
const getChangedConditions = require('./get-changed-conditions');
const getChangedOutputs = require('./get-changed-outputs');
const getChangedResources = require('./get-changed-resources');

module.exports = function getChanges(changeSet, stack) {
  if (changeSet.Status === 'FAILED') {
    if (changeSet.StatusReason.match(/The submitted information didn't contain changes/)) {
      return [];
    }

    throw new Error(`createChangeSet FAILED: ${changeSet.StatusReason}`);
  }

  if (changeSet.Status === 'CREATE_COMPLETE') {
    const parameters = getChangedParameters(changeSet, stack);
    const conditions = getChangedConditions(changeSet, stack);
    const resources = getChangedResources(changeSet, stack, parameters);
    const outputs = getChangedOutputs(changeSet, stack);

    return [
      ...Object.values(parameters),
      ...Object.values(conditions),
      ...Object.values(resources),
      ...Object.values(outputs)
    ];
  }

  throw new Error(`Expected changeSet.Status to be CREATE_COMPLETE but got ${changeSet.Status}`);
};