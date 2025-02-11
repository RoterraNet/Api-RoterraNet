const express = require('express');
const router = express.Router();
const {
    postOnboardingChecklistsDB
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

// WARNING: WILL DELETE ALL CURRENT DATA FROM ONBOARDING TABLE
const makeOnboardingTodos = async (req, res) => {
    try {
        const now = new Date()
		// using user ids of first 5 employees for checklist testing
        const testCases = [
            {user_id: 739, start_date: now},
            {user_id: 491, start_date: now},
            {user_id: 452, start_date: now},
            {user_id: 29, start_date: now},
            {user_id: 82, start_date: now},
        ]

        await knex(postOnboardingChecklistsDB).delete()
        await knex(postOnboardingChecklistsDB).insert(testCases)

        // const users = await knex(getUsersDB)
        //     .select('user_id', 'start_date')
        //     .where({deleted: 0})

        // const checklists = []
        // for (const user in users) {
        //     checklists.push({
        //         user_id: user.user_id,
        //         completed: true,
        //         completed_by_id: 794,
        //         completed_on: now,
        //         start_date: user.start_date,

        //         resume_filed: true,
        //         employment_offer_signed: true,
        //         onboarding_package_completed: true,
        //         banking_info_received: true,
        //         tour_completed: true,
        //         added_to_timesheet: true,
        //         time_adjustment_completed: true,
        //         reimbursement_form_completed: true,
        //         added_to_timesheet_summary: true,
        //         employee_record_folder_created: true,
        //         added_to_intranet: true,
        //         benefits_waiting_period: '',
        //         invited_to_benefits: true,
        //         added_to_birthday_anniversary: true,
        //         added_to_orgchart: true,
        //         added_to_quickbook:strue,
        //         added_to_scotia: true,
        //         wage_negotiation_reminders_made: true,
        //         welcome_email_sent: true,
        //         welcome_gift_provided: true,
        //         picture_taken: true,
        //         has_referral: false,
        //         referral_from: "",
        //         electronic_file_documents_scanned: true,
        //         safety_orientation_completed: true,
        //         safety_form_signed: true,
        //         exams_marked: true,
        //         whmis_certificate_made: true,
        //         added_to_hs_folder: true,
        //         training_certificates_in_hs: true,
        //         added_to_training_matrix: true,
        //         added_name_to_hs_sheet: true,
        //         driver_consent_scanned: true,
        //         insurance_consent_scanned: true,
        //         drivers_list_updated: true,
        //         insurance_emailed: true
        //     })
        // }
        
        // await knex(postOnboardingChecklistsDB).delete()
        // await knex(postOnboardingChecklistsDB).insert(checklists)

	} catch (error) {
		console.log('something went wrong', error);
	}
}

module.exports = {
    makeOnboardingTodos,
}