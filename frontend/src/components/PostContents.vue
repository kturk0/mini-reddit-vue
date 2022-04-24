<template>
    <div class="subDiv">
      <p @click="goToSubreddit">r/{{ subreddit.name }} </p>
      <p>/{{ subreddit.id }} </p>
    </div>
    <div v-if="ready" class="post">
         <Post :post="post" :inState="true"></Post>
    </div>
    <div>
      <form @submit.prevent="addComment">
        <div>
        <input type="submit" value="Dodaj komentarz">
        </div>
        <textarea v-model="content" placeholder="Treść komentarza" rows="10" cols="50"></textarea>
      </form>
    </div>
    <div class="commentContainer" v-for="comment in comments" :key="comment.id">
        <Comment :comment="comment" :post="post" :socket="socket" />
    </div>
</template>

<script>
import Post from './Post.vue';
import Comment from './Comment.vue';
import route from '../routes';
import api from "../api";

export default {

  name: 'PostContents',
  route,
  components: {
    Post,
    Comment
  },
  data() {
    return {
        post: {},
        comments: [],
        subreddit: {},
        ready: false,
        content: '',
        currentUser: {},
        socket: null

    }
  },
  created() {
    this.socket = this.$root.socket;
    this.socket.on("commentDeleted", (data) => {
        this.deleteComment(data);
    });
    this.socket.on("commentAdded", () => {
        this.getComments();
    });
    this.getUser();
      this.getPost().then(() => {
          this.getComments();
          this.getSubreddit();
          this.ready=true;

      })
  },
  methods: {
    async getPost() {
      const response = await api.get('/post/' + this.$route.params.idP);
      this.post = response.data[0];
    },
    async getComments() {
      const response = await api.get('/comment/post/' + this.$route.params.idP);
      this.comments = response.data;
    },
    async getSubreddit() {
      const response = await api.get('/subreddit/' + this.post.subreddit_id);
      this.subreddit = response.data[0];
    },
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.currentUser = response.data;
    },
    async addComment() {
      const response = await api.post('/comment',{content: this.content, user_id: this.currentUser.id, post_id: this.$route.params.idP})
      this.socket.emit("addedComment", response.data.id);
    },
    deleteComment(id) {
      this.comments = this.comments.filter((el) => el.id != id);
    },
    goToSubreddit() {
      this.$router.push({ name: 'Subreddit', params: {searchInput: this.searchInp}});

    }
  }
}

</script>

<style lang="scss">
.post {
     margin: auto;
     margin-bottom: 5%;
}
.commentContainer {
    display: flex;
    justify-content: center;
}
.subDiv {
  p:hover{
    color:blue;
  }
}
</style>