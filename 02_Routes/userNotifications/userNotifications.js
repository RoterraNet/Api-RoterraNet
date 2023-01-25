const knex = require('../../01_Database/connection');
const database = require('../../01_Database/database');

const postUserNotificationsDB = database.postUserNotificationsDB;
const getNotificationSettingsDB = database.getNotificationSettingsDB;

const postUserNotification = async (user_id, title, description, created_on, url, settingType) => {
	try {
		const settingRes = await knex(getNotificationSettingsDB)
			.select(settingType)
			.where({ user_id: user_id })
			.returning(settingType);
		console.log(settingRes[0][settingType]);
		const settingPermission = settingRes[0][settingType];

		if (settingPermission) {
			await knex(postUserNotificationsDB).insert({
				user_id: user_id,
				title: title,
				description: description,
				created_on: created_on,
				url: url,
			});
			console.log('added');
		}
	} catch (error) {
		console.log(error);
	}
};
module.exports = { postUserNotification };

//EXAMPLE
// postUserNotification(
// 	614,
// 	'Plasma Sheet Completed',
// 	`Plasma Sheet ${updatedData[0].sheet_name} has been completed`,
// 	todayDate(),
// 	`plasmarunsheets/${updatedData[0].id}`,
// 	'plasma_run_sheet'
// );

// postUserNotification(
// 	user_id,
// 	TITLE
// 	DETAIL,
// 	CREATED DATE,
// 	URL,
// 	NOTIFICATION SETTING NAME
// );
