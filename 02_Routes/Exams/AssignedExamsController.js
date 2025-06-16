const knex = require('../../01_Database/connection');
const {
	getAssignedExamsDB,
	postAssignedExamsDB,
	getUsersDB,
	getExamsDB,
	postCompletedExamsHistoryDB,
} = require('../../01_Database/database');

const getExamsAssignedToUser = async (req, res) => {
	try {
		const { user_id, exam_status } = req.query;

		let exams;
		switch (exam_status) {
			case 'assigned':
				// get all exams that have ever been assigned to user
				exams = await knex(getAssignedExamsDB)
					.select(
						`${getAssignedExamsDB}.assigned_exam_id`,
						`${getAssignedExamsDB}.exam_id`,
						`${getAssignedExamsDB}.completed`,
						`${getAssignedExamsDB}.completed_on`,
						`${getAssignedExamsDB}.passed`,
						`${getAssignedExamsDB}.exam_total`,
						`${getAssignedExamsDB}.actual_score`,

						`${getExamsDB}.title`
					)
					.innerJoin(getExamsDB, `${getExamsDB}.exam_id`, `${getAssignedExamsDB}.exam_id`)
					.where({ assigned_to: user_id })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('title', 'asc')
					.orderBy('completed', 'asc')
					.orderBy('completed_on', 'desc');
				break;
			case 'passed':
				// get all exams that have been assigned to user and user has passed
				exams = await knex(getAssignedExamsDB)
					.select(
						`${getAssignedExamsDB}.assigned_exam_id`,
						`${getAssignedExamsDB}.exam_id`,
						`${getAssignedExamsDB}.completed_on`,
						`${getAssignedExamsDB}.exam_total`,
						`${getAssignedExamsDB}.actual_score`,
						`${getExamsDB}.title`
					)
					.innerJoin(getExamsDB, `${getExamsDB}.exam_id`, `${getAssignedExamsDB}.exam_id`)
					.where({ assigned_to: user_id, completed: true, passed: true })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('title', 'asc')
					.orderBy('completed_on', 'desc');
				break;
			case 'pending':
				// get all exams that are assigned to user and waiting to be completed
				exams = await knex(getAssignedExamsDB)
					.select(
						`${getAssignedExamsDB}.assigned_exam_id`,
						`${getAssignedExamsDB}.exam_id`,
						`${getExamsDB}.title`
					)
					.innerJoin(getExamsDB, `${getExamsDB}.exam_id`, `${getAssignedExamsDB}.exam_id`)
					.where({ assigned_to: user_id, completed: false })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('title', 'asc');
				break;

			case 'unassigned':
				// get all exams that have never been assigned to user or are not currently waiting for completion by user
				// i.e. exams that have never been assigned, has been unassigned, or has been already passed by user
				exams = await knex(getExamsDB)
					.select('exam_id', 'title')
					.where({ deleted: false })
					.whereNotExists(
						// exclude...
						knex
							.select('exam_id')
							.from(getAssignedExamsDB)
							.whereRaw(`${getExamsDB}.exam_id = ${getAssignedExamsDB}.exam_id`) // ...exams that have been assigned to user
							.whereRaw(`${getAssignedExamsDB}.deleted = false`) // ...exams that are pending completion by user
							.andWhere({ assigned_to: user_id, completed: false })
					)
					.orderBy('title', 'asc');

				break;

			default:
				res.status(400).json({
					message:
						'Invalid exam_status provided (must be "assigned", "passed", "pending", or "unassigned")',
					color: 'error',
				});
				return;
		}

		res.status(200).json({
			message: 'Assigned exams information successfully retrieved updated',
			color: 'success',
			data: exams,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting assigned exams information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getExamUserIsTaking = async (req, res) => {
	try {
		const { assigned_exam_id, user_id } = req.query;

		// get information about assigned exam ID
		const takenExamInfo = await knex(getAssignedExamsDB)
			.select(
				`${getAssignedExamsDB}.exam_id`,
				`${getExamsDB}.title`,
				`${getAssignedExamsDB}.assigned_to`,
				`${getAssignedExamsDB}.completed`
			)
			.innerJoin(getExamsDB, `${getAssignedExamsDB}.exam_id`, `${getExamsDB}.exam_id`)
			.where(`${getAssignedExamsDB}.assigned_exam_id`, assigned_exam_id);

		// if given user ID is the assigned exam's user ID and exam is not completed, send response with exam information
		// otherwise send error
		if (takenExamInfo[0].assigned_to == user_id && !takenExamInfo[0].completed) {
			res.status(200).json({
				message: 'Exam ID of exam to take successfully retrieved',
				color: 'success',
				data: takenExamInfo[0],
			});
		} else {
			res.status(400).json({
				message: 'Invalid exam to take',
				color: 'error',
			});
		}
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting assigned exams information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getUsersAssignedToExam = async (req, res) => {
	try {
		const { exam_id, exam_status } = req.query;

		let users;
		switch (exam_status) {
			case 'assigned':
				// get all users who have ever been assigned this exam
				users = await knex(getUsersDB)
					.select(`${getUsersDB}.user_id`, `${getUsersDB}.preferred_name`)
					.distinct(`${getUsersDB}.user_id`)
					.whereRaw(`${getUsersDB}.deleted = 0`)
					.innerJoin(
						getAssignedExamsDB,
						`${getUsersDB}.user_id`,
						`${getAssignedExamsDB}.assigned_to`
					)
					.where({ exam_id: exam_id })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('preferred_name', 'asc');
				break;

			case 'passed':
				// get all users who have been assigned, completed, and passed an instance of this exam
				users = await knex(getUsersDB)
					.select(`${getUsersDB}.user_id`, `${getUsersDB}.preferred_name`)
					.distinct(`${getUsersDB}.user_id`)
					.whereRaw(`${getUsersDB}.deleted = 0`)
					.innerJoin(
						getAssignedExamsDB,
						`${getUsersDB}.user_id`,
						`${getAssignedExamsDB}.assigned_to`
					)
					.where({ exam_id: exam_id, completed: true, passed: true })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('preferred_name', 'asc');
				break;

			case 'pending':
				// get all users who have an instance of this exam waiting to be completed
				users = await knex(getUsersDB)
					.select(`${getUsersDB}.user_id`, `${getUsersDB}.preferred_name`)
					.distinct(`${getUsersDB}.user_id`)
					.whereRaw(`${getUsersDB}.deleted = 0`)
					.innerJoin(
						getAssignedExamsDB,
						`${getUsersDB}.user_id`,
						`${getAssignedExamsDB}.assigned_to`
					)
					.where({ exam_id: exam_id, completed: false })
					.andWhereRaw(`${getAssignedExamsDB}.deleted = false`)
					.orderBy('preferred_name', 'asc');
				break;

			case 'unassigned':
				// get all users who have never been assigned this exam or do not have an instance of this exam waiting to be completed
				// i.e. users that have never been assigned, have been unassigned, or have completed + passed this exam
				users = await knex(getUsersDB)
					.select(`${getUsersDB}.user_id`, `${getUsersDB}.preferred_name`)
					.whereRaw(`${getUsersDB}.deleted = 0`)
					.whereNotExists(
						// exclude...
						knex
							.select('assigned_to')
							.from(getAssignedExamsDB)
							.whereRaw(`${getAssignedExamsDB}.assigned_to = ${getUsersDB}.user_id`) // ...users who have been assigned this exam
							.andWhereRaw(`${getAssignedExamsDB}.deleted = false`) // ...users who have an instance of this exam waiting to be completed
							.andWhere({ exam_id: exam_id, completed: false })
					)
					.orderBy('preferred_name', 'asc');
				break;

			default:
				res.status(400).json({
					message:
						'Invalid exam_status provided (must be "assigned", "passed", "pending", or "unassigned")',
					color: 'error',
				});
				return;
		}

		res.status(200).json({
			message: 'Assigned exams information successfully retrieved updated',
			color: 'success',
			data: users,
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting assigned exams information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const gradeExamUserIsTaking = async (req, res) => {
	try {
		const { assigned_exam_id, questions, answers, selectable_options, answer_contexts } =
			req.body;

		let exam_total = 0;
		let actual_score = 0;
		questions.forEach((question, i) => {
			const { question_id, type, value } = question;

			exam_total += value;

			switch (type) {
				case 1:
					// multiple choice
					// if user selected the correct answer add question value to actual_score
					let correct = answers.some(
						(answer) =>
							answer.question_id === question_id &&
							answer.mc_correct === true &&
							answer.inputted_answer == true
					);

					questions[i].scored = correct ? value : 0;
					actual_score += correct ? value : 0;
					break;

				case 2:
				case 3:
					// written or selectable
					// add percentage of fields user got correct * question value to actual_score
					let inputsinQuestion = 0;
					let correctInputsInQuestion = 0;
					answers.forEach((answer) => {
						if (answer.question_id === question_id) {
							inputsinQuestion += 1;
							if (
								answer.text_correct.trim().toLowerCase() ===
								answer.inputted_answer.trim().toLowerCase()
							) {
								correctInputsInQuestion += 1;
							}
						}
					});
					questions[i].scored = (correctInputsInQuestion / inputsinQuestion) * value;
					actual_score += (correctInputsInQuestion / inputsinQuestion) * value;
					break;
			}
		});

		const gradedInformation = {
			exam_total: exam_total,
			actual_score: actual_score,
			passed: actual_score / exam_total >= 0.65, // passing grade is 65%
			completed: true,
			completed_on: new Date(),
		};

		if (gradedInformation.passed) {
			// if user passed, update assigned exam data
			await knex(postAssignedExamsDB)
				.update(gradedInformation)
				.where({ assigned_exam_id: assigned_exam_id });
		} else {
			// if user failed, update assigned exam data and insert a new row of the same exam
			const examInfo = await knex(postAssignedExamsDB)
				.update(gradedInformation)
				.where({ assigned_exam_id: assigned_exam_id })
				.returning(['exam_id', 'assigned_to', 'assigned_by', 'assigned_on']);
			await knex(postAssignedExamsDB).insert(examInfo[0]);
		}

		// insert exam details into completed exam details table as JSON
		await knex(postCompletedExamsHistoryDB).insert({
			assigned_exam_id: assigned_exam_id,
			details_json: {
				questions: questions,
				answers: answers,
				selectable_options: selectable_options,
				answer_contexts: answer_contexts,
			},
		});

		res.status(200).json({
			message: 'Exam successfully graded',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem grading exam',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const assignExams = async (req, res) => {
	try {
		const { user_ids, assigned_by, assigned_on, exam_id } = req.body;

		const newAssignedExams = user_ids.map((id) => {
			return {
				exam_id: exam_id,
				assigned_to: id,
				assigned_by: assigned_by,
				assigned_on: assigned_on,
				completed: false,
			};
		});

		await knex(postAssignedExamsDB).insert(newAssignedExams);

		res.status(200).json({
			message: 'Exam(s) successfully assigned',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem assigning exam(s)',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const unassignExam = async (req, res) => {
	try {
		const { user_id, exam_id } = req.body;

		await knex(postAssignedExamsDB)
			.update({ deleted: true })
			.where({ exam_id: exam_id, assigned_to: user_id, deleted: false, completed: false });

		res.status(200).json({
			message: 'Exam successfully unassigned',
			color: 'success',
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem unassigning exam',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getExamsAssignedToUser,
	getExamUserIsTaking,
	getUsersAssignedToExam,
	gradeExamUserIsTaking,
	assignExams,
	unassignExam,
};
