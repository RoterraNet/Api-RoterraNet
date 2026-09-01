const knex = require('../../../01_Database/connection');
const {
	postUsersDB,
	postOnboardingChecklistsDB,
	postUsersBenefitsDB,
	postUsersEmploymentRecordDB,
	getNotificationSettingsDB,
	userInvitesDB,
} = require('../../../01_Database/database');
const {
	AddUpdateAllUserPermissions,
} = require('../../../02.1_Complicated_Route_Functions/user_permissions_addEdit_fn');

const { hashInviteCode } = require('../userInvites/inviteGenerationFunctions');
const { extractUserData } = require('./userRegistrationFunctions');

const registerUser = async (req, res, next) => {
	try {
		const { user_data, invite_code } = req.body;

		const hashToCheck = hashInviteCode(invite_code.trim().toUpperCase());

		// redeem invite
		const redeemed = await knex(userInvitesDB)
			.where({ code_hash: hashToCheck, used_at: null, user_name_used: false })
			.andWhere('expires_at', '>', new Date())
			.update({ used_at: new Date() })
			.returning('*');

		if (redeemed.length == 1) {
			// make sure only 1 person redeems invite
			try {
				// invalidate all invites with that same username
				await knex(userInvitesDB)
					.update({ user_name_used: true })
					.where({ user_name: redeemed[0].user_name });

				const newUserData = extractUserData(user_data);
				const newUser = await knex(postUsersDB).insert(newUserData).returning('*');
				const { user_id, start_date, position, manager } = newUser;

				// create permissions for user
				await AddUpdateAllUserPermissions(user_data, user_id);

				// create user in notification settings
				await knex(getNotificationSettingsDB)
					.insert({
						user_id: user_id,
					})
					.onConflict('user_id')
					.merge()
					.returning('*');

				const benefitsDate = new Date(start_date);
				benefitsDate.setDate(benefitsDate.getDate() + 90);
				const rrspDate = new Date(start_date);
				rrspDate.setDate(rrspDate.getDate() + 365);

				// add to benefits table
				await knex(postUsersBenefitsDB).insert({
					user_id: user_id,
					effective_date: benefitsDate,
					rrsp_eligibility: rrspDate,
				});

				// create onboarding checklist
				await knex(postOnboardingChecklistsDB).insert({
					user_id: user_id,
					start_date: start_date,
				});

				// add employment record
				await knex(postUsersEmploymentRecordDB).insert({
					user_id: user_id,
					start_date: start_date,
					position_id: position,
					manager_id: manager,
					reason: 'Initial hire',
				});
			} catch (e) {
				next(e);
			}

			res.status(200).json({
				message: `Successfully registered`,
				color: 'success',
			});
		} else {
			res.status(200).json({
				message: `Invite invalid or expired, registration unsuccessful`,
				color: 'error',
			});
		}
	} catch (e) {
		next(e);
	}
};

module.exports = {
	registerUser,
};
