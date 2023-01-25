const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

router.get('/', async (req, res) => { 
    const { view } = req.query
    let shop_station_selected

    switch(view) {
        case "open":
            shop_station_selected =  await knex.select("id AS value", "station_name AS label").from('roterranet.shop_station').where("station_status", "=", "1")
          break;
        case "repair":
            shop_station_selected = await knex.select("id AS value", "station_name AS label").from('roterranet.shop_station').where("station_status", "=", "0")
          break;
        default:
            shop_station_selected = await knex.select("id AS value", "station_name AS label").from('roterranet.shop_station')
      }

    res.json(shop_station_selected)
})






router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_station_selected)
})

router.post('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_station_selected)
})

router.patch('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_station_selected)
})

router.delete('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_station_selected)
})

module.exports = router;