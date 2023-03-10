// Database Info
const { parse } = require('date-fns');
const knex = require('../01_Database/connection');

const database = require('../01_Database/database');

const getPoDB = database.getPoDB;
const postPoDB = database.postPoDB;

const getPoDetailDB = database.getPoDetailDB;
const postPoDetailDB = database.postPoDetailDB;

const postPoEditedDB = database.postPoEditedDB;

const postPoDetailEditedDB = database.postPoDetailEditedDB;

const postPoIdDB = database.postPoIdDB;

const getUsersPermissionsDB = database.getUsersPermissionsDB;

const getUsersDB = database.getUsersDB;

// Email
const po_emails = require('../04_Emails/po_emails/po_approval_email/po_approval_fn');
const po_request_approval_email = po_emails.po_request_approval_email;
const po_approved_email = po_emails.po_approved_email;
const po_rejected_email = po_emails.po_rejected_email;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ADD PO
//
// Put New PO in DB
//        -> GET NEW po, po_detail
//        -> CREATE new entries in po
//		  -> CREATE new entries in po_detail
// PO Approved?
//		  -> SELECT user po spending limit
//		  -> SELECT sum(extended_cost) as po_total_cost NEW po_detail
//		  -> po_total_cost < user.po_limit => Approved
//				=> Verify if PO already has PO_name
//					=> Give PO Name if no name
//				=> Update PO DB - Status = 4 (approved)
//				=> CREATE entry PO_id DB to give PO a name
// 				=> Sent Email To Admin (Morgan) notifying about PO
//		  -> po_total_cost > user.po_limit => Request Approval
//				=> Update PO DB - Status = 3 (awaiting approval)
//				=> Find Manager with Approval Limit High Enough
//				=> Send Manager Email to Approve PO
// 				=> Sent Email To Admin (Morgan) notifying about PO

