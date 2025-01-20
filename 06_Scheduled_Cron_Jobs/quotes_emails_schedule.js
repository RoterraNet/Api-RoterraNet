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

	cron.schedule('* 7 * * 1-5', async () => {
		// await manager_daily_mail();

		try {
			await estimator_daily_mail();
			await engineer_daily_mail();
			await estimator_daily_followUp_email();
		} catch (error) {
			console.log('error', error);
		}
	});
	// At 07:00 on every Friday.
	// cron.schedule('0 7 * * 5', async () => {
	// 	// await senior_manager_weekly_mail();
	// });
};
