const express = require('express');
const router = express.Router();
const {
	getHrTodosAnniversariesDB,
	postHrTodosAnniversariesDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingAnniversariesTodos = async (req, res) => {
	/* Gets either regular anniversaries within 30 days and major anniversaries within 90 days */
	try {
		const { completed } = req.query;
		const anniversariesTodosData =
			completed == false
				? await knex(getHrTodosAnniversariesDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('anniversary_date', 'asc')
						.orderBy('preferred_name', 'asc')
				: await knex(getHrTodosAnniversariesDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('completed_on', 'desc')
						.orderBy('preferred_name', 'asc');

		const now = new Date();
		const todosData = [];
		for (const todo of anniversariesTodosData) {
			todosData.push({
				...todo,
				days_before: Math.round(
					(todo.anniversary_date.getTime() - now.getTime()) / (1000 * 3600 * 24)
				),
			});
		}

		res.status(200).json({
			message: `Upcoming anniversaries data retrieved`,
			color: 'success',
			data: { todosData },
		});
		// // get all active users
		// activeUsers = await knex(getUsersDB)
		// 	.select('user_id', 'start_date', 'preferred_name')
		// 	.where({ deleted: 0 });
		// const now = new Date();
		// const regularAnniversaryData = [];
		// const majorAnniversaryData = [];
		// for (const user of activeUsers) {
		// 	// get what would be user's anniversary this year
		// 	const nthAnniversary = now.getFullYear() - user.start_date.getFullYear();
		// 	// if upcoming anniversary is not 1st year or greater, skip loop
		// 	if (nthAnniversary < 1) {
		// 		continue;
		// 	}
		// 	// create anniversary date
		// 	const anniversaryDate = new Date(user.start_date.getTime());
		// 	anniversaryDate.setFullYear(now.getFullYear());
		// 	const daysBefore = Math.round(
		// 		(anniversaryDate.getTime() - now.getTime()) / (1000 * 3600 * 24)
		// 	);
		// 	if (daysBefore < 0 || daysBefore > 365) {
		// 		continue;
		// 	}
		// 	if (nthAnniversary % 5 != 0 && daysBefore <= 30) {
		// 		regularAnniversaryData.push({
		// 			user_id: user.user_id,
		// 			preferred_name: user.preferred_name,
		// 			anniversary_date: anniversaryDate,
		// 			anniversary_num: nthAnniversary,
		// 			days_before: daysBefore,
		// 		});
		// 	} else if (nthAnniversary % 5 == 0 && daysBefore <= 90) {
		// 		majorAnniversaryData.push({
		// 			user_id: user.user_id,
		// 			preferred_name: user.preferred_name,
		// 			anniversary_date: anniversaryDate,
		// 			anniversary_num: nthAnniversary,
		// 			days_before: daysBefore,
		// 		});
		// 	}
		// }
		// // sort anniversaries by days_before ascending
		// regularAnniversaryData.sort((a, b) => a.days_before - b.days_before);
		// majorAnniversaryData.sort((a, b) => a.days_before - b.days_before);
		// res.status(200).json({
		// 	message: `Upcoming anniversaries data retrieved`,
		// 	color: 'success',
		// 	data: {
		// 		regularAnniversaries: regularAnniversaryData,
		// 		majorAnniversaries: majorAnniversaryData,
		// 	},
		// });
	} catch (e) {
		res.status(500).json({
			message: `Something went wrong retrieving anniversaries`,
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateAnniversariesTodos = async (req, res) => {
	/* Updates all given benefit milestone todos */
	try {
		const { new_todos, old_todos, edited_by, edited_on } = req.body.update_details;
		console.log(old_todos, new_todos);

		for (let i = 0; i < new_todos.length; i++) {
			// console.log('new:', new_todos[i]);
			// console.log('old:', old_todos[i]);
			const oldTodo = old_todos[i];
			const newTodo = new_todos[i];

			if (newTodo.completed === oldTodo.completed) {
				console.log('no changes');
				continue;
			}

			if (newTodo.completed == true && oldTodo.completed == false) {
				const updatedTodo = {
					completed: newTodo.completed,
					completed_by_id: edited_by,
					completed_on: edited_on,
				};

				await knex(postHrTodosAnniversariesDB)
					.update(updatedTodo)
					.where({ id: oldTodo.id });
			}
		}

		res.status(200).json({ message: 'Anniversaries to-do changes saved', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem saving anniversaries to-do changes',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getUpcomingAnniversariesTodos,
	updateAnniversariesTodos,
};
