<template>
  <el-config-provider>
    <div class="app-container">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        router
        @select="handleSelect"
      >
        <el-menu-item index="/">PPT转数字人视频</el-menu-item>
        <el-menu-item index="/avatar-creation">数字人管理</el-menu-item>
        <el-menu-item index="/voice-clone">声音管理</el-menu-item>
        <a href="pptlist/index.html" style="position:absolute;right: 100px; top:20px;text-decoration: none;"> AI生成PPT</a>

        <a  v-if="!user" href="login.html" style="position:absolute;right: 200px; top:20px;text-decoration: none;"> 登录</a>
        <div v-else>
          <a    href="javascript:void();" @click="logOut" style="position:absolute;right: 200px; top:20px;text-decoration: none;"> 退出</a>
          <span  style="position:absolute;right: 240px; top:20px;text-decoration: none;" > {{user.name}}</span>
        </div>



      </el-menu>

      
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </el-config-provider>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import { useRoute } from 'vue-router'
import axios from "axios";



const user = ref(null);

const route = useRoute()
const activeIndex = ref(route.path)

const handleSelect = (key) => {
  activeIndex.value = key
}

// 初始化
onMounted(() => {



  const sesionid= localStorage.getItem('sessionid');

  axios.get(getuserurl+"?sessionid="+sesionid,"",null)
      .then(response=>{

        if(response.data.name){
          user.value=response.data;

        }
      })

});

const logOut = ( ) => {
  const sesionid= localStorage.getItem('sessionid');
  axios.get(logoutuserpassurl+"?sessionid="+sesionid,"",null)
      .then(response=>{

         window.location.href="login.html";
      })
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px;
}
</style>