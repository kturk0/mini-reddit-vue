<template>
    <div class="post">
        <template v-if="checkIfModerator">
          <button type="button" v-on:click="delPost">Usuń</button>
        </template>
        <p class="username">{{ author.nickname }} {{date}}</p>
        <p class="title">{{ post.title }}</p>
        <div>
          <img v-bind:src="post.image_path" />
        </div>
        <template v-if="post.video_url !== null">
          <div>
            <iframe class="video" allow="fullscreen;" width="420" height="315" v-bind:src="post.video_url"></iframe>
          </div>
        </template> 
        <p class="content">{{ post.content }}</p>
        <span>
          <button :style="upColor" class="upButton" type="button" v-on:click="upvote">+</button>
          <button :style="downColor" class="downButton" type="button" v-on:click="downvote">-</button>
          <p :style="scoreColor">{{ score }}</p>
        </span>
        <template v-if="!inState">
          <p class="comms" @click="goToComments">Komentarze</p>
        </template>
    </div>
</template>

<script>
import api from "../api";
import router from '../routes';

export default {

  name: 'Post',
  router,
  props: {
      post: Object,
      inState: Boolean
  },
  data() {
    return {
      postCpy: this.post,
      date: '',
      author: {},
      user: {},
      moderators: [],
      allVotes: [],
      userVote: [],
      upColor: {},
      downColor: {},
      socket: null
    }
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on("scoreChanged", () => {
        this.getVotes();
    });
    let dateF = new Date(this.postCpy.creation_date);
    this.date = dateF.getFullYear() + "-" + (dateF.getMonth() + 1) +
       "-" + dateF.getDate() + " " +  dateF.getHours() + ":" +dateF.getMinutes();
    this.getVotes();
    this.getUser()
    .then( () => {
      this.getUserVote()
      .then( () => {
          if(this.userVote.length != 0)
          { 
            if(this.userVote[0].vote == 1)
              this.upColor = {backgroundColor:"green"};
            else  
              this.downColor = {backgroundColor:"red"};
          }
      });
      });
    this.getAuthor().then( () => {
         this.getSubredditModerators();
    });
  },
  methods: {
      async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
    },
    async getAuthor() {
        const response = await api.get('/reddit_user/'+ this.postCpy.user_id);
        this.author = response.data[0];
    },
    async addVote(num) {
        let newVote = {vote: num, user_id: this.user.id, post_id: this.postCpy.id};
       // await api.post('/post_vote',{vote: num, user_id: this.user.id, post_id: this.postCpy.id});
        this.getUserVote();
        this.socket.emit("changedScore", newVote, -1);
    },
    async changeVote(num) {
        let newVote = {vote: num, user_id: this.user.id, post_id: this.postCpy.id};
       // await api.put('/post_vote/' + this.userVote[0].id, {vote: num, user_id: this.user.id, post_id: this.postCpy.id});
        this.getUserVote();
        this.socket.emit("changedScore", newVote, this.userVote[0].id);
    },
    async getUserVote() {
        const response = await api.get('/post_vote/post/'+ this.postCpy.id + '/user/' + this.user.id);
        this.userVote = response.data;
    },
    async getVotes() {
        const response = await api.get('/post_vote/post/'+ this.postCpy.id);
        this.allVotes = response.data;
    },
    goToComments() {
        this.$router.push({ name: 'PostContents', params: {id: this.post.subreddit_id, idP: this.postCpy.id}});
    },
    async getSubredditModerators() {
        const response = await api.get('/subreddit_moderator/subreddit/'+ this.postCpy.subreddit_id);
        this.moderators = response.data;
    },
    async delPost() {
        await api.delete('/comment/post/' + this.postCpy.id);
        await api.delete('/post_vote/post/' + this.postCpy.id);
        await api.delete('/post/'+ this.postCpy.id);
        alert("USUNIĘTO POST" );
        this.$emit("deletePost", this.postCpy.id);
        this.$router.push({ name: 'Subreddit', params: {id: this.postCpy.subreddit_id}});
        if(this.postCpy.image_path != null)
        {
          await api.delete('/image/'+ this.postCpy.image_path.substring(this.postCpy.image_path.lastIndexOf('/')+1))
        }
    },
    upvote() {
      this.upColor = {backgroundColor:"green"};
      this.downColor = {};
      if(this.userVote.length == 0)
        this.addVote(1);
      else if(this.userVote[0].vote == 1)
      {
        this.upColor = {};
        this.changeVote(0);  
      }
      else
        this.changeVote(1);  
    },
    downvote() {
      this.downColor = {backgroundColor:"red"};
      this.upColor = {};
      if(this.userVote.length == 0)
        this.addVote(-1);
      else if(this.userVote[0].vote == -1)
      {
        this.downColor = {};
        this.changeVote(0);    
      }
      else
        this.changeVote(-1);    
    }
  },

  computed: {
    checkIfModerator() {
      for(const mod of this.moderators)
      {
        if(mod.user_id == this.user.id)
          return true;
      }
      return false;
    },
    score() {
      let newScore = 0;
      this.allVotes.forEach( (item) => {
        newScore += item.vote;
      })
      return newScore;  
    },
    scoreColor() {
      let color = {};
      if(this.score < 0)
        color = {color: "red"};
      else if(this.score > 0)
        color = {color: "green"};
      return color;
    }
  }
}
</script>

<style lang="scss" scoped>
.post{
    width: 60%;
    border: dashed 2px;
    margin-top: 1%;
    margin-bottom: 2%;
    padding: 0.1%;
    background-color: #ebebeb;
    .title {
      font-weight: bold;
      font-size: 30px;
    }
    .username {
      text-align: left;
      margin-left: 5%;
      font-style: italic;
    
    }
    .content {
      text-align: left;
      padding: 1%;
    }
    .comms:hover {
      color: blue;
    }
    .video {
      max-width:100%;
      max-height:100%;
    }
img {
  max-width:100%;
  max-height:100%;
}
}
</style>