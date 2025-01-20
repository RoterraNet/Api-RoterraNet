const knex = require('../../../01_Database/connection');
const {
	getUsersPreviousUsersDB,
	postUsersPreviousUsersDB,
} = require('../../../01_Database/database');

const getOnboardingQuestions = async (req, res) => {
	try {
		const results = await knex('roterranet.users_questions')
			.leftJoin('roterranet.users_questions_answers', function () {
				this.on(
					'roterranet.users_questions.id',
					'=',
					'roterranet.users_questions_answers.question_id'
				).andOn('roterranet.users_questions_answers.user_id', '=', 614);
			})
			.select(
				'roterranet.users_questions.id as question_id',
				'roterranet.users_questions.question',
				'roterranet.users_questions.group_id',
				'roterranet.users_questions.name',
				'roterranet.users_questions_answers.checked'
			);

		res.status(200).json(results);
	} catch (error) {
		console.error('Error fetching questions and answers:', error);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
};

const updateOnBoardingAnswers = async (req, res) => {
	const { checked, user_id, question_id } = req.body;

	try {
		const checker = await knex('roterranet.users_questions_answers')
			.select('id')
			.first()
			.where({
				question_id: question_id,
				user_id: user_id,
			});
		console.log(checker);
		if (!checker) {
			const data = await knex('roterranet.users_questions_answers').insert({
				question_id: question_id,
				user_id: user_id,
			});
		} else {
			const data = await knex('roterranet.users_questions_answers')
				.update({
					checked: checked,
				})
				.where({ id: checker.id });
		}

		res.send('data');
	} catch (error) {
		console.log('error', error);
		res.send(error);
	}
};

const addTerminationReason = async (req, res) => {
	const values = req.body;

	try {
		const results = await knex(postUsersPreviousUsersDB).insert(values);

		res.status(200).json(results);
	} catch (error) {
		console.error('Error fetching questions and answers:', error);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
};

const getTerminationReason = async (req, res) => {
	try {
		const { start, size, filters, sorting, globalFilter } = req.query;

		const parsedColumnFilters = JSON.parse(filters);
		const parsedColumnSorting = JSON.parse(sorting);

		const paginatedTable = await knex(getUsersPreviousUsersDB)
			.select('*')
			.modify((builder) => {
				if (!!parsedColumnFilters.length) {
					parsedColumnFilters.map((filter) => {
						const { id: columnId, value: filterValue } = filter;
						builder.whereRaw(`${columnId}::text iLIKE ?`, [`%${filterValue}%`]);
					});
				}
				if (!!parsedColumnSorting.length) {
					parsedColumnSorting.map((sort) => {
						const { id: columnId, desc: sortValue } = sort;
						const sorter = sortValue ? 'desc' : 'acs';
						console.log(columnId, sortValue, sorter);
						builder.orderBy(columnId, sorter);
					});
				} else {
					builder.orderBy('id', 'desc');
				}
			})

			.paginate({
				perPage: size,
				currentPage: start,
				isLengthAware: true,
			});

		res.status(200).json(paginatedTable);
	} catch (error) {
		console.error('Error fetching:', error);
		res.status(500).json({ error: 'Failed to fetch data' });
	}
};

const updateTerminationReason = async (req, res) => {
	const { id, update } = req.body;

	console.log(id, update);
	try {
		const results = await knex(postUsersPreviousUsersDB).update(update).where({ id: id });
		res.status(200).json(results);
	} catch (error) {
		console.error('Error fetching:', error);
		res.status(500).json({ error: 'Failed to update data' });
	}
};

module.exports = {
	getOnboardingQuestions,
	updateOnBoardingAnswers,
	addTerminationReason,
	getTerminationReason,
	updateTerminationReason,
};
