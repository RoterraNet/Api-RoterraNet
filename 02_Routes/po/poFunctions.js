const knex = require('../../01_Database/connection');
const database = require('../../01_Database/database');
const po_emails = require('../../04_Emails/po_emails/po_approval_email/po_approval_fn');
const po_request_approval_email = po_emails.po_request_approval_email;
const po_approved_email = po_emails.po_approved_email;

const getPoDB = database.getPoDB;
const postPoDB = database.postPoDB;
const getPoDetailDB = database.getPoDetailDB;
const postPoIdDB = database.postPoIdDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;
const getUsersDB = database.getUsersDB;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PO Approved?
exports.po_approval_process = async (user_id, po_id) => {
	//	-> SELECT user po spending limit
	const response2 = await knex(getUsersPermissionsDB)
		.select('po_limit_self')
		.where('user_id', user_id);
	const user_po_limit = response2[0].po_limit_self;

	//	-> SELECT total cost of po
	const response3 = await knex(getPoDB).select('*').where('po_id', '=', po_id);
	let Created_po = response3[0];
	const po_total_cost = Created_po.sum_extended_cost;

	let po_message = '';

	//	-> SELECT all po_details
	let Created_po_details = await knex(getPoDetailDB)
		.select('*')
		.where('po_id', '=', po_id)
		.where({ deleted: false });

	//	-> po_total_cost < user.po_limit
	//  => Approved => Update PO DB - Status = 4 (approved) => CREATE entry PO_id DB to give PO a name
	if (parseFloat(po_total_cost) < parseFloat(user_po_limit)) {
		let po_name;

		const response4 = await knex(postPoIdDB).where({ po_id: po_id });
		const check_if_po = response4[0]?.po_id;
		if (check_if_po !== undefined) {
			po_name = check_if_po.id;
		} else {
			const response5 = await knex(postPoIdDB).insert({ po_id: po_id }).returning('id');
			po_name = response5[0];
		}
		//      => Update Status Of PO => Approved
		await knex(postPoDB).where({ id: po_id }).update({ status: 4 });

		const emailingList = await knex(database.getPoEmailListDB)
			.select()
			.where({ deleted: false });

		emailingList.forEach(({ work_email }) => {
			po_approved_email(Created_po, Created_po_details, work_email);
		});

		po_message = `PO is Approved. PO # is ${po_name}`;
	}
	// po limit out of range
	else if (po_total_cost > 1000000000) {
		po_message = `PO cost is very high. Please go in and verify this cost is correct. Thanks`;
	}
	//	-> po_total_cost > user.po_limit => Request Approval => Find User with Approval Limit => Send User Email
	else {
		//  Status => awaiting approval
		await knex(postPoDB).where({ id: po_id }).update({ status: 3 });
		//		=> Find Manager with Approval Limit High Enough
		const manager_info = await recursiveFindManagerWithPOLimit(user_id, po_total_cost);
		//		=> Send Manager Email to Approve PO
		po_request_approval_email(Created_po, Created_po_details, manager_info.work_email);

		po_message = `PO is over your approval limit and requires approval.\n\nYou will be notified by e-mail when your PO is approved.\n\n Your order is being approved by ${manager_info.first_name} ${manager_info.last_name} \n\nThanks`;
	}

	return po_message;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Find Manager with PO Approval Limit High enough to approve
// Recursive Function

const recursiveFindManagerWithPOLimit = async (user_id, po_total_cost) => {
	// Get Manger ID
	const response1 = await knex(getUsersDB).select('manager').where('user_id', '=', user_id);
	const manager_id = response1[0].manager;

	// Find manager approval limit
	const response2 = await knex(getUsersPermissionsDB)
		.select('po_limit_other')
		.where('user_id', '=', manager_id);
	const manager_po_limit_other = response2[0].po_limit_other;
	// console.log(user_id, manager_po_limit_other, po_total_cost, parseFloat(manager_po_limit_other) > po_total_cost);

	// Manager Limit > PO total cost
	if (parseFloat(manager_po_limit_other) > po_total_cost) {
		const response3 = await knex(getUsersDB).select('*').where('user_id', '=', manager_id);
		const manager_info = response3[0];
		// console.log('made it', manager_info);
		return manager_info;
	}
	// Manager Limit Not High Enough => Find that Manager's Manager PO Limit
	else {
		return recursiveFindManagerWithPOLimit(manager_id, po_total_cost);
	}
};
