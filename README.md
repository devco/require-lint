# require-lint

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![CI](https://github.com/devco/require-lint/actions/workflows/ci.yml/badge.svg)](https://github.com/devco/require-lint/actions/workflows/ci.yml)

Parses your code for `require` statements, and checks that:

- all required dependencies are mentioned in `package.json`
- all dependencies in `package.json` are still being used

```bash
$ npm install -g require-lint
$ require-lint

[require-lint] Missing dependencies: attempt, express
[require-lint] Extraneous dependencies: lodash
```

Any failed checks will trigger an exit code of `1`, and you can choose to fail your build chain.

_Note:_ require-lint doesn't check devDependencies, since test code doesn't typically have a single entry point

## Default behaviour

By default, it looks for a `package.json` in the current folder.

```bash
require-lint
```

It then parses your source from the entry points declared as `main` and `bin`:

```json
{
  "main": "./lib/index.js",
  "bin": {
    "foo": "./bin/foo.js",
    "bar": "./bin/bar.js"
  }
}
```

## Options

You can also specify the following options

- `--pkg`

The path to your `package.json`.

```bash
require-lint --pkg ~/dev/thing/package.json
```

- `--src`

The path to additional entry points.
These must be relative to the given `package.json`.
Globs can be used as paths.

```bash
require-lint --src lib/server.js --src lib/worker.js
```

- `--require`

Any file to be required before processing, for example to load extra compilers like [Coffee-Script](http://coffeescript.org/).
These must be absolute paths or available modules.

```bash
require-lint --require coffeescript/register
```

- `--ignore-missing`

Modules that should not be considered missing, even if they are not declared in `package.json`. This is not recommended!

```bash
require-lint --ignore-missing newrelic
```

- `--ignore-extra`

Modules that should not be considered extraneous, even if they are not `required`. For example you might have a dependency on `coffeescript`, but not explicitly `require` it.

```bash
require-lint --ignore-extra coffeescript
```

If you would like to use `--ignore-extra` with multiple dependencies, you can separate them using commas:

```bash
require-lint --ignore-extra coffeescript,bootstrap,ejs
```

## Static configuration

All options above can also be saved in a `.requirelintrc` file at the root of your project. For example:

```text
require=coffeescript/register
ignore-missing=newrelic
```

This makes it easier to check-in your configuration to source-control, although you could equally save your options in `package.json`, for example:

```json
{
  "scripts": {
    "lint": "require-lint --require=coffeescript/register"
  }
}
```

_Note:_ the `.requirelintrc` file can be located at any path supported by the [rc](https://www.npmjs.com/package/rc) package, such as `~/.requirelintrc` or `/etc/requirelintrc`.

## Dev notes

```bash
npm install
npm test
```

## Other projects

_Note:_ inspired by [dependency-check](https://github.com/maxogden/dependency-check). This implementation relies on `Module._compile` to add support Coffee-Script.
