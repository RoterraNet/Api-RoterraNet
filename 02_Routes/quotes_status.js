const express = require("express");
const router = express.Router();
const datefns = require("date-fns");
const database = require("../01_Database/database");
const knex = require("../01_Database/connection");

const postQuotesStatusDB = database.postQuotesStatusDB
const getQuotesStatusDB = database.getQuotesStatusDB

const today_now = datefns.format(new Date(), "yyyy-MM-dd hh:mm:ss.SSS")

///users -> GET 
router.get('/', async (req, res) => {
    const {type} = req.query
    let getEntries

    // ?type=active -> Get All Active Users -> Full Name and ID only
    if(type === 'active') { getEntries = await knex(getQuotesStatusDB).select("status_id","status_name").orderBy("status_id")}

    res.json(getEntries)
})

module.exports = router;











