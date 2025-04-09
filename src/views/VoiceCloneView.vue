<template>
  <div class="voice-clone-container">
    <div class="page-header">
      <h2 class="page-title">{{opetitle}}</h2>
    </div>

    <div class="content-wrapper">
      <div class="upload-section card-container">
        <h3 class="section-title">上传音频</h3>
        <el-upload
          class="audio-uploader"
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleAudioChange"
          :file-list="audioFiles"
          accept="audio/*"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽音频文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传清晰的语音文件（.mp3, .wav），建议时长30秒以内
            </div>
          </template>
        </el-upload>
      </div>
      
      <div class="settings-section card-container">
        <h3 class="section-title">声音设置</h3>
        
        <el-form label-position="top">
          <el-form-item label="声音名称">
            <el-input v-model="voiceName" placeholder="请输入声音名称" />
          </el-form-item>

          <el-form-item label="内容">
            <el-input v-model="voiceContent" placeholder="内容" />
          </el-form-item>
        </el-form>
      </div>
      
      <div class="action-section">
        <el-button type="primary" class="action-button" @click="cloneVoice" :disabled="audioFiles.length==0&&!modifyId">
          {{ modifyId ? '保存修改' : '添加声音' }}
        </el-button>
      </div>
      
      <div v-if="clonedVoices.length > 0" class="results-section card-container">
        <h3 class="section-title">声音列表</h3>

        <audio id="notionAudio" src="" style="display:none;"></audio>

        <!-- 桌面端表格 -->
        <div class="desktop-table">
          <el-table :data="clonedVoices" style="width: 100%">
            <el-table-column prop="name" label="名称" width="180" />
            <el-table-column prop="audio_content" label="内容" width="120" />
            <el-table-column prop="adddate" label="创建时间" width="180" />
            <el-table-column prop="userid" label="创建人" width="120" />
            <el-table-column label="操作">
              <template #default="scope">
                <div class="action-buttons">
                  <el-button size="small" @click="playAudio(scope.row)">
                    播放原声
                  </el-button>
                  <el-button size="small" @click="previewVoice(scope.row)">
                    克隆声音
                  </el-button>
                  <el-button size="small" type="success" @click="saveVoice2(scope.row)">
                    修改
                  </el-button>
                  <el-button size="small" type="danger" @click="deleteVoice(scope.row,scope.$index)">
                    删除
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 移动端卡片列表 -->
        <div class="mobile-card-list">
          <div v-for="(voice, index) in clonedVoices" :key="voice.id" class="voice-card">
            <div class="voice-info">
              <h4>{{ voice.name }}</h4>
              <p><strong>内容:</strong> {{ voice.audio_content }}</p>
              <p><strong>创建时间:</strong> {{ voice.adddate }}</p>
              <p><strong>创建人:</strong> {{ voice.userid }}</p>
            </div>
            <div class="voice-actions">
              <el-button size="large" @click="playAudio(voice)">播放原声</el-button>
              <el-button size="large" @click="previewVoice(voice)">克隆声音</el-button>
              <el-button size="large" type="success" @click="saveVoice2(voice)">修改</el-button>
              <el-button size="large" type="danger" @click="deleteVoice(voice, index)">删除</el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="showPreview" class="preview-section card-container">
        <h3 class="section-title">声音克隆</h3>
        
        <div class="preview-content">
          <el-input
            v-model="previewText"
            type="textarea"
            :rows="3"
            placeholder="请输入要预览的文本"
          />
          
          <div class="preview-controls">
            <el-button type="primary" @click="generatePreview" :disabled="!previewText">
              生成
            </el-button>
            
            <div v-if="previewAudioUrl" class="audio-player">
              <audio controls :src="previewAudioUrl"></audio>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'

import {
  deleteVoiceService,
  generatePreviewAudio,
  getAllVoice,
  saveVoice
} from '../api/voiceService';
import {deletePPTService, uploadAndConvertPPT} from "../api/pptService.js";
const audioFiles = ref([])
const voiceName = ref('')
const voiceContent = ref('')
const voiceType = ref('male')
const emotionStyle = ref('standard')
const clonedVoices = ref([])
const showPreview = ref(false)
const previewText = ref('这是一段用于测试克隆声音效果的示例文本。通过这段文字，您可以听到克隆声音的音色、语调和情感表达。')
const previewAudioUrl = ref('')
const currentPreviewVoice = ref(null)

const opetitle=ref("添加声音")

const modifyId=ref(null);

const handleAudioChange = (file) => {
  audioFiles.value = [file]
}

// 初始化
onMounted(() => {
  getAllVoice().then(data=>{
    clonedVoices.value = data
  })
})

