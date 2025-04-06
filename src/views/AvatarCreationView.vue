<template>
  <div class="container">
    <h2>{{opetitle}}</h2>
    
    <div class="upload-section">
      <el-upload
        class="avatar-uploader"
        action="#"
        :auto-upload="false"
        :on-change="handleImageChange"
        :show-file-list="false"
        :file-list="audioFiles"
        accept="image/*"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar-image" />
        <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
      </el-upload>
      <div class="upload-tip">
        上传一张清晰的正面照片，生成您的专属数字人
      </div>
    </div>
    
    <div class="settings-section">
      <h3>数字人设置</h3>
      
      <el-form label-position="top">
        <el-form-item label="数字人名称">
          <el-input v-model="avatarName" placeholder="请输入数字人名称" />
        </el-form-item>
        

        

      </el-form>
    </div>
    
    <div class="action-section">
      <el-button type="primary" @click="generateAvatar" :disabled="!imageUrl">
        添加数字人
      </el-button>
    </div>
    
    <div v-if="generatedAvatars.length > 0" class="results-section">
      <h3>数字人列表</h3>
      
      <div class="avatar-grid">
        <div 
          v-for="(avatar, index) in generatedAvatars" 
          :key="index"
          class="avatar-item"
        >

          <div  style="width: 200px;text-align: center;font-size: 18px;" >
           {{avatar.name}}
          </div>
          <el-image 
            :src="avatar.pic_url"
            fit="cover"
            class="avatar-result-image"
          />
          <div class="avatar-actions">
            <el-button type="success" size="small" :disabled="avatar.id==-1" @click="saveAvatar(avatar)">
              修改
            </el-button>
            <el-button type="danger" size="small" :disabled="avatar.id==-1" @click="deleteAvatar(avatar,index)">
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
    generatedAvatars.value =data

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
      generatedAvatars.value =data
    })

  }).catch((err) => {

  })



}
</script>

<style scoped>
.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
}

.avatar-uploader {
  width: 300px;
  height: 300px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-uploader:hover {
  border-color: #409EFF;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-tip {
  margin-top: 10px;
  color: #606266;
}

.settings-section {
  max-width: 500px;
  margin: 0 auto 30px;
}

.action-section {
  text-align: center;
  margin-bottom: 30px;
}

.results-section {
  margin-top: 40px;
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.avatar-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.avatar-result-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.avatar-actions {
  padding: 10px;
  display: flex;
  justify-content: space-around;
}

/* 添加媒体查询 */
@media screen and (max-width: 767px) {
  .container {
    padding: 15px;
  }
  
  .avatar-uploader {
    width: 200px;
    height: 200px;
  }
  
  .settings-section {
    max-width: 100%;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .avatar-result-image {
    height: 200px;
  }
  
  .upload-tip {
    font-size: 14px;
    text-align: center;
  }
  
  .action-section {
    margin: 20px 0;
  }
  
  .results-section {
    margin-top: 20px;
  }
  
  .avatar-actions {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }
  
  .avatar-actions .el-button {
    width: 100%;
  }
}

/* 平板设备样式 */
@media screen and (min-width: 768px) and (max-width: 1024px) {
  .avatar-uploader {
    width: 250px;
    height: 250px;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
  
  .avatar-result-image {
    height: 250px;
  }
}
</style>