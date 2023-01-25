const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');

const getRoute = require('./RouteCreaters/get');

const database = require('../01_Database/database');
const getUsersPermissionsDB = database.getUsersPermissionsDB;
const postUsersDB = database.postUsersDB;

const addUpdate_users_permisions = require('../02.1_Complicated_Route_Functions/user_permissions_addEdit_fn');

// /users_permissions/:id -> GET -> get one users permissions
getRoute.getById(router, getUsersPermissionsDB, 'user_id');

// /user/:id -> PUT -> edit one user
//     => Update secure information
//        => username, password, user rights
//        => permissions
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const { values, user_id } = req.body;

	const { supervisor_view } = values;
	delete values.supervisor_view;

	// This function is in 02.1 Complicated Functions
	await addUpdate_users_permisions.AddUpdateAllUserPermissions(values, id);

	const editedEntryId = await knex(postUsersDB)
		.update({
			user_name: values.user_name,
			password: values.password,
			user_rights: values.user_rights,
			updated_on: values.updated_on,
			updated_by: values.updated_by,
			supervisor_view: supervisor_view,
		})
		.where('user_id', '=', id)
		.returning('user_id');

	res.json(editedEntryId);
});

module.exports = router;
