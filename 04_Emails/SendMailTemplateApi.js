require('dotenv').config();
const axios = require('axios');

const smtp2GoTemplateSendMail = async ({ to, subject, templateId, templateData }) => {
	// const apiKey = process.env.SMTP2GO_API_KEY;

	const apiKey = 'api-E35681F9D89043B4A15C218687F508E9';

	const apiUrl = 'https://api.smtp2go.com/v3/email/send';

	// const apiUrl = 'https://api.smtp2go.com/v3/';

	const emailData = {
		api_key: apiKey,
		to: [to],
		sender: 'survey@roterra.com', // Replace with your sender email
		subject: subject,
		template_id: templateId,
		template_data: templateData,
	};

	try {
		const response = await axios.post(apiUrl, emailData);

		if (response.data.data.succeeded) {
			console.log('Email sent successfully:', response.data);
		} else {
			console.error('Failed to send email:', response.data);
		}
	} catch (error) {
		console.error('Error sending email:', error);
	}
};

module.exports = smtp2GoTemplateSendMail;
