const express = require('express');
const knex = require('../../01_Database/connection');
const {
	getPlasmaRunSheetItemsDB,
	postPlasmaRunSheetItemsDB,
} = require('../../01_Database/database');

const getSheetItems = async (req, res) => {
	try {
		const { sheet_id } = req.query;

		const itemList = await knex(getPlasmaRunSheetItemsDB)
			.select('*', 'id as item_id')
			.where({ plasma_run_sheet_id: sheet_id })
			.andWhere({ deleted: false })
			.orderBy('item_id', 'asc');

		for (const item of itemList) {
			delete item.id;
		}

		res.status(200).json({
			message: 'Sheet items successfully retrieved',
			color: 'success',
			data: itemList,
		});
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving sheet items', color: 'error', error: e });
		console.log(e);
	}
};

const updateSheetItems = async (req, res) => {
	try {
		const { fields, dirty_fields, user_id } = req.body.update_details;

		const now = new Date();
		const updatedItems = [];
		for (const [itemType, dirtyItems] of Object.entries(dirty_fields)) {
			for (let i = 0; i < dirtyItems.length; i++) {
				const dirtyItem = dirtyItems[i];
				const item = fields[itemType][i];
				if (dirtyItem == null || Object.keys(dirtyItem).length == 0) continue;
				if (!item.hasOwnProperty('item_id') && item.deleted) continue;
				else {
					const updatedItem = {
						od: item.od ? item.od : null,
						size: item.helix_size_id,
						length: item.length ? item.length : null,
						width: item.width ? item.width : null,
						type: item.type,
						first_off_check: item.first_off_check,
						extra_detail: item.extra_detail ? item.extra_detail : null,
						actual_cut: item.actual_cut ? item.actual_cut : null,
						projected_qty: item.projected_qty ? item.projected_qty : null,
						total_required: item.total_required ? item.total_required : null,
						total_cut: item.total_cut ? item.total_cut : null,
						workorder_id: item.workorder_id,
						plasma_run_sheet_id: item.plasma_run_sheet_id,
						created_by: item.created_by,
						created_on: item.created_on,
						verified_by: item.verified_by,
						verified_on: item.verified_on,
						deleted: item.deleted,
						deleted_by: item.deleted ? user_id : item.deleted_by,
						deleted_on: item.deleted ? now : item.deleted_on,
					};

					if (item.hasOwnProperty('item_id')) updatedItem.id = item.item_id;

					updatedItems.push(updatedItem);
				}
			}
		}

		await knex(postPlasmaRunSheetItemsDB).insert(updatedItems).onConflict('id').merge();
		res.status(200).json({ message: 'Sheet items successfully updated', color: 'success' });
	} catch (e) {
		res.status(500).json({ message: 'Error updating sheet items', color: 'error', error: e });
		console.log(e);
	}
};
module.exports = {
	getSheetItems,
	updateSheetItems,
};
