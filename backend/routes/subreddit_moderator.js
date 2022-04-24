const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
   .post((req, res) => {
        const { user_id, subreddit_id } = req.body
        client.query('INSERT INTO subreddit_moderator (user_id, subreddit_id) VALUES ($1, $2)', [user_id, subreddit_id], (error,results) => {
          if(error) {
            throw error;
          }
          console.log("Dodano moderatora o id " + user_id +" do subreddita o id " + subreddit_id)
          res.status(201).json(results.rows);
        })
    });

router.route("/subreddit/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit_moderator WHERE subreddit_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    });    

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit_moderator WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { user_id, subreddit_id } = req.body
        client.query('UPDATE subreddit_moderator SET user_id = $1, subreddit_id = $2 WHERE id = $3', [user_id, subreddit_id, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM subreddit_moderator WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('subreddit_moderator with id ${id} deleted');
        })
    });

module.exports = router;