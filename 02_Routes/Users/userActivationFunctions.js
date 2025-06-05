const knex = require('../../01_Database/connection');
const {
	postUsersBenefitsDB,
	postUsersEmploymentRecordDB,
	postOnboardingChecklistsDB,
} = require('../../01_Database/database');

exports.addToBenefits = async (user_id, start_date) => {
	// check if user is in users_benefits table
	const benefitsData = await knex(postUsersBenefitsDB).select('*').where({ user_id: user_id });

	// if not, add user into table
	if (benefitsData.length == 0) {
		const benefitsDate = new Date(start_date);
		benefitsDate.setDate(benefitsDate.getDate() + 90);
		const rrspDate = new Date(start_date);
		rrspDate.setDate(rrspDate.getDate() + 365);
		console.log(benefitsDate, rrspDate);
		await knex(postUsersBenefitsDB).insert({
			user_id: user_id,
			effective_date: benefitsDate,
			rrsp_eligibility: rrspDate,
		});
		console.log('user was not in benefits table, now added');
	}
};

exports.addOnboardingChecklist = async (user_id, start_date) => {
	await knex(postOnboardingChecklistsDB).insert({
		user_id: user_id,
		start_date: start_date,
	});
	console.log('added onboarding checklist');
};

exports.addEmploymentHistory = async (user_id, start_date, position_id, manager_id, reason) => {
	await knex(postUsersEmploymentRecordDB).insert({
		user_id: user_id,
		start_date: start_date,
		position_id: position_id,
		manager_id: manager_id,
		reason: reason,
	});
	console.log('added employment history');
};
