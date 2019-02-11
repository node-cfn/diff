'use strict';

const deepEqual = require('deep-equal');

const getAction = require('./get-action');

module.exports = function getChangedOutputs(changeSet, stack) {
    const currentOutputs = changeSet.ProcessedTemplate.Outputs || {};
    const previousOutputs = stack.ProcessedTemplate.Outputs || {};

    const outputs = new Set([
        ...Object.keys(currentOutputs),
        ...Object.keys(previousOutputs)
    ]);

    return Array.from(outputs).reduce((memo, name) => {
        const current = currentOutputs[name];
        const previous = previousOutputs[name];

        if (!deepEqual(current, previous)) {
            memo[name] = {
                Type: 'Output',
                OutputChange: {
                    OutputKey: name,
                    Action: getAction(previous, current),
                    To: current,
                    From: previous
                },
            };
        }

        return memo;
    }, {});
};