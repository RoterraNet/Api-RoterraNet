const express = require('express');
const router = express.Router();
const {
	getOffboardingChecklistsDB,
	postOffboardingChecklistsDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');
const { stringify } = require('qs');
const { format } = require('date-fns');

const getOffboardingTodos = async (req, res) => {
	/* Gets completed or incompleted, or most recent (if user_id is supplied) offboarding todos */
	try {
		const { completed, user_id } = req.query;
		let offboardingChecklistData;

		if (user_id) {
			offboardingChecklistData = await knex(getOffboardingChecklistsDB)
				.select('*')
				.where({ user_id: user_id })
				.orderBy('completed_on', 'desc')
				.limit(1);
		} else {
			offboardingChecklistData =
				completed == false
					? await knex(getOffboardingChecklistsDB)
							.select('*')
							.where({ completed: completed })
							.orderBy('last_workday', 'asc')
							.orderBy('preferred_name', 'asc')
					: await knex(getOffboardingChecklistsDB)
							.select('*')
							.where({ completed: completed })
							.orderBy('completed_on', 'desc')
							.orderBy('preferred_name', 'asc');
		}
		// console.log(offboardingChecklistData);

		// format todos data
		todosData = [];
		for (const checklist of offboardingChecklistData) {
			todosData.push({
				details: {
					id: checklist.id,
					user_id: checklist.user_id,
					preferred_name: checklist.preferred_name,
					completed: checklist.completed,
					completed_by_name: checklist.completed_by_name,
					completed_on: checklist.completed_on,
					updated_by_name: checklist.updated_by_name,
					updated_on: checklist.updated_on,
					last_workday: checklist.last_workday,
				},
				checklist: {
					resignation_termination_filed: checklist.resignation_termination_filed,
					moved_hr_file_to_former: checklist.moved_hr_file_to_former,
					employee_tracker_updated: checklist.employee_tracker_updated,
					deactivated_from_intranet: checklist.deactivated_from_intranet,
					benefits_cancelled: checklist.benefits_cancelled,
					benefits_cancelled_date: checklist.benefits_cancelled_date
						? format(new Date(checklist.benefits_cancelled_date), 'yyyy-MM-dd')
						: '',
					rrsp_cancelled: checklist.rrsp_cancelled,
					rrsp_cancelled_date: checklist.rrsp_cancelled_date
						? format(new Date(checklist.rrsp_cancelled_date), 'yyyy-MM-dd')
						: '',
					exit_interview_conducted: checklist.exit_interview_conducted,
					manager_checklist_completed: checklist.manager_checklist_completed,
					benefits_rrsp_reminders_removed: checklist.benefits_rrsp_reminders_removed,
					departure_email_sent: checklist.departure_email_sent,
					moved_paper_file_to_terminated: checklist.moved_paper_file_to_terminated,

					payments_reimbursements_processed: checklist.payments_reimbursements_processed,
					final_payment_date: checklist.final_payment_date
						? format(new Date(checklist.final_payment_date), 'yyyy-MM-dd')
						: '',
					roe_file_processed: checklist.roe_file_processed,
					made_quickbooks_inactive: checklist.made_quickbooks_inactive,
					scotia_deactivated: checklist.scotia_deactivated,
					timesheet_deactivated: checklist.timesheet_deactivated,
					timesheet_summary_removed: checklist.timesheet_summary_removed,

					moved_hs_folder_to_former: checklist.moved_hs_folder_to_former,
					removed_from_training_matrix: checklist.removed_from_training_matrix,
					removed_name_from_hs_sheet: checklist.removed_name_from_hs_sheet,
					drivers_list_updated: checklist.drivers_list_updated,
					insurance_emailed: checklist.insurance_emailed,
					safety_equipment_returned: checklist.safety_equipment_returned,

					it_checklist_completed: checklist.it_checklist_completed,
				},
			});
		}

		// headers above certain checklist items
		const headers = {
			resignation_termination_filed: 'Human Resources',
			payments_reimbursements_processed: 'Payroll',
			moved_hs_folder_to_former: 'Health & Safety',
			it_checklist_completed: 'IT (See IT Checklist)',
		};

		// labels for checklist items
		const labels = {
			resignation_termination_filed: 'File resignation/termination letter or email',
			moved_hr_file_to_former: "Move employee's HR folder to former employees",
			employee_tracker_updated:
				'Update employee tracker (move employee from active to terminated sheet)',
			deactivated_from_intranet: 'Deactivate from Intranet',
			benefits_cancelled: 'Cancel Canada Life Benefits',
			benefits_cancelled_date: 'Effective date:',
			rrsp_cancelled: 'Cancel RRSP',
			rrsp_cancelled_date: 'Effective date:',
			exit_interview_conducted: 'Conduct Exit Interview, if applicable',
			manager_checklist_completed: "Ensure Manager's Offboarding Checklist is complete",
			benefits_rrsp_reminders_removed: 'Remove Benefits and RRSP Reminder from Planner',
			departure_email_sent: 'Ensure departure email is sent',
			moved_paper_file_to_terminated: 'Move paper employee file to terminated employees',

			payments_reimbursements_processed: 'Process final payment & reimbursement',
			final_payment_date: 'Final payment date:',
			roe_file_processed: 'Process ROE & file in employee file',
			made_quickbooks_inactive: 'Make employee inactive in QuickBooks',
			scotia_deactivated: 'Deactivate employee in Scotia Connect after final payment date',
			timesheet_deactivated: 'Deactivate from timesheets (Wasp/QR code)',
			timesheet_summary_removed: 'Remove from Timesheet Summary (email Morgan)',

			moved_hs_folder_to_former: 'Move H&S employee folder to former employees',
			removed_from_training_matrix: 'Remove employee from the training matrix',
			removed_name_from_hs_sheet: 'Remove employee name from H&S Meeting Sign-in Sheet',
			drivers_list_updated: 'Update drivers list',
			insurance_emailed: 'Email insurance to have employee removed',
			safety_equipment_returned: 'Ensure safety equipment is returned',

			it_checklist_completed: 'Ensure IT Termination/Layoff Checklist is completed',
		};

		res.status(200).json({
			message: `Offboarding to-do data retrieved`,
			color: 'success',
			data: {
				todosData: todosData,
				headers: headers,
				labels: labels,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: `Something went wrong retrieving offboarding to-do data`,
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateOffboardingTodos = async (req, res) => {
	/* Updates all offboarding todos */
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
				benefits_cancelled_date:
					newTodo.checklist.benefits_cancelled_date !== ''
						? newTodo.checklist.benefits_cancelled_date
						: null,
				rrsp_cancelled_date:
					newTodo.checklist.rrsp_cancelled_date !== ''
						? newTodo.checklist.rrsp_cancelled_date
						: null,
				final_payment_date:
					newTodo.checklist.final_payment_date !== ''
						? newTodo.checklist.final_payment_date
						: null,
				updated_by_id: edited_by,
				updated_on: edited_on,
			};

			if (newTodo.details.completed == true && oldTodo.details.completed == false) {
				updatedTodo.completed = true;
				updatedTodo.completed_by_id = edited_by;
				updatedTodo.completed_on = edited_on;
			}

			// console.log(updatedTodo);

			await knex(postOffboardingChecklistsDB)
				.update(updatedTodo)
				.where({ id: oldTodo.details.id });
		}

		res.status(200).json({ message: 'Offboarding to-do changes saved', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem saving offboarding to-do changes',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getOffboardingTodos,
	updateOffboardingTodos,
};
