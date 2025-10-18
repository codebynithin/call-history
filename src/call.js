#!/usr/bin/env node
const version = require('../package.json').version;
const program = require('commander');

program
  .version(version)
  .command('filter', 'filter the call history')
  .command('version', 'to get the version details')
  .command('help', 'to generate help notes')
  .option('-v, --version', 'to get the version details')
  .option('-h, --help', 'to generate help notes')
  .parse(process.argv);

/* const initNpm = async () => {
  const args = process.argv.slice(2);
  const [type, ...values] = args;

  if (!type) {
    console.error('Argument missing...');
    console.error("Try 'call help'");
    process.exit(1);
    return;
  }

  if (type === 'help' || type === '--help' || type === '-h') {
    displayHelp();
  } else if (type === 'version' || type === '--version' || type === '-v') {
    displayVersion();
    } else if (type === 'filter') {
    applyFilter(values);
  }
};

const displayHelp = () => {
  console.log('Usage: call [filter] -[from] -[to] -[task]');
  console.log('Usage: call [--version] | [--help]');
  console.log(`Below are common Call History commands utilized in various scenarios:\n
Format call history to time entry:
  filter\t: Select and group each person's call history. For example "call filter -task <task id> -from <start_date> -to <end_date>"`);
};

const displayVersion = () => {
  const path = require('path');
  const packageJson = require(path.resolve(__dirname, './package.json'));
  const packageVersion = packageJson.version;

  console.log('Package version:', packageVersion);
};

const applyFilter = (values) => {
  const { filterCalls, removeEmpty } = require('./call-filter');

  if (values?.length) {
    values[0] = ` ${values[0]}`;
  }

  const filteredValues = removeEmpty(values.join(' '))
    .split(' -')
    .filter((item) => item);

  filterCalls(filteredValues);
};

if (program.version || program.help) {
  initNpm();
} */
