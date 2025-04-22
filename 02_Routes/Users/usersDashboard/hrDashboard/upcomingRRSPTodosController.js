const express = require('express');
const router = express.Router();
const {
	getHrTodosRRSPDB,
	postHrTodosRRSPDB,
	postUsersBenefitsDB,
} = require('../../../../01_Database/database');
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
						.andWhereRaw(
							"DATE(current_date) BETWEEN DATE(due_date - INTERVAL '30 days') AND DATE(due_date + INTERVAL '30 days')"
						)
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
						(new Date(todo.due_date).getTime() - now.getTime()) / (1000 * 3600 * 24)
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
			const { details: oldDetails, checklist: oldChecklist } = oldTodo;
			const newTodo = new_todos[i];
			const { details: newDetails, checklist: newChecklist } = newTodo;

			if (JSON.stringify(newTodo) === JSON.stringify(oldTodo)) {
				console.log('no changes');
				continue;
			}

			const updatedTodo = {
				...newChecklist,
				updated_by_id: edited_by,
				updated_on: edited_on,
			};

			// exclude fields that are viewed from other tables
			delete updatedTodo.enrolment_status;
			delete updatedTodo.due_date;

			if (newDetails.completed == true && oldDetails.completed == false) {
				updatedTodo.completed = true;
				updatedTodo.completed_by_id = edited_by;
				updatedTodo.completed_on = edited_on;
			}

			// console.log(updatedTodo);

			await knex(postHrTodosRRSPDB).update(updatedTodo).where({ id: oldDetails.id });

			// check if benefits status has been set
			if (newChecklist.enrolment_status !== oldChecklist.enrolment_status) {
				const updatedRRSP = {
					rrsp_updated_by: edited_by,
					rrsp_updated_on: edited_on,
				};

				switch (newChecklist.enrolment_status) {
					case 'Waiting':
						updatedRRSP.rrsp_status = 1;
						break;
					case 'Enrolled':
						updatedRRSP.rrsp_status = 2;
						break;
					case 'Waived':
						updatedRRSP.rrsp_status = 3;
						break;
					case 'Ineligible':
						updatedRRSP.rrsp_status = 4;
						break;
					default:
						break;
				}

				console.log(updatedRRSP);
				await knex(postUsersBenefitsDB)
					.update(updatedRRSP)
					.where({ user_id: newDetails.user_id });
			}
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
