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
        res.send('data');
    } catch (e) {
        console.log(e)
    }
}

module.exports = {
	updateGeneralInformation,
};
