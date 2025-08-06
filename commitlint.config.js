module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new features
        'fix', // fix bug
        'docs', // update documentation
        'style', // code style changes (non-functional)
        'refactor', // refactoring
        'test', // adding or updating tests
        'chore', // changes to build process or auxiliary tools
        'perf', // performance improvements
        'ci', // CI configuration
        'build', // changes to build system or external dependencies
        'revert', // revert
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
}
