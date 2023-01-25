const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

router.get('/', async (req, res) => { 
    const { view } = req.query
    let equip_selected

    switch(view) {
        case "open":
            equip_selected =  await knex('roterranet.equipment').whereNull("current_user_id")
          break;
        case "inuse":
            equip_selected = await knex('roterranet.equipment').whereNotNull("current_user_id")
          break;
        default:
            equip_selected = await knex('roterranet.equipment')
      }

    res.json({equip_selected})
})

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json({equip_selected})
})

router.post('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json({equip_selected})
})

router.patch('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json({equip_selected})
})

router.delete('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json({equip_selected})
})

module.exports = router;