'use strict';

const deepEqual = require('deep-equal');

const getAction = require('./get-action');

module.exports = function getChangedConditions(changeSet, stack) {
    const currentConditions = changeSet.ProcessedTemplate.Conditions || {};
    const previousConditions = stack.ProcessedTemplate.Conditions || {};

    const outputs = new Set([
        ...Object.keys(currentConditions),
        ...Object.keys(previousConditions)
    ]);

    return Array.from(outputs).reduce((memo, name) => {
        const current = currentConditions[name];
        const previous = previousConditions[name];

        if (!deepEqual(current, previous)) {
            memo[name] = {
                Type: 'Condition',
                ConditionChange: {
                    ConditionKey: name,
                    Action: getAction(previous, current),
                    From: previous,
                    To: current
                }
            };
        }

        return memo;
    }, {});
};