const knex = require('../../01_Database/connection');
const {
	getAnswerContextsDB,
	getAnswerFieldsDB,
	getExamQuestionsDB,
	getSelectableAnswerOptionsDB,
	getExamsDB,
	postAnswerContextsDB,
	postAnswerFieldsDB,
	postExamQuestionsDB,
	postSelectableAnswerOptionsDB,
	postExamsDB,
	examPageDetails,
} = require('../../01_Database/database');

const deleteRows = async (rowsArray, table, rowId) => {
	if (rowsArray?.length > 0) {
		await knex(table)
			.del()
			.whereIn(
				rowId,
				rowsArray?.map((row) => {
					return row[rowId];
				})
			);
	}
};

const updateExamInfo = async (req, res) => {
	try {
		const {
			exam_id,
			is_draft,
			title,
			page_count,
			page_details,
			questions,
			answers,
			selectable_options,
			answer_contexts,
			deleted,
		} = req.body;

		deleteRows(deleted?.questions, postExamQuestionsDB, 'question_id');
		deleteRows(deleted?.answers, postAnswerFieldsDB, 'answer_field_id');
		deleteRows(deleted?.selectable_options, postSelectableAnswerOptionsDB, 'option_id');
		deleteRows(deleted?.answer_contexts, postAnswerContextsDB, 'answer_context_id');

		// console.log('exam id', exam_id);
		const updatedExam = await knex(postExamsDB)
			.insert(
				{ exam_id: exam_id, title: title, is_draft: is_draft, page_count: page_count },
				['exam_id']
			)
			.onConflict('exam_id')
			.merge();

		const newPages = page_details?.map((p, index) => {
			return { ...p, exam_id: exam_id, page: index + 1 };
		});
		await knex(examPageDetails).insert(newPages).onConflict(['exam_id', 'page']).merge();

		// console.log('returned exam id', updatedExam);

		// for each item, a 'new: true' field is checked if it is a new item
		// insert/update exam questions
		questions?.forEach(async (q, qIndex) => {
			const updatedQuestion = q.new
				? await knex(postExamQuestionsDB).insert(
						{
							exam_id: updatedExam[0].exam_id,
							type: q.type,
							question_body: q.question_body,
							value: q.value,
							number: qIndex + 1,
							page: q.page,
						},
						['question_id']
				  )
				: await knex(postExamQuestionsDB)
						.update(
							{
								question_id: q.question_id,
								exam_id: updatedExam[0].exam_id,
								type: q.type,
								question_body: q.question_body,
								value: q.value,
								number: qIndex + 1,
								page: q.page,
							},
							['question_id']
						)
						.where({ question_id: q.question_id });

			// insert/update selectable_options
			selectable_options?.forEach(async (s) => {
				if (s.question_id === q.question_id) {
					s.new
						? await knex(postSelectableAnswerOptionsDB).insert({
								question_id: updatedQuestion[0].question_id,
								option_body: s.option_body,
						  })
						: await knex(postSelectableAnswerOptionsDB)
								.update({
									question_id: updatedQuestion[0].question_id,
									option_body: s.option_body,
								})
								.where({ option_id: s.option_id });
				}
			});

			// insert/update answers
			answers?.forEach(async (a) => {
				if (a.question_id === q.question_id) {
					const updatedAnswer = a.new
						? await knex(postAnswerFieldsDB).insert(
								{
									question_id: updatedQuestion[0].question_id,
									mc_body: a.mc_body,
									mc_correct: a.mc_correct,
									text_correct: a.text_correct,
								},
								['answer_field_id']
						  )
						: await knex(postAnswerFieldsDB)
								.update(
									{
										question_id: updatedQuestion[0].question_id,
										mc_body: a.mc_body,
										mc_correct: a.mc_correct,
										text_correct: a.text_correct,
									},
									['answer_field_id']
								)
								.where({ answer_field_id: a.answer_field_id });

					// insert/update answer contexts
					let before_index = 0;
					let after_index = 0;

					// need to use for...of loop to ensure order insertion for answer index ordering
					for (const c of answer_contexts) {
						if (c.answer_field_id === a.answer_field_id) {
							c.new
								? await knex(postAnswerContextsDB).insert({
										answer_field_id: updatedAnswer[0].answer_field_id,
										relative_position: c.relative_position,
										index:
											c.relative_position === 'before'
												? before_index
												: after_index,
										content: c.content,
										content_type: c.content_type,
								  })
								: await knex(postAnswerContextsDB)
										.update({
											answer_field_id: updatedAnswer[0].answer_field_id,
											relative_position: c.relative_position,
											index:
												c.relative_position === 'before'
													? before_index
													: after_index,
											content: c.content,
											content_type: c.content_type,
										})
										.where({ answer_context_id: c.answer_context_id });

							if (c.relative_position === 'before') {
								before_index += 1;
							} else {
								after_index += 1;
							}
						}
					}
				}
			});
		});

		res.status(200).json({ message: 'Exam successfully updated', color: 'success' });
	} catch (e) {
		res.status(500).json({
			message: 'Problem updating exam',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

const getExamInfo = async (req, res) => {
	try {
		const { exam_id } = req.query;

		const exam = await knex(getExamsDB)
			.select('exam_id', 'title', 'is_draft', 'page_count')
			.where({ exam_id: exam_id });

		const pageDetails = await knex(examPageDetails)
			.select('exam_id', 'page', 'page_header')
			.where({ exam_id: exam_id })
			.orderBy('page', 'asc');

		const questions = await knex(getExamQuestionsDB)
			.select('question_id', 'type', 'number', 'question_body', 'value', 'page')
			.where({ exam_id: exam_id })
			.orderBy([
				{ column: 'page', order: 'asc' },
				{ column: 'number', order: 'asc' },
			]);

		const answers = await knex(getAnswerFieldsDB)
			.select(
				`${getAnswerFieldsDB}.answer_field_id`,
				`${getAnswerFieldsDB}.question_id`,
				`${getAnswerFieldsDB}.mc_body`,
				`${getAnswerFieldsDB}.mc_correct`,
				`${getAnswerFieldsDB}.text_correct`
			)
			.innerJoin(
				getExamQuestionsDB,
				`${getAnswerFieldsDB}.question_id`,
				`${getExamQuestionsDB}.question_id`
			)
			.where(`${getExamQuestionsDB}.exam_id`, exam_id)
			.orderBy('answer_field_id', 'asc');

		const selectableOptions = await knex(getSelectableAnswerOptionsDB)
			.select(
				`${getSelectableAnswerOptionsDB}.option_id`,
				`${getSelectableAnswerOptionsDB}.question_id`,
				`${getSelectableAnswerOptionsDB}.option_body`
			)
			.innerJoin(
				getExamQuestionsDB,
				`${getSelectableAnswerOptionsDB}.question_id`,
				`${getExamQuestionsDB}.question_id`
			)
			.where(`${getExamQuestionsDB}.exam_id`, exam_id)
			.orderBy('option_id', 'asc');

		const answerContexts = await knex(getAnswerContextsDB)
			.select(
				`${getAnswerContextsDB}.answer_context_id`,
				`${getAnswerContextsDB}.answer_field_id`,
				`${getAnswerContextsDB}.relative_position`,
				`${getAnswerContextsDB}.index`,
				`${getAnswerContextsDB}.content`,
				`${getAnswerContextsDB}.content_type`
			)
			.innerJoin(
				getAnswerFieldsDB,
				`${getAnswerContextsDB}.answer_field_id`,
				`${getAnswerFieldsDB}.answer_field_id`
			)
			.innerJoin(
				getExamQuestionsDB,
				`${getAnswerFieldsDB}.question_id`,
				`${getExamQuestionsDB}.question_id`
			)
			.where(`${getExamQuestionsDB}.exam_id`, exam_id)
			.orderBy('answer_field_id', 'asc')
			.orderBy('relative_position', 'desc')
			.orderBy('index', 'asc');

		res.status(200).json({
			message: 'Exam information successfully retrieved',
			color: 'success',
			data: {
				exam_id: exam[0]?.exam_id,
				title: exam[0]?.title,
				is_draft: exam[0]?.is_draft,
				page_count: exam[0]?.page_count,
				page_details: pageDetails,
				questions: questions,
				answers: answers,
				selectable_options: selectableOptions,
				answer_contexts: answerContexts,
			},
		});
	} catch (e) {
		res.status(500).json({
			message: 'Problem getting exam information',
			color: 'error',
			error: e,
		});
		console.log(e);
	}
};

module.exports = {
	getExamInfo,
	updateExamInfo,
};
