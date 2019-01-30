'use strict';

const getAction = require('./get-action');

module.exports = function getChangedParameters(changeSet, stack) {
    const currentParameters = changeSet.Parameters || {};
    const previousParameters = stack.Parameters || {};

    const previousValues = previousParameters.reduce((memo, { ParameterKey, ParameterValue }) => {
        memo[ParameterKey] = ParameterValue;
        return memo;
    }, {});

    return currentParameters.reduce((memo, { ParameterKey, ParameterValue }) => {
        const previousValue = previousValues[ParameterKey];

        if (previousValue === ParameterValue) {
            return memo;
        }

        memo[ParameterKey] = {
            Type: 'Parameter',
            ParameterChange: {
                ParameterKey,
                From: previousValue,
                To: ParameterValue
            },
        };

        return memo;
    }, {});  
};