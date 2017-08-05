# error-code

All error logs should carry an error code,
this rule would help you guide the developer to add the required argument with
error code property to the log arguments.

## Examples

The following patterns are considered problems;

    /*eslint log-linter/error-code: 'myCode'*/

    // invalid
    console.error("Power over whelming");//no arguments

    // invalid
    var arg1 = {obj:"with nothing interesting"};
    var arg2 = {obj:"with nothing interesting"};
    console.error("In taro adun", arg1, arg2);//arguments with no error code

The following patterns are **not** considered problems;

    /*eslint log-linter/error-code: 'myCode'*/

    // valid
   var arg = {obj:"stay a while and listen", myCode: "crazy grandpa"};
   console.error("In taro adun", arg);

    // valid
    var arg = {obj:"stay a while and listen"};
    arg.myCode = "crazy grandpa";
    console.error("Need a light?", arg);

## Version

This rule was introduced in eslint-plugin-log-linter 0.0.1

## Links

* [Rule source](../rules/error-code.js)