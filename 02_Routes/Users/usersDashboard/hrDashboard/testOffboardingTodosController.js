const express = require('express');
const router = express.Router();
const { postOffboardingChecklistsDB } = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

// WARNING: WILL DELETE ALL CURRENT DATA FROM OFFBOARDING TABLE
const makeOffboardingTodos = async (req, res) => {
	try {
		const now = new Date();
		// using user ids of first 5 employees for checklist testing
		// const testCases = [
		//     {user_id: 739, last_workday: now},
		//     {user_id: 491, last_workday: now},
		//     {user_id: 452, last_workday: now},
		//     {user_id: 29, last_workday: now},
		//     {user_id: 82, last_workday: now},
		// ]

		// await knex(postOffboardingChecklistsDB).delete();
		// await knex(postOffboardingChecklistsDB).insert(testCases)

		// const users = await knex(getUsersDB)
		//     .select('user_id')
		//     .where({deleted: 1})

		// const checklists = []
		// for (const user in users) {
		//     checklists.push({
		//         user_id: user.user_id,
		//         completed: true,
		//         completed_by_id: 794,
		//         completed_on: now,
		//         last_workday: now,

		//         resignation_termination_filed: true,
		//         moved_hr_file_to_former: true,
		//         employee_tracker_updated: true,
		//         deactivated_from_intranet: true,
		//         benefits_cancelled: true,
		//         benefits_cancelled_date: now,
		//         rrsp_cancelled: true,
		//         rrsp_cancelled_date: now,
		//         exit_interview_conducted: true,
		//         manager_checklist_completed: true,
		//         benefits_rrsp_reminders_removed: true,
		//         departure_email_sent: true,
		//         moved_paper_file_to_terminated: true,

		//         payments_reimbursements_processed: true,
		//         final_payment_date: now,
		//         roe_file_processed: true,
		//         made_quickbooks_inactive: true,
		//         scotia_deactivated: true,
		//         timesheet_deactivated: true,
		//         timesheet_summary_removed: true,

		//         moved_hs_folder_to_former: true,
		//         removed_from_training_matrix: true,
		//         removed_name_from_hs_sheet: true,
		//         drivers_list_updated: true,
		//         insurance_emailed: true,
		//         safety_equipment_returned: true,

		//         it_checklist_completed: true,
		//     })
		// }

		// await knex(postOffboardingChecklistsDB).delete()
		// await knex(postOffboardingChecklistsDB).insert(checklists)
	} catch (error) {
		console.log('something went wrong', error);
	}
};

module.exports = {
	makeOffboardingTodos,
};
