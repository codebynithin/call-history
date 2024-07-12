const { format, subDays, isWithinInterval } = require('date-fns');
const { MultiSelect } = require('enquirer');
const fs = require('fs');
const os = require('os');
const path = require('path');

function roundTimeTo5(timeStr) {
  const sanitizedTime = timeStr.replace(/[^0-9\s]/g, '');
  const [minutes, seconds] = sanitizedTime.split(' ').map(Number);
  const totalSeconds = minutes * 60 + seconds;
  const roundedSeconds = 300 * Math.max(totalSeconds / 300);
  const roundedMinutes = Math.floor(roundedSeconds / 60);
  return roundedMinutes;
}

function getLastDayOfWeek(inputString) {
  const currentDate = new Date();
  let targetDate = currentDate;

  switch (inputString.toLowerCase()) {
    case 'today':
      targetDate = currentDate;
      break;
    case 'yesterday':
      targetDate = subDays(currentDate, 1);
      break;
    default:
      targetDate = currentDate;
      while (format(targetDate, 'EEEE').toLowerCase() !== inputString.toLowerCase()) {
        targetDate = subDays(targetDate, 1);
      }
  }

  return targetDate;
}

async function filterCalls(values) {
  const filter = {};
  const keyMap = { from: 'from', to: 'to' };

  if (values?.length) {
    for (const item of values) {
      let [key, ...itemValues] = item.split(' ');
      const itemValue = itemValues.join(' ');

      if (key.charAt(0) === '-') {
        key = key.substring(1);
      }

      if (keyMap[key]) {
        filter[keyMap[key]] = new Date(itemValue).toISOString().split('T')[0];
      } else {
        filter.task = itemValue;
      }
    }
  }

  const filePath = path.join(os.homedir(), 'teams-call.txt');
  let content;
  let start = false;
  let output;

  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    console.error("teams-call.txt file missing or it's empty in your desktop, please try again.");
    fs.appendFileSync('teams-call.txt', filePath, (err) => {
      if (err) {
        throw err;
      }

      console.log('String appended to file!');
    });
    process.exit(1);
  }

  content = content.replace(/\n{3,}/g, '\n\n');
  const calls = content?.split(/\n\n/g).reduce((acc, curr) => {
    if (curr.includes('Contact groups') || curr.includes('Speed dial')) {
      start = false;
    }

    if (start) {
      const daysOfWeek = [
        'Today',
        'Yesterday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let [person, direction, time, day] = curr.split(/\n/g);

      if (day && roundTimeTo5(time)) {
        person = person.split(', ').sort().join(',');

        if (day.length === 5 && day !== 'Today') {
          day = 'Today';
        }

        if (daysOfWeek.includes(day)) {
          day = format(getLastDayOfWeek(day), 'yyyy-MM-dd');
        }

        if (
          (filter.from &&
            filter.to &&
            isWithinInterval(new Date(day), {
              start: new Date(filter.from),
              end: new Date(filter.to),
            })) ||
          (!filter.from && !filter.to)
        ) {
          acc.add({ day, person, time: roundTimeTo5(time) });
        }
      }
    }

    if (curr.includes('Voicemail')) {
      start = true;
    }

    return acc;
  }, new Set());

  const choices = Array.from(calls).map((item) => ({
    name: `${item.day} - ${item.person} - ${item.time}`,
    value: item,
  }));
  const prompt = new MultiSelect({ name: 'calls', message: 'Select required calls', choices });

  try {
    const answer = await prompt.run();
    output = choices.reduce((acc, { value, name }) => {
      if (answer.includes(name)) {
        if (!acc[value.day]) {
          acc[value.day] = { [value.person]: { duration: 0, remarks: '', remarksArray: [] } };
        }

        if (!acc[value.day][value.person]) {
          acc[value.day][value.person] = { duration: 0, remarks: '', remarksArray: [] };
        }

        if (acc[value.day][value.person].remarksArray?.length) {
          acc[value.day][value.person].remarksArray.push(`${value.time}m`);
        } else {
          acc[value.day][value.person].remarksArray.push(`${value.person} ${value.time}m`);
        }

        acc[value.day][value.person].duration += +value.time;
        acc[value.day][value.person].remarks = acc[value.day][value.person].remarksArray.join(', ');
      }

      return acc;
    }, {});

    joinCalls(output, filter.task);
  } catch (error) {
    console.error(error);
  }
}

function joinCalls(entriesByDate, task) {
  let output = '';

  for (const [date, persons] of Object.entries(entriesByDate)) {
    for (const { duration, remarks } of Object.values(persons)) {
      output += `timectl add -dt ${date} -t ${task || '<task id>'} -w Internal calls -du ${duration} -r ${remarks}\n`;
    }
  }

  console.log(output);
}

function removeEmpty(obj) {
  for (let [key, val] of Object.entries(obj)) {
    if (val && typeof val === 'object') {
      removeEmpty(val);
      if (!(Object.keys(val).length || val instanceof Date)) {
        delete obj[key];
      }
    } else {
      if (typeof val === 'string') {
        val = val.trim();
      }

      if (val === null || val === undefined || val === '') {
        delete obj[key];
      } else {
        obj[key] = val;
      }
    }
  }

  return obj;
}

module.exports = { filterCalls, removeEmpty };
