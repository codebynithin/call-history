#!/usr/bin/env node
const version = require('../package.json').version;
const program = require('commander');
const { execSync } = require('child_process');

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  execSync('node ' + __dirname + '/call-help.js', { stdio: 'inherit' });
  process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  execSync('node ' + __dirname + '/call-version.js', { stdio: 'inherit' });
  process.exit(0);
}

program
  .version(version)
  .command('filter', 'filter the call history')
  .command('version', 'to get the version details')
  .command('help', 'to generate help notes')
  .parse(process.argv);
