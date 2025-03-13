const express = require('express');
const router = express.Router();
const {
	postHrTodosAnniversariesDB,
	getUsersDB,
	getUsersBenefitsDB,
	postHrTodosBenefitsDB,
	postHrTodosRRSPDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

// WARNING: WILL DELETE ALL CURRENT DATA FROM BENEFITS, RRSP, AND ANNIVERSARY TODO TABLES AND
// ADD ALL UPCOMING TODOS WITHIN A YEAR, SHOULD ONLY BE USED IN NON-LIVE DATABASE
const makeUpcomingTodos = async (req, res) => {
	try {
		/* DELETE CURRENT RRSP TODOS AND ADD RRSP TODO ITEMS FOR USERS WHO ARE RRSP ELIGIBLE IN THE NEXT YEAR */

		await knex(postHrTodosRRSPDB).delete();

		const getUpcomingRRSP = knex.raw(
			"DATE(rrsp_eligibility) BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '365 days')"
		);

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

		/* DELETE CURRENT BENEFITS TODOS AND ADD BENEFIT TODO ITEMS FOR USERS WHO HAVE ANY MILESTONE IN THE NEXT YEAR */

		await knex(postHrTodosBenefitsDB).delete();

		const getUpcomingBenefits = [
			[
				'Benefits effective',
				knex.raw(
					"DATE(effective_date) BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '365 days')"
				),
			],
			[
				'1 year',
				knex.raw(
					"DATE(start_date + INTERVAL '1 year') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '365 days')"
				),
			],
			[
				'5 year',
				knex.raw(
					"DATE(start_date + INTERVAL '5 years') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '365 days')"
				),
			],
			[
				'10 year',
				knex.raw(
					"DATE(start_date + INTERVAL '10 years') BETWEEN DATE(current_date) AND DATE(current_date + INTERVAL '365 days')"
				),
			],
		];

		for (const [milestone, query] of getUpcomingBenefits) {
			const upcomingBenefitsUsers = await knex(getUsersBenefitsDB)
				.select('user_id', 'effective_date', 'start_date')
				.where(query)
				.andWhere({ deleted: 0 });

			console.log(`upcoming benefits (${milestone})`, upcomingBenefitsUsers);
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

					switch (milestone) {
						case 'Benefits effective':
							due_date = new Date(effective_date);
							todo['due_date'] = due_date;
							todo['confirmed_enrolment'] = false;
							todo['emailed_details'] = false;
							todo['added_benefit_deduction'] = false;
							break;

						case '1 year':
							due_date = new Date(start_date);
							due_date.setFullYear(due_date.getFullYear() + 1);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['ordered_hsp_card'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '5 year':
							due_date = new Date(start_date);
							due_date.setFullYear(due_date.getFullYear() + 5);
							todo['due_date'] = due_date;
							todo['emailed_details'] = false;
							todo['updated_hsp_amount'] = false;
							todo['updated_benefit_class'] = false;
							break;

						case '10 year':
							due_date = new Date(start_date);
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

		/* DELETE CURRENT ANNIVERSARY TODOS AND ADD ANNIVERSARY TODO ITEMS FOR USERS WHO HAVE ANY ANNIVERSARY IN THE NEXT 90 DAYS */

		await knex(postHrTodosAnniversariesDB).delete();

		activeUsers = await knex(getUsersDB)
			.select('user_id', 'start_date', 'preferred_name')
			.where({ deleted: 0 });

		const now = new Date();

		for (const user of activeUsers) {
			// get what would be user's anniversary this year
			const anniversaryYear = now.getFullYear() - user.start_date.getFullYear();

			// if upcoming anniversary is not 1st year or greater, skip loop
			if (anniversaryYear < 1) {
				continue;
			}

			// calculate upcoming anniversary date
			const anniversaryDate = new Date(user.start_date.getTime());
			anniversaryDate.setFullYear(now.getFullYear());

			// if anniversary is not within 0-90 days, skip loop
			const daysBefore = Math.round(
				(anniversaryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
			);
			if (daysBefore < 0 || daysBefore > 90) {
				continue;
			}

			if (anniversaryYear % 5 != 0 && daysBefore <= 30) {
				// regular anniversary
				await knex(postHrTodosAnniversariesDB).insert({
					user_id: user.user_id,
					type: 'regular',
					anniversary_date: anniversaryDate,
					anniversary_year: anniversaryYear,
				});
			} else if (anniversaryYear % 5 == 0 && daysBefore <= 90) {
				// major anniversary
				await knex(postHrTodosAnniversariesDB).insert({
					user_id: user.user_id,
					type: 'major',
					anniversary_date: anniversaryDate,
					anniversary_year: anniversaryYear,
				});
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
