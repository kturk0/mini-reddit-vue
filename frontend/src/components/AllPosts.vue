<template>
  <button class="createSubreddit" type="button" v-on:click="goSubForm">Stwórz nowy subreddit</button>
  <div class="paraDiv">
    <p v-if="filteredPosts.length >0">Posty wybrane dla ciebie :</p>
    <p v-if="!filteredPosts.length >0">Pusto tutaj! Dołącz do paru subredditów!</p>
  </div>
  <div class="postContainer" v-for="post in filteredPosts" :key="post.id">
    <Post :post="post" :inState="false"/>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';
import Post from './Post.vue';

export default {
  inheritAttrs: false,
  name: 'AllPosts',
  components: {
    Post
  },
  data() {
    return {
      posts: [],
      currentUser: {},
      userSubreddits: [],
      ready: false
    }
  },
  created() {
    this.getUser().then( () => {
      this.getUserSubreddits()
    }).then( () => {
      this.getPosts();
    });

  },
  methods: {
    async getPosts() {
        const response = await api.get('/post');
        this.posts = response.data;
    },
    goSubForm() {
        router.push({ name: 'SubredditForm' });
    },
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.currentUser = response.data;
    },
    async getUserSubreddits() {
        const response = await api.get('/subreddit_user/user/'+ this.currentUser.id);
        this.userSubreddits = response.data;
        this.ready=true;
    },
    isPostFromSubbed(post) {
      
      for(let i=0; i<this.userSubreddits.length; i++)
      {
        if(this.userSubreddits[i].subreddit_id == post.subreddit_id)
          return true;
      }
      return false;    
    }
  },
  computed: {
    filteredPosts() {
        let filtered = this.posts.filter(post => {
          return this.isPostFromSubbed(post);
        });
        return filtered.sort(function(a,b){
          return new Date(b.creation_date) - new Date(a.creation_date);
        });
    }
  }
}
</script>

<style lang="scss">
.createSubreddit {
  float:left;
}
.paraDiv {
  padding-top: 10px;
    p{
      text-align:center;
      font-weight: bold;
      font-size: 20px;
    }
}
.postContainer {
  display: flex;
  justify-content: center;
}
</style>