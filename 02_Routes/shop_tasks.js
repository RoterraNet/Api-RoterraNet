const express = require("express");
const router = express.Router();
const knex = require("../01_Database/connection");

router.get('/', async (req, res) => { 
    const { view, shop } = req.query
    let shop_task_selected

    shop_task_selected =  await knex.select("id AS value", "task_name AS label").from('roterranet.shop_tasks')

    res.json(shop_task_selected)
})

router.get('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_task_selected)
})

router.post('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_task_selected)
})

router.patch('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_task_selected)
})

router.delete('/:user_id', async (req, res) => {
    const { user_id } = req.params
    const { start_day } = req.body;

    res.json(shop_task_selected)
})

module.exports = router;