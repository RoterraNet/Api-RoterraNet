const express = require('express');
const knex = require('../01_Database/connection');
const { getUsersDB, postNewsDB } = require('../01_Database/database');

const { differenceInYears, isSameDay } = require('date-fns');

const get_birthdays = async () => {
	const users = await knex(getUsersDB)
		.select('first_name', 'alias_first_name', 'last_name', 'birthday')
		.where({ deleted: 0 });

	const today = new Date();

	const birthdays = users
		.map((u) => ({
			first_name: u.alias_first_name || u.first_name,
			last_name: u.last_name,
			birthday: u.birthday,
		}))
		.filter((u) => {
			const birth = new Date(u.birthday);

			const thisYearBirthday = new Date(birth);
			thisYearBirthday.setFullYear(today.getFullYear());

			return isSameDay(today, thisYearBirthday);
		});

	return birthdays;
};

const post_birthdays = async (body) => {
	try {
		for (const i of body) {
			const subject = `Happy Birthday ${i.first_name} ${i.last_name}`;
			const news_description = `It's ${i.first_name}'s Birthday. Have a great day!`;

			await knex(postNewsDB).insert({
				department: 999999,
				subject,
				news_description,
				deleted: 0,
				created_by: 2,
				created_on: new Date(),
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const get_start_dates = async () => {
	const users = await knex(getUsersDB)
		.select(
			'start_date',
			'last_name',
			knex.raw(`
				CASE 
					WHEN alias_first_name = '' THEN first_name 
					ELSE alias_first_name 
				END AS first_name
			`)
		)
		.where({ deleted: 0 });

	const today = new Date();

	const anniversaries = users.filter((u) => {
		const start = new Date(u.start_date);

		const anniversaryThisYear = new Date(start);
		anniversaryThisYear.setFullYear(today.getFullYear());

		return isSameDay(today, anniversaryThisYear);
	});

	return anniversaries;
};

const post_anniversaries = async (body) => {
	try {
		for (const i of body) {
			const today = new Date();
			const startDate = new Date(i.start_date);

			const anniversaryThisYear = new Date(startDate);
			anniversaryThisYear.setFullYear(today.getFullYear());

			if (!isSameDay(today, anniversaryThisYear)) continue;

			const years = differenceInYears(today, startDate);

			if (years <= 0) continue;

			const subject = `Happy ${years} Year Anniversary ${i.first_name} ${i.last_name}`;
			const news_description = `Congratulations on another year with the company ${i.first_name}. Here's to many more.`;

			await knex(postNewsDB).insert({
				department: 999999,
				subject,
				news_description,
				deleted: 0,
				created_by: 2,
				created_on: new Date(),
			});
		}
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
