const knex = require('../../../01_Database/connection');
const { userInvitesDB } = require('../../../01_Database/database');
const { generateInviteCode, hashInviteCode } = require('./inviteGenerationFunctions');

const generateInvite = async (req, res, next) => {
	try {
		const { employee_data, created_by, user_name } = req.body;

		// create invite code and hash
		const { code, hash } = generateInviteCode();

		// save invite code hash
		await knex(userInvitesDB).insert({
			code_hash: hash,
			employee_data: employee_data,
			created_at: new Date(),
			expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
			used_at: null,
			created_by: created_by,
			user_name: user_name,
			user_name_used: false, // (already false by default when making row, just fyi)
		});

		res.status(200).json({
			message: `Invite successfully generated`,
			color: 'success',
			code: code,
			user_name: user_name,
		});
	} catch (e) {
		next(e);
	}
};

const validateInvite = async (req, res, next) => {
	try {
		const { invite_code } = req.body;

		const hashToCheck = hashInviteCode(invite_code.trim().toUpperCase());

		// check for valid hashed invite code
		const result = await knex(userInvitesDB)
			.select('*')
			.where({ code_hash: hashToCheck, used_at: null, user_name_used: false })
			.andWhere('expires_at', '>', new Date())
			.first();

		if (result) {
			res.status(200).json({
				message: `Invite validated`,
				color: 'success',
				valid: true,
				employee_data: result.employee_data,
				invited_by: result.created_by,
			});
		} else {
			res.status(200).json({
				message: `Invite invalid or expired`,
				color: 'error',
				valid: false,
			});
		}
	} catch (e) {
		next(e);
	}
};

module.exports = {
	generateInvite,
	validateInvite,
};
