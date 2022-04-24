<template>
  <b>EDYCJA METADANYCH</b>
  <div class="form">
    <form @submit.prevent="editSubreddit">
      <p v-if="errors.length">
        <b>Wymagane poprawki!</b>
        <ul class="errorList">
             <li class="error" v-for="(error,index) in errors" :key="index">{{ error }}</li>
        </ul>
      </p>
      <textarea v-model="description" placeholder="Przykładowy opis twojego subreddita." rows="20" cols="50"></textarea>
      <input type="submit" value="Edytuj opis">
    </form>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';
import route from '../routes';

export default {
  inheritAttrs: false,
  name: 'EditMeta',
  router,
  route,
  data() {
    return {
      errors: [],
      description: '',
      user: {},
      subreddit: {}
    }
  },
  created() {
      this.getSubreddit();
      this.getUser();
  },
  methods: {
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
        console.log(response.data);
    },
    editSubreddit() { 
        this.errors = [];
        this.checkForErrors()
        if(this.errors.length === 0)
            api.put('/subreddit/' + this.subreddit.id, {name: this.subreddit.name, description: this.description})
            .then(() => {
                alert("Zmieniono opis subreddita");
                router.push({ name: 'Subreddit', params: {id: this.$route.params.id} });
            })

    },
    checkForErrors() {
        if(this.description.length < 3)
            this.errors.push("Opisz trochę subreddit!");
    },
    async getSubreddit() {
        const response = await api.get('/subreddit/' + this.$route.params.id);
        this.subreddit = response.data[0];
        this.description = this.subreddit.description;
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
        width: 10%;
        text-align: right;
        margin: 1%;
      }
      div {
          margin: auto;
          width: 30%;
      }
    
    
}
</style>