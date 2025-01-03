const express = require('express');
const knex = require('../../../01_Database/connection');
const { getUsersDB,
        postUsersDB,
        getUsersPermissionsDB
 } = require('../../../01_Database/database');

const getIntranetPermissions = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`getting user permissions of user ${id}`);
        const data = await knex(getUsersPermissionsDB)
            .select(
                'quote_read', 'quote_create', 'quote_update', 'quote_delete', 'quote_manager', 
                'customer_read', 'customer_create', 'customer_update', 'customer_delete', 'customer_manager',
                'contact_read', 'contact_create', 'contact_update', 'contact_delete', 'contact_manager',
                'project_read', 'project_create', 'project_update', 'project_delete', 'project_manager',
                'po_read', 'po_create', 'po_update', 'po_delete', 'po_manager',
                'supplier_read', 'supplier_create', 'supplier_update', 'supplier_delete', 'supplier_manager',
                'workorder_read', 'workorder_create', 'workorder_update', 'workorder_delete', 'workorder_manager',
                'user_read', 'user_create', 'user_update', 'user_delete', 'user_manager',
                'logistics_read', 'logistics_create', 'logistics_update', 'logistics_delete', 'logistics_manager',
                'manufacturing', 
                'plasma_table_operator',
            )
            .where({user_id: id});
        res.status(202).json({ message: 'Permissions retrieved', color: 'success', data: data})
    } catch (e) {
        res.status(500).json({ message: 'Error retrieving permissions', color: 'error', error: e });
        console.log(e);
    }
}

const getIntranetLimits = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`getting user permissions of user ${id}`);
        const data = await knex(getUsersPermissionsDB)
            .select(
                'po_limit_self',
                'quote_limit_self',
                'project_limit_self',
                'workorder_limit_self',

                'po_limit_other',
                'quote_limit_other',
                'project_limit_other',
                'workorder_limit_other'
            )
            .where({user_id: id});
        res.status(202).json({ message: 'Limits retrieved', color: 'success', data: data})
    } catch (e) {
        res.status(500).json({ message: 'Error retrieving limits', color: 'error', error: e });
        console.log(e);
    }
}

const updateGeneralInformation = async (req, res) => {
    try {
        const body = req.body;
        const data = await knex(postUsersDB)
            .update(body.update)
            .where({user_id: body.user_id});
        res.status(202).json({ message: 'Information has been updated', color: 'success' });
    } catch (e) {
        res.status(500).json({ message: 'Error updating information', color: 'error', error: e });
		console.log(e);
    }
};

module.exports = {
	updateGeneralInformation,
    getIntranetPermissions,
    getIntranetLimits
};
