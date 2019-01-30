'use strict';

function describeStack(cf, StackName) {
    return cf.describeStacks({ StackName })
        .promise()
        .then(res => res.Stacks[0])
        .catch(e => {
            if (e.code === 'ValidationError' && e.message.match(/does not exist/)) {
                return {};
            }
            throw e;
        });
}

function getTemplate(cf, StackName) {
    return cf.getTemplate({ StackName, TemplateStage: 'Processed' })
        .promise()
        .then(res => {
            if (res.TemplateBody) {
                return JSON.parse(res.TemplateBody);
            }
            return {};
        })
        .catch(e => {
            if (e.code === 'ValidationError' && e.message.match(/does not exist/)) {
                return {};
            }
            throw e;
        });
}

module.exports = function getStack(cf, StackName) {
    return Promise.all([
        describeStack(cf, StackName),
        getTemplate(cf, StackName)
    ])
    .then(([stack, template]) => {
        stack.ProcessedTemplate = template;
        return stack;
    });
};