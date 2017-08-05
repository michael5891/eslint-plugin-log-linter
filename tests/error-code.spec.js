"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../rules/error-code");
const RuleTester = require("../node_modules/eslint/lib/testers/rule-tester");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const errorCodePropName = "code";

ruleTester.run("error-code", rule, {
    valid: [
        {
            //error code on init
            code:   "var arg = {a:222, b:'mish', code:'error code context'}; " +
                    "console.error('text', arg);",
            options: [errorCodePropName]
        },
        {
            //error code on override
            code:   "var arg = {a:222, b:'mish'}; " +
                    "arg = {code:'error code context'};" +
                    "console.error('text', arg);",
            options: [errorCodePropName]
        },
        {
            //error code on dot notation
            code:   "var arg = {a:222, b:'mish'}; " +
                    "arg.code = 'error code context';" +
                    "console.error('text', arg);",
            options: [errorCodePropName]
        },
        {
            //multiple arguments on call expression
            code:   "var arg = {a:222, b:'mish'}; " +
                    "var arg2 = {a:222, b:'mish'}; " +
                    "arg.code = 'error code context';" +
                    "console.error('text', arg2, arg);",
            options: [errorCodePropName]
        }
    ],
    invalid: [
        {
            code: "console.error('text')",
            options: [errorCodePropName],
            errors: [{ message: `Error logs must be provided with argument caring an error code property: ${errorCodePropName}`}]
        },
        {
            code:   "var arg = {a:222, b:'mish'}; " +
                    "console.error('text', arg);",
            options: [errorCodePropName],
            errors: [{ message: `Error logs must be provided with argument caring an error code property: ${errorCodePropName}`}]
        },
        {
            code:   "var arg = {a:222, b:'mish'}; " +
                    "arg.myError = 2435;" +
                    "console.error('text', arg);",
            options: [errorCodePropName],
            errors: [{ message: `Error logs must be provided with argument caring an error code property: ${errorCodePropName}`}]
        }
    ]
});