<template>
    <template v-if="isUserModerator">
    <div class="modded">
      <p>Jesteś moderatorem tego subreddita</p>
      <button type="button" v-on:click="goToEditMeta()">Edytuj metadane</button>
    </div>
    </template>
    <template v-if="isUserSubbed">
      <div class="subSpan">
        <p class="subbed">Zasubskrybowano</p>
        <button class="desub" type="button" v-on:click="desubscribe()">Anuluj subskrypcję</button>
      </div>
    </template>
    <template v-if="!isUserSubbed">
      <button class="sub" type="button" v-on:click="subscribe()">Subskrybuj</button>
    </template>
    <div>
        <p class="name">{{ subreddit.name }}</p>
        <p class="description">{{ subreddit.description }}</p>
    </div>
    <template v-if="isUserSubbed">
      <button type="button" v-on:click="goCreatePost()">Utwórz nowy post</button>
    </template>
    <div class="postContainer" v-for="post in sortedPosts" :key="post.id">
     <Post :post="post" @deletePost="deletPost"/>
    </div>
</template>

<script>
import route from '../routes';
import api from "../api";
import Post from './Post.vue';

export default {
  inheritAttrs: false,
  name: 'Subreddit',
  route,
  components: {
    Post
  },
  data() {
    return {
        currentUser: {},
        userSubreddits: [],
        subreddit: {},
        posts: [],
        subredditModerators: []
    }
  },
  created() {
      this.getSubreddit().then( () => {
        this.getPosts();
        this.getUser().then(() => {
          this.getUserSubreddits();
        });
      })
      .then( () => {
        this.getSubredditModerators();
      })

  },
  methods: {
    async getPosts() {
        const response = await api.get('/post/subreddit/' + this.$route.params.id);
        this.posts = response.data;
    },
    async getSubreddit() {
        const response = await api.get('/subreddit/' + this.$route.params.id);
        this.subreddit = response.data[0];
    },
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.currentUser = response.data;
    },
    async getUserSubreddits() {
        const response = await api.get('/subreddit_user/user/'+ this.currentUser.id);
        this.userSubreddits = response.data;
    },
    async getSubredditModerators() {
        const response = await api.get('/subreddit_moderator/subreddit/'+ this.subreddit.id);
        this.subredditModerators = response.data;
    },
    async subscribe() {
        const newSubredditUser = {
          user_id: this.currentUser.id,
          subreddit_id: this.$route.params.id
        }
        const response = await api.post('/subreddit_user', newSubredditUser);
        this.userSubreddits = response.data;
        this.userSubreddits = [...this.userSubreddits,newSubredditUser];
    },
    async desubscribe() {
      await api.delete('/subreddit_user/' + this.currentUser.id + '/' + this.$route.params.id);
      this.getUserSubreddits();
    },
    goCreatePost() {
      route.push({ name: 'PostForm', params: {id: this.subreddit.id}});
      
    },
    deletPost(idP) {
      this.posts = this.posts.filter((post) => post.id != idP);
    },
    goToEditMeta() {
      route.push({ name: 'EditMeta', params: {id: this.subreddit.id}});
    }
  },
  computed: {
    sortedPosts() {
      return this.posts.filter(() => true).sort((p1,p2) =>{
        return new Date(p1.creation_date) - new Date(p2.creation_date)
      });
    },
    isUserSubbed() {
      for(const su of this.userSubreddits)
      {
        if(su.subreddit_id == this.$route.params.id)
          return true;
      }
      return false;
    },
    isUserModerator() {
      for(const mod of this.subredditModerators)
      {
        if(mod.user_id == this.currentUser.id)
          return true;
      }
      return false;
    }
  }
}
</script>

<style lang="scss">
.name {
  font-size: 25px;
}
.postContainer {
  display: flex;
  justify-content: center;
}
.modded{
  p {
    display:inline-block;
    margin-right: 5px;
  }
  button {
    display:inline-block;
  }
}
.subSpan {
  .subbed {
    color: green;
    display:inline-block;
    margin-right: 5px;
  }
  .desub {
   display:inline-block;
   color: red;
  }

}
.sub {
  color: green;
}
</style>