// /po -> POST -> create new po
exports.po_add = (router) => {
	return router.post('/', async (req, res) => {
		try {
			const { values } = req.body;

			//	-> GET NEW po, po_detail
			let New_po_details = values.po_details;
			delete values.po_id;
			delete values.po_name;
			delete values.po_details;

			let New_po = values;
			let user_id = New_po.created_by;
			//  -> CREATE new entries in po
			console.log('this is data', New_po);
			const po_id = (await knex(postPoDB).insert(New_po).returning('id'))[0];
			console.log('return ID', po_id);
			// 		//	-> CREATE new entries in po_detail
			const New_po_details_AND_po_id = New_po_details.map((po_detail) => {
				po_detail.id = po_detail.po_detail_id;
				const gl_id = po_detail.gl.gl_id;
				const gl_detail_id = po_detail.gl_detail.gl_detail_id;
				delete po_detail.po_detail_id;
				delete po_detail.id;
				delete po_detail.gl;
				delete po_detail.sum_received_quantity;
				delete po_detail.received_status;
				delete po_detail.gl_detail_description;
				delete po_detail.gl_detail_code;
				delete po_detail.gl_description;
				delete po_detail.received_items;
				delete po_detail.gl_detail;

				// console.log({ ...po_detail, po_id: po_id, gl_id: gl_id, gl_detail_id: gl_detail_id });
				return { ...po_detail, po_id: po_id, gl_id: gl_id, gl_detail_id: gl_detail_id };
			});

			await knex(postPoDetailDB).insert(New_po_details_AND_po_id);

			// PO Approved?
			const po_message = await po_approval_process(user_id, po_id);

			res.json({ po_id: po_id, po_message: po_message });
		} catch (e) {
			console.log(e);
		}
	});
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Edit PO -> Determine if Manager Needs to Approve -
//
// Put Edited PO in DB
//        -> GET NEW po, po_detail
//        -> SELECT OLD po
//        -> SELECT OLD po_detail
//        -> CREATE new entries in po_edited 		- OLD po 		=> po_edited,
//		  -> CREATE new entries in po_detail_edited - OLD po_detail => po_detail_edited,
//		If(po_update) {
//        -> UPDATE new entries in po
//      }
// 		If(po_detail_update) {
// 		  -> DELETE, CREATE, UPDATE removed po_detail
//		}
// PO Approved?
//		  -> SELECT user po spending limit
//		  -> SELECT sum(extended_cost) as po_total_cost NEW po_detail
//		  -> po_total_cost < user.po_limit => Approved
//				=> Verify if PO already has PO_name
//					=> Give PO Name if no name
//				=> Update PO DB - Status = 4 (approved)
//				=> CREATE entry PO_id DB to give PO a name
// 				=> Sent Email To Admin (Morgan) notifying about PO
//		  -> po_total_cost > user.po_limit => Request Approval
//				=> Update PO DB - Status = 3 (awaiting approval)
//				=> Find Manager with Approval Limit High Enough
//				=> Send Manager Email to Approve PO
// 				=> Sent Email To Admin (Morgan) notifying about PO

exports.po_edit = (router) => {
	return router.put('/:id', async (req, res) => {
		const { values } = req.body;
		const { type } = req.query;

		//	-> GET NEW po, po_detail
		let Submitted_po_details = values.po_details;
		delete values.po_details;
		let Submitted_po = values;
		const po_id = Submitted_po.po_id;
		let user_id = Submitted_po.updated_by;
		let po_message = '';
		// If you are trying to Approve PO
		if (type == 'approval') {
			delete Submitted_po.po_id;

			//  -> SELECT OLD po
			const Old_po = (
				await knex(getPoDB)
					.select(
						'sum_quantity',
						'sum_received_quantity',
						'status',
						'requisitioned_by_work_email'
					)
					.where('po_id', '=', po_id)
			)[0];

			// Approved
			if (Submitted_po.status == 4) {
				if (Old_po.sum_quantity <= Old_po.sum_received_quantity) {
					// Received
					Submitted_po.status = 5;
				}
				await knex(postPoDB).update(Submitted_po).where('id', '=', po_id);

				// Verify if PO has PO # already created
				const response = await knex(postPoIdDB).where({ po_id: po_id });
				const verifyPONumberCreated = response[0]?.po_id;
				if (!verifyPONumberCreated) {
					await knex(postPoIdDB).insert({ po_id: po_id });
				}

				// GETS the most Up to Date PO information from DB
				const get_newly_updated_po = await knex(getPoDB)
					.select('*')
					.where('po_id', '=', po_id);
				let created_po_details = await knex(getPoDetailDB)
					.select('*')
					.where('po_id', '=', po_id);

				await knex(getUsersDB)
					.select('manager')
					.where({ user_id: get_newly_updated_po[0].requisitioned_by })
					.then(async (id) => {
						console.log(parseInt(user_id), parseInt(id[0].manager));
						if (parseInt(user_id) !== parseInt(id[0].manager)) {
							const managerEmail = await knex(getUsersDB)
								.select('work_email')
								.where({ user_id: id[0].manager });

							po_approved_email(
								get_newly_updated_po[0],
								created_po_details,
								managerEmail[0].work_email
							);
						}
					});

				po_approved_email(
					get_newly_updated_po[0],
					created_po_details,
					get_newly_updated_po[0].requisitioned_by_work_email
				);
				po_approved_email(
					get_newly_updated_po[0],
					created_po_details,
					'mresler@roterra.com'
				);
				po_approved_email(get_newly_updated_po[0], created_po_details, 'gene@roterra.com');
			}
			// Rejected
			if (Submitted_po.status == 2) {
				await knex(postPoDB).update(Submitted_po).where('id', '=', po_id);

				// GETS the most Up to Date PO information from DB
				const get_newly_updated_po = await knex(getPoDB)
					.select('*')
					.where('po_id', '=', po_id);
				let created_po_details = await knex(getPoDetailDB)
					.select('*')
					.where('po_id', '=', po_id);
				po_rejected_email(
					get_newly_updated_po[0],
					created_po_details,
					get_newly_updated_po[0].requisitioned_by_work_email
				);
			}
			// If you are trying to Update Comments
		} else if (type == 'comments') {
			delete Submitted_po.po_id;
			await knex(postPoDB).update(Submitted_po).where('id', '=', po_id);
			po_message = 'PO Comments Updated';
			// If you are trying to Update general PO info
		} else if (type == 'edit_po') {
			// console.log(2.1);
			delete Submitted_po.po_id;
			await knex(postPoDB).update(Submitted_po).where('id', '=', po_id);
			po_message = await po_approval_process(user_id, po_id);
			// If you are trying to update PO Details
		} else {
			try {
				// console.log(values, type);

				//  -> SELECT OLD po
				const Old_po = (await knex(postPoDB).select('*').where('id', '=', po_id))[0];
				Old_po.po_id = Old_po.id;
				delete Old_po.id;
				// -> SELECT OLD po_detail
				const response2 = await knex(postPoDetailDB).select('*').where('po_id', '=', po_id);
				const Old_po_details = response2.map((old_po_detail) => {
					old_po_detail.po_detail_id = old_po_detail.id;
					delete old_po_detail.id;
					delete old_po_detail.received;
					delete old_po_detail.gl_name;
					delete old_po_detail.gl_detail_name;
					return old_po_detail;
				});

				// -> CREATE new entries in po_edited 		- OLD po 		=> po_edited,
				const po_edited_id = (
					await knex(postPoEditedDB)
						.insert({
							...Old_po,
							updated_by: Submitted_po.updated_by,
							updated_on: Submitted_po.updated_on,
							edit_reason_comment: Submitted_po.edit_reason_comment,
						})
						.returning('po_edited_id')
				)[0];
				// console.log({ po_edited_id });
				// -> CREATE new entries in po_detail_edited - OLD po_detail => po_detail_edited,
				const Created_po_details_edited = Old_po_details.map((old_po_detail) => {
					return { ...old_po_detail, po_edited_id: po_edited_id };
				});
				const po_details_edited_id = await knex(postPoDetailEditedDB)
					.insert(Created_po_details_edited)
					.returning('po_detail_edited_id');
				// console.log({ po_details_edited_id });
				// console.log(2);

				// -> UPDATE new entries in po
				if (type == 'edit_po') {
					// console.log(2.1);

					await knex(postPoDB).update(Submitted_po).where('id', '=', po_id);
					po_message = `PO General Information Changed`;
				}
				// console.log('2.2');
				// -> DELETE, CREATE, UPDATE removed po_detail
				// console.log(type);
				if (type == 'edit_po_details') {
					// console.log('2.3.1');
					let Existing_po_details = [];
					let Need_Creating_po_details = [];
					// console.log('2.3');

					Submitted_po_details.forEach((po_detail) => {
						po_detail.gl_id = po_detail.gl.gl_id;
						po_detail.gl_detail_id = po_detail.gl_detail.gl_detail_id;
						delete po_detail.gl;
						delete po_detail.gl_detail;
						delete po_detail.gl_description;
						delete po_detail.gl_detail_code;
						delete po_detail.gl_detail_description;
						delete po_detail.received_status;
						delete po_detail.received_items;
						delete po_detail.sum_received_quantity;

						if (po_detail.po_detail_id == 'new') {
							delete po_detail.po_detail_id;
							Need_Creating_po_details.push({ ...po_detail, po_id: po_id });
						} else {
							Existing_po_details.push(po_detail);
						}
					});
					// console.log({ Existing_po_details });
					// console.log({ Need_Creating_po_details });
					// Create New PO Details
					if (Need_Creating_po_details.length > 0) {
						// Delete Below => id to po_detail_id
						// Delete Above
						// console.log(Need_Creating_po_details);
						await knex(postPoDetailDB).insert(Need_Creating_po_details); // Need_Creating_po_details => after delete
						// console.log('3');
					}

					// Get PO Details ID's => Client Sent
					// console.log(3.1);
					let Existing_po_details_ids = Existing_po_details.map(
						(existing_po_detail) => existing_po_detail.po_detail_id
					);
					// console.log(3.2);

					// Delete PO's that were removed => Check to See if any PO Details Deleted
					// console.log(Old_po_details);

					const Delete_po_details = Old_po_details.filter(
						(old_po_detail) =>
							!Existing_po_details_ids.includes(old_po_detail.po_detail_id)
					);
					// console.log(3.3);

					const Delete_po_details_ids = Delete_po_details.map(
						(delete_po_detail) => delete_po_detail.po_detail_id
					);
					// console.log(3.4);
					// console.log({ Delete_po_details_ids });
					// console.log(knex(postPoDetailDB).whereIn('id', Delete_po_details_ids).delete().toString());
					if (Delete_po_details_ids.length > 0) {
						await knex(postPoDetailDB).whereIn('id', Delete_po_details_ids).delete();
					}
					// console.log(4);

					// Update Remaining PO Details that are left
					const Update_po_details_queries = Existing_po_details.map((po_detail) => {
						const po_detail_id = po_detail.po_detail_id;
						delete po_detail.po_detail_id;
						return knex(postPoDetailDB).where('id', po_detail_id).update(po_detail);
					});
					// console.log(Update_po_details_queries.map((x) => x.toString()));
					await Promise.all(Update_po_details_queries);
					// console.log(Update_po_details_queries);

					// console.log(5);
					// PO Approved?
					po_message = await po_approval_process(user_id, po_id);
					// console.log(6);
				}
			} catch (e) {
				console.log('error message add po_details', e);
				res.status(400).send({ po_id: null, po_message: `This is an error! ${e}` });
			}
		}
		res.json({ po_id: po_id, po_message: po_message });
	});
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PO Approved?
const po_approval_process = async (user_id, po_id) => {
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
	let Created_po_details = await knex(getPoDetailDB).select('*').where('po_id', '=', po_id);

	//	-> po_total_cost < user.po_limit
	//  => Approved => Update PO DB - Status = 4 (approved) => CREATE entry PO_id DB to give PO a name
	if (parseFloat(po_total_cost) < parseFloat(user_po_limit)) {
		let po_name;

		const response4 = await knex(postPoIdDB).where({ po_id: po_id });
		const check_if_po = response4[0]?.po_id;
		console.log(check_if_po);
		if (check_if_po !== undefined) {
			po_name = check_if_po.id;
		} else {
			console.log();
			const response5 = await knex(postPoIdDB).insert({ po_id: po_id }).returning('id');
			console.log(response5);
			po_name = response5[0];
			console.log(2, po_name);
		}
		//      => Update Status Of PO => Approved
		await knex(postPoDB).where({ id: po_id }).update({ status: 4 });
		// 		=> Sent Email To Admin (Morgan) notifying about PO
		// 		=> Sent Email To Prez (Gene) notifying about PO

		po_approved_email(Created_po, Created_po_details, 'mresler@roterra.com');
		po_approved_email(Created_po, Created_po_details, 'gene@roterra.com');

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

		// 		=> Sent Email To Admin (Morgan) notifying about PO
		po_request_approval_email(Created_po, Created_po_details, 'mresler@roterra.com');

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
