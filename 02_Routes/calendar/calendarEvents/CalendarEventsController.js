const knex = require('../../../01_Database/connection');
const {
	postCalendarLocationsDB,
	getCalendarCategoriesDB,
	getCalendarSubCategoriesDB,
	postInAndOutDB,
	getInAndOutDB,
} = require('../../../01_Database/database');

const getLocations = async (req, res) => {
	try {
		const calendarLocations = await knex(postCalendarLocationsDB)
			.select('id', 'location_name')
			.where({
				deleted: false,
			})
			.orderBy('location_name', 'asc');
		res.json(calendarLocations);
	} catch (error) {
		console.error('Error getting all locations:', error);
		'Error getting locations:', error;
		throw error;
	}
};

const getCategories = async (req, res) => {
	try {
		const calendarCategories = await knex(getCalendarCategoriesDB)
			.select()
			.where({ deleted: false })
			.orderBy('category', 'asc');
		res.json(calendarCategories);
	} catch (error) {
		console.error('Error getting categories', error);
		'Error getting categories:', error;
		throw error;
	}
};

const getSubCategories = async (req, res) => {
	const { category } = req.query;

	try {
		const calendarCategories = await knex(getCalendarSubCategoriesDB)
			.select()
			.where({ category_id: category })
			.andWhere({ deleted: false })
			.orderBy('sub_category_name', 'asc');
		res.json(calendarCategories);
	} catch (error) {
		console.error('Error getting Sub categories', error);
		'Error getting sub categories:', error;
		throw error;
	}
};

const addCalendarEvent = async (req, res) => {
	const {
		created_on,
		created_by,
		user_id,
		category,
		location_id,
		description,
		date,
		return_date,
		sub_category,
	} = req.body;

	try {
		const postInAndOut = await knex(postInAndOutDB)
			.insert({
				user_id,
				created_by,
				created_on,
				category,
				location_id,
				description,
				date,
				return_date,
				sub_category,
			})
			.returning('*');

		res.json(postInAndOut);
	} catch (error) {
		console.error('Error getting Sub categories', error);
		'Error getting sub categories:', error;
		throw error;
	}
};

const getUserEvents = async (req, res) => {
	const { start, size, filters, sorting, user_id } = req.query;
	const parsedColumnFilters = JSON.parse(filters);
	const parsedColumnSorting = JSON.parse(sorting);

	try {
		const calendarEvents = await knex(getInAndOutDB)
			.select()
			.where({ user_id: user_id.user_id })

			.modify((builder) => {
				if (!!parsedColumnFilters.length) {
					parsedColumnFilters.map((filter) => {
						const { id: columnId, value: filterValue } = filter;

						if (Array.isArray(filterValue) && filterValue.length > 0) {
							builder.whereIn(columnId, filterValue);
						} else {
							builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
						}
					});
				}
				if (!!parsedColumnSorting.length) {
					parsedColumnSorting.map((sort) => {
						const { id: columnId, desc: sortValue } = sort;

						const sorter = sortValue ? 'desc' : 'acs';
						console.log(columnId, sortValue, sorter);
						builder.orderBy(columnId, sorter);
					});
				} else {
					builder.orderBy('date', 'desc');
				}
			})
			.paginate({
				perPage: size,
				currentPage: start,
				isLengthAware: true,
			});

		console.log(calendarEvents);
		res.json(calendarEvents);
	} catch (error) {
		console.error('Error getting User events', error);
		res.status(500).json({ msg: 'Error getting User events:', error: error });
	}
};

module.exports = {
	getLocations,
	getCategories,
	getSubCategories,
	addCalendarEvent,
	getUserEvents,
};
