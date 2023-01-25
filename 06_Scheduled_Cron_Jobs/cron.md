
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *

field value
second 0-59
minute 0-59
hour 0-23
day of month 1-31
month 1-12 (or names)
day of week 0-7 (or names, 0 or 7 are sunday)

EXAMPLES

var cron = require('node-cron');

cron.schedule('1,2,4,5 \* \* \* \*', () => {
console.log('running every minute 1, 2, 4 and 5');
});
Using ranges
You may also define a range of values:

var cron = require('node-cron');

cron.schedule('1-5 \* \* \* \*', () => {
console.log('running every minute to 1 from 5');
});
