const { exec } = require('child_process');
const cron = require('node-cron');

const nodemailer = require('nodemailer');
const fs = require('fs');
const { sendMail } = require('../04_Emails/00_mailer');

module.exports = () => {
	// At 07:00 on every day-of-week from Monday through Friday.
	// cron.schedule('0,15,30,59 1-59 0-23 * * *', async () => {

	// cron.schedule('0 7 * * 1-5', async () => {
	cron.schedule('53 11 * * 1-5', async () => {
		try {
			const connectionString = 'postgresql://postgres:Qzpmal10@192.168.2.2:5434/roterranet';

			const pgDumpPath = 'C:/Program Files/PostgreSQL/14/bin/pg_dump'; // Update this with the actual path to pg_dump

			const timestamp = new Date().toISOString().replace(/:/g, '-');
			const backupFileName = `backup_${timestamp}.sql`;
			const backupCommand = `"${pgDumpPath}" "${connectionString}" > "06_Scheduled_Cron_Jobs/${backupFileName}"`;
			// Execute the backup command
			exec(backupCommand, async (error, stdout, stderr) => {
				if (error) {
					console.error(`Backup failed w/ Error: ${error.message}`);
					return;
				}
				if (stderr) {
					console.error(`Backup failed w/ stderr: ${stderr}`);
					return;
				}
				console.log('Backup successful');

				const transporter = nodemailer.createTransport({
					host: 'mail.smtp2go.com',
					port: 2525,
					secure: false,
					auth: {
						user: process.env.EMAIL_USERNAME,
						pass: process.env.EMAIL_PASSWORD,
					},
				});

				const mailOptions = {
					from: 'intranet@roterra.com',
					to: `halghanim@roterra.com`,
					subject: 'SQL Backup',
					html: '<h1>Hello World!</h1>',
					attachments: [
						{
							filename: backupFileName,
							path: __dirname + `/${backupFileName}`,
						},
					],
				};
				transporter.sendMail(mailOptions, (err, info) => {
					if (err) {
						console.error(`Error sending email: ${err}`);
						return;
					}
					console.log(`Email sent: ${info.response}`);
				});
			});
		} catch (error) {
			console.log('error', error);
		}
	});
};
