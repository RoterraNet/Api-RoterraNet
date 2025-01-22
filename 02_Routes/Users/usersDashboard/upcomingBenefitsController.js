const express = require('express');
const router = express.Router();
const {
    getUsersBenefitsDB,
    getHrTodosBenefitsDB,
    postHrTodosBenefitsDB,
    postHrTodosRRSPDB,
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getUpcomingBenefitsTodos = async (req, res) => {
    /* Gets all upcoming benefit milestones todos */
    try {
        const benefitsTodosData = await knex(getHrTodosBenefitsDB)
            .select('*')
            .where({completed: false})

        // console.log('benefits todos data', benefitsTodosData)

        // create todos based on milestone
        const now = new Date();
        const todos = []
        for (const todo of benefitsTodosData) {
            const newTodo = {
                id: todo.id,
                user_id: todo.user_id,
                preferred_name: todo.preferred_name,
                due_date: todo.due_date,
                milestone: todo.milestone,
                days_before: Math.round((todo.due_date.getTime() - now.getTime()) / (1000*3600*24)),
                completed:todo.completed
            }

            // create different checklists for different milestones
            switch (todo.milestone) {
                case '90 days':
                    todos.push({
                        ...newTodo,
                        checklist: [
                            {
                                key: 'emailed_details',
                                value: todo.emailed_details,
                                label: 'Email benefits information'
                            },
                            {
                                key: 'confirmed_enrolment',
                                value: todo.confirmed_enrolment,
                                label: 'Confirm online enrolment completed'
                            },
                            {
                                key: 'added_benefit_deduction',
                                value: todo.added_benefit_deduction,
                                label: 'Add benefit deduction to payroll'
                            }
                        ]
                    })
                    break;

                case '1 year':
                    todos.push({
                        ...newTodo,
                        checklist: [
                            {
                                key: 'emailed_details',
                                value: todo.emailed_details,
                                label: 'Email employee about benefit bump'
                            },
                            {
                                key: 'updated_benefit_class',
                                value: todo.updated_benefit_class,
                                label: 'Update benefit class on Canada Life'
                            },
                            {
                                key: 'ordered_hsp_card',
                                value: todo.ordered_hsp_card,
                                label: 'Order HSP card'
                            }
                        ]
                    })
                    break;

                case '5 years':
                case '10 years':
                    todos.push({
                        ...newTodo,
                        checklist: [
                            {
                                key: 'emailed_details',
                                value: todo.emailed_details,
                                label: 'Email employee about benefit bump'
                            },
                            {
                                key: 'updated_benefit_class',
                                value: todo.updated_benefit_class,
                                label: 'Update benefit class on Canada Life'
                            },
                            {
                                key: 'updated_hsp_amount',
                                value: todo.updated_hsp_amount,
                                label: 'Update HSP amount'
                            }
                        ]
                    })
                    break;
            }
        }

        // sort todos by days_before ascending
        todos.sort((a, b) => { return a.days_before - b.days_before })
        res.status(200).json({ message: 'Upcoming benefits data retrieved', color: 'success', data: { todos: todos } } );
    } catch (e) {
        res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: e });
        console.log(e);
    }
}

const updateBenefitsTodos = async (req, res) => {
    /* Updates all given benefit milestone todos */
    try {
        const { new_todos, completed_by_id } = req.body.update_details

        // get list of todo ids corresponding todo items
        const updatedTodosIds = []
		const updatedTodos = []
		for (const todo of new_todos) {
			const updatedChecklist = {}
			for (const checklistItem of todo.checklist) {
				updatedChecklist[checklistItem.key] = checklistItem.value
			}
			const updatedTodo = {
				completed: todo.completed,
                completed_by_id: todo.completed ? completed_by_id : todo.completed_by_id, // if completed, add id of who completed
				...updatedChecklist
			}
			updatedTodos.push(updatedTodo)
			updatedTodosIds.push(todo.id)
		}

        // update each row in table
        for (let i = 0; i < updatedTodos.length; i++) {
            await knex(postHrTodosBenefitsDB)
                .update(updatedTodos[i])
                .where({id: updatedTodosIds[i].toString()})
        }

        res.status(200).json({  message: 'Changes saved', color: 'success' });
    } catch (e) {
        res.status(500).json({ message: 'Problem saving changes', color: 'error', error: e });
        console.log(e);
    }
}


module.exports = {
    getUpcomingBenefitsTodos,
    updateBenefitsTodos,
}