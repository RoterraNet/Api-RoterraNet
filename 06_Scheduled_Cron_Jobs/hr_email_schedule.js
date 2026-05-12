const cron = require('node-cron');

const {
	get_probation_period_60_days,
	get_probation_period_83_days,
	benefitsEligibilityReminder,
	performanceReviewReminder,
	addHrTodos,
} = require('../02.1_Complicated_Route_Functions/hr_cron');

module.exports = () => {
	cron.schedule(
		'0 7 * * 1-5',
		async () => {
			console.log('HR cron running');

			const jobs = [
				get_probation_period_60_days(),
				get_probation_period_83_days(),
				benefitsEligibilityReminder(),
				addHrTodos(),
				performanceReviewReminder(),
			];

			const results = await Promise.allSettled(jobs);

			results.forEach((r, i) => {
				if (r.status === 'rejected') {
					console.error(`Job ${i} failed:`, r.reason);
				}
			});
		},
		{
			timezone: 'America/Edmonton',
		}
	);
};
