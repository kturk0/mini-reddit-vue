const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');


router.route("/")
    .post((req, res) => {
        const { user_id, subreddit_id } = req.body
        client.query('INSERT INTO subreddit_user (user_id, subreddit_id) VALUES ($1, $2)', [user_id, subreddit_id], (error,results) => {
          if(error) {
            throw error;
          }
          console.log("Subreddit_user added to subreddit of id : " + subreddit_id);
          res.status(201).json(results.rows);
        })
    });

router.route("/user/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit_user WHERE user_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    });

router.route("/:idU/:idS")
    .delete((req, res) => {
      const idU = parseInt(req.params.idU);
      const idS = parseInt(req.params.idS);
      client.query('DELETE FROM subreddit_user WHERE user_id = $1 AND subreddit_id = $2', [idU,idS], (error,results) => {
        if(error) {
          throw error;
        }
        res.status(200).send('subreddit_user with id_user ${idU} and id_subreddit ${idS} deleted');
      })
  });

router.route("/subreddit/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit_user WHERE subreddit_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM subreddit_user WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { user_id, subreddit_id } = req.body
        client.query('UPDATE subreddit_user SET user_id = $1, subreddit_id = $2 WHERE id = $3', [user_id, subreddit_id, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM subreddit_user WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('subreddit_user with id ${id} deleted');
        })
    });

module.exports = router;