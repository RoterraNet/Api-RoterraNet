const express = require('express');
const knex = require('../01_Database/connection');
const { getUsersDB, postNewsDB } = require('../01_Database/database');
const formatDistanceToNowStrict = require('date-fns/formatDistanceToNowStrict');

// GETS all birthdays with todays day and todays month
// retruns users alias if there is ones. if no alias, returns first name
const get_birthdays = async () => {
	const getUser = knex.raw(
		" CASE WHEN alias_first_name = '' THEN first_name ELSE alias_first_name END AS first_name, last_name"
	);
	const getBirthday = knex.raw(
		'EXTRACT(MONTH from birthday)  = EXTRACT(MONTH from now()) and EXTRACT(DAY from birthday)  = EXTRACT(DAY from now()) and deleted = 0'
	);
	const data = await knex(getUsersDB).select(getUser).where(getBirthday);

	return data;
};

//  Takes in body as an object.
// Maps the object inserting the info into the NEWS DB table
const post_birthdays = async (body) => {
	await body.map(async (i) => {
		const subject = `Happy Birthday ${i.first_name} ${i.last_name}`;
		const news_description = `It's ${i.first_name}'s Birthday. Have a great day!`;
		await knex(postNewsDB).insert({
			department: 999999,
			subject: subject,
			news_description: news_description,
			deleted: 0,
			created_by: 2,
			created_on: new Date(),
		});
	});
};
// GETS all birthdays with todays day and todays month
// retruns users alias if there is ones. if no alias, returns first name
// ltart_date, last_name
const get_start_dates = async () => {
	const getUser = knex.raw(
		"start_date, last_name,  CASE WHEN alias_first_name = '' THEN first_name ELSE alias_first_name END AS first_name"
	);
	const getBirthday = knex.raw(
		'EXTRACT(MONTH from start_date)  = EXTRACT(MONTH from now()) and EXTRACT(DAY from start_date)  = EXTRACT(DAY from now()) and deleted = 0'
	);
	const data = await knex(getUsersDB).select(getUser).where(getBirthday);
	return data;
};

//  Takes in body as an object.
// Maps the object inserting the info into the NEWS DB table
const post_anniversaries = async (body) => {
	try {
		await body.map(async (i) => {
			let years = i.start_date;
			// compares users start_date to current date (functions from datefns)
			years = formatDistanceToNowStrict(new Date(years));
			const subject = `Happy ${years} Anniversary ${i.first_name} ${i.last_name}`;
			const news_description = `Congratulations on another year with the company ${i.first_name}. Here's to many more.`;
			await knex(postNewsDB).insert({
				department: 999999,
				subject: subject,
				news_description: news_description,
				deleted: 0,
				created_by: 2,
				created_on: new Date(),
			});
		});
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	get_birthdays,
	post_birthdays,
	get_start_dates,
	post_anniversaries,
};
