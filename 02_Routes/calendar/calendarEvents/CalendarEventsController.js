const knex = require('../../../01_Database/connection');
const {
	postCalendarLocationsDB,
	getCalendarCategoriesDB,
	getCalendarSubCategoriesDB,
	postInAndOutDB,
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

module.exports = {
	getLocations,
	getCategories,
	getSubCategories,
	addCalendarEvent,
};
