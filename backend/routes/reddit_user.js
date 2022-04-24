const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
    .get((req, res) => {
      client.query('SELECT * FROM reddit_user', (error,results) => {
      if(error) {
          throw error;
      }
      res.status(200).json(results.rows);
      })
    })
    .post((req, res) => {
        const { nickname, password, email } = req.body
        client.query('INSERT INTO reddit_user (nickname, password, email) VALUES ($1, $2, $3)', [nickname, password, email], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(201).json(results.rows);
        })
    });

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM reddit_user WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { nickname, password, email } = req.body
        client.query('UPDATE reddit_user SET nickname = $1, password = $2, email = $3 WHERE id = $4 RETURNING *', [nickname, password, email, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM reddit_user WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('reddit_user with id ${id} deleted');
        })
    });

module.exports = router;