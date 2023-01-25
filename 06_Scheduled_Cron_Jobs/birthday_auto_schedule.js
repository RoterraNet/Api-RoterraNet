var { cron } = require('node-cron');
const {
	get_birthdays,
	post_birthdays,
	get_start_dates,
	post_anniversaries,
} = require('../02.1_Complicated_Route_Functions/birthday_cron');

module.exports = () => {
	// At 06:00 on every day runs once
	cron.schedule('0 6 * * *', async () => {
		await get_birthdays().then((res) =>
			Object.keys(res).length === 0 ? null : post_birthdays(res)
		);
		await get_start_dates().then((res) =>
			Object.keys(res).length === 0 ? null : post_anniversaries(res)
		);
	});
};
