const express = require('express');
const router = express.Router();
const knex = require('../../../01_Database/connection');
const { postUsersDB } = require('../../../01_Database/database');

const updateGeneralInformation = async (req, res) => {
    try {
        const body = req.body;
        const data = await knex(postUsersDB)
            .update(body.update)
            .where({user_id: body.user_id});
            res.status(202).json({ message: 'Information has been updated', color: 'success' });
    } catch (e) {
        res.status(500).json({ message: 'Something Went Wrong', color: 'error', error: e });
		console.log(e);
    }
}

module.exports = {
	updateGeneralInformation,
};
