#!/usr/bin/env node

const path = require('path')
const rc = require('rc')
const index = require('../lib/index')

function list (arg) {
  if (Array.isArray(arg)) return arg
  else if (typeof arg === 'string') return arg.split(',')
  else return []
}

const args = rc('requirelint')

try {
  const report = index.lint({
    pkg: path.resolve(args.pkg || 'package.json'),
    requires: list(args.require),
    sources: list(args.src),
    ignoreMissing: list(args['ignore-missing']),
    ignoreExtra: list(args['ignore-extra'])
  })

  if (report.missing.length > 0) {
    console.error('[require-lint] Missing dependencies:', report.missing.join(', '))
  }

  if (report.extra.length > 0) {
    console.error('[require-lint] Extraneous dependencies:', report.extra.join(', '))
  }

  if (report.missing.length + report.extra.length > 0) {
    process.exit(1)
  } else {
    console.log('[require-lint] OK')
  }
} catch (ex) {
  console.error(ex.stack)
  process.exit(1)
}
