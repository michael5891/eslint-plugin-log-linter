"use strict";

/**
 * Require error logs to be provided with argument caring an error code property.
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
            for(let propIdx = 0; propIdx < source.properties.length; propIdx++) {
                let prop = source.properties[propIdx];
                if(prop.key.name === errorCodeProperty) {
                    retVal = true;
                    break;
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

        /**
         * Scan code for identifier references
         * @param context
         * @param {ASTNode} identifier
         * @returns {boolean}
         */
        function errorCodeDefined(context, identifier) {
            let retVal = false;
            for(let idx = 0; idx < globalScope.variables.length; idx++) {
                const variable = globalScope.variables[idx];
                if(variable && variable.name === identifier.name && variable.references) {
                    //browse references for errorCode definition
                    for(let refIdx = 0; refIdx < variable.references.length; refIdx++) {
                        let ref = variable.references[refIdx];
                        if(ref.init) {
                            retVal = checkInitDefinitionForErrorCode(ref.resolved);
                        } else if(ref.writeExpr && ref.writeExpr.type === 'ObjectExpression') {
                            retVal = checkPropertiesForErrorCode(ref.writeExpr);
                        } else if(ref.writeExpr && ref.writeExpr.type === 'NewExpression') {
                            //do nothing, error code should be explicitly defined not as part of a class definition.
                        } else if(ref.identifier) { //object extended though dot notation
                            retVal = checkDotExtentionForErrorCode(ref.identifier);
                        }
                        if(retVal) {
                            break;
                        }
                    }
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
                if(node.callee.property.name === 'error') {
                    let valid = false;
                    let identifierNode = null;
                    for(let arg of node.arguments) {
                        if(arg.type === 'Identifier') {
                            identifierNode = arg;
                            if(errorCodeDefined(context, identifierNode)) {
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