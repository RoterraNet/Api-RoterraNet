const express = require('express');
const knex = require('../01_Database/connection');
const { getUsersDB, postNewsDB, getUsersBenefitsDB } = require('../01_Database/database');
const { sendMail } = require('../04_Emails/00_mailer');
const { hr_probation_email } = require('../04_Emails/hr_emails/hr_probation_email');
const { hr_performance_review_email } = require('../04_Emails/hr_emails/performanceReviewEMail');
const { hr_rrsp_email } = require('../04_Emails/hr_emails/rrspEmail');

const makeEmailObject = (emailBody, contact_email, email_subject) => {
	const emailObject = {
		from: 'intranet@roterra.com',
		to: contact_email || `it@roterra.com`,
		subject: email_subject,
		html: emailBody, // html body
	};
	return emailObject;
};

// checks start date and add 60 day for probation email
const get_probation_period_60_days = async () => {
	const getProbationSQL = knex.raw("start_date + INTERVAL '60 days' = current_date");

	const data = await knex(getUsersDB)
		.select('start_date', 'manager', 'deleted')
		.where(getProbationSQL)
		.andWhere('deleted', '=', 0);

	for (let i = 0; i < data.length; i++) {
		const usersManagers = data[i];

		const rawSelect = knex.raw(
			`first_name, last_name, start_date, manager, manager_name, position_name, deleted, start_date + INTERVAL '60 days' as probation`
		);
		const eachUserAndManager = await knex(getUsersDB)
			.select(rawSelect)
			.where(getProbationSQL)
			.andWhere('manager', '=', usersManagers.manager)
			.andWhere('deleted', '=', 0);

		const managerEmail = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', usersManagers.manager);

		sendMail(
			makeEmailObject(
				hr_probation_email(eachUserAndManager, 60),
				managerEmail[0].work_email,

				'60 Day employee probation'
			)
		);
	}
};
// checks start date and add 83 day for probation email
const get_probation_period_83_days = async () => {
	const getProbationSQL = knex.raw("start_date + INTERVAL '83 days' = current_date");

	const data = await knex(getUsersDB)
		.select('start_date', 'manager', 'deleted')
		.where(getProbationSQL)
		.andWhere('deleted', '=', 0);

	for (let i = 0; i < data.length; i++) {
		const usersManagers = data[i];

		const rawSelect = knex.raw(
			`first_name, last_name, start_date, manager, manager_name, position_name, deleted, start_date + INTERVAL '83 days' as probation`
		);
		const eachUserAndManager = await knex(getUsersDB)
			.select(rawSelect)
			.where(getProbationSQL)
			.andWhere('manager', '=', usersManagers.manager)
			.andWhere('deleted', '=', 0);

		const managerEmail = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', usersManagers.manager);

		sendMail(
			makeEmailObject(
				hr_probation_email(eachUserAndManager, 83),
				managerEmail[0].work_email,
				'Probation ends in 7 days'
			)
		);
	}
};

// checks start date and removes 30 day for probation email
const benefitsEligibilityReminder = async () => {
	try {
		const getProbationSQL = knex.raw(
			"DATE(current_date - INTERVAL '1 month') = DATE(rrsp_eligibility)"
		);

		const rrsp_eligibility_users = await knex(getUsersBenefitsDB)
			.select('user_id', 'preferred_name', 'rrsp_eligibility', 'deleted')
			.where(getProbationSQL)
			.andWhere('deleted', '=', 0);

		if (rrsp_eligibility_users.length !== 0) {
			sendMail(
				makeEmailObject(
					hr_rrsp_email(rrsp_eligibility_users, 30),
					'humanresources@roterra.com',
					'RRSP Eligibility within 30 Days'
				)
			);
		}
	} catch (error) {
		console.log('something went wrong', error);
	}
};

const performanceReviewReminder = async () => {
	try {
		const getProbationSQL = knex.raw(
			"DATE(current_date - INTERVAL '1 month') = DATE(reminder_date)"
		);

		const hr_performance_review_users = await knex(getUsersBenefitsDB)
			.select('user_id', 'preferred_name', 'reminder_date', 'deleted')
			.where(getProbationSQL)
			.andWhere('deleted', '=', 0);
		if (hr_performance_review_users.length !== 0) {
			sendMail(
				makeEmailObject(
					hr_performance_review_email(hr_performance_review_users, 30),
					'humanresources@roterra.com',
					'Performance Review Reminder 30Days'
				)
			);
		}
	} catch (error) {
		console.log('something went wrong', error);
	}
};

module.exports = {
	get_probation_period_60_days,
	get_probation_period_83_days,
	benefitsEligibilityReminder,
	performanceReviewReminder,
};
