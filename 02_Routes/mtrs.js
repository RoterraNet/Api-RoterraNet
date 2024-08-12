const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getMaterialTracking = database.getMaterialTracking;
const postMaterialTracking = database.postMaterialTracking;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// MTR_DETAILS
router.use('/:id/mtrs_details', require('./mtrs_details'));

// /mtrs -> PATCH -> TABLE -> get all mtrs paginated
getTableRoute.getTableData(router, getMaterialTracking);

// /mtrs -> POST -> create new mtr
// postRoute.newEntry(router, getMaterialTracking, postMaterialTracking, today_now, 'mtr_id');

router.post('/', async (req, res) => {
	const { values } = req.body;

	try {
		const postNewMTR = await knex(postMaterialTracking)
			.insert({
				created_by: values.created_by,
				created_on: values.created_on,
				po_id: values.po_id,
				po_detail_id: values.po_detail_id,

				manufacture: values.manufacture,
				supplier: values.supplier,
				company: values.company,
			})
			.returning('mtr_id');

		const poUpdateId = await knex(database.postPoDetailDB)
			.where({ id: values.po_detail_id })
			.update({ mtr_id: postNewMTR[0] });

		res.status = 202;
		res.json({ msg: 'New MTR was created', newMTR: postNewMTR[0] });
	} catch (e) {
		console.log('e', e);
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

router.post('/addMTR', async (req, res) => {
	const { values } = req.body;

	try {
		// const postNewMTR = await knex(postMaterialTracking)
		// 	.insert({
		// 		created_by: values.created_by,
		// 		created_on: values.created_on,
		// 		po_id: values.po_id,
		// 		po_detail_id: values.po_detail_id,

		// 		manufacture: values.manufacture,
		// 		supplier: values.supplier,
		// 		company: values.company,
		// 	})
		// 	.returning('mtr_id');

		// const poUpdateId = await knex(database.postPoDetailDB)
		// 	.where({ id: values.po_detail_id })
		// 	.update({ mtr_id: postNewMTR[0] });

		res.status = 202;
		res.json({ msg: 'New MTR was created' });
	} catch (e) {
		console.log('e', e);
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

// /mtrs/:id -> GET -> get one mtr

router.get('/:id', async (req, res) => {
	const id = req.params.id;

	try {
		const getData = await knex(getMaterialTracking).select('*').where({ mtr_id: id });
		res.status = 202;
		res.json(getData);
	} catch (e) {
		console.log('e', e);
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

getRoute.getById(router, getMaterialTracking, 'mtr_id');

// /mtrs/:id -> PUT -> edit one mtr
putRoute.editById(router, getMaterialTracking, postMaterialTracking, today_now, 'mtr_id');

// /mtrs/:id -> DELETE -> delete one mtr
deleteRoute.deleteRoute(router, postMaterialTracking, today_now, 'mtr_id');

module.exports = router;
