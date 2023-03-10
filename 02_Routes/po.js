const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const datefns = require('date-fns');
const database = require('../01_Database/database');

const deleteRoute = require('./RouteCreaters/delete');
const postFunctionRoute = require('./RouteCreaters/post_function');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putFunctionRoute = require('./RouteCreaters/put_function');

const getPoDB = database.getPoDB;
const postPoDB = database.postPoDB;
const postPoDetailDB = database.postPoDetailDB;

const quote_mail = require('../04_Emails/quotes_emails/quote_addEdit_email/quote_addEdit_fn');
const edit_quote_mail = quote_mail.edit_quote_mail;

const complicated_functions = require('../02.1_Complicated_Route_Functions/po_addEdit_fn');
const po_add = complicated_functions.po_add;
const po_edit = complicated_functions.po_edit;

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// PO DETAILS
router.use('/:id/po_details', require('./po_details'));

// /po -> GET ALL
router.get('/', async (req, res) => {
	const { type, job_number } = req.query;

	let query = knex(getPoDB);

	if (type == 'total_cost') {
		query = query.sum('sum_extended_cost');
	}

	if (job_number) {
		query = query.where({ job_number: job_number });
	}

	const getEntries = await query;

	res.json(getEntries);
});

// po -> PATCH -> TABLE -> get all quotes paginated
getTableRoute.getTableData(router, getPoDB);

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

// po -> POST -> create new quote
po_add(router);

// po/:id -> GET -> get one po
getRoute.getById(router, getPoDB, 'po_id');

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

// po/:id -> PUT -> edit one po
po_edit(router);

// po/:id -> DELETE -> delete one po
router.delete('/:id', async (req, res) => {
	const postDB = postPoDB;
	const delete_one_id_name = 'id';
	const current_day = today_now;

	const { id } = req.params;
	const { user_id } = req.body;

	const deletedEntry = await knex(postDB)
		.update({ deleted_by: user_id, deleted_on: current_day, deleted: 1, status: 1 })
		.where(delete_one_id_name, '=', id);

	res.json({ deletedEntry });
});

module.exports = router;
