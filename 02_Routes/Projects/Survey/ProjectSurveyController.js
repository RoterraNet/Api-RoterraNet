const knex = require('../../../01_Database/connection');
const {
	getUsersNewUsersCheckList,
	postUsersNewUsersCheckList,
	getProjectsDB,
	getContactDB,
} = require('../../../01_Database/database');
const smtp2GoTemplateSendMail = require('../../../04_Emails/SendMailTemplateApi');

const getProjectSurveyTable = async (req, res) => {
	try {
		const { project_id } = req.query;
		const paginatedTable = await knex('roterranet.view_project_survey')
			.select()
			.where({ project_id: project_id });
		res.send(paginatedTable);
	} catch (error) {
		console.error('Error finding surveys:', error);
		throw error;
	}
};

const sendOneSurvey = async (req, res) => {
	const { created_by, contact_id, project_id, created_on, email_msg, pm_name } = req.body;

	try {
		const paginatedTable = await knex('roterranet.project_survey').insert({
			created_by: created_by,
			contact_id: contact_id,
			project_id: project_id,
			created_on: created_on,
		});

		const projectData = await knex(getProjectsDB).where({ id: project_id });

		const contactData = await knex(getContactDB).where({ contact_id: contact_id });

		const customer_name = projectData[0].customer_name;
		const projectId = projectData[0].workorder_id;

		const contact_name = contactData[0].full_name;
		const contact_email = contactData[0].email;

		await smtp2GoTemplateSendMail({
			contact_name: contact_name,
			to: contact_email,
			subject: 'Thank You',
			templateId: '7229523',
			templateData: {
				contact_name: contact_name,
				action_url: `https://www.surveymonkey.com/r/roterraPiling?customer=${customer_name}&contact=${contact_name}&projectId=${projectId}`,
				sender_name: pm_name,
				email_msg: email_msg,
			},
		});

		res.send('data');
	} catch (error) {
		console.log(error);
		res.status(500).send('Error sending email');
	}
};

module.exports = {
	getProjectSurveyTable,
	sendOneSurvey,
};
