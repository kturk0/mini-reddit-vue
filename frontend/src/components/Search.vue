<template>
    <div>
        <p class="searching">Wyszukiwanie {{ searchInput }}</p>
    </div>
    <template v-if="subs.length === 0 &&  posts.length === 0">
      <p class="noResults">BRAK WYNIKÓW!</p>
    </template>
    <template v-if="subs.length > 0" >
      <p class="foundSubs">ZNALEZIONE SUBREDDITY :</p>
      <div class="subsContainer" v-for="sub in subs" :key="sub.id">
      <p v-on:click="goToSubreddit(sub.id)" >{{ sub.name }} </p>
      </div>
    </template>
    <template v-if="posts.length > 0" >
      <p class="foundPosts">ZNALEZIONE POSTY :</p>
        <div class="postContainer" v-for="post in posts" :key="post.id">
          <Post :post="post" :inState="false"/>
        </div>
    </template>
</template>

<script>
import api from "../api";
import route from '../routes';
import Post from './Post.vue';

export default {
  inheritAttrs: false,
  name: 'Search',
  route,
  components: {
    Post
  },
  props: {
    searchInput: String
  },
  data() {
    return {
        subs: [],
        posts: [],
        ready: false
    }
  },
  created() {
     this.getSubreddits();
     this.getPosts();
  },
  methods: {
     async getSubreddits() {
        const response = await api.get('/subreddit');
        this.subs = response.data;
        this.subs = this.subs.filter(sub => sub.name.includes(this.searchInput));
    },
     async getPosts() {
        const response = await api.get('/post');
        this.posts = response.data;
        this.posts = this.posts.filter(post => post.content.includes(this.searchInput));
        this.ready=true;
    },
    goToSubreddit(sub_id) {
        this.$router.push({ name: 'Subreddit', params: {id: sub_id}});
    }
  },
  watch: {
    searchInput: function(){
      this.getSubreddits();
      this.getPosts();
    }
    
  }
}
</script>

<style lang="scss">
.noResults{
  color: red;
  font-size: 20px;
}
.foundSubs{
  color: #73ad6a;
  font-size: 20px;
}
.foundPosts{
  color: #73ad6a;
  font-size: 20px;
}
.subsContainer {
  display: flex;
  justify-content: center;
  p {
    color: green;
  }
  p:hover {
    color: blue;
  }

}
</style>