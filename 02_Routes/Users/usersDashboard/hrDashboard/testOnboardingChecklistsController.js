const express = require('express');
const router = express.Router();
const {
    postOnboardingChecklistsDB
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

// WARNING: WILL DELETE ALL CURRENT DATA FROM TODO TABLES AND 
// ADD ALL UPCOMING TODOS WITHIN A YEAR
const makeOnboardingChecklists = async (req, res) => {
    try {
		// using user ids of first 5 employees for checklist testing
        const testCases = [
            {user_id: 739},
            {user_id: 491},
            {user_id: 452},
            {user_id: 29},
            {user_id: 82},
        ]
        
        await knex(postOnboardingChecklistsDB).delete()
        await knex(postOnboardingChecklistsDB).insert(testCases)

	} catch (error) {
		console.log('something went wrong', error);
	}
}

module.exports = {
    makeOnboardingChecklists,
}