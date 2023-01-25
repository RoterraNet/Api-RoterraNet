const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

const database = require("../01_Database/database")
const getIndustriesDB = database.getIndustriesDB
const postIndustriesDB = database.postIndustriesDB

const datefns = require("date-fns");
const today_now = datefns.format(new Date(), "yyyy-MM-dd hh:mm:ss.SSS")

// /industries -> GET ALL
router.get('/', async (req, res) => {
    const getEntries = await knex(getIndustriesDB).select("*").orderBy("industry_name","asc")
    res.json(getEntries)
})

module.exports = router;
