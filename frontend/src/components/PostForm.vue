<template>
  <div>
    <b>TWORZENIE NOWEGO POSTA</b>
  </div>
  <div class="form">
    <form @submit.prevent="createPost">
      <p v-if="errors.length">
        <b>Wymagane poprawki!</b>
        <ul class="errorList">
             <li class="error" v-for="(error,index) in errors" :key="index">{{ error }}</li>
        </ul>
      </p>
      <input class="submitClass" type="submit" value="Dodaj post">
      <div>
        <label for="title">Tytuł :</label>
        <input name="title" v-model="title" >
      </div>
      <div>
        <label for="video_url">Link youtube :</label>
        <input name="video_url" v-model="video_url" >
      </div>
      <div>
        <label for="fileInput">Obrazek :</label>
        <input name="fileInput" type="file" @change="onFileSelect">
      </div>
    </form>
    <textarea class="textA" v-model="content" placeholder="Treść posta" rows="20" cols="50"></textarea>
  </div>
</template>

<script>
import api, {server} from "../api";
import router from '../routes';
import route from '../routes';

export default {
  inheritAttrs: false,
  name: 'PostForm',
  router,
  route,
  data() {
    return {
      errors: [],
      title: '',
      content: '',
      file: null,
      image_path: null,
      video_url: null,
      subreddit: [],
      user: {},
      newPost: {}
    }
  },
  created() {
      this.getUser();
      this.getSubreddit();
  },
  methods: {
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
    },
    createPost() { 
        this.errors = [];
        this.checkForErrors()
        if(this.video_url === '')
          this.video_url = null;
        if(this.file === '')
          this.file = null;
        var video_url_emb = null;
        var fileUrl = null;
        if(this.errors.length === 0)
        {
          if(this.video_url !== null)
          {
            var video_id = this.video_url.split('v=')[1];
            var ampersandPosition = video_id.indexOf('&');
            if(ampersandPosition != -1) {
              video_id = video_id.substring(0, ampersandPosition);
            }
            video_url_emb = 'https://www.youtube.com/embed/' + video_id;
          }
          if(this.file != null) {
            const fd = new FormData();
            fileUrl = server + '/' + this.file.name;
            fd.append('image', this.file, this.file.name);
            api.post('/image',fd).then( res => {
              console.log(res.data);
            });
          }
          api.post('/post', {title: this.title, content: this.content, image_path: fileUrl,
            video_url: video_url_emb, creation_date: Date.now(), subreddit_id: this.subreddit.id, user_id: this.user.id})
          .then(response => {
              alert("Utworzono nowy post o tytule : " + this.title);
              this.newPost = response.data[0]; 
              router.push({ name: 'Subreddit', params: {id: this.$route.params.id}});
              
          })
        }

    },
    checkForErrors() {
        if(this.title.length < 4)
            this.errors.push("Tytuł musi mieć co najmniej 4 znaki!");
    },
    async getSubreddit() {
        const response = await api.get('/subreddit/' + this.$route.params.id );
        this.subreddit = response.data[0];
    },
    onFileSelect(event) {
      this.file = event.target.files[0];
      
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
  display: inline-block;
  text-align: center;
    label {
      text-align: center;
      
        width: 50%;
        text-align: right;
        margin: 1%;
      }
      input {}
      div {
          margin: auto;
          width: 60%;
          padding: 1%;
      }
      .submitClass {
        margin: 1%
      }
    
    
}
.textA {
       max-width:100%;
      max-height:100%;
}
</style>