const cloneVoice = () => {
  if(modifyId.value){
    saveVoice(audioFiles.value.length>0?audioFiles.value[0].raw:null,voiceName.value,voiceContent.value,modifyId.value).then(data=>{
      clonedVoices.value = data
      modifyId.value=null;
      opetitle.value="添加声音";
      voiceName.value="";
      voiceContent.value="";
      audioFiles.value=[];
    });
  }else {
    if (audioFiles.value.length === 0) {
      ElMessage.warning('请先上传音频文件')
      return
    }

    if (!voiceName.value) {
      ElMessage.warning('请输入声音名称')
      return
    }
    if (!voiceContent.value) {
      ElMessage.warning('请输入声音内容')
      return
    }

    ElMessage.info('正在克隆声音，请稍候...')

    saveVoice(audioFiles.value[0].raw, voiceName.value, voiceContent.value).then(data => {
      clonedVoices.value = data
      audioFiles.value=[];
    });
  }
}

const playAudio=(row)=>{
  const audio = document.getElementById('notionAudio');
  audio.src=serverurl+"/"+row.audio_url;
  audio.play()
}

const getVoiceTypeLabel = (type) => {
  const types = {
    male: '男声',
    female: '女声',
    child: '儿童'
  }
  return types[type] || type
}

const getEmotionLabel = (emotion) => {
  const emotions = {
    standard: '标准',
    energetic: '活力',
    gentle: '温柔',
    serious: '严肃'
  }
  return emotions[emotion] || emotion
}

const previewVoice = (voice) => {
  showPreview.value = true
  currentPreviewVoice.value = voice
  previewAudioUrl.value = '' // 清除之前的预览
}

const generatePreview = () => {
  if (!previewText.value) {
    ElMessage.warning('请输入要预览的文本')
    return
  }
  
  if (!currentPreviewVoice.value) {
    ElMessage.warning('请先选择一个声音')
    return
  }
  
  ElMessage.info('正在生成预览音频...')

  generatePreviewAudio(currentPreviewVoice.value.id,previewText.value).then(data=>{
    previewAudioUrl.value = serverurl+"/"+data.url
  })
}

const saveVoice2 = (voice) => {
  opetitle.value="修改声音("+voice.name+")"
  voiceName.value=voice.name;
  voiceContent.value=voice.audio_content;
  modifyId.value=voice.id;
}

const deleteVoice = (voice,index) => {
  ElMessageBox.confirm(
      '将要删除选中的声音，删除之后，将不能恢复，是否继续?',
      '警告',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    deleteVoiceService(voice.id).then(data=>{
      clonedVoices.value = data
      if (clonedVoices.value.length === 0) {
        showPreview.value = false
      }
    })
  }).catch((err) => {
  })
}
</script>

<style scoped>
/* 基础样式 */
.voice-clone-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #0f1629;
  min-height: 100vh;
  color: #e0e6ed;
  position: relative;
  overflow: hidden;
}

/* 背景科技效果 */
.voice-clone-container::before {
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

/* 内容布局 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 30px;
  position: relative;
  z-index: 1;
}

/* 卡片容器样式 */
.card-container {
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

.card-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #4cc9f0, transparent);
  opacity: 0.7;
}

.card-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(76, 201, 240, 0.15);
  border-color: rgba(76, 201, 240, 0.4);
}

.section-title {
  color: #4cc9f0;
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 25px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  position: relative;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  display: inline-block;
  width: 18px;
  height: 18px;
  margin-right: 10px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234cc9f0"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}

/* 上传区域样式 */
.audio-uploader {
  width: 100%;
}

.audio-uploader :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 40px 20px;
  border-color: rgba(76, 201, 240, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: rgba(15, 23, 42, 0.5);
  position: relative;
  overflow: hidden;
}

.audio-uploader :deep(.el-upload-dragger)::before {
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

.audio-uploader :deep(.el-upload-dragger:hover) {
  border-color: #4cc9f0;
  background-color: rgba(76, 201, 240, 0.1);
  transform: scale(1.01);
}

.audio-uploader :deep(.el-icon--upload) {
  font-size: 48px;
  color: #4cc9f0;
  margin-bottom: 15px;
  transition: transform 0.3s ease;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 0 8px rgba(76, 201, 240, 0.5));
}

.audio-uploader :deep(.el-upload-dragger:hover .el-icon--upload) {
  transform: scale(1.1) translateY(-5px);
}

.audio-uploader :deep(.el-upload__text) {
  color: #e0e6ed;
  font-size: 16px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
}

.audio-uploader :deep(.el-upload__text em) {
  color: #4cc9f0;
  font-style: normal;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.audio-uploader :deep(.el-upload__text em:hover) {
  text-shadow: 0 0 8px rgba(76, 201, 240, 0.8);
}

.audio-uploader :deep(.el-upload__tip) {
  color: #a0aec0;
  font-size: 14px;
  margin-top: 12px;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

/* 表单样式 */
.settings-section :deep(.el-form-item__label) {
  font-weight: 500;
  color: #e0e6ed;
  font-size: 15px;
  padding-bottom: 5px;
}

.settings-section :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.3) inset;
  transition: all 0.3s ease;
  background-color: rgba(15, 23, 42, 0.5);
}

.settings-section :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #4cc9f0 inset;
}

