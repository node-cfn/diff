'use strict';

const graph = require('@cfn/graph');

// Nested Stack changes with a Modify Action need to be evaluated separately,
// because CloudFormation always returns Changes for them, even when there aren't any
module.exports = (changeSet, stack, parameters) => {
    const template = changeSet.ProcessedTemplate;
    const existingResources = stack.ProcessedTemplate.Resources;

    const { resourceChanges, stackModifyChanges } = changeSet.Changes.reduce((memo, change) => {
        if (change.Type === 'Resource') {
            const { ResourceChange } = change;
            const { ResourceType, LogicalResourceId } = ResourceChange;

            if (ResourceChange.Action === 'Modify' && ResourceType === 'AWS::CloudFormation::Stack') {
                memo.stackModifyChanges[LogicalResourceId] = change;
            } else {
                if (LogicalResourceId in memo.resourceChanges) {
                    throw new Error(`Sorry, changing the type of an existing resource (${LogicalResourceId}) is not implemented yet`);
                }

                memo.resourceChanges[LogicalResourceId] = change;
            }
        } else {
            throw new Error(`Unexpected Change Type: ${change.Type}`);
        }

        return memo;
    }, { resourceChanges: {}, stackModifyChanges: {} });

    // A resource changed if any reference changed: order matters!
    graph({ template }).reverse().forEach(({ logicalId, resource, references }) => {
        const existingResource = existingResources[logicalId];
        const change = resourceChanges[logicalId] || stackModifyChanges[logicalId];

        if (change) {
            const { ResourceChange } = change;
            const { Action } = ResourceChange;

            ResourceChange.ResourceKey = logicalId;
            ResourceChange.From = existingResource;
            ResourceChange.To = resource;

            change.References = references.reduce((memo, reference) => {
                if (reference in resourceChanges) {
                    memo.push({ Resource: reference })
                } else if (reference in parameters) {
                    memo.push({ Parameter: reference });
                }

                return memo;
            }, []);
            
            if (resource.Type === 'AWS::CloudFormation::Stack') {
                const newTemplateURL = resource.Properties.TemplateURL;

                if (Action === 'Add') {
                    change.TemplateURL = {
                        To: newTemplateURL
                    };
                } else if (Action === 'Modify') {
                    if (existingResource && existingResource.Type === 'AWS::CloudFormation::Stack') {
                        const oldTemplateURL = existingResource.Properties.TemplateURL

                        if (oldTemplateURL !== newTemplateURL) {
                            change.TemplateURL = {
                                To: newTemplateURL,
                                From: oldTemplateURL
                            };
                        }
                    } else {
                        change.TemplateURL = {
                            To: newTemplateURL
                        };
                    }
                }

                const modifications = ResourceChange.Details.filter(d => d.Evaluation !== 'Dynamic');

                if (change.References.length > 0 || change.TemplateURL || modifications.length > 0) {
                    resourceChanges[logicalId] = change;
                }
            }
        }
    });

    return resourceChanges;
};