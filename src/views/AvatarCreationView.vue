<template>
  <div class="avatar-creation-container">
    <div class="page-header">
      <div class="tech-line"></div>
      <h2 class="page-title">{{ opetitle }}</h2>
      <div class="tech-line"></div>
    </div>
    
    <div class="content-wrapper">
      <div class="upload-section tech-card">
        <div class="card-header">
          <div class="tech-icon"></div>
          <h3>上传照片</h3>
        </div>
        
        <el-upload
          class="avatar-uploader"
          action="#"
          :auto-upload="false"
          :on-change="handleImageChange"
          :show-file-list="false"
          :file-list="audioFiles"
          accept="image/*"
        >
          <div class="upload-area" :class="{ 'has-image': imageUrl }">
            <img v-if="imageUrl" :src="imageUrl" class="avatar-image" />
            <div v-else class="upload-placeholder">
              <el-icon class="avatar-uploader-icon"><plus /></el-icon>
              <span>点击上传照片</span>
            </div>
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
          </div>
        </el-upload>
        
        <div class="upload-tip">
          <i class="tip-icon"></i>
          上传一张清晰的正面照片，生成您的专属数字人
        </div>
      </div>
      
      <div class="settings-section tech-card">
        <div class="card-header">
          <div class="tech-icon settings-icon"></div>
          <h3>数字人设置</h3>
        </div>
        
        <el-form label-position="top">
          <el-form-item label="数字人名称">
            <el-input 
              v-model="avatarName" 
              placeholder="请输入数字人名称" 
              class="tech-input"
            />
          </el-form-item>
        </el-form>
        
        <div class="action-section">
          <el-button 
            type="primary" 
            class="tech-button" 
            @click="generateAvatar" 
            :disabled="!imageUrl"
          >
            <span class="button-text">{{ modifyid ? '保存修改' : '添加数字人' }}</span>
            <div class="button-effect"></div>
          </el-button>
        </div>
      </div>
    </div>
    
    <div v-if="generatedAvatars.length > 0" class="results-section tech-card">
      <div class="card-header">
        <div class="tech-icon list-icon"></div>
        <h3>数字人列表</h3>
      </div>
      
      <div class="avatar-grid">
        <div 
          v-for="(avatar, index) in generatedAvatars" 
          :key="index"
          class="avatar-item"
        >
          <div class="avatar-name">
            {{ avatar.name }}
          </div>
          
          <div class="avatar-image-container">
            <el-image 
              :src="avatar.pic_url"
              fit="cover"
              class="avatar-result-image"
              loading="lazy"
            />
            <div class="tech-corner top-left"></div>
            <div class="tech-corner top-right"></div>
            <div class="tech-corner bottom-left"></div>
            <div class="tech-corner bottom-right"></div>
          </div>
          
          <div class="avatar-actions">
            <el-button 
              type="success" 
              size="small" 
              class="tech-button small" 
              :disabled="avatar.id==-1" 
              @click="saveAvatar(avatar)"
            >
              修改
            </el-button>
            <el-button 
              type="danger" 
              size="small" 
              class="tech-button small danger" 
              :disabled="avatar.id==-1" 
              @click="deleteAvatar(avatar,index)"
            >
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {deleteAvatarService, generateAvatarServer, getAllAvatar} from "../api/avatarService";
import {deleteVoiceService} from "../api/voiceService.js";


const opetitle=ref("添加数字人")
const audioFiles = ref([])
const imageUrl = ref('')
const avatarName = ref('')
const avatarStyle = ref('realistic')
const avatarGender = ref('male')
const generatedAvatars = ref([])

const modifyid=ref(null)

const handleImageChange = (file) => {
  // 读取上传的图片并显示预览
  audioFiles.value = [file]

  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 初始化
onMounted(() => {
  getAllAvatar().then(data=>{
    data.forEach(function(item) {
      item.pic_url=serverurl+"/"+item.pic_url;
    });
    generatedAvatars.value = data
  })
})

const generateAvatar = () => {
  // 这里应该调用后端API生成数字人
  // 模拟生成过程

  if(modifyid.value){
    generateAvatarServer(audioFiles.value.length>0?audioFiles.value[0].raw:null,avatarName.value, modifyid.value).then(data => {
      data.forEach(function (item) {
        item.pic_url = serverurl + "/" + item.pic_url;
      });
      generatedAvatars.value = data

      modifyid.value=null;
      opetitle.value="添加数字人";
      avatarName.value="";
      imageUrl.value="";

      audioFiles.value=[];
    });
  }else {
    if (audioFiles.value.length === 0) {
      ElMessage.warning('请先上传照片')
      return
    }

    if (!avatarName.value) {
      ElMessage.warning('请输入数字人名称')
      return
    }

    ElMessage.info('正在保存数字人，请稍候...')

    generateAvatarServer(audioFiles.value[0].raw, avatarName.value).then(data => {
      data.forEach(function (item) {
        item.pic_url = serverurl + "/" + item.pic_url;
      });
      generatedAvatars.value = data

      audioFiles.value=[];
    });
  }
}

const saveAvatar = (avatar) => {
  // 这里应该调用后端API保存数字人
  imageUrl.value=avatar.pic_url;
  modifyid.value=avatar.id;
  avatarName.value=avatar.name;
  opetitle.value="修改数字人("+avatar.name+")"
}

const deleteAvatar = (avatar,index) => {
  ElMessageBox.confirm(
      '将要删除选中的声音，删除之后，将不能恢复，是否继续?',
      '警告',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    deleteAvatarService(avatar.id).then(data=>{
      data.forEach(function(item) {
        item.pic_url=serverurl+"/"+item.pic_url;
      });
      generatedAvatars.value = data
    })
  }).catch((err) => {
  })
}
</script>

