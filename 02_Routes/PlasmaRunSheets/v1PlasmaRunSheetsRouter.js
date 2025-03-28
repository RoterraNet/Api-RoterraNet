const express = require('express');
const router = express.Router();
const authorize = require('../Authorization/authorization');

const plasmaRunSheetInformationController = require('./plasmaRunSheetInformationController');
const plasmaRunSheetItemsController = require('./plasmaRunSheetItemsController');
const { getPlasmaRunSheetItemsDB, getPlasmaRunSheetsDB } = require('../../01_Database/database');
const knex = require('../../01_Database/connection');

router.get('', authorize({}), plasmaRunSheetInformationController.getSheetInformation);
router.put('', authorize({}), plasmaRunSheetInformationController.updateSheetInformation);
router.post('', authorize({}), plasmaRunSheetInformationController.createSheet);

router.get('/items', authorize({}), plasmaRunSheetItemsController.getSheetItems);
router.put('/items', authorize({}), plasmaRunSheetItemsController.updateSheetItems);

router.get(`/table`, async (req, res) => {
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
					if (columnId == 'priority') {
						builder.whereNotNull('priority');
					}
					builder.orderBy(columnId, sorter);
				});
			}
		})
		.orderBy('completed', 'desc')
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
});

module.exports = router;
