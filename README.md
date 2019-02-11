# @cfn/diff

The purpose of this library is to make it easy to get an explanation of the difference between a CloudFormation Template and a Stack (if one exists) - similar to `terraform plan`.

## Usage

```js
const diff = require('@cfn/diff');

const { changeSetName, changes } = diff({
    // for aws-sdk calls
    credentials,
    // used for creating the CloudFormation Stack and ChangeSet
    stackName,
    description,
    roleArn,
    parameters,
    capabilities,
    template, // the actual (parsed) template, not the string templateBody!
    prefix, // a prefix added to the change set name
    detailed = false // will fetch S3 contents for nested stacks to include detailed differences
});
```

This is basically just a wrapper around CloudFormation ChangeSets with some additional logic for including Changes for Outputs, Parameters, Conditions as well as handling nested stacks. CloudFormation ChangeSets _do not_ handle nested stacks correctly. They always return changes even when there are none. This library works around it by building a graph of the elements (resources, conditions, etc.) in a stack and trying to omit these false positives if there were no changes to a resource or any of its dependencies.