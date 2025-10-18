#!/usr/bin/env node

console.log('Usage: call [filter] -[from] -[to] -[task]');
console.log('Usage: call [version] | [help]');
console.log(`
Below are common Call History commands utilized in various scenarios:

Format call history to time entry:
  filter\t: Select and group each person's call history.
  \t\t  Example: "call filter -t <task id> -from <start_date> -to <end_date>"

Options:
  -t, --task <id>\tTask ID to associate with the calls
  -from <date>\t\tStart date for filtering (format: YYYY-MM-DD)
  -to <date>\t\tEnd date for filtering (format: YYYY-MM-DD)
  -v, --version\t\tDisplay version information
  -h, --help\t\tDisplay this help message
`);
