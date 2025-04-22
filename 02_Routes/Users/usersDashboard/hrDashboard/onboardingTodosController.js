const express = require('express');
const router = express.Router();
const {
	getOnboardingChecklistsDB,
	postOnboardingChecklistsDB,
	postUsersBenefitsDB,
	postHrTodosBenefitsDB,
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getOnboardingTodos = async (req, res) => {
	/* Gets completed or incompleted, or most recent (if user_id is supplied) onboarding todos */
	try {
		const { completed, user_id } = req.query;
		let onboardingChecklistData;

		if (user_id) {
			onboardingChecklistData = await knex(getOnboardingChecklistsDB)
				.select('*')
				.where({ user_id: user_id })
				.orderBy('completed_on', 'desc')
				.limit(1);
		} else {
			onboardingChecklistData =
				completed == false
					? await knex(getOnboardingChecklistsDB)
							.select('*')
							.where({ completed: completed })
							.orderBy('start_date', 'asc')
							.orderBy('preferred_name', 'asc')
					: await knex(getOnboardingChecklistsDB)
							.select('*')
							.where({ completed: completed })
							.orderBy('completed_on', 'desc')
							.orderBy('preferred_name', 'asc');
		}

		// format todos data
		const todosData = [];
		for (const checklist of onboardingChecklistData) {
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
					start_date: checklist.start_date,
				},
				checklist: {
					resume_filed: checklist.resume_filed,
					employment_offer_signed: checklist.employment_offer_signed,
					onboarding_package_completed: checklist.onboarding_package_completed,
					banking_info_received: checklist.banking_info_received,
					tour_completed: checklist.tour_completed,
					added_to_timesheet: checklist.added_to_timesheet,
					time_adjustment_completed: checklist.time_adjustment_completed,
					reimbursement_form_completed: checklist.reimbursement_form_completed,
					added_to_timesheet_summary: checklist.added_to_timesheet_summary,
					employee_record_folder_created: checklist.employee_record_folder_created,
					added_to_intranet: checklist.added_to_intranet,
					invited_to_benefits: checklist.invited_to_benefits,
					benefits_waiting_period: checklist.benefits_waiting_period,
					added_to_birthday_anniversary: checklist.added_to_birthday_anniversary,
					added_to_orgchart: checklist.added_to_orgchart,
					added_planner_reminders: checklist.added_planner_reminders,
					added_to_quickbooks: checklist.added_to_quickbooks,
					added_to_scotia: checklist.added_to_scotia,
					wage_negotiation_reminders_made: checklist.wage_negotiation_reminders_made,
					welcome_email_sent: checklist.welcome_email_sent,
					welcome_gift_provided: checklist.welcome_gift_provided,
					picture_taken: checklist.picture_taken,
					has_referral: checklist.has_referral,
					referral_from: checklist.referral_from,
					electronic_file_documents_scanned: checklist.electronic_file_documents_scanned,
					safety_orientation_completed: checklist.safety_orientation_completed,
					safety_form_signed: checklist.safety_form_signed,
					exams_marked: checklist.exams_marked,
					whmis_certificate_made: checklist.whmis_certificate_made,
					added_to_hs_folder: checklist.added_to_hs_folder,
					training_certificates_in_hs: checklist.training_certificates_in_hs,
					added_to_training_matrix: checklist.added_to_training_matrix,
					added_name_to_hs_sheet: checklist.added_name_to_hs_sheet,
					driver_consent_scanned: checklist.driver_consent_scanned,
					insurance_consent_scanned: checklist.insurance_consent_scanned,
					drivers_list_updated: checklist.drivers_list_updated,
					insurance_emailed: checklist.insurance_emailed,
				},
			});
		}

		// headers above certain checklist items
		const headers = {
			resume_filed: 'Human Resources & Payroll',
			safety_orientation_completed: 'Health & Safety',
		};

		// labels for checklist items
		const labels = {
			resume_filed: 'Resume filed',
			employment_offer_signed: 'Offer of employment signed & initialed in all corners',
			onboarding_package_completed: 'Complete onboarding package',
			banking_info_received: 'Banking information received (void cheque or bank print out)',
			tour_completed:
				'Office/Shop tour (bathrooms, lunchrooms, lockers, location of PPE, muster, fire extinguishers, First Aid kits, evacuation alarms)',
			added_to_timesheet: 'Add to Timesheets (Wasp/QR code)',
			time_adjustment_completed: 'Complete Time Adjustment Sheet, if required',
			reimbursement_form_completed: 'Complete Reimbursement Form, if required',
			added_to_timesheet_summary: 'Add to Timesheet Summary (email Morgan)',
			employee_record_folder_created: 'Create employee record folder in Employee Records',
			added_to_intranet: 'Add to Intranet',
			invited_to_benefits: 'Invite employee to enrol in Canada Life benefit',
			benefits_waiting_period: 'Benefits waiting period:',
			added_to_birthday_anniversary: 'Add to Birthday & Anniversary',
			added_to_orgchart: 'Add to Org chart',
			added_planner_reminders: 'Add Benefits and RRSP reminder to Planner',
			added_to_quickbooks: 'Add employee to QuickBooks',
			added_to_scotia: 'Add employee banking information in Scotia Connect',
			wage_negotiation_reminders_made: 'Make reminders if any negotiated future wage updates',
			welcome_email_sent: 'Ensure welcome email is sent',
			welcome_gift_provided: 'Provide welcome gift',
			picture_taken: 'Take picture of employee to be added to the intranet',
			has_referral: 'Employee has referral',
			referral_from: 'Referral from:',
			electronic_file_documents_scanned: 'Scan all documents for electronic file',

			safety_orientation_completed: 'New Hire Safety Orientation completed',
			safety_form_signed: 'New Hire Safety Form signed',
			exams_marked: 'Mark all exams',
			whmis_certificate_made: 'Make WHMIS certificate',
			added_to_hs_folder: 'Add employee to H&S folder: Training – Employee Records',
			training_certificates_in_hs: 'Put copies of all training certificates in H&S folder',
			added_to_training_matrix: 'Add employee to training matrix',
			added_name_to_hs_sheet: 'Add employee name to H&S meeting sign-in sheet',
			driver_consent_scanned: 'Scan Drivers Abstract Consent Form',
			insurance_consent_scanned: 'Scan Insurance Consent Form',
			drivers_list_updated: 'Update drivers list',
			insurance_emailed: 'Email insurance',
		};

		res.status(200).json({
			message: `Onboarding to-do data retrieved`,
			color: 'success',
			data: {
				todosData: todosData,
				headers: headers,
				labels: labels,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: `Something went wrong retrieving onboarding to-do data`,
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updateOnboardingTodos = async (req, res) => {
	/* Updates all onboarding todos */
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

			if (newDetails.completed == true && oldDetails.completed == false) {
				updatedTodo.completed = true;
				updatedTodo.completed_by_id = edited_by;
				updatedTodo.completed_on = edited_on;
			}

			// console.log(updatedTodo);

			await knex(postOnboardingChecklistsDB).update(updatedTodo).where({ id: oldDetails.id });

			// automatically update benefits_status and effective_date in users_benefits table when changed
			// and create a benefits checklist if necessary
			if (oldChecklist.benefits_waiting_period !== newChecklist.benefits_waiting_period) {
				let effectiveDate = new Date(newDetails.start_date);

				if (newChecklist.benefits_waiting_period === 'Waiting') {
					effectiveDate.setDate(effectiveDate.getDate() + 90);
				}

				console.log(effectiveDate);
				// set benefits status to 'Waiting' and set calculated effective date
				await knex(postUsersBenefitsDB)
					.update({
						benefits_status: 1,
						effective_date: effectiveDate,
						benefits_updated_by: edited_by,
						benefits_updated_on: edited_on,
					})
					.where({ user_id: newDetails.user_id });

				// upsert benefits checklist
				await knex(postHrTodosBenefitsDB)
					.insert({
						user_id: newDetails.user_id,
						milestone: 'Benefits effective',
						confirmed_enrolment: false,
						emailed_details: false,
						added_benefit_deduction: false,
						updated_intranet_benefits: false,
						completed: false,
						updated_by_id: null,
						updated_on: null,
					})
					.onConflict(['user_id', 'milestone']) // if already exists, update
					.merge();
			}
		}

		res.status(200).json({ message: 'Onboarding to-do changes saved', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem saving onboarding to-do changes',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getOnboardingTodos,
	updateOnboardingTodos,
};
