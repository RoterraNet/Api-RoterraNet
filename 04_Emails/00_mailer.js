const nodemailer = require('nodemailer');
const knex = require('../01_Database/connection');
const database = require('../01_Database/database');

const getEmailLogDB = database.getEmailLogDB;
const postEmailLogDB = database.postEmailLogDB;

const mail_transporter = nodemailer.createTransport({
	host: 'mail.smtp2go.com',
	port: 2525,
	secure: false,

	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},

	pool: true,
	maxConnections: 5,
	maxMessages: 100,

	connectionTimeout: 30_000,
	greetingTimeout: 30_000,
	socketTimeout: 60_000,

	keepAlive: true,
});

const verifySMTP = async () => {
	const MAX_RETRIES = 5;

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			console.log(`Checking SMTP connection - Attempt ${attempt}/${MAX_RETRIES}`);

			await mail_transporter.verify();

			console.log('SMTP server is ready');

			return true;
		} catch (error) {
			console.error(
				`SMTP connection attempt ${attempt}/${MAX_RETRIES} failed:`,
				error.message
			);

			if (attempt === MAX_RETRIES) {
				console.error('FINAL SMTP CONNECTION FAILURE');

				return false;
			}

			const delay = 1000 * Math.pow(2, attempt - 1);

			console.log(`Retrying SMTP connection in ${delay / 1000} seconds...`);

			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
};

verifySMTP();

exports.sendMail = async (mailOptions) => {
	const MAX_RETRIES = 5;

	const email_info = {
		email_to: mailOptions.to,
		email_from: mailOptions.from,
		email_subject: mailOptions.subject,

		email_html: mailOptions.html || mailOptions.text,

		email_error: false,
	};

	for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
		try {
			console.log(
				`Sending email: "${mailOptions.subject}" - Attempt ${attempt}/${MAX_RETRIES}`
			);

			const info = await mail_transporter.sendMail(mailOptions);

			try {
				await knex(postEmailLogDB).insert(email_info);

				console.log('Message Sent:', mailOptions.subject);
			} catch (dbError) {
				console.error('Email sent but failed to log email:', dbError);
			}

			return info;
		} catch (error) {
			console.error(`Email attempt ${attempt}/${MAX_RETRIES} failed:`, error.message);

			if (attempt === MAX_RETRIES) {
				try {
					await knex(postEmailLogDB).insert({
						...email_info,

						email_error: true,

						email_error_message: error.message,
					});
				} catch (dbError) {
					console.error('Failed to log email error:', dbError);
				}

				console.error('FINAL EMAIL FAILURE:', mailOptions.subject);

				throw error;
			}

			const delay = 1000 * Math.pow(2, attempt - 1);

			console.log(`Retrying email in ${delay / 1000} seconds...`);

			await new Promise((resolve) => setTimeout(resolve, delay));
		}
	}
};
