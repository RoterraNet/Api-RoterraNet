const express = require('express');
const router = express.Router();
const {
    getUsersDB
} = require('../../../01_Database/database');
const knex = require('../../../01_Database/connection');

const getUpcomingAnniversaries = async (req, res) => {
    /* Gets either all, only major, or only minor upcoming anniversaries */
    try {
        const { anniversary_type, days_in_advance } = req.query;
        const daysInAdvance = parseInt(days_in_advance)

        // get all active users
        activeUsers = await knex(getUsersDB)
            .select('user_id', 'start_date', 'preferred_name')
            .where({deleted: 0})

        const now = new Date();

        // get anniversary number of user's next anniversary if within the given days in advance for a regular or major (5/10/15/...-year) anniversary
        const anniversaryUpcomingIn = (anniversaryDate, daysInAdvance) => {
            // cutoff date for notice of anniversaries
            const upperBoundDate = new Date();
            upperBoundDate.setDate(now.getDate() + daysInAdvance)

            // calculate difference in days between current time and upcoming anniversary
            const daysBeforeAnniversary = Math.round((anniversaryDate.getTime() - now.getTime()) / (1000*3600*24))

            // check if positive (negative happens when placeholder has same month but earlier day than current time) 
            // && if days before anniversary is within given daysInAdvance notice 
            if ((0 <= daysBeforeAnniversary) && (daysBeforeAnniversary <= daysInAdvance)) {
                return daysBeforeAnniversary;
            } else {
                return -1;
            }
        }

        const anniversaryData = [];
        for (const user of activeUsers) {
            // get what would be user's anniversary this year
            const nthAnniversary = now.getFullYear() - user.start_date.getFullYear();

            // if upcoming anniversary is not 1st year or greater, skip loop
            if (nthAnniversary < 1) {
                continue;
            }
            // if querying for regular anniversary and is a (5/10/15/...-year) anniversary, skip loop
            if ((anniversary_type === 'regular') && (nthAnniversary % 5 == 0)) {
                continue;
            }
            // if querying for major anniversary and is not a (5/10/15/...-year) anniversary, skip loop
            if ((anniversary_type === 'major') && (nthAnniversary % 5 != 0)) {
                continue;
            }

            // create anniversary date
            let anniversaryDate = new Date(user.start_date.getTime())
            anniversaryDate.setFullYear(now.getFullYear())
            const days = anniversaryUpcomingIn(anniversaryDate, daysInAdvance)
            if (days != -1) {
                const anniversary = {
                    user_id: user.user_id,
                    preferred_name: user.preferred_name,
                    anniversary_date: anniversaryDate,
                    anniversary_num: nthAnniversary,
                    days_before: days
                }
                anniversaryData.push(anniversary)
            }        
        }
        
        // sort anniversaries by days_before ascending
        anniversaryData.sort((a, b) => a.days_before - b.days_before)
        res.status(200).json({ message: `${anniversary_type} upcoming anniversaries data retrieved`, color: 'success', data: anniversaryData });
    } catch (e) {
        res.status(500).json({ message: `Something went wrong retrieving ${anniversary_type} anniversaries`, color: 'error', error: e });
        console.log(e);
    }
}

module.exports = {
    getUpcomingAnniversaries
}