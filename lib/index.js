const _ = require('lodash')
const path = require('path')
const Module = require('module')
const detective = require('detective')
const fg = require('fast-glob')
const modules = require('./modules')

exports.lint = function (opts) {
  // pre-load all "--require" files
  const requires = opts.requires || []
  requires.forEach(function (req) {
    require(req)
  })

  // load the package.json
  const pkg = require(opts.pkg)
  const basedir = path.dirname(opts.pkg)
  const sources = allSources(basedir, pkg, opts.sources)

  if (sources.length === 0) {
    throw new Error('No entry points found, please specify --src')
  }
  let dependencies = []

  // override of Module._compile
  // to find all call to "require"
  function _compile (str, filename) {
    let requires
    const parent = this
    try {
      requires = detective(str)
    } catch (ex) {
      ex.toString = function () {
        return filename + ':' + this.loc.line + '\n ' + ex.message
      }
      throw ex
    }
    requires.forEach(function (req) {
      if (modules.isRelative(req)) {
        Module._load(req, parent)
      } else {
        if (!modules.isCore(req)) {
          dependencies.push(modules.name(req))
        }
      }
    })
  }

  // override Module._compile temporarily
  // callback gets executed when the override is ready
  // and the override gets removed when the callback is finished
  override(Module.prototype, '_compile', _compile, function () {
    sources.forEach(function (sourcePath) {
      try {
        require(sourcePath)
      } catch (ex) {
        throw new Error(ex)
      }
    })
  })

  // find all differences
  const pkgDependencies = Object.keys(pkg.dependencies || {})
  dependencies = _.uniq(dependencies)
  return {
    missing: _.difference(dependencies, pkgDependencies, opts.ignoreMissing),
    extra: _.difference(pkgDependencies, dependencies, opts.ignoreExtra)
  }
}

function allSources (basedir, pkg, additional) {
  return listify(pkg.main)
    .concat(_.values(pkg.bin))
    .concat(getAdditionalSources(basedir, additional))
    .map(function (file) {
      return path.resolve(path.join(basedir, file))
    })
}

const getAdditionalSources = function (basedir, additionalSources) {
  return listify(additionalSources).reduce(function (acc, pattern) {
    const matches = fg.sync(pattern, { cwd: basedir, onlyFiles: true })
    return acc.concat(matches)
  }, [])
}

const listify = function (obj) {
  if (Array.isArray(obj)) return obj
  if (!obj) return []
  return [obj]
}

function override (object, method, override, fn) {
  const old = object[method]
  try {
    object[method] = override
    fn()
  } finally {
    object[method] = old
  }
}
