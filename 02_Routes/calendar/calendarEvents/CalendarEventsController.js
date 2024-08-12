const knex = require('../../../01_Database/connection');
const { postCalendarLocationsDB } = require('../../../01_Database/database');

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
		console.error('Error creating new hire check:', error);
		'Error adding MTR detail:', error;
		throw error;
	}
};

module.exports = {
	getLocations,
};
