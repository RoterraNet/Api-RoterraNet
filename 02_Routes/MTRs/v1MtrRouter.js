const express = require('express');
const knex = require('../../01_Database/connection');
const router = express.Router();
const { format } = require('date-fns');

const MTRheatRouter = require('./MTRHeats/MTRHeatRouter');
const { getMaterialTracking, getMaterialTrackingDetails } = require('../../01_Database/database');

router.use('/heatrouter', MTRheatRouter);

router.get('/table', async (req, res) => {
	const { start, size, filters, sorting, globalFilter } = req.query;

	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	const paginatedTable = await knex(getMaterialTracking)
		.select(
			'mtr_id',
			'supplier_name',
			'supplier',
			'plate_yn',
			'pipe_od',
			'pipe_wall',
			'plate_thickness',
			'wsheet',
			'hsheet',
			'created_by_name',
			'created_by',
			'created_on',
			'deleted'
		)
		.where({ deleted: 0 })
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					if (columnId === 'heats') {
						return;
					}

					if (columnId === 'dimensions') {
						for (const [key, value] of Object.entries(filterValue)) {
							if (value?.trim())
								builder.whereRaw(`${key}::text iLIKE ?`, [`%${value.trim()}%`]);
						}
					} else if (columnId === 'created_on') {
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
				builder.whereRaw(`${getMaterialTracking}.*::text iLIKE ?`, [`%${globalFilter}%`]);
			}
			if (!!parsedColumnSorting.length) {
				parsedColumnSorting.map((sort) => {
					const { id: columnId, desc: sortValue } = sort;
					const sorter = sortValue ? 'desc' : 'acs';
					builder.orderBy(columnId, sorter);
				});
			}
		})
		.orderBy('created_on', 'desc')
		.paginate({
			perPage: size,
			currentPage: start,
			isLengthAware: true,
		});

	const mtr_ids = [];
	paginatedTable.data.map((each) => {
		mtr_ids.push(each.mtr_id);
	});

	// get all heats that are associated with any of the retrieved MTRs
	const allHeats = await knex(getMaterialTrackingDetails)
		.select('heat', 'id', 'mtr_id')
		.whereIn('mtr_id', mtr_ids)
		.andWhere({ deleted: 0 });

	// assigned heats to respective MTRs
	paginatedTable.data.map((mtr) => {
		mtr.heats = {};
		allHeats.map((heat) => {
			if (heat.mtr_id === mtr.mtr_id) {
				mtr.heats[heat.id] = heat.heat;
			}
		});
	});

	// check if heats has been filtered for (COLUMN FILTER ONLY, does not work in global filter), and retrieve only MTRs that match those heats
	const i = parsedColumnFilters.findIndex((filter) => filter.id === 'heats');
	if (i != -1 && parsedColumnFilters[i]?.value?.trim() !== '') {
		const heatFilter = parsedColumnFilters[i].value.trim();
		paginatedTable.data = paginatedTable.data.filter((mtr) => {
			for (const [key, value] of Object.entries(mtr.heats)) {
				if (value.includes(heatFilter)) {
					return true;
				}
			}
			return false;
		});
	}

	res.status(200).json(paginatedTable);
});
module.exports = router;
