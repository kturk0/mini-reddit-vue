<template>
  <b>ZMIANA HASŁA</b>
  <div class="form">
    <form @submit.prevent="changePassword">
      <p v-if="errors.length">
        <b>Wymagane poprawki!</b>
        <ul class="errorList">
             <li class="error" v-for="(error,index) in errors" :key="index">{{ error }}</li>
        </ul>
      </p>
      <div>
        <label for="oldPassword">Stare hasło</label>
        <input name="oldPassword" type="password" v-model="oldPassword" placeholder="stare hasło">
      </div>
      <div>
        <label for="password">Nowe hasło</label>
        <input name="password" type="password" v-model="password" placeholder="hasło" >
      </div>
      <div>
        <label for="passwordRepeat">Powtórz nowe hasło</label>
        <input name="passwordRepeat" type="password" v-model="passwordRepeat" placeholder="powtórz hasło">
      </div>
      <input type="submit" value="Zmień hasło">
    </form>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';
import route from '../routes';

export default {
  name: 'Profile',
  router,
  route,
  data() {
    return {
    errors: [],
      oldPassword: '',
      password: '',
      passwordRepeat: '',
      user: {}
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
    changePassword() { 
        this.errors = [];
        this.checkForErrors().then( () => {
        if(this.errors.length === 0)
            {
              api.put('/reddit_user/' + this.user.id, {nickname: this.user.nickname, password: this.password, email: this.user.email})
              .then(() => {
                  alert("Zmieniono hasło!");
                  router.push({ name: 'AllPosts'});
                  
              })
            }
        });
    },
    async checkForErrors() {
        if(this.password.length < 5)
            this.errors.push("Hasło musi mieć co najmniej 5 znaków!");
        if(this.password !== this.passwordRepeat)
            this.errors.push("Wpisane hasła nie są takie same!");
        await this.getUser().then(() => {
            if(this.user.password !== this.oldPassword)
                this.errors.push("Wpisano błędne hasło!");
        });
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
        width: 20%;
        text-align: right;
        margin: 1%;
      }
      div {
          margin: auto;
          width: 80%;
      }
    
    
}
</style>
