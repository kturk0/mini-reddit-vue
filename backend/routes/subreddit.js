const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
    .get((req, res) => {
        client.query('SELECT * FROM subreddit', (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .post((req, res) => {
        const { name, description } = req.body
        client.query('INSERT INTO subreddit (name, description) VALUES ($1, $2) RETURNING *', [name, description], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(201).json(results.rows);
        })
    });

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { name, description } = req.body
        client.query('UPDATE subreddit SET name = $1, description = $2 WHERE id = $3', [name, description, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM subreddit WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('Subreddit with id ${id} deleted');
        })
    });

module.exports = router;