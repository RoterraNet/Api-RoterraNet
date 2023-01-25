const express = require('express');
const router = express.Router({ mergeParams: true });
const knex = require('../01_Database/connection');
const datefns = require('date-fns');
const database = require('../01_Database/database');

const postPoReceivedDB = database.postPoReceivedDB;

const getPoDetailDB = database.getPoDetailDB;

const postPoDB = database.postPoDB;
const getPoDB = database.getPoDB;

router.post('/', async (req, res) => {
	const { values, user_id } = req.body;
	const { type } = req.query;
	const po_id = values.po_id;

	try {
		let newEntryId;

		// Receive ALL Of PO Detail
		if (type == 'receive_all') {
			// Get Relevant PO Detail
			const response1 = await knex(getPoDetailDB).where('po_detail_id', '=', values.po_detail_id);
			let po_detail = response1[0];
			console.log(po_detail.sum_received_quantity, po_detail, 'made it');
			if (po_detail.quantity > po_detail.sum_received_quantity) {
				console.log('made it 2');
				let remaining_quantity_to_receive = po_detail.quantity - po_detail.sum_received_quantity;
				newEntryId = await knex(postPoReceivedDB)
					.insert({ ...values, received_quantity: remaining_quantity_to_receive })
					.returning('po_receiving_id');
			}
		}
		// Receive PARTIAL of Po Detail
		else {
			newEntryId = await knex(postPoReceivedDB)
				.insert({ ...values, received_quantity: values.received_quantity })
				.returning('po_receiving_id');
		}

		//  -> SELECT OLD po
		const Old_po = (await knex(getPoDB).select('sum_quantity', 'sum_received_quantity', 'status').where('po_id', '=', po_id))[0];
		if (Old_po.status == 4 || Old_po.status == 5) {
			if (Old_po.sum_quantity <= Old_po.sum_received_quantity) {
				await knex(postPoDB).update({ status: 5 }).where('id', '=', po_id);
			} else {
				await knex(postPoDB).update({ status: 4 }).where('id', '=', po_id);
			}
		}

		res.json(newEntryId);
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: 'This is an error!',
		});
	}
});

module.exports = router;
