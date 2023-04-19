const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');

const database = require('../01_Database/database');
const getMaterialTrackingDetails = database.getMaterialTrackingDetails;
const postMaterialTrackingDetails = database.postMaterialTrackingDetails;

const datefns = require('date-fns');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

// /mtrs/:id/mtrs_details -> POST -> create new mtr detail
// postRoute.newEntry(
// 	router,
// 	getMaterialTrackingDetails,
// 	postMaterialTrackingDetails,
// 	today_now,
// 	'id'
// );

router.post('/', async (req, res) => {
	const { values } = req.body;
	console.log('this one');
	let getAllHeats = await knex(getMaterialTrackingDetails)
		.select('heat')
		.where({ mtr_id: values.mtr_id })
		.andWhere({ deleted: 0 });

	// const dbRes = getAllHeats.map((entry) => {
	// 	console.log(parseInt(entry.heat), parseInt(values.heat));

	// 	if (parseInt(entry.heat) === parseInt(values.heat)) {
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// });
	// console.log(dbRes.includes(false));
	// if (dbRes.includes(true)) {
	// 	console.log('dont add');
	// 	return res.send({ msg: 'Heat Already Exists' });
	// } else {
	// 	console.log('add');

	const postNewMTR = await knex(postMaterialTrackingDetails)
		.insert({
			heat: values.heat,
			mtr_id: values.mtr_id,
			hsheet: values.hsheet,
			pipe: values.pipe,
			plate: values.plate,
			wsheet: values.wsheet,
			plate_steel_grade: values.plate_steel_grade,
			created_on: values.created_on,
			created_by: values.created_by,
		})
		.returning('mtr_id');

	return res.send({ mtr_id: postNewMTR[0] });
});

router.get('/:id', async (req, res) => {
	const id = req.params.id;

	try {
		let getAllHeats = await knex(getMaterialTrackingDetails)
			.select('heat', 'id', 'file_name', 'location', 'file_deleted')
			.where({ mtr_id: id })
			.andWhere({ deleted: 0 });

		return res.json(getAllHeats);
	} catch (error) {
		console.log(error);
	}
});

// /mtrs/:id/mtrs_details/:id -> GET -> get one mtr detail
// getRoute.getById(router, getMaterialTrackingDetails, 'id');

router.get('/:id/detail', async (req, res) => {
	const id = req.params.id;

	try {
		let getAllHeats = await knex(getMaterialTrackingDetails)
			.select('*')
			.where({ id: id })
			.andWhere({ deleted: 0 });

		return res.json(getAllHeats);
	} catch (error) {
		console.log(error);
	}
});

router.get('/:id/workorders', async (req, res) => {
	const id = req.params.id;

	try {
		const getData = await knex(database.getWorkordersItemsDetailsDB)
			.select('workorder_item_detail_name', 'workorder_item_id', 'workorder_id')

			.where({ mtr_detail_id: id })
			.distinctOn('workorder_id');

		res.status = 202;
		res.json(getData);
	} catch (e) {
		console.log('e', e);
		res.status = 500;
		res.json({ error: e, msg: 'Something went wrong. Check Error' });
	}
});

// /mtrs/:id/mtrs_details/:id -> PUT -> edit one mtr detail
putRoute.editById(router, getMaterialTrackingDetails, postMaterialTrackingDetails, today_now, 'id');

// /mtrs/:id/mtrs_details/:id -> DELETE -> delete one mtr detail
deleteRoute.deleteRoute(router, postMaterialTrackingDetails, today_now, 'id');

module.exports = router;
