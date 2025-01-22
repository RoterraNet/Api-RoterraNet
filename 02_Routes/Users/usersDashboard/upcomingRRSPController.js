const express = require('express');
const router = express.Router();
const {
    getHrTodosRRSPDB,
    postHrTodosRRSPDB
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getUpcomingRRSPTodos = async (req, res) => {
    /* Gets all upcoming RRSP eligibility todos */
    try {
        const rrspTodosData = await knex(getHrTodosRRSPDB)
            .select('*')
            .where({completed: false})
        
        console.log('rrsp todos', rrspTodosData)

        // create todos
        const now = new Date();
        const todos = []
        for (const todo of rrspTodosData) {
            const newTodo = {
                id: todo.id,
                user_id: todo.user_id,
                preferred_name: todo.preferred_name,
                due_date: todo.due_date,
                days_before: Math.round((todo.due_date.getTime() - now.getTime()) / (1000*3600*24)),
                completed: todo.completed,
                checklist: [
                    {
                        key: 'emailed_details',
                        value: todo.emailed_details,
                        label: 'Email employee RRSP details'
                    },
                    {
                        key: 'enrolment_status',
                        value: todo.enrolment_status 
                    }
                ]
            }

            todos.push(newTodo)
        }
        
        // sort todos by days_before ascending
        todos.sort((a, b) => { return a.days_before - b.days_before })
        res.status(200).json({ message: 'Upcoming RRSP data retrieved', color: 'success', data: { todos: todos } });
    } catch (e) {
        res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: e });
        console.log(e);
    }
}

const updateRRSPTodos = async (req, res) => {
    /* Updates all given RRSP milestone todos */
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
            await knex(postHrTodosRRSPDB)
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
    getUpcomingRRSPTodos,
    updateRRSPTodos
}