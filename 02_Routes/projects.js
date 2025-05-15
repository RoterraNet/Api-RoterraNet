const express = require('express');
const router = express.Router();
const datefns = require('date-fns');
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');
const SearchBuilder = require('./RouteCreaters/RouteHelpers/SearchBuilder');

const getProjectsDB = database.getProjectsDB;
const postProjectsDB = database.postProjectsDB;
const postWorkorder_id = database.postWorkorderIdDB;
const getProjectsEmailListDB = database.getProjectsEmailListDB;

const { sendMail } = require('../04_Emails/00_mailer');

const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

const { createProjectEmailBody } = require('../04_Emails/Project Emails/newProjectEmail');
const authorize = require('./Authorization/authorization');

const makeEmailObject = (emailBody, contact_email, email_subject) => {
	const emailObject = {
		from: 'intranet@roterra.com',
		to: contact_email || `it@roterra.com`,
		subject: email_subject,
		html: emailBody, // html body
	};
	return emailObject;
};

// JOINED ROUTES   ///////////////////////////////////////////////////////////////////////////////////////////////
// PROJECT CONTACTS
router.use('/:id/projects_contacts', require('./projects_contacts'));
// PROJECT NOTES
router.use('/:id/projects_notes', require('./projects_notes'));

// /project -> PATCH -> TABLE -> get all projects paginated
getTableRoute.getTableData(router, getProjectsDB);

router.get(`/table`, authorize(), async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);
	console.log(getProjectsDB);

	const paginatedTable = await knex(getProjectsDB)
		.select(
			'workorder_id',
			'id',
			'project',
			'customer_name',
			'customer_id',
			'contact_id',
			'contact_name',
			'projectmanager_name',
			'project_status',
			'project_technology',
			'contract_total',
			'invoiced_total',
			'created_on',
			'deleted'
		)
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;
					console.log(columnId);
					if (columnId === 'contract_total') {
						builder.whereBetween(
							columnId,
							filterValue.map((each) => (each === '' ? 0 : parseFloat(each)))
						);
					} else {
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
					}
				});
			}
			if (!!globalFilter) {
				builder.whereRaw(`${getProjectsDB}.*::text iLIKE ?`, [`%${globalFilter}%`]);
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

	res.status(200).json(paginatedTable);
});

/**
 * Function Posts new Project to DB
 * @author   Hasan Alghanim
 * @param    {String} values   			Gets the values from req.Body
 * @description 						When post gets called, Project gets created in project DB
 * @description 						A base workorder gets created to obtain workorder id "Ex 811XXXX"
 * @description 						Updates project with new workorder ID.
 * @return   {Object} 					Object of newly created/updated project
 * @route                               POST - > '/'
 */
router.post('/', async (req, res) => {
	const { values, user_id } = req.body;
	try {
		newProjectId = await knex(postProjectsDB)
			.insert({ ...values })
			.returning('id');

		createWorkOrderId = await knex(postWorkorder_id)
			.insert({ project_id: parseInt(newProjectId) })
			.returning('*');
		workOrderIdRes = createWorkOrderId?.[0];
		updateProject = await knex(postProjectsDB)
			.update({ workorder_id: workOrderIdRes.workorder_id })
			.where('id', '=', workOrderIdRes.project_id)
			.returning('id');

		res.status(202).send(updateProject);

		emailInfo = await knex(getProjectsDB)
			.select(
				'id',
				'workorder_id',
				'customer_id',
				'customer_name',
				'projectmanager_id',
				'projectmanager_name',
				'created_by',
				'quote_id',
				'purchase_order',
				'project',
				'contract_total',
				'project_technology'
			)
			.where('id', '=', workOrderIdRes.project_id);

		const emailingList = await knex(getProjectsEmailListDB).select().where({ deleted: false });

		emailingList.forEach(({ work_email }) => {
			sendMail(
				makeEmailObject(
					createProjectEmailBody(emailInfo[0]),
					work_email,
					`New Job Created - ${emailInfo[0].workorder_id}`
				)
			);
		});
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: 'This is an error!',
			error: e,
		});
	}
});

// /project/:id -> GET -> get one project
getRoute.getById(router, getProjectsDB, 'id');

// /project/:id -> PUT -> edit one project
putRoute.editById(router, getProjectsDB, postProjectsDB, today_now, 'id');

// /project/:id -> DELETE -> delete one project
deleteRoute.deleteRoute(router, postProjectsDB, today_now, 'id');

module.exports = router;
