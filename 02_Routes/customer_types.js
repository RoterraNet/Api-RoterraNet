const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

const database = require("../01_Database/database")
const getCustomerTypesDB = database.getCustomerTypesDB


// /customer types -> GET ALL
router.get('/', async (req, res) => {
    const getEntries = await knex(getCustomerTypesDB).select("*").where("customer_type_name", '!=', 'N/A')
    res.json(getEntries)
})

module.exports = router;