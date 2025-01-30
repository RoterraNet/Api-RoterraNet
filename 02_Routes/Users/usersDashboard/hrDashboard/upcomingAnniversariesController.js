const express = require('express');
const router = express.Router();
const {
    getUsersDB
} = require('../../../../01_Database/database');
const knex = require('../../../../01_Database/connection');

const getUpcomingAnniversaries = async (req, res) => {
    /* Gets either regular anniversaries within 30 days and major anniversaries within 90 days */
    try {
        // get all active users
        activeUsers = await knex(getUsersDB)
            .select('user_id', 'start_date', 'preferred_name')
            .where({deleted: 0})

        const now = new Date();

        const regularAnniversaryData = [];
        const majorAnniversaryData = [];
        for (const user of activeUsers) {
            // get what would be user's anniversary this year
            const nthAnniversary = now.getFullYear() - user.start_date.getFullYear();

            // if upcoming anniversary is not 1st year or greater, skip loop
            if (nthAnniversary < 1) {
                continue;
            }

            // create anniversary date
            const anniversaryDate = new Date(user.start_date.getTime())
            anniversaryDate.setFullYear(now.getFullYear())
            const daysBefore = Math.round((anniversaryDate.getTime() - now.getTime()) / (1000*3600*24))
            if (daysBefore < 0 || daysBefore > 365) {
                continue;
            }

            if (nthAnniversary % 5 != 0 && daysBefore <= 30) {
                regularAnniversaryData.push({
                    user_id: user.user_id,
                    preferred_name: user.preferred_name,
                    anniversary_date: anniversaryDate,
                    anniversary_num: nthAnniversary,
                    days_before: daysBefore
                })
            } else if (nthAnniversary % 5 == 0 && daysBefore <= 365) {
                majorAnniversaryData.push({
                    user_id: user.user_id,
                    preferred_name: user.preferred_name,
                    anniversary_date: anniversaryDate,
                    anniversary_num: nthAnniversary,
                    days_before: daysBefore
                })
            }    
        }
        
        // sort anniversaries by days_before ascending
        regularAnniversaryData.sort((a, b) => a.days_before - b.days_before)
        majorAnniversaryData.sort((a, b) => a.days_before - b.days_before)
        res.status(200).json({ message: `Upcoming anniversaries data retrieved`, color: 'success', data: {regularAnniversaries: regularAnniversaryData, majorAnniversaries: majorAnniversaryData } });
    } catch (e) {
        res.status(500).json({ message: `Something went wrong retrieving ${anniversary_type} anniversaries`, color: 'error', error: e });
        console.log(e);
    }
}

module.exports = {
    getUpcomingAnniversaries
}