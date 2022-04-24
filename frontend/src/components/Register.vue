<template>
  <b>REJESTRACJA</b>
  <div class="form">
    <form @submit.prevent="register">
      <p v-if="errors.length">
        <b>Popraw następuące błędy:</b>
        <ul class="errorList">
             <li class="error" v-for="(error,index) in errors" :key="index">{{ error }}</li>
        </ul>
      </p>
      <div>
        <label for="nickname">Nick</label>
        <input name="nickname" v-model="nickname" placeholder="nick">
      </div>
      <div>
        <label for="email">Email</label>
        <input name="email" v-model="email" placeholder="email">
      </div>
      <div>
        <label for="password">Hasło</label>
        <input name="password" type="password" v-model="password" placeholder="hasło" >
      </div>
      <div>
        <label for="passwordRepeat">Powtórz hasło</label>
        <input name="passwordRepeat" type="password" v-model="passwordRepeat" placeholder="powtórz hasło">
      </div>
      <input type="submit" value="Zarejestruj">
    </form>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';

export default {
  inheritAttrs: false,
  name: 'Register',
  router,
  data() {
    return {
      errors: [],
      nickname: '',
      email: '',
      password: '',
      passwordRepeat: '',
      currentUsers: []
    }
  },
  created() {
  },
  methods: {
    register() { 
        this.errors = [];
        this.checkForErrors().then(() => {
          if(this.errors.length === 0)
            api.post('/reddit_user', {nickname: this.nickname, password: this.password, email: this.email})
            .then(response => {
                console.log(response);
                alert("Rejestracja ukończona! Możesz się teraz zalogować");
                router.push({ name: 'AllPosts' });
            })
        })

    },
    async checkForErrors() {
        var reg = /\S+@\S+\.\S+/;
        if(!reg.test(this.email))
            this.errors.push("Nieprawidłowy email!");
        if(this.password.length < 5)
            this.errors.push("Hasło musi mieć co najmniej 5 znaków!");
        if(this.password !== this.passwordRepeat)
            this.errors.push("Wpisane hasła nie są takie same!");
        await this.getUsers().then(() => {
            let nickFound = false;
            let emailFound = false;
            for(var i = 0; i < this.currentUsers.length; i++) {
                if(this.currentUsers[i].nickname === this.nickname) 
                    nickFound = true;
                if(this.currentUsers[i].email === this.email)
                    emailFound = true;
                if(nickFound && emailFound)
                    break;    
            }
            if(nickFound)
                this.errors.push("Ten nick jest już zajęty!");
            if(emailFound)
                this.errors.push("Ten email jest już zajęty!");
        });
    },
    async getUsers() {
        const response = await api.get('/reddit_user');
        this.currentUsers = response.data;
        console.log(response.data);
    },
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
    
}
b {
  font-size: 30px;
}
</style>
