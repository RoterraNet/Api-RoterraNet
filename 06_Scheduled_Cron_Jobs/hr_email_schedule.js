const cron = require('node-cron');

const {
	get_probation_period_60_days,
	get_probation_period_83_days,
	benefitsEligibilityReminder,
	performanceReviewReminder,
} = require('../02.1_Complicated_Route_Functions/hr_cron');

module.exports = () => {
	// At 06:00 on every day runs once

	// '0 6 * * *' runs every monday - friday 6 am

	// '*/10 * * * * *' runs everyt 10 secs
	cron.schedule('0 6 * * *', async () => {
		await get_probation_period_60_days();
		await get_probation_period_83_days();

		await benefitsEligibilityReminder();
		await performanceReviewReminder();
	});
};
