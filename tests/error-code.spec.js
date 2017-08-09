"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../rules/error-code");
const RuleTester = require("../node_modules/eslint/lib/testers/rule-tester");

var fs = require('fs');

require.extensions['.txt'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};

var validCode = require("./validCode.txt");
var invalidCode = require("./invalidCode.txt");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();

const errorCodePropName = "code";

const errorMessage = { message: `Error logs must be provided with argument caring an error code property: ${errorCodePropName}`};

ruleTester.run("error-code", rule, {
    valid: [
        {
            code: validCode,
            options: [errorCodePropName],
            parserOptions: {
                ecmaVersion: 6
            }
        }
    ],
    invalid: [
        {
            code: invalidCode,
            options: [errorCodePropName],
            parserOptions: {
                ecmaVersion: 6
            },
            //error message for each invalid test... ugly I know...
            errors: [errorMessage, errorMessage, errorMessage, errorMessage, errorMessage, errorMessage, errorMessage]
        },
    ]
});