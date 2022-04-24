const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
    .post((req, res) => {
        const { content, user_id, post_id } = req.body
        client.query('INSERT INTO comment (content, user_id, post_id) VALUES ($1, $2, $3) RETURNING *', [content, user_id, post_id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(201).json(results.rows);
        })
    })
    

router.route("/post/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM comment WHERE post_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .delete((req, res) => {
      const id = parseInt(req.params.id)
      client.query('DELETE FROM comment WHERE post_id = $1', [id], (error,results) => {
        if(error) {
          throw error;
        }
        res.status(200).send('Comment from posts of id : ${id} deleted');
      })
  });


router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM comment WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { content, user_id, post_id } = req.body
        client.query('UPDATE comment SET content = $1, user_id = $2, post_id = $3 WHERE id = $4', [content, user_id, post_id, id], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM comment WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('Comment with id ${id} deleted');
        })
    });

module.exports = router;