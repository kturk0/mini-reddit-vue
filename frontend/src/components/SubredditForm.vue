<template>
  <b>TWORZENIE NOWEGO SUBREDDITA</b>
  <div class="form">
    <form @submit.prevent="createSubreddit">
      <p v-if="errors.length">
        <b>Wymagane poprawki!</b>
        <ul class="errorList">
             <li class="error" v-for="(error,index) in errors" :key="index">{{ error }}</li>
        </ul>
      </p>
      <div>
        <label for="name">Nazwa</label>
        <input name="name" v-model="name" >
      <input type="submit" value="Stwórz subreddit">
      </div>
    </form>
    <textarea class="textA" v-model="description" placeholder="Przykładowy opis twojego subreddita." rows="20" cols="50"></textarea>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';

export default {
  inheritAttrs: false,
  name: 'SubredditForm',
  router,
  data() {
    return {
      errors: [],
      name: '',
      description: '',
      currentSubreddits: [],
      user: {},
      newSubreddit: {}
    }
  },
  created() {
      this.getUser();
  },
  methods: {
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
    },
    createSubreddit() { 
        this.errors = [];
        this.checkForErrors().then( () => {
           if(this.errors.length === 0)
            api.post('/subreddit', {name: this.name, description: this.description})
            .then(response => {
                console.log(response);
                alert("Utworzono nowy subreddit : " + this.name);
                this.newSubreddit = response.data[0];
                this.setModerator().then( () => {
                    router.push({ name: 'AllPosts' });
                })
            })
        })

    },
    async checkForErrors() {
        if(this.name.length < 4)
            this.errors.push("Nazwa musi mieć co najmniej 4 znaki!");
        if(this.description.length < 3)
            this.errors.push("Opisz trochę subreddit!");
        await this.getSubreddits().then(() => {
            let subredditFound = false;
            for(var i = 0; i < this.currentSubreddits.length; i++) {
                if(this.currentSubreddits[i].name === this.name) 
                {
                    subredditFound = true;
                    break;    
                }
            }
            if(subredditFound)
                this.errors.push("Ta nazwa jest już zajęta!");
        });
    },
    async getSubreddits() {
        const response = await api.get('/subreddit');
        this.currentSubreddits = response.data;
    },
    async setModerator() { 
      await api.post('/subreddit_moderator', {user_id: this.user.id, subreddit_id: this.newSubreddit.id})
      
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.errorList {
    list-style-type: none;
    .error {
        color: red;
    }
}
.form {
    label {
        display: inline-block;
        width: 15%;
        text-align: right;
        margin: 1%;
      }
      div {
          margin: auto;
          width: 30%;
      }
      .textA {
          max-width:100%;
          max-height:100%;
      }
    
    
}
</style>
