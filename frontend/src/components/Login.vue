<template>
  <template v-if="!isAuth">
    <p class="logText">LOGOWANIE</p>
    <section>
      <form>
        <div>
          <input type="text" name="username" id="username" placeholder="User" v-model="username">
        </div>
        <div>
          <input type="password" name="password" id="password" placeholder="Password" v-model="password">
        </div>
          <button type="button" v-on:click="login">Zaloguj</button>
      </form>
    </section>
    <p class="error" v-if="err">BŁĘDNE DANE!</p>
    <button class="registerButton" type="button" v-on:click="goRegister">Zarejestruj się</button>
  </template>
  <div v-if="isAuth">
      Witaj zalogowany!
      <button type="button" v-on:click="logout">Wyloguj</button>
  </div>
</template>

<script>
import api from "../api";
import router from '../routes';

export default {

  name: 'Login',
  data() {
    return {
      username: '',
      password: '',
      isAuth: false,
      err: false
    }
  },
  created() {
    this.getData();
  },
  methods: {
    login() { 
      api.post('/login', {username: this.username, password: this.password}, { withCredentials: true })
      .then(response => {
        this.isAuth = response.data;
        this.$root.loginSuccess();
        if(this.isAuth)
          router.push({ name: 'AllPosts' });
      })
      .catch(() => {
        this.err = true;
      }
      );
    },
    getData() {
      api.get(`/`, { withCredentials: true })
        .then(response => {
          this.isAuth = response.data;
        })
    },
    logout() {
      api.post('/logout', {}, { withCredentials: true}).then(response => {
        this.isAuth = response.data;
      })
    },
    goRegister() {
      router.push({ name: 'Register' });
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.logText {
  font-style: bold;
  font-size: 30px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

form {
  div {
          padding-top: 1%;
      padding-bottom: 1%;
    input {
      border: none;
      border-bottom: 2px solid black;
    }
  }
  button {
    border: 2px solid black;
    background-color: white;
  }
  button:hover {
    background-color: black;
    color: white
  }
}

.registerButton {
  padding: 2px;
  margin-top: 3%;
  border: 2px solid black;
  background-color: white;
}
.registerButton:hover {
  background-color: black;
  color: white
}

.error {
  color: red;
}
</style>
