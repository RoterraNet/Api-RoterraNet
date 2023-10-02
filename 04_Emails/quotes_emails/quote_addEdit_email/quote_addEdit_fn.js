// const knex = require('../../../01_Database/connection');
const database = require('../../../01_Database/database');
const getUsersDB = database.getUsersDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;

const quote_emails = require('./quote_addEdit_helperFN');
const engineering_assigned_email = quote_emails.engineering_assigned_email;
const engineering_completed_email = quote_emails.engineering_completed_email;
const quote_assigned_email = quote_emails.quote_assigned_email;
const quote_approved_email = quote_emails.quote_approved_email;
const quote_readyForApproval_email = quote_emails.quote_readyForApproval_email;
const engineering_NoBid_email = quote_emails.engineering_NoBid_email;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Determine If Request Approval -> Email Function
exports.add_quote_mail = async (data, user_id) => {
	const eng_contact_email = await knex(getUsersDB)
		.select('work_email')
		.where('user_id', '=', data.eng_contact_id);
	const assigned_user_email = await knex(getUsersDB)
		.select('work_email')
		.where('user_id', '=', data.assigned_to_id);

	// Quote Engineering Assigned to User
	if (
		data.eng_required === true &&
		data.eng_contact_id !== 0
		// &&user_id !== data.eng_contact_id
	) {
		await engineering_assigned_email(data, eng_contact_email[0].work_email);
	}

	// Quote Assigned To New User
	if (data.assigned_to_id !== user_id) {
		//&& user_id !== dataNew.assigned_to_id
		await quote_assigned_email(data, assigned_user_email[0].work_email);
	}
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PO Approved -> Email Function
exports.edit_quote_mail = async (dataOld, dataNew, user_id) => {
	// Engineering Assigned to User

	if (
		dataNew.eng_required == true &&
		dataOld.eng_contact_id !== dataNew.eng_contact_id &&
		user_id !== dataNew.eng_contact_id
	) {
		const eng_contact_email = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', dataNew.eng_contact_id);
		await engineering_assigned_email(dataNew, eng_contact_email[0].work_email);
	}

	// Engineering Completed => Notify Assigned User
	if (
		(dataOld.eng_completed_by_id === false && dataNew.eng_completed_by_id !== false) ||
		dataOld.eng_completed_by_id !== dataNew.eng_completed_by_id
	) {
		const assigned_user_email = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', dataNew.assigned_to_id);
		await engineering_completed_email(dataNew, assigned_user_email[0].work_email);
	}

	// Assigned To New User
	if (dataOld.assigned_to_id !== dataNew.assigned_to_id && user_id !== dataNew.assigned_to_id) {
		const assigned_user_email = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', dataNew.assigned_to_id);
		await quote_assigned_email(dataNew, assigned_user_email[0].work_email);
	}

	// Quote Complete => Sent to Approver
	if (
		dataOld.review_completed_by_id !== dataNew.review_completed_by_id &&
		user_id !== dataNew.review_completed_by_id
	) {
		// Get All Quote Managers
		const quote_managers_emails = await knex(getUsersPermissionsDB)
			.select('work_email')
			.where('quote_manager', '=', true);

		// Send Email to All Quote Managers
		for (let i = 0; i < quote_managers_emails.length; i++) {
			await quote_readyForApproval_email(dataNew, quote_managers_emails[i].work_email);
		}
	}

	// Approved - Notify Assigned Person
	if (dataOld.approved_by_id !== dataNew.approved_by_id && user_id !== dataNew.approved_by_id) {
		const approved_user_email = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', dataNew.approved_by_id);
		await quote_approved_email(dataNew, approved_user_email[0].work_email);
	}
	// NO BID - Notify Eng Person
	if (dataNew.status === 5 && dataOld.eng_required === true) {
		const eng_user_email = await knex(getUsersDB)
			.select('work_email')
			.where('user_id', '=', dataNew.eng_contact_id);

		await engineering_NoBid_email(dataNew, eng_user_email[0].work_email);
	}
};
