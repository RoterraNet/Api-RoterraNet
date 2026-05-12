var cron = require('node-cron');
const {
	get_birthdays,
	post_birthdays,
	get_start_dates,
	post_anniversaries,
} = require('../02.1_Complicated_Route_Functions/birthday_cron');

module.exports = () => {
	// At 06:00 on every day runs once

	// '0 6 * * *',

	cron.schedule(
		'0 7 * * 1-5',
		async () => {
			console.log('cron running');

			const birthdays = await get_birthdays();
			if (Object.keys(birthdays).length) {
				await post_birthdays(birthdays);
			}

			const startDates = await get_start_dates();
			if (Object.keys(startDates).length) {
				await post_anniversaries(startDates);
			}
			console.log('cron done');
			console.log('Birthdays', birthdays);
			console.log('startDates', startDates);
		},

		{
			timezone: 'America/Edmonton',
		}
	);
};
