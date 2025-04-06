<template>
  <div class="container">
    <h2  >{{opetitle}}</h2>



    
    <div class="upload-section">
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
    
    <div class="settings-section">
      <h3>声音设置</h3>
      
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
      <el-button type="primary" @click="cloneVoice"  :disabled="audioFiles.length==0&&!modifyId" >
        添加声音
      </el-button>
    </div>
    
    <div v-if="clonedVoices.length > 0" class="results-section">
      <h3>声音列表</h3>


      <audio id="notionAudio" src="" style="display:none;"></audio>


      <el-table :data="clonedVoices" style="width: 100%">
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="audio_url" label="地址" width="120">

        </el-table-column>
        <el-table-column prop="audio_content" label="内容" width="120">

        </el-table-column>
        <el-table-column prop="adddate" label="创建时间" width="180" />
        <el-table-column prop="userid" label="创建人" width="180" />
        <el-table-column label="操作">
          <template #default="scope">
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
          </template>
        </el-table-column>
      </el-table>
    </div>
    
    <div v-if="showPreview" class="preview-section">
      <h3>声音克隆</h3>
      
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
          
          <audio v-if="previewAudioUrl" controls :src="previewAudioUrl"></audio>
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
  // 这里应该调用后端API保存声音



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
/* 添加媒体查询 */
@media screen and (max-width: 767px) {
  .container {
    padding: 15px;
  }
  
  .upload-section {
    margin-bottom: 20px;
  }
  
  .audio-uploader {
    width: 100%;
    padding: 20px;
  }
  
  .settings-section {
    max-width: 100%;
    margin: 0 auto 20px;
  }
  
  .el-form-item {
    margin-bottom: 15px;
  }
  
  .action-section {
    margin-bottom: 20px;
  }
  
  .results-section {
    margin-top: 20px;
  }
  
  .el-table {
    font-size: 12px;
  }
  
  .el-table-column {
    width: auto !important;
  }
  
  .preview-section {
    margin-top: 20px;
  }
  
  .preview-content {
    max-width: 100%;
  }
  
  .preview-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  audio {
    width: 100%;
  }
  
  .el-button {
    width: 100%;
    margin: 5px 0;
  }
}

/* 平板设备样式 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .upload-section {
    max-width: 600px;
    margin: 0 auto 30px;
  }
  
  .settings-section {
    max-width: 600px;
  }
  
  .preview-content {
    max-width: 800px;
  }
}
</style>