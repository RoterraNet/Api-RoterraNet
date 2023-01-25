const express = require('express');
const router = express.Router();
const database = require('../01_Database/database');
const knex = require('../01_Database/connection');

const getRcaDB = database.getRcaDB;
const postRcaDB = database.postRcaDB;

const getRcaTeamMembersDB = database.getRcaTeamMembersDB;
const postRcaTeamMembersDB = database.postRcaTeamMembersDB;

const getRcaImprovementsDB = database.getRcaImprovementsDB;
const postRcaImprovementsDB = database.postRcaImprovementsDB;

router.get(`/table`, async (req, res) => {
	const page = req.query.page;
	const perPage = req.query.perPage;

	const paginatedTable = await knex(getRcaDB).select('*').paginate({
		perPage: perPage,
		currentPage: page,
		isLengthAware: true,
	});

	res.json(paginatedTable);
});

router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const getRca = await knex(getRcaDB).select('*').where({ id: id });
		const getRcaTeamMembers = await knex(getRcaTeamMembersDB)
			.select('user_id', 'full_name', 'id')
			.where({ rca_id: id })
			.andWhere({ deleted: false });

		const getRcaImprovments = await knex(getRcaImprovementsDB)
			.select('user_id', 'full_name', 'id', 'detail')
			.where({ rca_id: id });
		const allData = [
			{ ...getRca[0], team_members: getRcaTeamMembers, improvements: getRcaImprovments },
		];
		res.json(allData);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

router.post('/addRca', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const newRcaId = await knex(postRcaDB)
			.insert({
				created_by: values.created_by,
				created_on: values.created_on,
				type: values.type,
				other_type: values.other_type,
				main_problem: values.main_problem,
				containment: values.containment,
				containment_reviewed_by: values.containment_reviewed_by,
				containment_reviewed_on: values.containment_reviewed_on,
				root_cause: values.root_cause,
				corrective_action: values.corrective_action,
				implement_corrective_action: values.implement_corrective_action,
				effectiveness_of_action: values.effectiveness_of_action,
				ncr_id: values.ncr_id,
			})
			.returning('id');

		// Add team members to rca
		const filteredTeamMembers = [];
		values.team_members.map((each) => {
			each.user.user_id !== '' && filteredTeamMembers.push(each.user.user_id);
		});

		const fieldsToInsert = filteredTeamMembers.map((user_id) => ({
			user_id: user_id,
			created_by: values.created_by,
			created_on: values.created_on,
			ncr_id: values.ncr_id,
			rca_id: newRcaId[0],
		}));

		const insertTeamMembers = await knex(postRcaTeamMembersDB).insert(fieldsToInsert);

		// Add RCA improvements

		const improvementsToInsert = values.continues_improvement.map((each) => ({
			user_id: each.verified_by.user_id,
			created_by: values.created_by,
			created_on: values.created_on,
			ncr_id: values.ncr_id,
			rca_id: newRcaId[0],
			detail: each.detail,
		}));

		const insertRcaImprovements = await knex(postRcaImprovementsDB).insert(
			improvementsToInsert
		);

		res.json(newRcaId[0]);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

router.put('/updaterca/:id', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const updatedRCA = await knex(postRcaDB)
			.update({
				...values.update,
			})
			.where({ id: values.rca_id });

		res.json(updatedRCA);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

router.post('/addTeamMembers/', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const newTeamMember = await knex(postRcaTeamMembersDB).insert(values);

		res.json(newTeamMember);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

router.put('/updateTeamMembers/:id', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const updatedTeamMember = await knex(postRcaTeamMembersDB)
			.update({
				...values.update,
			})
			.where({ id: values.id });

		res.json(updatedTeamMember);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

router.post('/addImprovements', async (req, res) => {
	try {
		const { values } = req.body;
		console.log(values);

		const newUpdate = await knex(postRcaImprovementsDB).insert(values);

		res.json(newUpdate);
	} catch (error) {
		res.json({ msg: 'something went wrong', error: error });
	}
});

module.exports = router;
