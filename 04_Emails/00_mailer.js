var nodemailer = require('nodemailer');
const knex = require('../01_Database/connection');
const database = require('../01_Database/database');

const getEmailLogDB = database.getEmailLogDB;
const postEmailLogDB = database.postEmailLogDB;

// create reusable transporter object using the default SMTP transport
const mail_transporter = nodemailer.createTransport({
	host: 'mail.smtp2go.com',
	port: 2525,
	secure: false,
	auth: {
		user: process.env.EMAIL_USERNAME,
		pass: process.env.EMAIL_PASSWORD,
	},
});

// function to send emails and catch errors
exports.sendMail = (mailOptions) => {
	mail_transporter.sendMail(mailOptions, (error, info) => {
		const email_info = {
			email_to: mailOptions.to,
			email_from: mailOptions.from,
			email_subject: mailOptions.subject,
			email_html: mailOptions.text,
			email_error: false,
		};
		try {
			if (error) {
				// Send Email to Email Log DB => with error message
				knex(postEmailLogDB)
					.insert({
						...email_info,
						email_error: true,
						email_error_message: error.message,
					})
					.then((x) => {
						console.log('error', error, 'mail subject', mailOptions.subject);
					});
			} else {
				// Send Email to Email Log DB
				knex(postEmailLogDB)
					.insert(email_info)
					.then((x) => {
						console.log('Message Sent: ', mailOptions.subject);
					});
			}
		} catch (e) {
			console.log(e);
		}
	});
};
