const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

const deleteRoute = require("./RouteCreaters/delete");
const postRoute = require("./RouteCreaters/post");
const getRoute = require("./RouteCreaters/get");
const getTableRoute = require("./RouteCreaters/getTable");
const putRoute = require("./RouteCreaters/put");

const database = require("../01_Database/database")
const postNotesDB = database.postNotesDB
const getNotesDB = database.getNotesDB

const datefns = require("date-fns");
const today_now = datefns.format(new Date(), "yyyy-MM-dd hh:mm:ss.SSS")

// /notes -> GET -> LIST
router.get('/', async (req, res) => {
    const {customer, quote, contact} = req.query
    const sql = knex(getNotesDB).select("*").where("deleted", "=", false)
    let getEntries

    // ?query_key=query_value
    // eg. ?customer=customer_id 
    // Get Notes for customer X
    if(contact){ getEntries = await sql.andWhere('contact_id','=',contact)}
    if(customer){ getEntries = await sql.andWhere('customer_id','=',customer)}
    if(quote){ getEntries = await sql.andWhere('quote_id','=',quote)}

    res.json(getEntries)
})

// /notes -> PATCH -> TABLE -> get all notes paginated
getTableRoute.getTableData(router, getNotesDB)

// /notes -> POST -> create new note
postRoute.newEntry(router, getNotesDB, postNotesDB, today_now, "note_id")

// /notes/:id -> GET -> get one note
getRoute.getById(router, getNotesDB, "note_id")

// /notes/:id -> PUT -> edit one note
putRoute.editById(router, getNotesDB, postNotesDB, today_now, "note_id")

// /notes/:id -> DELETE -> delete one note
deleteRoute.deleteRoute(router, postNotesDB, today_now, "note_id")

module.exports = router;