<style scoped>
/* 基础样式与科技感主题 */
.avatar-creation-container {
  max-width: 1200px;
  margin: 0 auto;
  background-color: #0f1629;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #e0e6ed;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* 背景科技效果 */
.avatar-creation-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 10% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 90% 80%, rgba(100, 218, 255, 0.05) 0%, transparent 30%);
  pointer-events: none;
  z-index: 0;
}

/* 页面标题样式 */
.page-header {
  margin-bottom: 40px;
  text-align: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  color: #4cc9f0;
  font-size: 2.2rem;
  margin: 0;
  padding: 0 20px;
  position: relative;
  display: inline-block;
  text-shadow: 0 0 15px rgba(76, 201, 240, 0.3);
  font-weight: 600;
  letter-spacing: 1px;
}

.page-title::before,
.page-title::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 60px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #4cc9f0, transparent);
}

.page-title::before {
  right: 100%;
}

.page-title::after {
  left: 100%;
}

.tech-line {
  height: 2px;
  flex-grow: 1;
  background: linear-gradient(90deg, transparent, #4cc9f0, transparent);
  max-width: 150px;
  opacity: 0.7;
}

/* 内容布局 */
.content-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

/* 卡片容器样式 */
.tech-card {
  background-color: rgba(25, 32, 56, 0.7);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  padding: 25px;
  transition: all 0.3s ease;
  border: 1px solid rgba(76, 201, 240, 0.2);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.tech-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4cc9f0, transparent);
  opacity: 0.7;
}

.tech-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(76, 201, 240, 0.15);
  border-color: rgba(76, 201, 240, 0.4);
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  position: relative;
}

.card-header h3 {
  color: #4cc9f0;
  margin: 0;
  font-size: 1.4rem;
  font-weight: 500;
}

.tech-icon {
  width: 24px;
  height: 24px;
  margin-right: 10px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: drop-shadow(0 0 5px rgba(76, 201, 240, 0.5));
}

.settings-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234cc9f0"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>');
}

.list-icon {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234cc9f0"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>');
}

/* 上传区域样式 */
.upload-section {
  display: flex;
  flex-direction: column;
}

.upload-area {
  width: 100%;
  height: 300px;
  border: 2px dashed rgba(76, 201, 240, 0.3);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  background-color: rgba(15, 23, 42, 0.5);
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(45deg, rgba(76, 201, 240, 0.05) 25%, transparent 25%) -5px 0,
    linear-gradient(45deg, transparent 75%, rgba(76, 201, 240, 0.05) 75%) -5px 0,
    linear-gradient(45deg, transparent 75%, rgba(76, 201, 240, 0.05) 75%) 0 0,
    linear-gradient(45deg, rgba(76, 201, 240, 0.05) 25%, transparent 25%) 0 0;
  background-size: 10px 10px;
  opacity: 0.3;
  z-index: 0;
}

.upload-area:hover {
  border-color: #4cc9f0;
  box-shadow: 0 0 20px rgba(76, 201, 240, 0.2);
  transform: scale(1.01);
}

.upload-area.has-image {
  border-style: solid;
  border-color: rgba(76, 201, 240, 0.5);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #4cc9f0;
  position: relative;
  z-index: 1;
}

.avatar-uploader-icon {
  font-size: 48px;
  color: #4cc9f0;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 0 8px rgba(76, 201, 240, 0.5));
}

.upload-area:hover .avatar-uploader-icon {
  transform: scale(1.1) translateY(-5px);
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  margin-top: 15px;
  color: #a0aec0;
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 1.5;
}

.tip-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234cc9f0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>');
  background-size: contain;
  filter: drop-shadow(0 0 3px rgba(76, 201, 240, 0.5));
}

/* 科技感角落 */
.tech-corner {
  position: absolute;
  width: 15px;
  height: 15px;
  border-color: #4cc9f0;
  opacity: 0.7;
  z-index: 2;
}

