const express = require('express');
const router = express.Router();
const datefns = require('date-fns');
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');
const addUpdate_users_permisions = require('../02.1_Complicated_Route_Functions/user_permissions_addEdit_fn');

const deleteRoute = require('./RouteCreaters/delete');
const postRoute = require('./RouteCreaters/post');
const getRoute = require('./RouteCreaters/get');
const getTableRoute = require('./RouteCreaters/getTable');
const putRoute = require('./RouteCreaters/put');
const SearchBuilder = require('./RouteCreaters/RouteHelpers/SearchBuilder');

const postUsersDB = database.postUsersDB;
const getUsersDB = database.getUsersDB;
const getQuotesDB = database.getQuotesDB;
const getUsersPermissionsDB = database.getUsersPermissionsDB;

const UsersImages = database.UsersImages;

const XLSX = require('xlsx');
const today_now = datefns.format(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS');

///users -> GET
router.get('/', async (req, res) => {
	const { type } = req.query;
	let getEntries;

	// ?type=active -> Get All Active Users -> Full Name and ID only
	if (type === 'active') {
		getEntries = await knex(getUsersDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.orderBy('first_name', 'asc');
	}

	// ?type=engineers    -> Get All Engineers -> Full Name and ID only
	if (type === 'engineers') {
		getEntries = await knex(getUsersDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere('engineer', '=', true)
			.orderBy('first_name', 'asc');
	}

	// ?type=estimators   -> Get All People Who Can Add A Quote -> Full Name and ID only
	if (type === 'estimators') {
		getEntries = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere('quote_create', '=', true)
			.orderBy('first_name', 'asc');
	}

	// ?type=managers   -> Get Managers -> Full Name and ID only
	if (type === 'managers') {
		// Admin, Senior Manager, Manager, Supervisor <= 4
		getEntries = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere('user_rights', '<=', 4)
			.orderBy('first_name', 'asc');
	}

	// ?type=office_users   -> Get All Office Users -> Full Name and ID only
	if (type === 'office_users') {
		getEntries = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere('company', '=', 1)
			.orderBy('first_name', 'asc');
	}

	// ?type=shop_users   -> Get All Shop Users -> Full Name and ID only
	if (type === 'shop_users') {
		getEntries = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere('company', '=', 2)
			.orderBy('first_name', 'asc');
	}

	if (type === 'plasma_users') {
		getEntries = await knex(getUsersPermissionsDB)
			.select(knex.raw("CONCAT(first_name,' ',last_name) as full_name"), 'user_id')
			.where('deleted', '=', 0)
			.andWhere({ plasma_table_operator: true })
			.orderBy('first_name', 'asc');
	}

	res.json(getEntries);
});

router.get('/prevnextUsers/', async (req, res) => {
	const { id } = req.query;

	const users = await knex(getUsersDB)
		.select('user_id', 'preferred_name')
		.where({ deleted: 0 })
		.orderBy('preferred_name', 'acs');

	const searchUser = (arr, id) => {
		if (arr.length === 0) return -1;
		for (let i = 0; i < arr.length; i++) {
			if (arr[i].user_id === id) return i;
		}
		return -1;
	};
	const currentUserIndex = searchUser(users, parseInt(id));

	res.json([{ previous: users[currentUserIndex - 1], next: users[currentUserIndex + 1] }]);
});

router.get('/validateUsername/', async (req, res) => {
	const { username } = req.query;

	const usernameAvailability = await knex(getUsersDB)
		.select('user_id')
		.where({ user_name: username });

	const available = usernameAvailability.length > 0 ? true : false;

	res.json({ available: available });
});

// /user -> PATCH -> TABLE -> get all users paginated
getTableRoute.getTableData(router, 'roterranet.view_users');

router.get(`/table`, async (req, res) => {
	const page = req.query.page;
	const perPage = req.query.perPage;
	const activeStatus = req.query.activeStatus;

	const search = Object.keys(JSON.parse(req.query.search));
	const newArrayCleaned = [];
	search.map((each) => {
		const parsedObj = JSON.parse(req.query.search)[each];
		parsedObj.filterBy !== '' && newArrayCleaned.push(parsedObj);
	});
	console.log(req.query);

	const paginatedTable = await knex(getUsersDB)
		.select(
			'first_name',
			'user_id',
			'middle_name',
			'last_name',
			'preferred_name',
			'alias_first_name',
			'alias_middle_name',
			'alias_last_name',
			'start_date',
			'birthday',
			'direct_dial',
			'work_extension',
			'work_cell',
			'work_email',
			'position',
			'home_address',
			'home_address2',
			'home_city',
			'home_province',
			'home_postal_code',
			'home_country',
			'home_phone',
			'personal_email',
			'personal_cell',
			'department',
			'department_name',
			'position_name',
			'healthcare_number',
			'ice1name',
			'ice1phone1',
			'vehicle_1',
			'v1_man',
			'v1_license_plate',
			'v1_model',
			'supervisor_view',
			'manager',
			'preferred_name '
		)
		.modify((builder) => {
			SearchBuilder(newArrayCleaned, builder);
			if (activeStatus != 9) builder.where({ deleted: activeStatus });
		})

		.orderBy('preferred_name', 'asc')
		.paginate({
			perPage: perPage,
			currentPage: page,
			isLengthAware: true,
		});

	res.json(paginatedTable);
});

// /user -> POST -> create user
router.post('/', async (req, res) => {
	const { values, user_id } = req.body;

	const newValues = { ...values, first_aider: values.first_aider === true ? 1 : 2 };
	const user_info = getUser_Data(newValues);

	let newEntryId;

	console.log({ user_id });
	try {
		console.log(knex(postUsersDB).insert(user_info).returning('user_id').toString());
		newEntryId = await knex(postUsersDB).insert(user_info).returning('user_id');
		const user_id = newEntryId[0];
		// This function is in 02.1 Complicated Functions
		await addUpdate_users_permisions.AddUpdateAllUserPermissions(values, user_id);

		await knex(database.getNotificationSettingsDB)
			.insert({
				user_id: user_id,
			})
			.onConflict('user_id')
			.merge()
			.returning('*');
	} catch (e) {
		console.log(e);
		return res.status(400).send({
			message: 'This is an error!',
		});
	}
	res.json(newEntryId);
});

// /user/:id -> GET -> get one user
getRoute.getById(router, getUsersDB, 'user_id');

// /user/:id -> PUT -> edit one user
putRoute.editById(router, getUsersDB, postUsersDB, today_now, 'user_id');

// /user/:id -> DELETE -> delete one user
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const { type, senority_debit, start_date, deleted_on, user_id } = req.query;
	let deletedEntry;
	if (type === 'activated') {
		deletedEntry = await knex(postUsersDB)
			.update({
				activated_on: today_now,
				activated_by: user_id,
				start_date: start_date,
				deleted: 0,
				senority_debit: senority_debit,
			})
			.where('user_id', '=', id);
	} else if (type === 'deleted') {
		deletedEntry = await knex(postUsersDB)
			.update({
				deleted_by: user_id,
				deleted_on: deleted_on,
				deleted: 1,
				senority_debit: senority_debit,
			})
			.where('user_id', '=', id);
	} else {
		deletedEntry = await knex(postUsersDB)
			.update({
				deleted_by: user_id,
				deleted_on: deleted_on,
				deleted: 1,
				senority_debit: senority_debit,
			})
			.where('user_id', '=', id);
	}

	res.json({ deletedEntry });
});

router.post('/user_image', async (req, res) => {
	const { user_id, image } = req.body;
	try {
		console.log(knex(UsersImages).insert({ user_id, image }).returning('user_id').toString());
		const uploadImage = await knex(UsersImages).insert({ user_id, image }).returning('user_id');
		res.status(200).send({ message: 'Image Uploaded ', uploadImage });
	} catch (error) {
		res.status(500).send({ message: 'Upload Failed', error: error });
	}
});

router.get('/user_image/', async (req, res) => {
	try {
		console.log('this data', knex(UsersImages).where('user_id', '=', 642).toString());
		const uploadImage = await knex(UsersImages).where('user_id', '=', '642');
		res.status(200).send({ message: 'image ', uploadImage });
	} catch (error) {
		res.status(500).send({ message: 'Failed', error: error });
	}
});

module.exports = router;

// Functions used above
const getUser_Data = (values) => {
	// Create User Info Variable => no permission information

	const {
		user_name,
		password,
		first_name,
		middle_name,
		last_name,
		alias_first_name,
		alias_middle_name,
		alias_last_name,
		start_date,
		senority_debit,
		birthday,
		direct_dial,
		work_extension,
		work_cell,
		work_email,
		manager,
		company,
		user_rights,
		position,
		department,
		created_by,
		created_on,
		updated_by,
		updated_on,
		deleted,
		deleted_by,
		deleted_on,
		home_address,
		home_address2,
		home_city,
		home_province,
		home_postal_code,
		home_country,
		personal_cell,
		home_phone,
		personal_email,
		image,
		first_aider,
		ice1name,
		ice1phone1,
		ice1phone2,
		ice2name,
		ice2phone1,
		ice2phone2,
		po_access,
		quote_access,
		project_access,
		parking_pass,
		v1_license_plate,
		v1_man,
		v1_model,
		v1_colour,
		v2_license_plate,
		v2_man,
		v2_model,
		v2_colour,
		external_access,
		external_password,
		forklift,
		skidsteer,
		crane,
		loader,
		engineer,
		healthcare_number,
		ice1relationship,
		ice2relationship,
		allergies_dietary_concerns,
		medical_concerns,
		boot_tool_allowance,
		activated_on,
		activated_by,
	} = values;

	// Data will go into 'roterranet.users' all other data will go into permissions DB's

	const user_info = {
		user_name: user_name || '',
		password: password || '',
		first_name: first_name || '',
		middle_name: middle_name || '',
		last_name: last_name || '',
		alias_first_name: alias_first_name || '',
		alias_middle_name: alias_middle_name || '',
		alias_last_name: alias_last_name || '',
		start_date: start_date || null,
		senority_debit: senority_debit || 0,
		birthday: birthday || null,
		direct_dial: direct_dial || '',
		work_extension: work_extension || '',
		work_cell: work_cell || '',
		work_email: work_email || '',
		manager: manager || null,
		company: 1,
		user_rights: user_rights || null,
		position: position || null,
		department: department || null,
		created_by: created_by || null,
		created_on: created_on || null,
		updated_by: updated_by || null,
		updated_on: updated_on || null,
		deleted: deleted || 0,
		deleted_by: deleted_by || null,
		deleted_on: deleted_on || null,
		home_address: home_address || '',
		home_address2: home_address2 || '',
		home_city: home_city || '',
		home_province: home_province || '',
		home_postal_code: home_postal_code || '',
		home_country: home_country || '',
		personal_cell: personal_cell || '',
		home_phone: home_phone || '',
		personal_email: personal_email || '',
		image: image || '',
		first_aider: first_aider || 1,
		ice1name: ice1name || '',
		ice1phone1: ice1phone1 || '',
		ice1phone2: ice1phone2 || '',
		ice2name: ice2name || '',
		ice2phone1: ice2phone1 || '',
		ice2phone2: ice2phone2 || '',
		po_access: po_access || 0,
		quote_access: quote_access || 0,
		project_access: project_access || 0,
		parking_pass: parking_pass || '',
		v1_license_plate: v1_license_plate || '',
		v1_man: v1_man || '',
		v1_model: v1_model || '',
		v1_colour: v1_colour || '',
		v2_license_plate: v2_license_plate || '',
		v2_man: v2_man || '',
		v2_model: v2_model || '',
		v2_colour: v2_colour || '',
		external_access: external_access || null,
		external_password: external_password || '',
		forklift: forklift || null,
		skidsteer: skidsteer || null,
		crane: crane || null,
		loader: loader || null,
		engineer: engineer || false,
		healthcare_number: healthcare_number || '',
		ice1relationship: ice1relationship || '',
		ice2relationship: ice2relationship || '',
		allergies_dietary_concerns: allergies_dietary_concerns || '',
		medical_concerns: medical_concerns || '',
		boot_tool_allowance: boot_tool_allowance || '',
		activated_on: activated_on || null,
		activated_by: activated_by || null,
	};
	return user_info;
};

router.get('/tableDownload/download', async (req, res) => {
	const users = database.getUsersDB;
	const benefits = database.getUsersBenefitsDB;

	const queryParams = req.query;

	const search = Object.keys(queryParams);

	const newSearch = [];
	search.map((each) => {
		queryParams[each] === 'true' && newSearch.push(each);
	});

	console.log(newSearch);
	const data = await knex(users)
		.select(newSearch)
		.from(users)
		.leftJoin(benefits, `${users}.user_id`, `${benefits}.user_id`)
		.orderBy('preferred_name', 'asc')

		.modify((builder) => {
			if (queryParams?.['roterranet.view_users.deleted'] !== 'true') {
				builder.where({ [`${users}.deleted`]: 0 });
			}
			if (queryParams?.['roterranet.view_users.birthday'] == 'true') {
				const parsedBirthdays = JSON.parse(queryParams.birthday_dates);
				builder.whereBetween(`${users}.birthday`, [
					parsedBirthdays.birthday_start || '1900-01-01',
					parsedBirthdays.birthday_end || new Date(),
				]);
			}
			if (queryParams?.['roterranet.view_users.start_date'] == 'true') {
				const parsedStartDate = JSON.parse(queryParams.start_date_dates);
				builder.whereBetween(`${users}.start_date`, [
					parsedStartDate.start_date_start || '1900-01-01',
					parsedStartDate.start_date_end || new Date(),
				]);
			}
		});

	const workSheet = XLSX.utils.json_to_sheet(data);
	const workBook = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(workBook, workSheet, 'Data');
	XLSX.writeFile(workBook, 'Data.xlsx');

	res.setHeader('Content-Disposition', 'attachment; filename="Data.xlsx');
	res.setHeader(
		'Content-type',
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	);

	var wbout = XLSX.write(workBook, { bookType: 'xlsx', type: 'buffer' });
	res.send(Buffer.from(wbout));
});
