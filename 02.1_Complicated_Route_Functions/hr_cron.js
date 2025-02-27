const express = require('express');
const knex = require('../01_Database/connection');
const {
	getUsersDB,
	postNewsDB,
	getUsersBenefitsDB,
	postHrTodosBenefitsDB,
	postHrTodosRRSPDB,
} = require('../01_Database/database');
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

const addHrTodos = async () => {
	/* 
	Adds RRSP eligibility and benefits milestones to todo tables 1 month 
	in advance of actual date, called every morning at 6am
	 */
	try {
		// get all users whose rrsp eligibility is in exactly 1 month
		const getUpcomingRRSP = knex.raw(
			"DATE(current_date + INTERVAL '1 month') = DATE(rrsp_eligibility)"
		);
		const upcomingRRSPUsers = await knex(getUsersBenefitsDB)
			.select('user_id', 'rrsp_eligibility')
			.where(getUpcomingRRSP)
			.andWhere({ deleted: 0 });

		// add to RRSP todo table and assign default values
		if (upcomingRRSPUsers.length !== 0) {
			const newTodos = [];
			for (const user of upcomingRRSPUsers) {
				const { user_id, rrsp_eligibility } = user;
				const todo = {
					user_id: user_id,
					due_date: rrsp_eligibility,
					emailed_details: false,
					completed: false,
				};
				newTodos.push(todo);
			}

			// add to table
			console.log('adding new rrsp todos:', newTodos);
			await knex(postHrTodosRRSPDB).insert(newTodos);
		}

		// get all users who have a benefit milestone in exactly 1 month
		const getUpcomingBenefits = [
			['90 days', knex.raw("DATE(current_date + INTERVAL '1 month') = DATE(effective_date)")],
			[
				'1 year',
				knex.raw(
					"DATE(current_date + INTERVAL '1 month') = DATE(start_date + INTERVAL '1 year')"
				),
			],
			[
				'5 year',
				knex.raw(
					"DATE(current_date + INTERVAL '1 month') = DATE(start_date + INTERVAL '5 years')"
				),
			],
			[
				'10 year',
				knex.raw(
					"DATE(current_date + INTERVAL '1 month') = DATE(start_date + INTERVAL '10 years')"
				),
			],
		];
		for (const [milestone, query] of getUpcomingBenefits) {
			const upcomingBenefitsUsers = await knex(getUsersBenefitsDB)
				.select('user_id', 'effective_date', 'start_date')
				.where(query)
				.andWhere({ deleted: 0 });

			if (upcomingBenefitsUsers.length !== 0) {
				const newTodos = [];
				for (const user of upcomingBenefitsUsers) {
					const { user_id, effective_date, start_date } = user;
					let due_date;
					const todo = {
						user_id: user_id,
						completed: false,
						milestone: milestone,
					};

					// assign default values to benefit todo depending on milestone
					switch (milestone) {
						case '90 days':
							due_date = new Date(effective_date);
							todo['due_date'] = due_date;
							todo['confirmed_enrolment'] = false;
							todo['emailed_details'] = false;
							todo['added_benefit_deduction'] = false;
							break;

						case '1 year':
							due_date = new Date(start_date);
							setFullYear(due_date.getFullYear() + 1);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['ordered_hsp_card'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '5 year':
							due_date = new Date(start_date);
							setFullYear(due_date.getFullYear() + 5);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['updated_hsp_amount'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '10 year':
							due_date = new Date(start_date);
							setFullYear(due_date.getFullYear() + 10);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['updated_hsp_amount'] = false;
							todo['updated_benefit_class'] = false;
							break;

						default:
							break;
					}

					newTodos.push(todo);
				}

				// add to table
				console.log(`adding new benefits todos (${milestone}):`, newTodos);
				await knex(postHrTodosBenefitsDB).insert(newTodos);
			}
		}
	} catch (error) {
		console.log('Something went wrong adding HR todos', error);
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
	addHrTodos,
};