.top-left {
  top: 0;
  left: 0;
  border-top: 2px solid;
  border-left: 2px solid;
}

.top-right {
  top: 0;
  right: 0;
  border-top: 2px solid;
  border-right: 2px solid;
}

.bottom-left {
  bottom: 0;
  left: 0;
  border-bottom: 2px solid;
  border-left: 2px solid;
}

.bottom-right {
  bottom: 0;
  right: 0;
  border-bottom: 2px solid;
  border-right: 2px solid;
}

/* 表单元素样式 */
.tech-input {
  background-color: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(76, 201, 240, 0.3);
  border-radius: 8px;
  color: #e0e6ed;
  transition: all 0.3s ease;
}

.tech-input:focus {
  border-color: #4cc9f0;
  box-shadow: 0 0 10px rgba(76, 201, 240, 0.3);
}

:deep(.el-input__wrapper) {
  background-color: transparent !important;
  box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.3) inset !important;
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #4cc9f0 inset !important;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4cc9f0 inset, 0 0 10px rgba(76, 201, 240, 0.3) !important;
}

:deep(.el-input__inner) {
  background-color: transparent !important;
  color: #e0e6ed !important;
  height: 42px;
  font-size: 15px;
}

:deep(.el-form-item__label) {
  color: #4cc9f0 !important;
  font-weight: 500;
  font-size: 15px;
  padding-bottom: 5px;
}

/* 按钮样式 */
.action-section {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.tech-button {
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  padding: 12px 30px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
  height: 48px;
  font-size: 16px;
}

.tech-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.tech-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 201, 240, 0.4);
}

.tech-button:hover::before {
  left: 100%;
}

.tech-button:active {
  transform: translateY(0);
}

.tech-button:disabled {
  background: linear-gradient(135deg, #2d3748, #4a5568);
  box-shadow: none;
  opacity: 0.7;
}

.button-text {
  position: relative;
  z-index: 2;
}

.button-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
  z-index: 1;
}

.tech-button.small {
  padding: 8px 15px;
  font-size: 12px;
  height: auto;
}

.tech-button.danger {
  background: linear-gradient(135deg, #f56565, #ed8936);
}

/* 结果区域样式 */
.results-section {
  margin-top: 40px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.avatar-item {
  background-color: rgba(25, 32, 56, 0.7);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(76, 201, 240, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.avatar-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #4cc9f0, #4361ee);
}

.avatar-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(76, 201, 240, 0.15);
  border-color: rgba(76, 201, 240, 0.4);
}

.avatar-name {
  padding: 15px;
  text-align: center;
  font-size: 18px;
  color: #4cc9f0;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  background-color: rgba(15, 23, 42, 0.5);
  position: relative;
  z-index: 1;
}

.avatar-image-container {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.avatar-result-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.avatar-item:hover .avatar-result-image {
  transform: scale(1.05);
}

.avatar-actions {
  padding: 15px;
  display: flex;
  justify-content: space-around;
  background-color: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(76, 201, 240, 0.2);
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .avatar-creation-container {
    padding: 10px;
  }
  
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-title::before,
  .page-title::after {
    width: 30px;
  }
  
  .tech-line {
    max-width: 80px;
  }
  
  .tech-card {
    padding: 15px;
    border-radius: 8px;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .upload-area {
    height: 250px;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 15px;
  }
  
  .avatar-name {
    font-size: 16px;
    padding: 10px;
  }
  
  .avatar-image-container {
    height: 200px;
  }
  
  .avatar-actions {
    flex-direction: column;
    gap: 10px;
  }
  
  .tech-button.small {
    width: 100%;
  }
  
  .card-header h3 {
    font-size: 1.2rem;
  }
}

/* 平板设备样式 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .avatar-creation-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .content-wrapper {
    gap: 20px;
  }
  
  .card-container {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .avatar-image-container {
    height: 250px;
  }
}

/* 动画效果 */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 201, 240, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(76, 201, 240, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 201, 240, 0);
  }
}

.tech-button:not(:disabled) {
  animation: pulse 2s infinite;
}

/* 科技感光效 */
@keyframes glow {
  0% {
    box-shadow: 0 0 5px rgba(76, 201, 240, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 201, 240, 0.8);
  }
  100% {
    box-shadow: 0 0 5px rgba(76, 201, 240, 0.5);
  }
}

/* 滚动条美化 */
:deep(::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

:deep(::-webkit-scrollbar-track) {
  background: rgba(15, 23, 42, 0.5);
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb) {
  background: rgba(76, 201, 240, 0.3);
  border-radius: 4px;
}

:deep(::-webkit-scrollbar-thumb:hover) {
  background: rgba(76, 201, 240, 0.5);
}
</style>