.settings-section :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4cc9f0 inset, 0 0 10px rgba(76, 201, 240, 0.3);
}

.settings-section :deep(.el-input__inner) {
  height: 42px;
  font-size: 15px;
  color: #e0e6ed;
  background-color: transparent;
}

/* 按钮样式 */
.action-section {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.action-button {
  min-width: 180px;
  font-weight: 600;
  padding: 12px 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4cc9f0, #4361ee);
  border: none;
  box-shadow: 0 4px 15px rgba(76, 201, 240, 0.3);
  height: 48px;
  font-size: 16px;
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(76, 201, 240, 0.4);
}

.action-button:hover::before {
  left: 100%;
}

.action-button:active {
  transform: translateY(0);
}

/* 表格样式 */
.results-section {
  overflow: hidden;
}

.desktop-table {
  display: block;
}

.desktop-table :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  background-color: transparent;
}

.desktop-table :deep(.el-table__inner-wrapper::before) {
  display: none;
}

.desktop-table :deep(.el-table__header-wrapper th) {
  background-color: rgba(25, 32, 56, 0.9);
  color: #4cc9f0;
  font-weight: 600;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
}

.desktop-table :deep(.el-table__row) {
  background-color: rgba(25, 32, 56, 0.7);
  color: #e0e6ed;
  border-bottom: 1px solid rgba(76, 201, 240, 0.1);
}

.desktop-table :deep(.el-table__row:hover) {
  background-color: rgba(76, 201, 240, 0.2) !important;
  color: #ffffff !important;
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}

.desktop-table :deep(.el-table__row:hover td) {
  background-color: transparent !important;
}

.desktop-table :deep(.el-table__cell) {
  border-bottom: 1px solid rgba(76, 201, 240, 0.1);
}

.desktop-table :deep(.el-button) {
  transition: all 0.3s ease;
  background-color: rgba(25, 32, 56, 0.8);
  border: 1px solid rgba(76, 201, 240, 0.3);
  color: #e0e6ed;
  padding: 10px 16px;
  font-size: 14px;
  height: auto;
  min-height: 40px;
}

.desktop-table :deep(.el-button:hover) {
  transform: translateY(-2px);
  border-color: #4cc9f0;
  color: #4cc9f0;
  background-color: rgba(76, 201, 240, 0.1);
}

.desktop-table :deep(.el-button.el-button--success) {
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  padding: 10px 16px;
  font-size: 14px;
  height: auto;
  min-height: 40px;
}

.desktop-table :deep(.el-button.el-button--success:hover) {
  background-color: rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.8);
  color: #10b981;
}

.desktop-table :deep(.el-button.el-button--danger) {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  padding: 10px 16px;
  font-size: 14px;
  height: auto;
  min-height: 40px;
}

.desktop-table :deep(.el-button.el-button--danger:hover) {
  background-color: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.8);
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.action-buttons .el-button {
  flex: 1;
  min-width: 100px;
}

/* 移动端卡片列表 */
.mobile-card-list {
  display: none;
}

.voice-card {
  border: 1px solid rgba(76, 201, 240, 0.2);
  border-radius: 10px;
  padding: 18px;
  margin-bottom: 20px;
  background-color: rgba(25, 32, 56, 0.7);
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.voice-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: linear-gradient(to bottom, #4cc9f0, #4361ee);
}

.voice-card:hover {
  box-shadow: 0 8px 20px rgba(76, 201, 240, 0.15);
  transform: translateY(-3px);
  border-color: rgba(76, 201, 240, 0.4);
}

.voice-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4cc9f0;
  font-size: 18px;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}

.voice-info h4::before {
  content: '';
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%234cc9f0"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
}

.voice-info p {
  margin: 10px 0;
  color: #e0e6ed;
  font-size: 14px;
  line-height: 1.5;
}

.voice-info p strong {
  color: #a0aec0;
  margin-right: 5px;
}

.voice-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(76, 201, 240, 0.2);
}

.voice-actions .el-button {
  flex: 1;
  min-width: calc(80% - 5px);
  background-color: rgba(25, 32, 56, 0.8);
  border: 1px solid rgba(76, 201, 240, 0.3);
  color: #e0e6ed;
  transition: all 0.3s ease;
  padding: 12px 20px;
  font-size: 16px;
  height: auto;
  min-height: 48px;
}

.voice-actions .el-button:hover {
  transform: translateY(-2px);
  border-color: #4cc9f0;
  color: #4cc9f0;
  background-color: rgba(76, 201, 240, 0.1);
}

