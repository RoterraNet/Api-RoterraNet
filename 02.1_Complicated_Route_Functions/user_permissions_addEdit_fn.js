const knex = require('../01_Database/connection');
const database = require('../01_Database/database');

exports.AddUpdateAllUserPermissions = async (values, user_id) => {
	console.log('made it', user_id);
	console.log(values);
	if (user_id == undefined) return;
	await AddUpdatePermissions(
		'roterranet.quotes_permissions',
		[
			'quote_create',
			'quote_read',
			'quote_update',
			'quote_delete',
			'quote_manager',
			'quote_limit_self',
			'quote_limit_other',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.contact_permissions',
		['contact_create', 'contact_read', 'contact_update', 'contact_delete', 'contact_manager'],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.customer_permissions',
		[
			'customer_create',
			'customer_read',
			'customer_update',
			'customer_delete',
			'customer_manager',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.po_permissions',
		[
			'po_create',
			'po_read',
			'po_update',
			'po_delete',
			'po_manager',
			'po_limit_self',
			'po_limit_other',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.users_permissions',
		['user_create', 'user_read', 'user_update', 'user_delete', 'user_manager'],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.projects_permissions',
		[
			'project_create',
			'project_read',
			'project_update',
			'project_delete',
			'project_manager',
			'project_limit_self',
			'project_limit_other',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.workorders_permissions',
		[
			'workorder_create',
			'workorder_read',
			'workorder_update',
			'workorder_delete',
			'workorder_manager',
			'workorder_limit_self',
			'workorder_limit_other',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.suppliers_permissions',
		[
			'supplier_create',
			'supplier_read',
			'supplier_update',
			'supplier_delete',
			'supplier_manager',
		],
		values,
		user_id
	);
	await AddUpdatePermissions(
		'roterranet.manufacturing_permissions',
		['manufacturing', 'plasma_table_operator'],
		values,
		user_id
	);
	await AddUpdatePermissions('roterranet.users', ['company', 'user_rights'], values, user_id);

	await AddUpdatePermissions(
		'roterranet.logistics_permissions',
		[
			'logistics_create',
			'logistics_read',
			'logistics_update',
			'logistics_delete',
			'logistics_manager',
		],
		values,
		user_id
	);
};

const AddUpdatePermissions = async (postPermissionDB, permissions_names, values, user_id) => {
	// create object of permissions
	let new_permissions = {};
	permissions_names.forEach((permission_name) => {
		if (permission_name.includes('limit')) {
			new_permissions[permission_name] = values[permission_name] || 0;
		} else {
			new_permissions[permission_name] = values[permission_name] || false;
		}
	});

	// Check if user has permissions in the database
	// 		Yes => Update permissions
	// 		No => insert permissions
	const response = await knex(postPermissionDB).select('user_id').where('user_id', '=', user_id);
	const UpdatePermissions = response[0]?.user_id;

	try {
		if (UpdatePermissions) {
			await knex(postPermissionDB).update(new_permissions).where('user_id', '=', user_id);
		} else {
			await knex(postPermissionDB).insert({ user_id: user_id, ...new_permissions });
		}
	} catch (e) {
		console.log(e);
	}
};
