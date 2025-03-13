const express = require('express');
const router = express.Router();
const {
	getHrTodosAnniversariesDB,
	postHrTodosAnniversariesDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingAnniversariesTodos = async (req, res) => {
	/* Gets completed or incompleted anniversary todo items */

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
	/* Updates changed anniversary todos */
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