.voice-actions .el-button.el-button--success {
  background-color: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.5);
  padding: 12px 20px;
  font-size: 16px;
  height: auto;
  min-height: 48px;
}

.voice-actions .el-button.el-button--success:hover {
  background-color: rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.8);
  color: #10b981;
}

.voice-actions .el-button.el-button--danger {
  background-color: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  padding: 12px 20px;
  font-size: 16px;
  height: auto;
  min-height: 48px;
}

.voice-actions .el-button.el-button--danger:hover {
  background-color: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.8);
  color: #ef4444;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 预览区域样式 */
.preview-section {
  transition: all 0.3s ease;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.preview-content :deep(.el-textarea__wrapper) {
  border-radius: 8px;
  box-shadow: 0 0 0 1px rgba(76, 201, 240, 0.3) inset;
  background-color: rgba(15, 23, 42, 0.5);
}

.preview-content :deep(.el-textarea__inner) {
  padding: 12px;
  min-height: 120px;
  font-size: 15px;
  line-height: 1.6;
  transition: all 0.3s ease;
  color: #e0e6ed;
  background-color: transparent;
}

.preview-content :deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 0 0 1px #4cc9f0 inset;
}

.preview-content :deep(.el-textarea__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #4cc9f0 inset, 0 0 10px rgba(76, 201, 240, 0.3);
}

.preview-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
}

.audio-player {
  width: 100%;
  margin-top: 10px;
  background-color: rgba(15, 23, 42, 0.5);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid rgba(76, 201, 240, 0.2);
}

.audio-player audio {
  width: 100%;
  border-radius: 30px;
  height: 40px;
  filter: hue-rotate(180deg);
}

/* 平板设备样式 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .voice-clone-container {
    padding: 15px;
  }
  
  .page-title {
    font-size: 1.8rem;
  }
  
  .action-buttons {
    flex-direction: row;
  }
  
  .card-container {
    padding: 20px;
  }
  
  .section-title {
    font-size: 1.3rem;
  }
}

/* 移动设备样式 */
@media screen and (max-width: 767px) {
  .voice-clone-container {
    padding: 10px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-title::before,
  .page-title::after {
    width: 30px;
  }
  
  .card-container {
    padding: 15px;
    border-radius: 8px;
  }
  
  .section-title {
    font-size: 1.2rem;
  }
  
  .desktop-table {
    display: none;
  }
  
  .mobile-card-list {
    display: block;
  }
  
  .voice-actions {
    flex-direction: column;
  }
  
  .voice-actions .el-button {
    width: 100%;
    margin-left: 0 !important;
    min-width: 100%;
  }
  
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  
  .action-buttons .el-button {
    width: 100%;
    margin-left: 0 !important;
    margin-bottom: 8px;
  }
  
  .audio-uploader :deep(.el-upload-dragger) {
    padding: 20px 10px;
  }
  
  .audio-uploader :deep(.el-icon--upload) {
    font-size: 36px;
  }
  
  .audio-uploader :deep(.el-upload__text) {
    font-size: 14px;
  }
  
  .action-button {
    width: 100%;
    min-width: auto;
  }
  
  .preview-content :deep(.el-textarea__inner) {
    min-height: 80px;
  }
  
  .audio-player {
    padding: 10px;
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

.action-button:not(:disabled) {
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


.desktop-table :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  background-color: transparent;
  font-size: 15px; /* 增大表格字体 */
}

 

.desktop-table :deep(.el-table__header-wrapper th) {
  background-color: rgba(25, 32, 56, 0.9);
  color: #4cc9f0;
  font-weight: 600;
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  font-size: 16px; /* 增大表头字体 */
}

.desktop-table :deep(.el-table__row) {
  background-color: rgba(25, 32, 56, 0.7);
  color: #e0e6ed;
  border-bottom: 1px solid rgba(76, 201, 240, 0.1);
  font-size: 15px; /* 确保行内字体大小一致 */
}

 

.desktop-table :deep(.el-button) {
  transition: all 0.3s ease;
  background-color: rgba(25, 32, 56, 0.8);
  border: 1px solid rgba(76, 201, 240, 0.3);
  color: #e0e6ed;
  padding: 10px 16px;
  font-size: 15px; /* 增大按钮字体 */
  height: auto;
  min-height: 40px;
}

 

.voice-info h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4cc9f0;
  font-size: 20px; /* 增大移动端卡片标题字体 */
  border-bottom: 1px solid rgba(76, 201, 240, 0.2);
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}

.voice-info p {
  margin: 10px 0;
  color: #e0e6ed;
  font-size: 16px; /* 增大移动端卡片内容字体 */
  line-height: 1.6;
}

.voice-info p strong {
  color: #a0aec0;
  margin-right: 5px;
  font-size: 16px; /* 保持一致的字体大小 */
}
</style>