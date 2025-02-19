const express = require('express');
const router = express.Router();
const {
	getUsersBenefitsDB,
	postHrTodosBenefitsDB,
	postHrTodosRRSPDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

// WARNING: WILL DELETE ALL CURRENT DATA FROM TODO TABLES AND
// ADD ALL UPCOMING TODOS WITHIN A YEAR
const makeUpcomingTodos = async (req, res) => {
	try {
		const getUpcomingRRSP = knex.raw(
			"DATE(rrsp_eligibility) BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '30 days')"
		);

		await knex(postHrTodosRRSPDB).delete();

		const upcomingRRSPUsers = await knex(getUsersBenefitsDB)
			.select('user_id', 'rrsp_eligibility')
			.where(getUpcomingRRSP)
			.andWhere({ deleted: 0 });

		console.log('upcoming RRSP', upcomingRRSPUsers);
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

			console.log('rrsp todos', newTodos);
			await knex(postHrTodosRRSPDB).insert(newTodos);
		}

		await knex(postHrTodosBenefitsDB).delete();

		const getUpcomingBenefits = [
			[
				'Benefits effective',
				knex.raw(
					"DATE(effective_date) BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '30 days')"
				),
			],
			[
				'1 year',
				knex.raw(
					"DATE(effective_date + INTERVAL '1 year') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '30 days')"
				),
			],
			[
				'5 year',
				knex.raw(
					"DATE(effective_date + INTERVAL '5 years') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '30 days')"
				),
			],
			[
				'10 year',
				knex.raw(
					"DATE(effective_date + INTERVAL '10 years') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '30 days')"
				),
			],
		];

		for (const [milestone, query] of getUpcomingBenefits) {
			const upcomingBenefitsUsers = await knex(getUsersBenefitsDB)
				.select('user_id', 'effective_date')
				.where(query)
				.andWhere({ deleted: 0 });

			console.log(`upcoming benefits (${milestone})`, upcomingBenefitsUsers);
			if (upcomingBenefitsUsers.length !== 0) {
				const newTodos = [];
				for (const user of upcomingBenefitsUsers) {
					const { user_id, effective_date } = user;
					const due_date = new Date(effective_date);
					const todo = {
						user_id: user_id,
						completed: false,
						milestone: milestone,
					};

					switch (milestone) {
						case 'Benefits effective':
							todo['due_date'] = due_date;
							todo['confirmed_enrolment'] = false;
							todo['emailed_details'] = false;
							todo['added_benefit_deduction'] = false;
							break;

						case '1 year':
							due_date.setFullYear(due_date.getFullYear() + 1);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['ordered_hsp_card'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '5 year':
							due_date.setFullYear(due_date.getFullYear() + 5);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['updated_hsp_amount'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '10 year':
							due_date.setFullYear(due_date.getFullYear() + 10);
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

				console.log(`benefits todos (${milestone})`, newTodos);
				await knex(postHrTodosBenefitsDB).insert(newTodos);
			}
		}

		res.status(200);
	} catch (error) {
		console.log('something went wrong', error);
	}
};

module.exports = {
	makeUpcomingTodos,
};
