const knex = require('../../../01_Database/connection');
const {
	postCalendarLocationsDB,
	getCalendarCategoriesDB,
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

module.exports = {
	getLocations,
	getCategories,
};
