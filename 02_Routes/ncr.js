const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const { postUserNotification } = require('./userNotifications/userNotifications');

const getNcrDB = database.getNcrDB;
const postNcrDB = database.postNcrDB;

const getNcrDepartmentsDB = database.getNcrDepartmentsDB;

router.get(`/table`, async (req, res) => {
	const page = req.query.page;
	const perPage = req.query.perPage;

	const paginatedTable = await knex(getNcrDB)
		.select(
			'id',
			'project_id',
			'created_on',
			'created_by_name',
			'created_by',
			'classification',
			'supplier_id',
			'customer_id',
			'internal_department',
			'defect_code',
			'detail',
			'quantity',
			'status',
			'labor_cost',
			'other_cost',
			'material_cost'
		)
		.where({ deleted: false })
		.paginate({
			perPage: perPage,
			currentPage: page,
			isLengthAware: true,
		});

	res.json(paginatedTable);
});

putRoute.editById(router, getNcrDB, postNcrDB, '', 'id');

router.get('/:id', async (req, res) => {
	const { id } = req.params;

	const paginatedTable = await knex(getNcrDB)
		.select(
			'id',
			'project_id',
			'created_on',
			'created_by',
			'created_by_name',
			'classification_name',
			'classification',
			'supplier_id',
			'supplier_id',
			'supplier_name',
			'customer_id',
			'customer_name',
			'internal_department',
			'department_label',
			'defect_code',
			'detail',
			'quantity',
			'status',
			'initial_review_by',
			'initial_review_on',
			'disposition_review_by',
			'disposition_review_on',
			'disposition',
			'corrective_action',
			'containment',
			'material_cost',
			'labor_cost',
			'other_cost',
			'containment_review_by',
			'containment_review_id',
			'containment_review_on',
			'rca_id'
		)
		.where({ deleted: false })
		.andWhere({ id: id });

	res.json(paginatedTable);
});

router.post('/', async (req, res) => {
	const { values } = req.body;
	const insertData = await knex(postNcrDB)
		.insert({ ...values })
		.returning('*');

	const listOfUsersToNotify = await knex(database.getUsersPermissionsDB)
		.select('user_id')
		.whereRaw(`3 >= user_rights`)
		.andWhere({ deleted: 0 });
	console.log(listOfUsersToNotify);

	listOfUsersToNotify.forEach(({ user_id }) => {
		postUserNotification(
			user_id,
			'New NCR was Created',
			`An NCR was created for ${insertData[0].project_id}`,
			new Date(),
			`qualitycontrol/${insertData[0].id}`,
			'ncr'
		);
	});

	res.json(insertData);
});

router.get('/departments/all', async (req, res) => {
	const getDepartments = await knex(getNcrDepartmentsDB).select('label', 'id');

	res.json(getDepartments);
});

module.exports = router;
