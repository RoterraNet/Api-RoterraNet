const knex = require('../../01_Database/connection');
const {
	postUsersBenefitsDB,
	postUsersEmploymentRecordDB,
	postOnboardingChecklistsDB,
} = require('../../01_Database/database');

exports.addToBenefits = async (user_id, start_date) => {
	// check if user is in users_benefits table, add if not exists and return id of inserted item, return -1 if error or if user already in table
	try {
		const benefitsData = await knex(postUsersBenefitsDB)
			.select('*')
			.where({ user_id: user_id });

		// if not, add user into table
		if (benefitsData.length == 0) {
			const benefitsDate = new Date(start_date);
			benefitsDate.setDate(benefitsDate.getDate() + 90);
			const rrspDate = new Date(start_date);
			rrspDate.setDate(rrspDate.getDate() + 365);
			console.log(benefitsDate, rrspDate);
			const benefitsId = await knex(postUsersBenefitsDB).insert(
				{
					user_id: user_id,
					effective_date: benefitsDate,
					rrsp_eligibility: rrspDate,
				},
				['id']
			);
			console.log(`User ${user_id} was not in benefits table, now added`);
			return benefitsId[0].id;
		}
		return -1;
	} catch (e) {
		console.log(`Error adding user ${user_id} to benefits table:`, e);
		return -1;
	}
};

exports.addOnboardingChecklist = async (user_id, start_date) => {
	// add onboarding checklist item and return id of inserted item, return -1 if error
	try {
		const onboardingChecklistId = await knex(postOnboardingChecklistsDB).insert(
			{
				user_id: user_id,
				start_date: start_date,
			},
			['id']
		);
		console.log(`Added onboarding checklist for user ${user_id}`);

		return onboardingChecklistId[0].id;
	} catch (e) {
		console.log(`Error adding onboarding checklist for user ${user_id}:`, e);
		return -1;
	}
};

exports.addEmploymentHistory = async (user_id, start_date, position_id, manager_id, reason) => {
	// add employment history item and return id of inserted item, return -1 if error
	try {
		const employmentHistoryId = await knex(postUsersEmploymentRecordDB).insert(
			{
				user_id: user_id,
				start_date: start_date,
				position_id: position_id,
				manager_id: manager_id,
				reason: reason,
			},
			['id']
		);
		console.log(`Added employment history for user ${user_id}`);

		return employmentHistoryId[0].id;
	} catch (e) {
		console.log(`Error adding employment history for ${user_id}:`, e);
		return -1;
	}
};
