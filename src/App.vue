<template>
  <el-config-provider>
    <div class="app-container">
      <!-- 桌面导航菜单 -->
      <div class="desktop-nav">
        <div class="logo-container">
          <div class="logo-icon"></div>
          <span class="logo-text">PPT数字人</span>
        </div>
        
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
        </el-menu>
        
        <div class="nav-actions">
          <a href="pptlist/index.html" class="nav-link ai-ppt-link">
            <i class="nav-icon ai-icon"></i>
            AI生成PPT
          </a>
          
          <template v-if="!user">
            <a href="login.html" class="nav-link login-link">
              <i class="nav-icon login-icon"></i>
              登录
            </a>
          </template>
          <template v-else>
            <div class="user-info">
              <span class="username">{{ user.name }}</span>
              <a href="javascript:void(0);" @click="logOut" class="nav-link logout-link">
                <i class="nav-icon logout-icon"></i>
                退出
              </a>
            </div>
          </template>
        </div>
      </div>
      
      <!-- 移动端导航菜单 -->
      <div class="mobile-nav">
        <div class="mobile-header">
          <div class="logo-container">
            <div class="logo-icon"></div>
            <span class="logo-text">PPT数字人</span>
          </div>
          
          <div class="mobile-menu-toggle" @click="toggleMobileMenu">
            <div class="hamburger" :class="{ 'active': mobileMenuOpen }">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
        
        <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
          <router-link to="/" class="mobile-menu-item" @click="closeMobileMenu">PPT转数字人视频</router-link>
          <router-link to="/avatar-creation" class="mobile-menu-item" @click="closeMobileMenu">数字人管理</router-link>
          <router-link to="/voice-clone" class="mobile-menu-item" @click="closeMobileMenu">声音管理</router-link>
          <a href="pptlist/index.html" class="mobile-menu-item" @click="closeMobileMenu">AI生成PPT</a>
          
          <template v-if="!user">
            <a href="login.html" class="mobile-menu-item" @click="closeMobileMenu">登录</a>
          </template>
          <template v-else>
            <div class="mobile-user-info">
              <span class="username">{{ user.name }}</span>
              <a href="javascript:void(0);" @click="logOut" class="mobile-menu-item">退出</a>
            </div>
          </template>
        </div>
      </div>
      
      <div class="main-content">
        <router-view />
      </div>
      
      <footer class="app-footer">
        <div class="footer-content">
          <p>© 2023 PPT数字人视频转换平台 - 让PPT演示更生动</p>
        </div>
      </footer>
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
const mobileMenuOpen = ref(false)

const handleSelect = (key) => {
  activeIndex.value = key
}

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
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

const logOut = () => {
  const sesionid= localStorage.getItem('sessionid');
  axios.get(logoutuserpassurl+"?sessionid="+sesionid,"",null)
      .then(response=>{
         window.location.href="login.html";
      })
}
</script>

<style scoped>
/* 基础样式 */
.app-container {
  min-height: 100vh;
  display: flex;

  background: linear-gradient(90deg, #1a1f36, #2d3a5d);
  flex-direction: column; 
  position: relative;
  overflow-x: hidden;
}

/* 桌面导航样式 */
.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #1a1f36, #2d3a5d);
  padding: 0 20px;
  height: 64px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.logo-icon {
  width: 32px;
  height: 32px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234a90e2"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6 10H6v-2h8v2zm4-4H6v-2h12v2z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  margin-right: 8px;
}

.logo-text {
  color: #ffffff;
  font-size: 1.4rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.el-menu-demo {
  background: transparent !important;
  border-bottom: none !important;
  flex: 1;
}

.el-menu-demo :deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-size: 15px;
  transition: all 0.3s;
  border-bottom: 3px solid transparent !important;
  height: 64px;
  line-height: 64px;
}

.el-menu-demo :deep(.el-menu-item:hover) {
  color: #ffffff !important;
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-menu-demo :deep(.el-menu-item.is-active) {
  color: #ffffff !important;
  border-bottom: 3px solid #4a90e2 !important;
  font-weight: 600;
  background-color: rgba(74, 144, 226, 0.2) !important;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.nav-actions {
  display: flex;
  align-items: center;
}

.nav-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  margin-left: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  transition: all 0.3s;
}

.nav-link:hover {
  color: #ffffff;
  transform: translateY(-2px);
}

.nav-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
  background-size: contain;
  background-repeat: no-repeat;
}

.ai-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M21 11.18V9.72c0-.47-.16-.92-.46-1.28L16.6 3.72c-.38-.46-.94-.72-1.54-.72H8c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h2v3c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-3h1c.55 0 1-.45 1-1v-1.18c.85-.31 1.46-1.12 1.46-2.07 0-.94-.61-1.76-1.46-2.07zM13 16h-2v-2h2v2zm0-4H8V4h4v8z"/></svg>');
}

.login-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>');
}

.logout-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/></svg>');
}

.user-info {
  display: flex;
  align-items: center;
}

.username {
  color: #ffffff;
  margin-right: 15px;
  font-weight: 500;
}

/* 移动端导航样式 */
.mobile-nav {
  display: none;
  flex-direction: column;
  background: linear-gradient(90deg, #1a1f36, #2d3a5d);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.mobile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  height: 60px;
}

.mobile-menu-toggle {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.hamburger {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: .5s ease-in-out;
}

.hamburger span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #ffffff;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: .25s ease-in-out;
}

.hamburger span:nth-child(1) {
  top: 0px;
}

.hamburger span:nth-child(2) {
  top: 8px;
}

.hamburger span:nth-child(3) {
  top: 16px;
}

.hamburger.active span:nth-child(1) {
  top: 8px;
  transform: rotate(135deg);
}

.hamburger.active span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.hamburger.active span:nth-child(3) {
  top: 8px;
  transform: rotate(-135deg);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-menu.open {
  max-height: 500px;
}

.mobile-menu-item {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
}

.mobile-menu-item:hover, .mobile-menu-item.router-link-active {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.1);
}

.mobile-user-info {
  padding: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.mobile-user-info .username {
  display: block;
  margin-bottom: 10px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 20px;
  position: relative;
  z-index: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

/* 页脚样式 */
.app-footer {
  background: linear-gradient(90deg, #1a1f36, #2d3a5d);
  color: rgba(255, 255, 255, 0.7);
  padding: 20px;
  text-align: center;
  font-size: 14px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* 科技感装饰 */
.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a90e2, #67c23a, #e6a23c, #f56c6c);
  z-index: 101;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .main-content {
    padding: 15px;
  }
  
  .app-footer {
    padding: 15px;
    font-size: 12px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 144, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
  }
}

.nav-link.ai-ppt-link {
  position: relative;
  animation: pulse 2s infinite;
  padding: 5px 10px;
  border-radius: 4px;
  background-color: rgba(74, 144, 226, 0.2);
}
</style>