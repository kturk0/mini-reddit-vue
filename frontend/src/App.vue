<template>
  <nav class="topArea">
    <template v-if="isAuth">
      <button type="button" v-on:click="this.$router.push({ name: 'AllPosts'});" class="returnMain">MAIN</button>
      <input type="text" placeholder="search" v-model="searchInp" class="searchBar" v-on:keyup.enter="subSearch" >
      <p class="profileButton" v-on:click="gotoProfile"> {{ user.nickname }}</p>
      <button type="button" v-on:click="logout" class="logout">Wyloguj</button>
    </template>
    <template v-if="!isAuth">
      <button type="button" v-on:click="this.$router.push({ name: 'Login'});" class="goLogin">LOGOWANIE</button>
    </template>
  </nav>
  <div v-if="ready" class="route">
   <router-view></router-view>
  </div>
</template>

<script>
import router from './routes';
import api, {server} from "./api";
import io from 'socket.io-client';



export default {
  name: 'App',
  router,
  components: {
  },
  data() {
    return {
      searchInp: '',
      isAuth: false,
      user: {},
      socket: null,
      ready: false
    }
  },
  created() {
    this.socket = io(server, { transports: ['websocket'] })
    this.ready=true;
    this.checkAuth();
    this.getUser();
  },
  methods: {
    async getUser() {
        const response = await api.get('/user', { withCredentials: true });
        this.user = response.data;
    },
    logout() {
      api.post('/logout', {}, { withCredentials: true}).then(response => {
        this.isAuth = response.data;
        this.$router.push('Login') ;
      })
    },
    checkAuth() {
      api.get('/', { withCredentials: true })
        .then(response => {
          this.isAuth = response.data;
        })
    },
    subSearch() {
      this.$router.push({ name: 'Search', params: {searchInput: this.searchInp}});
    },
    loginSuccess() {
      this.getUser();
      this.isAuth=true;
    },
    gotoProfile() {
      this.$router.push({ name: 'Profile'});
    }
  }
}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.topArea {
  border-bottom: 3px solid black;
  height: 50px;
  padding-bottom: 3px;
  position: -webkit-sticky;
  position: sticky;
  top: 0;
  background-color: white;
  display: flex;
  justify-content: space-between;
  .profileButton:hover {
    color: blue;
  }
  p {
    margin-left: 15%;
    margin-right: 5%;
  }
  button {
     padding: 3px;
  }
  .searchBar {
    min-width: 20%;
    padding: 2px;
    margin-left: 30%;
  
  }
  .returnMain {
  }

  .logout {

  }

  .goLogin {
    margin-left: auto;
  }

}
.route {
  padding: 5px;
}

</style>
