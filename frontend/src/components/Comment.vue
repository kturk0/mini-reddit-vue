<template>
    <div class="comment">
        <template v-if="checkIfModerator">
          <button type="button" v-on:click="deleteComment">Usuń</button>
        </template>
        <p class="username">{{ author.nickname }}</p>
        <p class="content">{{ comment.content }}</p>
    </div>
</template>

<script>
import api from "../api";

export default {

  name: 'Comment',
  props: ['comment','post','socket'],
  data() {
    return {
        commentCpy: this.comment,
        postCpy: this.post,
        author: {},
        user: {},
        moderators: [],
    }
  },
  created() {
      this.getUser();
      this.getAuthor().then( () => {
          this.getSubredditModerators();
      });
  },
  methods: {
    async getAuthor() {
        const response = await api.get('/reddit_user/'+ this.commentCpy.user_id);
        this.author = response.data[0];
    },
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
    },
    async getSubredditModerators() {
        const response = await api.get('/subreddit_moderator/subreddit/'+ this.postCpy.subreddit_id);
        this.moderators = response.data;
    },
    async deleteComment() {
        await api.delete('/comment/' + this.commentCpy.id);
        this.socket.emit("deletedComment", this.commentCpy.id);
        alert("USUNIĘTO KOMENTARZ");
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
    }
  }
}
</script>

<style lang="scss" scoped>
.comment{
    width: 40%;
    border: solid 2px;
    margin-bottom: 1%;
    background-color: #fcfcfc;
    .content {
        text-align : left;
        padding: 1%;
    }
}
</style>