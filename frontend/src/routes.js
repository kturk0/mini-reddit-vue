
import {createRouter, createWebHistory} from 'vue-router';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import AllPosts from './components/AllPosts';
import Search from './components/Search';
import Subreddit from './components/Subreddit';
import EditMeta from './components/EditMeta';
import SubredditForm from './components/SubredditForm';
import PostContents from './components/PostContents'
import PostForm from './components/PostForm'

import api from "./api";

const isAuthenticated = () => {
    return api.get('/', { withCredentials: true });
  }

const checkIfModerator = async (idS) => {
    const response = await api.get('/user', { withCredentials: true });
    let user = response.data;
    const response2 = await api.get('/subreddit_moderator/subreddit/'+ idS);
    let subredditModerators = response2.data;
    for(let i; i< subredditModerators.length; i++)
    {
        if(user.id == subredditModerators[i].user_id)
            return true;
    }
    return false;
    
  }  

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/register',
            name: 'Register',
            component: Register
        },
        {
            path: '/profile',
            name: 'Profile',
            component: Profile
        },
        {
            path: '/',
            name: 'AllPosts',
            component: AllPosts,
            props: false
        },
        {
            path: '/search',
            name: 'Search',
            component: Search,
            props: true 
        },
        {
            path: '/r/:id',
            name: 'Subreddit',
            component: Subreddit
        },
        {
            path: '/r/:id/editmeta',
            name: 'EditMeta',
            component: EditMeta
        },
        {
            path: '/r/:id/createpost',
            name: 'PostForm',
            component: PostForm
        },
        {
            path: '/createsub',
            name: 'SubredditForm',
            component: SubredditForm
        },
        {
            path: '/r/:id/post/:idP',
            name: 'PostContents',
            component: PostContents
        }
    ]
})

router.beforeEach((to, from, next) => {
    isAuthenticated().then(auth => {
        if ((to.name !== 'Login' && to.name !== 'Register')  && !auth.data) next({ name: 'Login' })
        else if (to.name === 'EditMeta') 
        {
            checkIfModerator(to.params.id).then( (check) => {
                if(check)
                  next({ name: 'AllPosts' })
                else
                  next();  
            })
        }
        else{
            next();
        }
    })
  })

export default router;