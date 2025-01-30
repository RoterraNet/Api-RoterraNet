const express = require('express');
const router = express.Router();
const {
    getOnboardingChecklistsDB,
    postOnboardingChecklistsDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getOnboardingTodos = async (req, res) => {
    /* Gets onboarding todos */
    try {
        const { completed } = req.query;
        const onboardingChecklistData = completed == false ? 
            await knex(getOnboardingChecklistsDB)
                .select('*')
                // .orderBy('start_date', 'asc')
                .where({completed: completed})
            :
            await knex(getOnboardingChecklistsDB)
                .select('*')
                .where({completed: completed})
                .orderBy('completed_on', 'desc')

        // console.log(onboardingChecklistData)
        const onboardingTodos = []
        for (const checklist of onboardingChecklistData) {
            const formattedChecklistData = {
                id: checklist.id,
                user_id: checklist.user_id,
                preferred_name: checklist.preferred_name,
                completed: checklist.completed,
                completed_by_name: checklist.completed_by_name,
                completed_on: checklist.completed_on,
                checklist: [
                    {
                        key: 'resume_filed', 
                        value: checklist.resume_filed, 
                        label: 'Resume filed',
                        header: 'Human Resources & Payroll'
                    },
                    {
                        key: 'employment_offer_signed', 
                        value: checklist.employment_offer_signed, 
                        label: 'Offer of employment signed & initialed in all corners'
                    },
                    {
                        key: 'onboarding_package_completed', 
                        value: checklist.onboarding_package_completed, 
                        label: 'Complete onboarding package'
                    },
                    {
                        key: 'banking_info_received', 
                        value: checklist.banking_info_received, 
                        label: 'Banking information received (void cheque or bank print out)'
                    },
                    {
                        key: 'tour_completed', 
                        value: checklist.tour_completed, 
                        label: 'Office/Shop tour (bathrooms, lunchrooms, lockers, location of PPE, muster, fire extinguishers, First Aid kits, evacuation alarms)'
                    },
                    {
                        key: 'added_to_timesheet', 
                        value: checklist.added_to_timesheet, 
                        label: 'Add to Timesheets (Wasp/QR code)'
                    },
                    {
                        key: 'time_adjustment_completed', 
                        value: checklist.time_adjustment_completed, 
                        label: 'Complete Time Adjustment Sheet, if required'
                    },
                    {
                        key: 'reimbursement_form_completed', 
                        value: checklist.reimbursement_form_completed, 
                        label: 'Complete Reimbursement Form, if required'
                    },
                    {
                        key: 'added_to_timesheet_summary', 
                        value: checklist.added_to_timesheet_summary, 
                        label: 'Add to Timesheet Summary (email Morgan)'
                    },
                    {
                        key: 'employee_record_folder_created', 
                        value: checklist.employee_record_folder_created, 
                        label: 'Create employee record folder in Employee Records'
                    },
                    {
                        key: 'added_to_intranet', 
                        value: checklist.added_to_intranet, 
                        label: 'Add to Intranet'
                    },
                    {
                        key: 'invited_to_benefits', 
                        value: checklist.invited_to_benefits, 
                        label: 'Invite employee to enrol in Canada Life benefit'
                    },
                    {
                        key: 'benefits_waiting_peroid', 
                        value: checklist.benefits_waiting_peroid,
                    },
                    {
                        key: 'added_to_birthday_anniversary', 
                        value: checklist.added_to_birthday_anniversary, 
                        label: 'Add to Birthday & Anniversary'
                    },
                    {
                        key: 'added_to_orgchart', 
                        value: checklist.added_to_orgchart, 
                        label: 'Add to Org chart'
                    },
                    {
                        key: 'added_to_quickbooks', 
                        value: checklist.added_to_quickbooks, 
                        label: 'Add employee to QuickBooks'
                    },
                    {
                        key: 'added_to_scotia', 
                        value: checklist.added_to_scotia, 
                        label: 'Add employee banking information in Scotia Connect'
                    },
                    {
                        key: 'wage_negotiation_reminders_made', 
                        value: checklist.wage_negotiation_reminders_made, 
                        label: 'Make reminders if any negotiated future wage updates'
                    },
                    {
                        key: 'welcome_email_sent', 
                        value: checklist.welcome_email_sent, 
                        label: 'Ensure welcome email is sent'
                    },
                    {
                        key: 'welcome_gift_provided', 
                        value: checklist.welcome_gift_provided, 
                        label: 'Provide welcome gift'
                    },
                    {
                        key: 'picture_taken', 
                        value: checklist.picture_taken, 
                        label: 'Take picture of employee to be added to the intranet'
                    },
                    {
                        key: 'has_referral', 
                        value: checklist.has_referral, 
                    },
                    {
                        key: 'electronic_file_documents_scanned', 
                        value: checklist.electronic_file_documents_scanned, 
                        label: 'Scan all documents for electronic file'
                    },
                    {
                        key: 'safety_orientation_completed', 
                        value: checklist.safety_orientation_completed, 
                        label: 'New Hire Safety Orientation completed',
                        header: 'Health & Safety'
                    },
                    {
                        key: 'safety_form_signed', 
                        value: checklist.safety_form_signed, 
                        label: 'New Hire Safety Form signed'
                    },
                    {
                        key: 'exams_marked', 
                        value: checklist.exams_marked, 
                        label: 'Mark all exams'
                    },
                    {
                        key: 'whmis_certificate_made', 
                        value: checklist.whmis_certificate_made, 
                        label: 'Make WHMIS certificate'
                    },
                    {
                        key: 'added_to_hs_folder', 
                        value: checklist.added_to_hs_folder, 
                        label: 'Add employee to H&S folder: Training – Employee Records'
                    },
                    {
                        key: 'training_certificates_in_hs', 
                        value: checklist.training_certificates_in_hs, 
                        label: 'Put copies of all training certificates in H&S folder'
                    },
                    {
                        key: 'added_to_training_matrix', 
                        value: checklist.added_to_training_matrix, 
                        label: 'Add employee to training matrix'
                    },
                    {
                        key: 'added_name_to_hs_sheet', 
                        value: checklist.added_name_to_hs_sheet, 
                        label: 'Add employee name to H&S meeting sign-in sheet'
                    },
                    {
                        key: 'driver_consent_scanned', 
                        value: checklist.driver_consent_scanned, 
                        label: 'Scan Drivers Abstract Consent Form'
                    },
                    {
                        key: 'insurance_consent_scanned', 
                        value: checklist.insurance_consent_scanned, 
                        label: 'Scan Insurance Consent Form'
                    },
                    {
                        key: 'drivers_list_updated', 
                        value: checklist.drivers_list_updated, 
                        label: 'Update drivers list'
                    },
                    {
                        key: 'insurance_emailed', 
                        value: checklist.insurance_emailed, 
                        label: 'Email insurance'
    ,               }
                ]
            } 
            onboardingTodos.push(formattedChecklistData)
        }

        res.status(200).json({ message: `Onboarding to-do data retrieved`, color: 'success', data: onboardingTodos });
    } catch (e) {
        res.status(500).json({ message: `Something went wrong retrieving onboarding to-do data`, color: 'error', error: e });
        console.log(e);
    }
}

const updateOnboardingTodos = async (req, res) => {
    /* Updates all onboarding todos */
    try {
        const { new_todos, completed_on, completed_by_id } = req.body.update_details

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
                completed_on: todo.completed ? completed_on : todo.completed_on,
                completed_by_id: todo.completed ? completed_by_id : todo.completed_by_id, // if completed, add id of who completed
				...updatedChecklist
			}
			updatedTodos.push(updatedTodo)
			updatedTodosIds.push(todo.id)
		}

        // update each row in table
        for (let i = 0; i < updatedTodos.length; i++) {
            await knex(postOnboardingChecklistsDB)
                .update(updatedTodos[i])
                .where({id: updatedTodosIds[i].toString()})
        }

        res.status(200).json({ message: 'Onboarding to-do changes saved', color: 'success' });
    } catch (e) {
        res.status(500).json({ message: 'Problem saving onboarding to-do changes', color: 'error', error: e });
        console.log(e);
    }
}


module.exports = {
    getOnboardingTodos,
    updateOnboardingTodos
}