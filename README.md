# eslint-plugin-log-linter

> ESLint JS plugin

* [Overview](#overview)
* [Usage](#usage)
* [Rules](#rules)

<a name="overview"></a>
## Overview
The eslint-plugin-log-linter is an eslint js plugin for the logs linting.

It is using the ESLint library to help validate logging standards.

<a name="usage"></a>
## Usage without shareable config

1. Install `eslint` as a dev-dependency:

    ```shell
    npm install --save-dev eslint
    ```

2. Install `eslint-plugin-log-linter`:

    If ESLint is installed globally, 
    then make sure eslint-plugin-log-linter is also installed globally. 
    A globally-installed ESLint cannot find a locally-installed plugin.     

    ```shell
     npm install eslint-plugin-log-linter -global
    ```

    If ESLint is installed locally, then make sure eslint-plugin-log-linter is also installed locally.

    ```shell
     npm install eslint-plugin-log-linter -save-dev
    ```

3. Enable the plugin by adding it to your `.eslintrc`:

    ```yaml
    plugins:
      - log-linter
    ```
4. You can also configure these rules in your `.eslintrc`. All rules defined in this plugin have to be prefixed by 'log-linter/'

    ```yaml
    plugins:
      - log-linter
    rules:
      - log-linter/error-code: 'myCode'
    ```

----

<a name="rules"></a>
## Rules

* [error-code](docs/error-code.md) - provide error logs with argument holding an error code.