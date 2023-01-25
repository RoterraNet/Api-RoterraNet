const express = require('express');
const knex = require('../01_Database/connection');
const { getUsersDB, postNewsDB } = require('../01_Database/database');

// GETS all birthdays with todays day and todays month
// retruns users alias if there is ones. if no alias, returns first name
const get_birthdays = async () => {
	const getUser = knex.raw(
		" CASE WHEN alias_first_name = '' THEN first_name ELSE alias_first_name END AS first_name"
	);
	const getBirthday = knex.raw(
		"date_part('month',birthday) = date_part('month', now()) and date_part('day',birthday) = date_part('day', now()) and deleted = 0"
	);
	const data = await knex(getUsersDB).select(getUser).where(getBirthday);
	return data;
};

//  Takes in body as an object.
// Maps the object inserting the info into the NEWS DB table
const post_birthdays = async (body) => {
	await body.map(async (i) => {
		const subject = `Happy Birthday ${i.first_name}`;
		const news_description = `It's ${i.first_name}'s Birthday. Have a great day!`;
		await knex(postNewsDB).insert({
			department: 999999,
			subject: subject,
			news_description: news_description,
			deleted: 0,
			created_by: 614,
			created_on: format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
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
		"date_part('month', start_date) = date_part('month', now()) and date_part('day',start_date) = date_part('month', now()) and deleted = 0"
	);
	const data = await knex(getUsersDB).select(getUser).where(getBirthday);
	return data;
};

//  Takes in body as an object.
// Maps the object inserting the info into the NEWS DB table
const post_anniversaries = async (body) => {
	await body.map(async (i) => {
		let years = i.start_date;
		// comapres users start_date to current date (fuctions from datefns)
		years = formatDistanceToNowStrict(new Date(years));
		const subject = `Happy ${years} Anniversary ${i.first_name} ${i.last_name}`;
		const news_description = `Congratulations on another year with the company ${i.first_name}. Here's to many more.`;
		await knex(postNewsDB).insert({
			department: 999999,
			subject: subject,
			news_description: news_description,
			deleted: 0,
			created_by: 614,
			created_on: format(new Date(), 'yyyy-MM-dd hh:mm:ss'),
		});
	});
};

module.exports = {
	get_birthdays,
	post_birthdays,
	get_start_dates,
	post_anniversaries,
};
