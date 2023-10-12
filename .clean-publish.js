module.exports = {
  packageManager: 'npm',
  access: 'restricted',
  files: [
    '.nyc_output',
    'coverage',
    '.gitignore',
    '.mocharc.json',
    '.nvmrc',
    '.nycrc',
    'tmp*'
  ],
  fields: ['standard']
}
