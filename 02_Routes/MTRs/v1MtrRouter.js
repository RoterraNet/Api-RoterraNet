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
			`${getMaterialTracking}.mtr_id`,
			'supplier_name',
			'supplier',
			'plate_yn',
			'pipe_od',
			'pipe_wall',
			'plate_thickness',
			`${getMaterialTracking}.wsheet`,
			`${getMaterialTracking}.hsheet`,
			`${getMaterialTracking}.created_by_name`,
			`${getMaterialTracking}.created_by`,
			`${getMaterialTracking}.created_on`,
			`${getMaterialTracking}.deleted`,
			// Aggregate all heats into comma-separated string per MTR
			knex.raw(
				`STRING_AGG(${getMaterialTrackingDetails}.heat, ',' ORDER BY ${getMaterialTrackingDetails}.heat) as heats`
			)
		)
		.leftJoin(getMaterialTrackingDetails, (o) => {
			o.on(
				`${getMaterialTracking}.mtr_id`,
				'=',
				`${getMaterialTrackingDetails}.mtr_id`
			).andOn(`${getMaterialTrackingDetails}.deleted`, '=', 0);
		})
		.where(`${getMaterialTracking}.deleted`, 0)
		.groupBy(
			`${getMaterialTracking}.mtr_id`,
			'supplier_name',
			'supplier',
			'plate_yn',
			'pipe_od',
			'pipe_wall',
			'plate_thickness',
			`${getMaterialTracking}.wsheet`,
			`${getMaterialTracking}.hsheet`,
			`${getMaterialTracking}.created_by_name`,
			`${getMaterialTracking}.created_by`,
			`${getMaterialTracking}.created_on`,
			`${getMaterialTracking}.deleted`
		)
		.modify((builder) => {
			if (!!parsedColumnFilters.length) {
				parsedColumnFilters.map((filter) => {
					const { id: columnId, value: filterValue } = filter;

					if (columnId === 'heats') {
						if (filterValue?.trim()) {
							builder.havingRaw(
								`STRING_AGG(${getMaterialTrackingDetails}.heat, ',') iLIKE ?`,
								[`%${filterValue.trim()}%`]
							);
						}
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
					const sorter = sortValue ? 'desc' : 'asc';
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

	paginatedTable.data = paginatedTable.data.map((mtr) => {
		mtr.heats = mtr.heats ? mtr.heats.split(',') : [];
		return mtr;
	});

	res.status(200).json(paginatedTable);
});
module.exports = router;
