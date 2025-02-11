const express = require('express');
const router = express.Router();
const { getHrTodosBenefitsDB, postHrTodosBenefitsDB } = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingBenefitsTodos = async (req, res) => {
	/* Gets all upcoming benefit milestones todos */
	try {
		const { completed } = req.query;
		const benefitsTodosData =
			completed == false
				? await knex(getHrTodosBenefitsDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('due_date', 'asc')
						.orderBy('preferred_name', 'asc')
				: await knex(getHrTodosBenefitsDB)
						.select('*')
						.where({ completed: completed })
						.orderBy('completed_on', 'desc')
						.orderBy('preferred_name', 'asc');

		// console.log(`benefits todos data`, benefitsTodosData)

		// create todos based on milestone
		const now = new Date();
		const todosData = [];
		for (const todo of benefitsTodosData) {
			const newTodo = {
				details: {
					id: todo.id,
					user_id: todo.user_id,
					preferred_name: todo.preferred_name,
					due_date: todo.due_date,
					milestone: todo.milestone,
					days_before: Math.round(
						(todo.due_date.getTime() - now.getTime()) / (1000 * 3600 * 24)
					),
					completed: todo.completed,
					completed_on: todo.completed_on,
					completed_by_name: todo.completed_by_name,
				},
			};

			// create different checklists for different milestones
			switch (todo.milestone) {
				case 'Benefits effective':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						confirmed_enrolment: todo.confirmed_enrolment,
						added_benefit_deduction: todo.added_benefit_deduction,
					};
					break;

				case '1 year':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						updated_benefit_class: todo.updated_benefit_class,
						ordered_hsp_card: todo.ordered_hsp_card,
					};
					break;

				case '5 year':
				case '10 year':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						updated_benefit_class: todo.updated_benefit_class,
						updated_hsp_amount: todo.updated_hsp_amount,
					};
					break;
			}

			todosData.push(newTodo);
		}

		const labels = {
			emailed_details: 'Email employee about benefits information/bump',
			confirmed_enrolment: 'Confirm online enrolment completed',
			added_benefit_deduction: 'Add benefit deduction to payroll',
			updated_benefit_class: 'Update benefit class on Canada Life',
			ordered_hsp_card: 'Order HSP card',
			updated_hsp_amount: 'Update HSP amount',
		};

		res.status(200).json({
			message: 'Benefits to-do data retrieved',
			color: 'success',
			data: {
				todosData: todosData,
				labels: labels,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: 'Something went wrong retrieving benefits to-do data',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateBenefitsTodos = async (req, res) => {
	/* Updates all given benefit milestone todos */
	try {
		const { new_todos, old_todos, edited_by, edited_on } = req.body.update_details;
		console.log(edited_by, edited_on);

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
				// updated_by: edited_by,
				// updated_on: edited_on,
			};

			if (newTodo.details.completed == true && oldTodo.details.completed == false) {
				updatedTodo.completed = true;
				updatedTodo.completed_by_id = edited_by;
				updatedTodo.completed_on = edited_on;
			}

			// console.log(updatedTodo);

			await knex(postHrTodosBenefitsDB).update(updatedTodo).where({ id: oldTodo.details.id });
		}

		res.status(200).json({ message: 'Benefits to-do changes saved', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem saving benefits to-do changes',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getUpcomingBenefitsTodos,
	updateBenefitsTodos,
};
