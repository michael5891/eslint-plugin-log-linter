"use strict";

/**
 * Require error logs to be provided with argument caring an error code property.
 *
 * Check esprima ECMAScript parser, has an online code parsing representation.
 * http://esprima.org/demo/parse.html
 *
 * ### Options
 *
 * - The argument error code property name. (Default: 'errorCode')
 *
 * @author: Michael Yakubov
 */

module.exports = {
    meta: {
        //options input validation schema
        schema: [ {
                type: "string",
                additionalProperties: false
            }]
    },
    create: function(context) {
        let globalScope;
        let errorCodeProperty = context.options[0] || 'errorCode';

        /**
         * Traverse input properties for the defined errorCodeProperty name.
         * @param {object} source
         * @returns {boolean}
         */
        function checkPropertiesForErrorCode(source) {
            let retVal = false;
            if(source && source.type !== 'CallExpression') {
                for(let propIdx = 0; propIdx < source.properties.length; propIdx++) {
                    let prop = source.properties[propIdx];
                    if(prop.key.name === errorCodeProperty) {
                        retVal = true;
                        break;
                    }
                }
            }
            return retVal;
        }

        /**
         * Variable init declaration.
         * @example
         *  var arg = {propA: 123};
         * @param {escope.Variable} variable - variable reference
         * @returns {boolean} whether the given node is considered a directive in its current position
         */
        function checkInitDefinitionForErrorCode(variable) {
            let retVal = false;
            for(let defIdx = 0; defIdx < variable.defs.length; defIdx++) {
                let def = variable.defs[defIdx];
                retVal = checkPropertiesForErrorCode(def.node.init);
                if(retVal) {
                    break;
                }
            }
            return retVal;
        }

        /**
         * Variable dot notation expression.
         * @example
         *  arg.errorCode = 123;
         * @param {ASTNode} identifier
         * @returns {boolean}
         */
        function checkDotExtentionForErrorCode(identifier) {
            let src = context.getSourceCode(identifier);
            let node = src.getNodeByRangeIndex(identifier.end);
            return (node.type === 'MemberExpression' && node.property.name === errorCodeProperty);
        }

        function getScopeVariables(scope) {
            let retVal = [];

            switch(scope.type) {
                case 'CatchClause':
                case 'FunctionExpression':
                case 'FunctionDeclaration':
                case 'ArrowFunctionExpression': {
                    retVal = context.getDeclaredVariables(scope);
                    break;
                }
                case 'BlockStatement':{
                    for(let idx=0; idx < scope.body.length; idx++) {
                        let vars = context.getDeclaredVariables(scope.body[idx]);
                        retVal = retVal.concat(vars);
                    }
                    break;
                }
                case 'Program':{
                    retVal = globalScope.variables;
                    break;
                }
            }

            return retVal;
        }

        /**
         * Scan code for identifier references
         * @param context
         * @param {ASTNode} identifier
         * @returns {boolean}
         */
        function checkIdentifierInScopeForErrorCode(identifier, scope) {
            var retVal = null;
            var scopeVariables = getScopeVariables(scope);
            if(scopeVariables && scopeVariables.length > 0) {
                for(var idx=0; idx < scopeVariables.length; idx++) {
                    var variable = scopeVariables[idx];
                    if(variable && variable.name === identifier.name && variable.references) {
                        retVal = checkVariableForErrorCode(variable);
                        break;
                    }
                }
            } else if(scope.type !== 'Program') {
                retVal = checkIdentifierInScopeForErrorCode(identifier, scope.parent);
            }

            return retVal;
        }

        /**
         * Scan code for variable references.
         * @param variable
         * @returns {boolean}
         */
        function checkVariableForErrorCode(variable) {
            let retVal = false;
            //browse references for errorCode definition
            for(let refIdx = 0; refIdx < variable.references.length; refIdx++) {
                let ref = variable.references[refIdx];

                if(ref.init) {
                    retVal = checkInitDefinitionForErrorCode(ref.resolved);
                } else if(ref.writeExpr && ref.writeExpr.type === 'ObjectExpression') {
                    retVal = checkPropertiesForErrorCode(ref.writeExpr);
                } else if(ref.writeExpr && ref.writeExpr.type === 'NewExpression') {
                    //do nothing, error code should be explicitly defined not as part of a class definition.
                } else if(ref.identifier && ref.identifier.parent && ref.identifier.parent.type === 'MemberExpression') { //object extended though dot notation
                    retVal = checkDotExtentionForErrorCode(ref.identifier);
                }
                if(retVal) {
                    break;
                }
            }
            return retVal;
        }

        return {
            "Program": function() {
                globalScope = context.getScope();
            },
            'CallExpression:exit':function (node) {
                //interrupt on *.error() call expression
                if(node.callee && node.callee.property && node.callee.property.name === 'error') {
                    let valid = false;
                    for(let arg of node.arguments) {
                        if(arg.type === 'Identifier') {
                            if(checkIdentifierInScopeForErrorCode(arg, arg.parent)) {
                                valid = true;
                                break;
                            }
                        }
                    }
                    if(!valid) {
                        context.report(node, `Error logs must be provided with argument caring an error code property: ${errorCodeProperty}`);
                    }
                }
            }
        };
    }
};