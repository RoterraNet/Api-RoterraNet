var cron = require('node-cron');
var quote_summary_emails = require('../04_Emails/quotes_emails/quote_summary_email/quote_summary_fn');
const {
	senior_manager_weekly_mail,
	manager_daily_mail,
	estimator_daily_mail,
	engineer_daily_mail,
	estimator_daily_followUp_email,
} = quote_summary_emails;

module.exports = () => {
	// At 07:00 on every day-of-week from Monday through Friday.
	// cron.schedule('0,15,30,59 1-59 0-23 * * *', async () => {

	cron.schedule(
		'0 7 * * 1-5',
		async () => {
			console.log('daily mail cron running');

			const jobs = [
				estimator_daily_mail(),
				engineer_daily_mail(),
				estimator_daily_followUp_email(),
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
