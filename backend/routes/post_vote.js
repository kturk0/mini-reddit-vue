const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
    .post((req, res) => {
        const { vote, user_id, post_id } = req.body
        client.query('INSERT INTO post_vote (vote, user_id, post_id) VALUES ($1, $2, $3) RETURNING *', [vote, user_id, post_id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(201).json(results.rows);
        })
    });

router.route("/post/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM post_vote WHERE post_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        console.log("Returning votes for post of id " + id)
        res.status(200).json(results.rows);
        })
    })
    .delete((req, res) => {
      const id = parseInt(req.params.id);
      client.query('DELETE FROM post_vote WHERE post_id = $1', [id], (error,results) => {
        if(error) {
          throw error;
        }
        res.status(200).send('post_vote with post_id ${id} deleted');
      })
  });       

router.route("/post/:id/user/:idU")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        const idU = parseInt(req.params.idU);
        client.query('SELECT * FROM post_vote WHERE post_id = $1 AND user_id = $2', [id,idU], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .delete((req, res) => {
      const id = parseInt(req.params.id);
      const idU = parseInt(req.params.idU);
      client.query('DELETE FROM post_vote WHERE post_id = $1 AND user_id = $2', [id,idU], (error,results) => {
        if(error) {
          throw error;
        }
        res.status(200).send('post_vote with post_id ${id} and user_id ${idU} deleted');
      })
  });    

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM post_vote WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { vote, user_id, post_id } = req.body
        client.query('UPDATE post_vote SET vote = $1, user_id = $2, post_id = $3 WHERE id = $4', [vote, user_id, post_id, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM post_vote WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('post_vote with id ${id} deleted');
        })
    });

module.exports = router;