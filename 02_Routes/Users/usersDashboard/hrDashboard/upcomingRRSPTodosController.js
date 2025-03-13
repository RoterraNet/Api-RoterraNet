const express = require('express');
const router = express.Router();
const { getHrTodosRRSPDB, postHrTodosRRSPDB } = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingRRSPTodos = async (req, res) => {
	/* Gets completed or incompleted upcoming RRSP eligibility todos */
	try {
		const { completed } = req.query;
		const rrspTodosData =
			completed == false
				? await knex(getHrTodosRRSPDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('due_date', 'asc')
						.orderBy('preferred_name', 'asc')
				: await knex(getHrTodosRRSPDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('completed_on', 'desc')
						.orderBy('preferred_name', 'asc');

		// console.log('rrsp todos data', rrspTodosData)

		// create todos
		const now = new Date();
		const todosData = [];
		for (const todo of rrspTodosData) {
			todosData.push({
				details: {
					id: todo.id,
					user_id: todo.user_id,
					preferred_name: todo.preferred_name,
					due_date: todo.due_date,
					days_before: Math.round(
						(todo.due_date.getTime() - now.getTime()) / (1000 * 3600 * 24)
					),
					completed: todo.completed,
					completed_on: todo.completed_on,
					completed_by_name: todo.completed_by_name,
					updated_by_name: todo.updated_by_name,
					updated_on: todo.updated_on,
				},
				checklist: {
					emailed_details: todo.emailed_details,
					enrolment_status: todo.enrolment_status,
				},
			});
		}

		labels = {
			emailed_details: 'Email employee RRSP details',
			enrolment_status: 'Enrolment status:',
		};

		res.status(200).json({
			message: 'RRSP to-do data retrieved',
			color: 'success',
			data: {
				todosData: todosData,
				labels: labels,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: 'Something went wrong retrieving RRSP to-do data',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateRRSPTodos = async (req, res) => {
	/* Updates changed RRSP todos */
	try {
		const { new_todos, old_todos, edited_by, edited_on } = req.body.update_details;
		// console.log(edited_by, edited_on);

		for (let i = 0; i < new_todos.length; i++) {
			// console.log('new:', new_todos[i]);
			// console.log('old:', old_todos[i]);
			const oldTodo = old_todos[i];
			const newTodo = new_todos[i];

			if (JSON.stringify(newTodo) === JSON.stringify(oldTodo)) {
				console.log('no changes');
				continue;
			}

			const updatedTodo = {
				...newTodo.checklist,
				updated_by_id: edited_by,
				updated_on: edited_on,
			};

			if (newTodo.details.completed == true && oldTodo.details.completed == false) {
				updatedTodo.completed = true;
				updatedTodo.completed_by_id = edited_by;
				updatedTodo.completed_on = edited_on;
			}

			// console.log(updatedTodo);

			await knex(postHrTodosRRSPDB).update(updatedTodo).where({ id: oldTodo.details.id });
		}

		res.status(200).json({ message: 'RRSP to-do changes saved', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem saving RRSP to-do changes',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getUpcomingRRSPTodos,
	updateRRSPTodos,
};
