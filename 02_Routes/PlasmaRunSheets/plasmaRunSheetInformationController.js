const express = require('express');
const knex = require('../../01_Database/connection');
const {
	getPlasmaRunSheetsDB,
	postPlasmaRunSheetsDB,
	getUsersPermissionsDB,
	getPlasmaRunSheetItemsDB,
	postPlasmaRunSheetItemsDB,
} = require('../../01_Database/database');
const { postUserNotification } = require('../userNotifications/userNotifications');
const { todayDate } = require('../../03_Utils/formatDates');
const { format } = require('date-fns');

const createSheet = async (req, res) => {
	try {
		const { new_sheet } = req.body;

		await knex(postPlasmaRunSheetsDB).insert({ ...new_sheet });

		res.status(200).json({
			message: 'Sheet successfully created',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: 'Error creating sheet', color: 'error', error: e });
		console.log(e);
	}
};

const cloneSheet = async (req, res) => {
	try {
		const { copies, starting_number, sheet_id, created_by, created_on } = req.body;

		// get plasma run sheet to copy
		const sheetToCopy = await knex(postPlasmaRunSheetsDB) // get from postDB, since it already has the fields we need for insertion
			.select('*')
			.where({ id: sheet_id, deleted: false });

		// change copied plasma run sheet created fields
		const copiedData = {
			...sheetToCopy[0],
			created_by: created_by,
			created_on: created_on,
		};
		delete copiedData.id; // remove sheet's ID, since a new ID will be assigned

		// get items associated with copied plasma run sheet
		const sheetItems = await knex(postPlasmaRunSheetItemsDB) // get from postDB, since it already has the fields we need for insertion
			.select('*')
			.where({ plasma_run_sheet_id: sheet_id, deleted: false })
			.orderBy('id', 'asc');

		for (let i = 0; i < copies; i++) {
			// insert new plasma sheet copy and get its ID
			const newSheet = await knex(postPlasmaRunSheetsDB)
				.insert({
					...copiedData,
					rush: false,
					completed: false,
					completed_date: null,
					sheet_name: starting_number // if starting_number was supplied, add to sheet_name
						? `${copiedData.sheet_name} (${parseInt(starting_number) + i})`
						: copiedData.sheet_name,
				})
				.returning('id');

			// create new item copies associated with plasma sheet
			const copiedItems = sheetItems.map((item) => {
				// change copied plasma run sheet item created fields and assign new sheet's ID to item
				const newItem = {
					...item,
					created_by: created_by,
					created_on: created_on,
					plasma_run_sheet_id: newSheet[0],
				};
				delete newItem.id; // remove item's ID, since a new ID will be assigned
				return newItem;
			});

			// insert item copies
			await knex(postPlasmaRunSheetItemsDB).insert(copiedItems);
		}

		res.status(200).json({
			message: `Sheet successfully cloned (${copies} copies)`,
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({ message: 'Error cloning sheet', color: 'error', error: e });
		console.log(e);
	}
};

const getSheetInformation = async (req, res) => {
	try {
		const { sheet_id } = req.query;

		const sheetList = await knex(getPlasmaRunSheetsDB).select('*').where({ id: sheet_id });

		res.status(200).json({
			message: 'Sheet successfully retrieved',
			color: 'success',
			data: sheetList[0],
		});
	} catch (e) {
		res.status(500).json({ message: 'Error retrieving sheet items', color: 'error', error: e });
		console.log(e);
	}
};

const updateSheetInformation = async (req, res) => {
	try {
		const { update_type, values } = req.body.update_details;

		const updatedSheet = {
			sheet_name: values.sheet_name,
			sheet_thickness: values.sheet_thickness ? values.sheet_thickness : null,
			sheet_length: values.sheet_length ? values.sheet_length : null,
			sheet_width: values.sheet_width ? values.sheet_width : null,
			created_by: values.created_by,
			created_on: values.created_on,
			program_verified: values.program_verified,
			thickness_verified: values.thickness_verified,
			length_verified: values.length_verified,
			width_verified: values.width_verified,
			verified_by: values.verified_by,
			verified_on: values.verified_on,
			heat_number: values.heat_number,
			cut_off_length: values.cut_off_length ? values.cut_off_length : null,
			cut_off_width: values.cut_off_width ? values.cut_off_width : null,
			plate_utilization: values.plate_utilization ? values.plate_utilization : null,
			completed: values.completed,
			completed_date: update_type === 'reverted' ? null : values.completed_date,
			cut_off: values.cut_off,
			rush: values.rush,
			priority: values.priority,
			operator_notes: values.operator_notes,
			manager_notes: values.manager_notes,
			deleted: values.deleted,
		};

		const updatedSheets = await knex(postPlasmaRunSheetsDB)
			.update(updatedSheet)
			.where({ id: values.id })
			.returning('*');

		if (update_type === 'completed') {
			// gets  list of users to send notification to
			const usersListToNotify = await knex(getUsersPermissionsDB)
				.select('user_id')
				.where({ manufacturing: true, deleted: 0 });

			// send Notification
			usersListToNotify.forEach(({ user_id }) => {
				postUserNotification(
					user_id,
					'Plasma Sheet Completed',
					`Plasma Sheet ${updatedSheets[0].sheet_name} has been completed`,
					todayDate(),
					`plasmarunsheets/${updatedSheets[0].id}`,
					'plasma_run_sheet'
				);
			});
		}

		let message = '';
		switch (update_type) {
			case 'updated':
				message = 'Sheet information successfully updated';
				break;
			case 'completed':
				message = 'Sheet information successfully updated and completed';
				break;
			case 'reverted':
				message = 'Sheet information successfully updated and reverted';
				break;
		}
		res.status(200).json({
			message: message,
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Error updating sheet information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getTable = async (req, res) => {
	// get plasma run sheet table list
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getPlasmaRunSheetsDB)
		.select(
			'id',
			'sheet_name',
			'priority',
			'thickness_name',
			'sheet_length',
			'sheet_width',
			'created_on',
			'completed',
			'completed_date',
			'rush'
		)
		.where({ deleted: false })
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					if (columnId === 'workorders') {
						return;
					}

					if (columnId === 'created_on' || columnId === 'completed_date') {
						if (!filterValue?.start && !filterValue?.finish) {
							return;
						} else if (!filterValue?.start) {
							builder.where(
								columnId,
								'<=',
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')}"`
							);
						} else if (!filterValue?.finish) {
							builder.where(
								columnId,
								'>=',
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')}"`
							);
						} else {
							builder.whereBetween(columnId, [
								`"${format(new Date(filterValue?.start), 'yyyy-MM-dd')} 00:00:00"`,
								`"${format(new Date(filterValue?.finish), 'yyyy-MM-dd')} 20:00:00"`,
							]);
						}
					} else if (Array.isArray(filterValue) && filterValue.length > 0) {
						builder.whereIn(columnId, filterValue);
					} else {
						if (filterValue?.trim())
							builder.andWhereRaw(`${columnId}::text iLIKE ?`, [
								`%${filterValue.trim()}%`,
							]);
					}
				});
			}
			if (!!globalFilter) {
				builder.whereRaw(`${getPlasmaRunSheetsDB}.*::text iLIKE ?`, [`%${globalFilter}%`]);
			}
			if (!!parsedColumnSorting.length) {
				parsedColumnSorting.map((sort) => {
					const { id: columnId, desc: sortValue } = sort;
					const sorter = sortValue ? 'desc' : 'asc';
					if (columnId === 'priority') {
						builder.whereNotNull('priority');
					}
					builder.orderBy(columnId, sorter);
				});
			}
		})
		.orderByRaw(
			`CASE WHEN completed IS NULL OR completed = false THEN 0 WHEN completed = true THEN 1 END`
		)
		.orderByRaw('completed_date desc NULLS LAST')
		.orderBy('id', 'desc')

		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	const ids = [];
	paginatedTable.data.map((each) => {
		ids.push(each.id);
	});

	// get workorders associated with plasma run sheet
	const itemList = await knex(getPlasmaRunSheetItemsDB)
		.select('plasma_run_sheet_id', 'workorder_id', 'workorder_name')
		.whereIn('plasma_run_sheet_id', ids)
		.whereNotNull('workorder_name');

	paginatedTable.data.map((sheet) => {
		sheet.workorders = {};
		itemList.map((item) => {
			if (item.plasma_run_sheet_id === sheet.id) {
				sheet.workorders[item.workorder_id] = item.workorder_name;
			}
		});
	});
	// check if workorders has been filtered for, and retrieve sheets that match those workorders
	const i = parsedColumnFilters.findIndex((filter) => filter.id === 'workorders');
	if (i != -1 && parsedColumnFilters[i]?.value?.trim() !== '') {
		const workorderFilter = parsedColumnFilters[i].value.trim();
		paginatedTable.data = paginatedTable.data.filter((sheet) => {
			for (const [key, value] of Object.entries(sheet.workorders)) {
				if (value.includes(workorderFilter)) {
					return true;
				}
			}
			return false;
		});
	}

	res.status(200).json(paginatedTable);
};

module.exports = {
	createSheet,
	cloneSheet,
	getSheetInformation,
	updateSheetInformation,
	getTable,
};
