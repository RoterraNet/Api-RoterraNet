const knex = require('../../../01_Database/connection');
const { format, parseISO } = require('date-fns');
const database = require('../../../01_Database/database');
const getQuotesDB = database.getQuotesDB;
const getUsersDB = database.getUsersDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;
const {
	createQuoteSummaryEmailEngineers,
	createQuoteSummaryEmailEstimators,
} = require('./quote_summary_template');
const { sendMail } = require('../../00_mailer');
const { todayDate } = require('../../../03_Utils/formatDates');

// FUNCTION => EMAIL
const makeEmailObject = (emailBody, contact_email, email_subject) => {
	const emailObject = {
		from: 'intranet@roterra.com',
		to: contact_email || `it@roterra.com`,
		subject: email_subject,
		html: emailBody, // html body
	};
	return emailObject;
};

// ESTIMATOR DAILY EMAIL => ASSIGNED OPEN QUOTES
exports.estimator_daily_mail = async () => {
	const estimators_ids_with_open_quotes = await knex(getQuotesDB)
		.distinct('assigned_to_id')
		.where('status', '=', 0)
		.andWhere('final_completed_by_id', '=', 0)
		.andWhere('assigned_to_user_status', '=', 0);

	for (let i = 0; i < estimators_ids_with_open_quotes.length; i++) {
		const estimator_id = estimators_ids_with_open_quotes[i].assigned_to_id;
		const estimators_work_email = await knex(getUsersDB)
			.select('work_email', 'preferred_name')
			.where('user_id', '=', estimator_id);
		const estimators_open_quotes = await knex(getQuotesDB)
			.select('*')
			.whereIn('quote_status_description', [
				'Awaiting Eng',
				'Awaiting Approval',
				'Awaiting Quote',
				'Completion Information',
			])
			.andWhere('assigned_to_id', '=', estimator_id)
			.orderBy('due_date', 'asc');

		sendMail(
			makeEmailObject(
				createQuoteSummaryEmailEstimators({
					data: estimators_open_quotes,
					name: estimators_work_email[0].preferred_name,
				}),
				estimators_work_email[0].work_email,
				'Assigned Open Quotes'
			)
		);
	}
};

exports.estimator_daily_followUp_email = async () => {
	const estimators_ids_with_follow_ups = await knex(getQuotesDB)
		.distinct('assigned_to_id')
		.where('status', '=', 5)
		.andWhere('follow_up', '=', true)
		.andWhere('assigned_to_user_status', '=', 0);

	for (let i = 0; i < estimators_ids_with_follow_ups.length; i++) {
		const estimator_id = estimators_ids_with_follow_ups[i].assigned_to_id;
		const estimators_work_email = await knex(getUsersDB)
			.select('work_email', 'preferred_name')
			.where('user_id', '=', estimator_id);

		const estimators_follow_ups = await knex(getQuotesDB)
			.select('*')
			.andWhere('deleted', '=', 0)
			.andWhere('follow_up', '=', true)
			.andWhere('status', '=', 5)
			.andWhere('follow_up_on', '=', new Date())
			.andWhere('assigned_to_id', '=', estimator_id);

		const sentMail = sendMail(
			makeEmailObject(
				createQuoteSummaryEmailEstimators({
					data: estimators_follow_ups,
					name: estimators_work_email[0].preferred_name,
				}),
				estimators_work_email[0].work_email,
				'Todays Quote Follow Ups'
			)
		);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ENGINEER DAILY EMAIL => ASSIGNED OPEN QUOTES
exports.engineer_daily_mail = async () => {
	const engineers_ids_with_open_quotes = await knex(getQuotesDB)
		.distinct('eng_contact_id')
		.where('eng_required', '=', true)
		.andWhere('eng_completed_by_id', '=', 0)
		.andWhere('eng_user_status', '=', 0);

	arrayOfMailObjects = [];
	for (let i = 0; i < engineers_ids_with_open_quotes.length; i++) {
		const engineers_id = engineers_ids_with_open_quotes[i].eng_contact_id;

		const engineers_work_email = await knex(getUsersDB)
			.select('work_email', 'preferred_name')
			.where({ user_id: engineers_id });
		// const engineers_open_quotes = await knex(getQuotesDB).select('*').where('eng_required', '=', true).andWhere('eng_completed_by_id', '=', 0);
		const engineers_open_quotes = await knex(getQuotesDB)
			.select('*')
			.where({ quote_status_description: 'Awaiting Eng' })
			.andWhere({ eng_contact_id: engineers_id });

		sendMail(
			makeEmailObject(
				createQuoteSummaryEmailEngineers({
					data: engineers_open_quotes,
					name: engineers_work_email[0].preferred_name,
				}),
				engineers_work_email[0].work_email,
				'Engineering Open Quotes'
			)
		);
	}
};
