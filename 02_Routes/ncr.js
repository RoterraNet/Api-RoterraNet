const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const postRoute = require('./RouteCreaters/post');
const putRoute = require('./RouteCreaters/put');
const { postUserNotification } = require('./userNotifications/userNotifications');
const authorize = require('./Authorization/authorization');

const getNcrDB = database.getNcrDB;
const postNcrDB = database.postNcrDB;

const getNcrDepartmentsDB = database.getNcrDepartmentsDB;

router.get(`/table`, async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;
	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);
	const sql = knex.raw('LEFT(detail, 50) AS summary ');
	const paginatedTable = await knex(getNcrDB)
		.select(
			'id',
			'project_id',
			'created_on',
			'created_by_name',
			'created_by',
			'classification',
			'department_label',
			'customer_name',
			'supplier_name',
			'supplier_id',
			'customer_id',
			'classification_name',
			'internal_department',
			'defect_code',
			'detail',
			'quantity',
			'status',
			'labor_cost',
			'other_cost',
			'material_cost',
			'total_value',
			'rca_id',
			'deleted',
			sql
		)
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					if (columnId === 'total_value') {
						builder.whereBetween(
							columnId,
							filterValue.map((each) => (each === '' ? 0 : parseFloat(each)))
						);
					} else {
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
					}
				});
			}
			if (!!parsedColumnSorting.length) {
				parsedColumnSorting.map((sort) => {
					const { id: columnId, desc: sortValue } = sort;
					const sorter = sortValue ? 'desc' : 'acs';
					console.log(columnId, sortValue, sorter);
					builder.orderBy(columnId, sorter);
				});
			} else {
				builder.orderBy('id', 'desc');
			}
		})
		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	res.json(paginatedTable);
});

router.get(`/table/download`, authorize(), async (req, res) => {
	const sql = knex.raw('LEFT(detail, 50) AS summary ');
	const paginatedTable = await knex(getNcrDB).select(
		'id',
		'created_on',
		'created_by_name',
		'classification',
		'department_label',
		'classification_name',
		'internal_department',
		'defect_code',
		'status',
		'total_value',
		'detail',
		sql
	);
	res.json(paginatedTable);
});

putRoute.editById(router, getNcrDB, postNcrDB, '', 'id');

router.get('/:id', authorize(), async (req, res) => {
	const { id } = req.params;

	const ncrDetail = await knex(getNcrDB)
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

	res.json(ncrDetail);
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
