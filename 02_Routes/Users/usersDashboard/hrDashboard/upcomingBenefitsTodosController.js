const express = require('express');
const router = express.Router();
const {
	getHrTodosBenefitsDB,
	postHrTodosBenefitsDB,
	postUsersBenefitsDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingBenefitsTodos = async (req, res) => {
	/* Gets completed or incompleted benefit milestones todos */
	try {
		const { completed } = req.query;
		const benefitsTodosData =
			completed == false
				? await knex(getHrTodosBenefitsDB)
						.select('*')
						.where({ completed: completed })
						.andWhereRaw(
							"DATE(current_date) BETWEEN DATE(due_date) AND DATE(due_date + INTERVAL '30 days')"
						)
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
						(new Date(todo.due_date).getTime() - now.getTime()) / (1000 * 3600 * 24)
					),
					completed: todo.completed,
					completed_on: todo.completed_on,
					completed_by_name: todo.completed_by_name,
					updated_by_name: todo.updated_by_name,
					updated_on: todo.updated_on,
				},
			};

			// create different checklists for different milestones
			switch (todo.milestone) {
				case 'Benefits effective':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						confirmed_enrolment: todo.confirmed_enrolment,
						enrolment_status: todo.enrolment_status,
						added_benefit_deduction: todo.added_benefit_deduction,
						updated_intranet_benefits: todo.updated_intranet_benefits,
					};
					break;

				case '1 year':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						updated_benefit_class: todo.updated_benefit_class,
						ordered_hsp_card: todo.ordered_hsp_card,
						updated_intranet_benefits: todo.updated_intranet_benefits,
					};
					break;

				case '5 year':
				case '10 year':
					newTodo.checklist = {
						emailed_details: todo.emailed_details,
						updated_benefit_class: todo.updated_benefit_class,
						updated_hsp_amount: todo.updated_hsp_amount,
						updated_intranet_benefits: todo.updated_intranet_benefits,
					};
					break;
			}

			todosData.push(newTodo);
		}

		const labels = {
			emailed_details: 'Email employee about benefits information/bump',
			confirmed_enrolment: 'Confirm online enrolment completed',
			enrolment_status: 'Enrolment status:',
			added_benefit_deduction: 'Add benefit deduction to payroll',
			updated_benefit_class: 'Update benefit class on Canada Life',
			ordered_hsp_card: 'Order HSP card',
			updated_hsp_amount: 'Update HSP amount',
			updated_intranet_benefits: 'Update benefits in Intranet',
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
	/* Updates changed benefit milestone todos */
	try {
		const { new_todos, old_todos, edited_by, edited_on } = req.body.update_details;
		console.log(edited_by, edited_on);

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

			await knex(postHrTodosBenefitsDB).update(updatedTodo).where({ id: oldDetails.id });

			console.log(newChecklist.enrolment_status);
			// check if benefits status has been set, if so, update it in user_benefits table
			if (newChecklist.enrolment_status !== oldChecklist.enrolment_status) {
				const updatedBenefits = {
					benefits_updated_by: edited_by,
					benefits_updated_on: edited_on,
				};

				switch (newChecklist.enrolment_status) {
					case 'Waiting':
						updatedBenefits.benefits_status = 1;
						break;
					case 'Enrolled':
						updatedBenefits.benefits_status = 2;
						break;
					case 'Waived':
						updatedBenefits.benefits_status = 3;
						break;
					case 'Ineligible':
						updatedBenefits.benefits_status = 4;
						break;
					default:
						break;
				}

				await knex(postUsersBenefitsDB)
					.update(updatedBenefits)
					.where({ user_id: newDetails.user_id });
			}
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
