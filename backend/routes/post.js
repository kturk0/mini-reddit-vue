const express = require("express");
const router = express.Router();
const client = require('../dbCon.js');

router.route("/")
    .get((req, res) => {
        client.query('SELECT * FROM post', (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .post((req, res) => {
        const { title, content, image_path, video_url, creation_date, subreddit_id, user_id } = req.body
        client.query('INSERT INTO post (title, content, image_path, video_url, creation_date, subreddit_id, user_id) VALUES ($1, $2, $3, $4, to_timestamp($5 / 1000.0) , $6, $7)',
         [title, content, image_path, video_url, creation_date, subreddit_id, user_id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(201).json(results.rows);
        })
    });

router.route("/subreddit/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM post WHERE subreddit_id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    });    

router.route("/:id")
    .get((req, res) => {
        const id = parseInt(req.params.id);
        client.query('SELECT * FROM post WHERE id = $1', [id], (error,results) => {
        if(error) {
            throw error;
        }
        res.status(200).json(results.rows);
        })
    })
    .put((req, res) => {
        const id = parseInt(req.params.id)
        const { title, content, image_path, video_url, creation_date } = req.body
        client.query('UPDATE post SET title = $1, content = $2, image_path = $3, video_url = $4, creation_date = $5, su WHERE id = $6',
         [title, content, image_path, video_url, creation_date], (error,results) => {
          if(error) {
            throw error;
          } 
          res.status(200).json(results);
        })
    })
    .delete((req, res) => {
        const id = parseInt(req.params.id)
        client.query('DELETE FROM post WHERE id = $1', [id], (error,results) => {
          if(error) {
            throw error;
          }
          res.status(200).send('Post with id ${id} deleted');
        })
    });

module.exports = router;