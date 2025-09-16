const express = require('express');
const router = express.Router();
const knex = require('../01_Database/connection');
const util = require('util');

const database = require('../01_Database/database');
const getUsersBenefitsDB = database.getUsersBenefitsDB;
const postUsersBenefitsDB = database.postUsersBenefitsDB;

// // /get all performance reviews  -> GET ALL
router.get('/benefits/:id', async (req, res) => {
	const user_id = parseInt(req.params.id);

	const getBenefits = await knex(getUsersBenefitsDB)
		.select(
			'id',
			'user_id',
			'benefits_updated_by',
			'benefits_updated_by_name',
			'benefits_updated_on',
			'rrsp_updated_by',
			'rrsp_updated_by_name',
			'rrsp_updated_on',
			'link_sent',
			'employee_notified',
			'effective_date',
			'benefits_id',
			'single_or_family',
			'single_or_family_2',
			'payroll_deduction',
			'benefits_class',
			'rrsp_invite',
			'rrsp_eligibility',
			'added_to_clife',
			'benefits_status',
			'rrsp_status',

			'employee_contrub',
			'company_contrub',
			'type_of_contrub',
			'type_of_contrub_2',
			'reminder_date'
		)
		.where({ user_id: user_id });

	res.json(getBenefits);
});

router.post('/benefits/', async (req, res) => {
	const {
		user_id,
		updated_by,
		updated_on,
		benefits_status,
		effective_date,
		benefits_id,
		single_or_family,
		benefits_class,
	} = req.body.values;

	try {
		const select = await knex(postUsersBenefitsDB)
			.select('id', 'user_id')
			.where({ user_id: user_id });
		let updateInsertRes;
		if (select.length === 0) {
			updateInsertRes = await knex(postUsersBenefitsDB)
				.insert({
					user_id: user_id,
					benefits_updated_by: updated_by,
					benefits_updated_on: updated_on,
					benefits_status: benefits_status,
					effective_date: effective_date,
					benefits_id: benefits_id,
					single_or_family: single_or_family,
					benefits_class: benefits_class,
				})
				.returning('id');
		} else {
			updateInsertRes = await knex(postUsersBenefitsDB)
				.update({
					benefits_updated_by: updated_by,
					benefits_updated_on: updated_on,
					benefits_status: benefits_status,
					effective_date: effective_date,
					benefits_id: benefits_id,
					single_or_family: single_or_family,
					benefits_class: benefits_class,
				})
				.where({ user_id: user_id })
				.returning('id');
		}
		res.status(202).json({ message: 'Benefits Information was updated', color: 'success' });
	} catch (error) {
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
		console.log(error);
	}
});

router.post('/rrsp/', async (req, res) => {
	const { rrsp_status, added_to_clife, rrsp_eligibility, user_id, updated_by, updated_on } =
		req.body.values;

	const select = await knex(postUsersBenefitsDB)
		.select('id', 'user_id')
		.where({ user_id: user_id });

	try {
		if (select.length === 0) {
			await knex(postUsersBenefitsDB)
				.insert({
					rrsp_status: rrsp_status,
					added_to_clife: added_to_clife,
					user_id: user_id,
					rrsp_eligibility: rrsp_eligibility,
					rrsp_updated_by: updated_by,
					rrsp_updated_on: updated_on,
				})
				.returning('id');
		} else {
			await knex(postUsersBenefitsDB)
				.where({ user_id: user_id })
				.update({
					rrsp_status: rrsp_status,
					added_to_clife: added_to_clife,
					user_id: user_id,
					rrsp_eligibility: rrsp_eligibility,
					rrsp_updated_by: updated_by,
					rrsp_updated_on: updated_on,
				})
				.returning('id');
		}
		res.status(202).json({ message: 'RRSP Information was updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.get('/allowance/:id', async (req, res) => {
	try {
		const user_id = parseInt(req.params.id);

		const getAllowance = await knex(database.getUsersAllowancesDB)
			.select('id', 'user_id', 'type', 'amount', 'given_on', 'given_by_name', 'comments')
			.where({ user_id: user_id })
			.andWhere({ deleted: false });

		res.json(getAllowance);
	} catch (error) {
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.put('/allowance/delete', async (req, res) => {
	try {
		const { values } = req.body;

		const deleteAllowance = await knex(database.postUsersAllowanceDB)
			.update({ ...values.delete })
			.where({ id: values.id });

		res.status(200).json({
			message: 'Deleted',
			color: 'success',
		});
	} catch (error) {
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

router.post('/allowance/addNew', async (req, res) => {
	const { values } = req.body;

	try {
		InsertRes = await knex(database.postUsersAllowanceDB).insert({
			...values,
		});

		res.status(202).json({ message: 'Allowance Information was updated', color: 'success' });
	} catch (error) {
		console.log(error);
		res.status(500).json({
			errorMessage: error,
			message: 'Something Went Wrong',
			color: 'error',
		});
	}
});

module.exports = router;
