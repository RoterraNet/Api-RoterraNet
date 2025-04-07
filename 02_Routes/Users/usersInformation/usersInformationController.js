const express = require('express');
const knex = require('../../../01_Database/connection');
const {
	postUsersDB,
	getUsersPermissionsDB,
	getUsersPermissionsLogsDB,
	postUsersPermissionsLogsDB,
	postPersonalPropertyDB,
	getPersonalPropertyDB,
} = require('../../../01_Database/database');
const {
	AddUpdateAllUserPermissions,
} = require('../../../02.1_Complicated_Route_Functions/user_permissions_addEdit_fn');

const getIntranetPermissions = async (req, res) => {
	try {
		const { user_id } = req.query;
		console.log(`getting user permissions of user ${user_id}`);
		const permissions = await knex(getUsersPermissionsDB)
			.select(
				'quote_read',
				'quote_create',
				'quote_update',
				'quote_delete',
				'quote_manager',
				'customer_read',
				'customer_create',
				'customer_update',
				'customer_delete',
				'customer_manager',
				'contact_read',
				'contact_create',
				'contact_update',
				'contact_delete',
				'contact_manager',
				'project_read',
				'project_create',
				'project_update',
				'project_delete',
				'project_manager',
				'po_read',
				'po_create',
				'po_update',
				'po_delete',
				'po_manager',
				'supplier_read',
				'supplier_create',
				'supplier_update',
				'supplier_delete',
				'supplier_manager',
				'workorder_read',
				'workorder_create',
				'workorder_update',
				'workorder_delete',
				'workorder_manager',
				'user_read',
				'user_create',
				'user_update',
				'user_delete',
				'user_manager',
				'logistics_read',
				'logistics_create',
				'logistics_update',
				'logistics_delete',
				'logistics_manager',
				'company as welder',
				'manufacturing',
				'plasma_table_operator'
			)
			.where({ user_id: user_id });

		const allowed = [];
		const restricted = [];
		for (const [key, value] of Object.entries(permissions[0])) {
			if (key === 'welder') {
				if (value == 1) {
					restricted.push(key);
				} else {
					allowed.push(key);
				}
			} else {
				if (value == true) {
					allowed.push(key);
				} else {
					restricted.push(key);
				}
			}
		}
		allowed.sort();
		restricted.sort();

		res.status(200).json({
			message: 'Permissions retrieved',
			color: 'success',
			data: { allowed: allowed, restricted: restricted },
		});
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving permissions', color: 'error', error: e });
		console.log(e);
	}
};

const updateIntranetPermissions = async (req, res) => {
	try {
		const { user_id, update_details } = req.body;
		console.log('permission update details', update_details);

		// grab full permissions data
		const full_permissions = await knex(getUsersPermissionsDB)
			.select('*')
			.where({ user_id: user_id });

		const {
			new_allowed,
			new_restricted,

			changed_to_restricted,
			changed_to_allowed,
			created_by_id,
			created_on,
		} = update_details;

		const updated_permissions = {};
		for (const permission of new_allowed) {
			if (permission !== 'welder') {
				updated_permissions[permission] = true;
			} else {
				updated_permissions['company'] = 2;
			}
		}
		for (const permission of new_restricted) {
			if (permission !== 'welder') {
				updated_permissions[permission] = false;
			} else {
				updated_permissions['company'] = 1;
			}
		}

		// update full permissions data
		const full_updated = { ...full_permissions[0], ...updated_permissions };
		await AddUpdateAllUserPermissions(full_updated, user_id); // requires entire permission view data for proper updating

		const permission_changes = {
			changed_to_restricted: changed_to_restricted,
			changed_to_allowed: changed_to_allowed,
			num_changed_to_restricted: changed_to_restricted.length,
			num_changed_to_allowed: changed_to_allowed.length,
			num_changed: changed_to_allowed.length + changed_to_restricted.length,
		};

		JSON.stringify(permission_changes);

		const logData = {
			user_id: user_id,
			created_on: created_on,
			created_by_id: created_by_id,
			permission_changes: permission_changes,
		};

		console.log('log to be inserted:', logData);

		await knex(postUsersPermissionsLogsDB).insert(logData);

		res.status(202).json({ message: 'Permissions successfully updated', color: 'success' });
	} catch (e) {
		res.status(500).json({ message: 'Error updating permissions', color: 'error', error: e });
		console.log(e);
	}
};

const getIntranetPermissionsLogs = async (req, res) => {
	try {
		const { user_id } = req.query;
		console.log(`getting user permissions logs of user ${user_id}`);
		const data = await knex(getUsersPermissionsLogsDB)
			.select('created_on', 'created_by_name', 'permission_changes')
			.where({ user_id: user_id });
		res.status(200).json({
			message: 'Permission logs retrieved',
			color: 'success',
			data: data,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving permission logs',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getAccountInformation = async (req, res) => {
	try {
		const { user_id } = req.query;
		console.log(`getting user permissions of user ${user_id}`);
		const data = await knex(getUsersPermissionsDB)
			.select(
				'user_name',
				'user_rights_name',

				'po_limit_self',
				'quote_limit_self',
				'project_limit_self',
				'workorder_limit_self',

				'po_limit_other',
				'quote_limit_other',
				'project_limit_other',
				'workorder_limit_other'
			)
			.where({ user_id: user_id });
		res.status(200).json({ message: 'Limits retrieved', color: 'success', data: data });
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving limits', color: 'error', error: e });
		console.log(e);
	}
};

const updateAccountInformation = async (req, res) => {
	try {
		const { user_id, update_details } = req.body;

		// grab full permissions data
		const full_permissions = await knex(getUsersPermissionsDB)
			.select('*')
			.where({ user_id: user_id });

		// update full permissions data
		const full_updated = { ...full_permissions[0], ...update_details };
		await AddUpdateAllUserPermissions(full_updated, user_id); // requires entire permission view data for proper updating

		res.status(200).json({ message: 'Information has been updated', color: 'success' });
	} catch (e) {
		res.status(500).json({ message: 'Error updating information', color: 'error', error: e });
		console.log(e);
	}
};

const updateGeneralInformation = async (req, res) => {
	try {
		const { user_id, update_details } = req.body;
		const body = req.body;
		const data = await knex(postUsersDB).update(update_details).where({ user_id: user_id });
		res.status(200).json({ message: 'Information has been updated', color: 'success' });
	} catch (e) {
		res.status(500).json({ message: 'Error updating information', color: 'error', error: e });
		console.log(e);
	}
};

const getPersonalProperty = async (req, res) => {
	try {
		const { user_id } = req.query;

		const data = await knex(getPersonalPropertyDB).where({ user_id: user_id });
		res.status(200).json({
			message: 'Personal property retrieved',
			color: 'success',
			data: data,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error retrieving personal property',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const updatePersonalProperty = async (req, res) => {
	try {
		const { updated_items } = req.body.update_details;

		await knex(postPersonalPropertyDB).insert(updated_items).onConflict('item_id').merge();
		res.status(200).json({ message: 'Personal property has been updated', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Error updating personal property',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getIntranetPermissions,
	updateIntranetPermissions,
	getIntranetPermissionsLogs,
	getAccountInformation,
	updateGeneralInformation,
	updateAccountInformation,
	getPersonalProperty,
	updatePersonalProperty,
};
