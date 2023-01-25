const express = require("express");
const router = express.Router();
const database = require("../01_Database/database");
const knex = require("../01_Database/connection");

const getSalesTypeDB = database.getSalesTypeDB

//contact_type -> GET LIST
router.get('/', async (req, res) => {
    const {type} = req.query
    let getEntry
    
    //contact_type -> GET -> get all active customers
    if(type == "active") {getEntry = await knex(getSalesTypeDB).select("*")}

    res.json(getEntry)
})

module.exports = router