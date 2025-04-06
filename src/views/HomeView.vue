<template>
  <div class="container">
    <!-- PPT编辑区域 -->
    <div class="ppt-editor-container">
      <div class="editor-header">
<!--        <h2 class="editor-title"   v-html="selectPPTName" ></h2>-->

        <input v-if = "titleedit" v-model = "selectPPTName"
               @blur= "titleedit = false; $emit('update')"

               @keyup.enter = "updatePPTName">

          <h2   v-else class="editor-title"  @click = "titleedit = true;$emit('update')"> {{selectPPTName}} ({{selectPPTLength}} )</h2>




        <el-select
            v-model="selectPPT"
            style="width: 600px;"
            placeholder="请选择"
            clearable
            filterable

            @change="selectChange"
        >
          <el-option
              v-for="(item,index) in availablePpts"
              :key="index"
              :label="item.name"
              :value="item.id" />
        </el-select>

        <el-button type="primary" @click="deletePPT" class="upload-empty-btn">
          <el-icon><delete-filled /> </el-icon>删除当前PPT
        </el-button>
        <el-button type="primary" @click="uploadFileClick" class="new-upload-btn">
          <el-icon><upload-filled /></el-icon> 上传PPT
        </el-button>
      </div>
      
      <div class="ppt-editor">
        <!-- 左侧PPT缩略图列表 -->
        <div class="ppt-thumbnails">
          <div v-if="pptSlides.length === 0" class="empty-thumbnails">
            <el-empty description="暂无PPT页面" />


            <el-button type="primary" @click="showUploadDialog = true" class="upload-empty-btn">
              上传PPT
            </el-button>


          </div>
          <div 
            v-for="(slide, index) in pptSlides" 
            :key="index"
            class="ppt-slide"
            :class="{ active: currentSlideIndex === index }"
            @contextmenu.stop="showRightMenu($event,slide,index)"
            @click="selectSlide(index,slide)"
          >
            <el-image v-if="slide.pageurl.indexOf('.jpg')>1||slide.pageurl.indexOf('.png')>1"
              :src="slide.pageurl"
              fit="contain"
              class="thumbnail-image"
            />

            <video     v-else   :src="slide.pageurl"
                           fit="contain"                       class="thumbnail-image"            >

            </video>
            <div class="slide-number">{{ index + 1 }}</div>
          </div>


        </div>

        <!-- 中间内容区域 -->
        <div class="ppt-content">
          <!-- 当前选中的PPT页面 -->

          <div class="ppt-content2">
          <div class="current-slide">
            <el-image 
              v-if="currentSlide&&(currentSlide.pageurl.indexOf('.jpg')>1||currentSlide.pageurl.indexOf('.png')>1)"
              :src="currentSlide.pageurl"
              fit="contain"
              class="slide-image"
            />

            <video     v-else-if="currentSlide&&currentSlide.pageurl"   :src="currentSlide.pageurl"
                       controls   fit="contain"                       class="slide-image"            >

            </video>
            <div v-else class="empty-slide">
              <el-empty description="请上传PPT或选择一个PPT页面" />
            </div>

            <!-- 数字人位置预览 -->
            <div v-if="currentSlide && selectedAvatar&&selectedAvatar.id>0" class="virtual-human"
                :style="{
                  left: (virtualHumanPosition.x/2) + 'px',
                  top: (virtualHumanPosition.y/2) + 'px',
                  width:(virtualHumanSize.x/2)+'px',
                  height:(virtualHumanSize.y/2)+'px',
                  alt:'鼠标滚轮改变大小',

                  backgroundImage: `url(${selectedAvatar.pic_url})`
                }"
                @mousedown.prevent="startDrag"
                 @mousewheel.prevent="gunLun"



            ></div>
          </div>

          </div>

          <!-- 讲解文稿 -->
          <div class="script-editor">
            <h3 class="section-title">讲解文稿   <el-button type="primary" @click="getContentFromAI(1)" class="preview-btn"  style="float:right;margin: 10px;"> AI生成</el-button><el-button type="warning" @click="getContentFromAI(2)" class="preview-btn"  style="float:right;margin: 10px;"> AI简化</el-button></h3>
            <el-input
              v-if="currentSlide"
              v-model="currentSlide.pagecontent"
              type="textarea"
              :rows="5"
              placeholder="请输入此页PPT的讲解文稿"
              @input="updateScript"


              class="script-textarea"
            />
            <el-input
              v-else
              type="textarea"
              :rows="5"
              placeholder="请先上传PPT并选择一个页面"
              disabled
              class="script-textarea"
            />
          </div>

          <!-- 音频选择 -->
          <div class="audio-selector">
            <h3 class="section-title">音频设置</h3>

            <input type="checkbox" v-model="voiceforall" value="1" @click="voiceforall=!voiceforall">应用于全局



            <div class="audio-controls">
              <el-select v-model="selectedVoice" @change="changePPTPageParam" placeholder="选择讲解音频" class="voice-select">
                <el-option
                  v-for="voice in availableVoices"
                  :key="voice.id"
                  :label="voice.name"
                  :value="voice.id"
                />
              </el-select>
              <el-button type="primary" @click="previewAudio" class="preview-btn">
                <el-icon class="el-icon--left"><headset /></el-icon>预览音频
              </el-button>
              <audio v-if="previewAudioUrl" controls :src="previewAudioUrl"></audio>
            </div>
          </div>
        </div>

        <!-- 右侧设置区域 -->
        <div class="settings-panel">
          <h3 class="settings-title">数字人设置   </h3>


          
          <!-- 数字人选择 -->
          <div class="avatar-selector">
            <el-radio-group v-model="selectedAvatarId" @change="changeAvatar">
              <div v-for="avatar in availableAvatars" :key="avatar.id" class="avatar-option">
                <el-radio :label="avatar.id">
                  <div class="avatar-preview">
                    <el-image 
                      :src="avatar.pic_url"
                      fit="contain"
                      class="avatar-image"
                    />
                    <span class="avatar-name">{{ avatar.name }}</span>
                  </div>
                </el-radio>
              </div>
            </el-radio-group>


          </div>

          <!-- 数字人位置设置 -->
          <div class="position-settings">
            <h4 class="position-title">位置设置(1920*1080)</h4>

            <div style="margin-bottom: 10px;">
            <el-button type="success"   @click="changePos(1)"   >
              左上角
            </el-button>
            <el-button type="success"  @click="changePos(2)"  >
              左下角
            </el-button>
            </div>
            <div style="margin-bottom: 10px;">
            <el-button type="success"      @click="changePos(3)"  >
              右上角
            </el-button>

            <el-button type="success"      @click="changePos(4)"  >
              右下角
            </el-button>

            </div>

            <div style="margin-bottom: 10px;">
              <el-button type="success"     @click="changePos(5)"  >
                靠左居中
              </el-button>

              <el-button type="success"    @click="changePos(6)"    >
                靠右居中
              </el-button>

            </div>

            <div style="margin-bottom: 10px;">
              <el-button type="success"     @click="changePos(7)"  >
                靠上居中
              </el-button>

              <el-button type="success"      @click="changePos(8)"  >
                靠下居中
              </el-button>

            </div>


            <h4 class="position-title">自定义位置</h4>
            <div class="position-controls">
              <div class="position-input">
                <span class="coordinate-label">X坐标:</span>
                <el-input-number
                    @change="changePPTPageParam"
                    v-model="virtualHumanPosition.x"
                    :min="-200"
                    :max="4960"
                    size="small"
                    class="coordinate-input"
                />
              </div>
              <div class="position-input">
                <span class="coordinate-label">Y坐标:</span>
                <el-input-number
                    @change="changePPTPageParam"
                    v-model="virtualHumanPosition.y"
                    :min="-200"
                    :max="2180"
                    size="small"
                    class="coordinate-input"
                />
              </div>
            </div>
            <h4 class="position-title">大小设置</h4>
            <div class="position-controls">
              <div class="position-input">
                <span class="coordinate-label">宽度:</span>
                <el-input-number
                    @change="changePPTPageParam"
                  v-model="virtualHumanSize.x"
                  :min="0"
                  :max="512"
                  size="small"
                  class="coordinate-input"
                />
              </div>
              <div class="position-input">
                <span class="coordinate-label">高度:</span>
                <el-input-number
                    @change="changePPTPageParam"
                  v-model="virtualHumanSize.y"
                  :min="0"
                  :max="512"
                  size="small"
                  class="coordinate-input"
                />
              </div>
            </div>

            <input type="checkbox" v-model="istranspbg" value="1" @click="istranspbg=!istranspbg" @change="changePPTPageParam">背景透明

            <input type="checkbox" v-model="avatarforall" value="1" @click="avatarforall=!avatarforall" @change="changePPTPageParam">应用于全局

          </div>
        </div>
      </div>

      <!-- 导出视频按钮 -->
      <div class="export-section">
        <el-button type="success" size="large" @click="exportVideo" class="export-btn" :disabled="!pptSlides.length">
          <el-icon class="el-icon--left"><video-camera /></el-icon> 导出视频
        </el-button>
      </div>


      <div v-if="exportVideoData.length > 0" class="export-section">
        <h3>导出列表</h3>





        <el-table :data="exportVideoData" style="width: 100%">
          <el-table-column prop="adddate" label="添加时间" width="180" />

          <el-table-column prop="video_length" label="长度(秒)" width="120">

          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="180" />
          <el-table-column prop="process" label="导出进度" width="120">

          </el-table-column>
          <el-table-column prop="donedate" label="完成时间" width="180" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button size="small" :disabled="!scope.row.video_url" @click="openVideo(scope.row)">
                播放
              </el-button>


              <el-button size="small" type="success" :disabled="!scope.row.video_url" @click="downloadVideo(scope.row)">
                下载
              </el-button>
              <el-button size="small" type="danger" @click="deleteVideo(scope.row,scope.$index)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 上传PPT对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      title="上传PPT"
      width="500px"
      center
      destroy-on-close
      class="upload-dialog"
    >
      <div class="upload-dialog-content">
        <el-upload
          class="upload-area"
          drag
          ref="fileUpload"
          action="#"
          accept=".ppt,.pptx"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="fileList"
          :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽PPT文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传PPT文件（.ppt, .pptx）
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUploadDialog = false;fileList.value=[];">取消</el-button>
          <el-button type="primary" @click="uploadPPT" :disabled="!fileList.length">
            上传并转换
          </el-button>
        </span>
      </template>
    </el-dialog>


    <el-dialog
        v-model="showUploadImageDialog"
        title="上传图片或视频"
        width="500px"
        center
        destroy-on-close
        class="upload-dialog"
    >
      <div class="upload-dialog-content">
        <el-upload
            class="upload-area"
            drag
            action="#"
            :auto-upload="false"
            accept=".jpg,.png,.mp4,.mkv,.webm"
            :on-change="handleImageChange"
            :file-list="imageList"
            :limit="1"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽图片或视频文件到此处或 <em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传图片或视频文件（.png, .jpg,.mp4,.mkv,.webm）
            </div>
          </template>
        </el-upload>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imageList=[];showUploadImageDialog = false;">取消</el-button>
          <el-button type="primary" @click="uploadImage" :disabled="!imageList.length">
            上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

import {
  uploadAndConvertPPT,
  generateVideo,
  getAllPPT,
  findPageByPPTId,
  uploadPageContent,
  uploadPPTName,
  deletePPTPage,
  uploadPPTPage,
  deletePPTService,
  uploadPageParams,
  exortPPT,

  getPPTAllExport,
  deleteVideoService, getContentFromAIService
} from '../api/pptService';
import { generatePreviewAudio, getAllVoice} from "../api/voiceService";
import {getAllAvatar} from "../api/avatarService";
import { useAvatarStore } from '../stores/avatarStore';
import { useVoiceStore } from '../stores/voiceStore';
import { usePptStore } from '../stores/pptStore';



import { allPPTStore } from '../stores/allPPTStore';

import ContextMenu from '@imengyu/vue3-context-menu'
import {Delete} from "@element-plus/icons-vue";
import axios from "axios";


// 使用 store
const avatarStore = useAvatarStore();
const voiceStore = useVoiceStore();
const pptStore = usePptStore();

const allPPT = allPPTStore();

const voiceforall=ref(true)

const avatarforall=ref(true)

const istranspbg=ref(false)

// 文件上传相关
const fileList = ref([]);
const imageList = ref([]);
const pptSlides = ref([]);
const currentSlideIndex = ref(0);
const showUploadDialog = ref(false);

const showUploadImageDialog = ref(false);

const titleedit=ref(false);

// 数字人相关
const virtualHumanPosition = ref({ x: 300, y: 300 });

const virtualHumanSize = ref({ x: 300, y: 300 });
const selectedAvatarId = ref('');

// 音频相关
const selectedVoice = ref('');

const selectPPT = ref(0);

const selectPPTName = ref('');
const selectPPTLength = ref('');
const previewAudioUrl = ref('')


const exportVideoData=ref([]);

const userid=ref(0);


// 初始化
onMounted(() => {
  // 如果有可用的数字人，默认选择第一个

  
  // 如果有可用的声音，默认选择第一个

  const sesionid= localStorage.getItem('sessionid');

  axios.get(getuserurl+"?sessionid="+sesionid,"",null)
      .then(response=>{

        if(response.data.name){
          userid.value=response.data.id;

        }
        getData();
      })

     const getData=()=> {
       getAllVoice(userid.value).then(data => {
         data.forEach(function (item) {
           item.audio_url = serverurl + "/" + item.audio_url;
         });
         voiceStore.setVoices(data);
         if (availableVoices.value.length > 0) {
           selectedVoice.value = availableVoices.value[0].id;
         }
       })


       getAllAvatar(userid.value).then(data => {


         data.forEach(function (item) {
           item.pic_url = serverurl + "/" + item.pic_url;
         });


         avatarStore.setAvatars(data);
         if (availableAvatars.value.length > 0) {
           selectedAvatarId.value = availableAvatars.value[0].id;
         }
       })


       getAllPPT(userid.value).then(data => {

         data.sort(function (a, b) {
           return a.adddate - b.adddate
         })

         allPPT.setPPTS(data);
         if (data.length > 0) {
           selectPPT.value = data[0].id;
           selectChange(selectPPT.value)
         }

       });
     }
  handleIsExport();

});

// 计算当前选中的幻灯片
const currentSlide = computed(() => {
  if (pptSlides.value.length === 0) return null;
  return pptSlides.value[currentSlideIndex.value];
});

// 计算可用的数字人列表
const availableAvatars = computed(() => {
  return avatarStore.avatars;
});

// 计算可用的声音列表
const availableVoices = computed(() => {
  return voiceStore.voices;
});


const availablePpts = computed(() => {
  return allPPT.ppts;
});

// 计算当前选中的数字人
const selectedAvatar = computed(() => {
  return availableAvatars.value.find(avatar => avatar.id === selectedAvatarId.value);
});

// 处理文件选择
const handleFileChange = (file) => {
  fileList.value = [file];
};

const handleImageChange = (file) => {
  imageList.value = [file];
};

const handleIsExport=()=>{
     let isnoexport=false;
     const exports=exportVideoData.value;
     for(let  i=0;i<exports.length;i++){
       const exprow=exports[i];
       if(exprow!=100&&!exprow.video_url){
          isnoexport=true;
          break;
       }
     }

     if(isnoexport&&selectPPT.value){

       getPPTAllExport(selectPPT.value).then(data=>{
         exportVideoData.value=data;
       })
     }
     setTimeout(handleIsExport,5000);
}

// 上传PPT并转换为图片
const uploadPPT = async () => {
  if (!fileList.value.length) {
    ElMessage.warning('请先选择PPT文件');
    return;
  }

  // 显示上传中提示
  ElMessage.info('正在上传并转换PPT，请稍候...');
  
  try {
    // 调用API上传PPT并转换为图片
    const datas = await uploadAndConvertPPT(fileList.value[0].raw);

    const slides=datas.pages;
    slides.sort(function(a, b){return a.pageindex - b.pageindex});
    const ppt=datas.ppt


    availablePpts.value.push(ppt);

      selectPPT.value = ppt.id;


    slides.forEach((v, i) => {
      v.pageurl=serverurl+"/"+v.pageurl;
    })
    
    // 更新状态
    pptSlides.value = slides;
    pptStore.setSlides(slides);
    currentSlideIndex.value = 0;

    selectChange(selectPPT.value)
    
    // 关闭对话框
    showUploadDialog.value = false;


    fileList.value=[];
    ElMessage.success('PPT转换完成！');
  } catch (error) {
    ElMessage.error('PPT转换失败，请重试');
    console.error('PPT转换失败:', error);
  }
};


const deletePPT=()=>{


  ElMessageBox.confirm(
      '将要删除选中的PPT，删除之后，将不能恢复，是否继续?',
      '警告',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    if(!selectPPT.value){
      ElMessage.warning('请先选择PPT');
      return;
    }

    deletePPTService(selectPPT.value).then(data=>{

      data.sort(function (a,b){ return a.adddate-b.adddate})

      allPPT.setPPTS(data);
      if(data.length>0) {
        selectPPT.value = data[0].id;
        selectChange(selectPPT.value)
      }
    })

  }).catch((err) => {

  })




}
const uploadImage = async () => {
  if (!imageList.value.length) {
    ElMessage.warning('请先选择图片');
    return;
  }

  // 显示上传中提示
  ElMessage.info('正在上传图片，请稍候...');

  try {
    // 调用API上传PPT并转换为图片
    const datas = await uploadPPTPage(imageList.value[0].raw,pageedittype,selslide.id);

    const slides=datas.pages;

    slides.sort(function(a, b){return a.pageindex - b.pageindex});
    const ppt=datas.ppt

   // selectPPT.value = ppt.id;

    var min=parseInt(ppt.videocount/60);
    var sec=parseInt(ppt.videocount%60);
    selectPPTLength.value= (min>0?min+"分":"")+sec+"秒";


    slides.forEach((v, i) => {
      v.pageurl=serverurl+"/"+v.pageurl;
    })

    // 更新状态
    pptSlides.value = slides;
    pptStore.setSlides(slides);

    // 关闭对话框
    showUploadImageDialog.value = false;

    imageList.value=[];

    ElMessage.success('PPT转换完成！');
  } catch (error) {
    ElMessage.error('PPT转换失败，请重试');
    console.error('PPT转换失败:', error);
  }
};

// 选择幻灯片
const selectSlide = (index,slide) => {
  currentSlideIndex.value = index;
  pptStore.selectSlide(index);

  changeSlideParams(slide)
};

// 更新讲解文稿
const updateScript = () => {

  if (!currentSlide.value) return;
  pptStore.updateSlideScript(currentSlideIndex.value, currentSlide.value.pagecontent);

  uploadPageContent(currentSlide.value.id,currentSlide.value.pagecontent).then(data=>{

    if(data.ppt){
      var min=parseInt(data.ppt.videocount/60);
      var sec=parseInt(data.ppt.videocount%60);
      selectPPTLength.value= (min>0?min+"分":"")+sec+"秒";
    }


  })



};

// 更换数字人
const changeAvatar = (avatarId) => {
  selectedAvatarId.value = avatarId;
  pptStore.setAvatar(avatarId);

  changePPTPageParam();
};


const selectChange=(pptid)=>{



  selectPPT.value=pptid;
  titleedit.value=false;
  selectPPTName.value=allPPT.findById(pptid).name;

  var min=parseInt(allPPT.findById(pptid).videocount/60);
  var sec=parseInt(allPPT.findById(pptid).videocount%60);
  selectPPTLength.value= (min>0?min+"分":"")+sec+"秒";

  ElMessage.info('查询页面中，请稍候...');
  findPageByPPTId(pptid).then(slides=>{

      slides.sort(function(a, b){return a.pageindex - b.pageindex});
      slides.forEach((v, i) => {
        v.pageurl=serverurl+"/"+v.pageurl;
      })

      // 更新状态
      pptSlides.value = slides;
      pptStore.setSlides(slides);
      currentSlideIndex.value = 0;


      changeSlideParams(slides[0])



    });

  getPPTAllExport(pptid).then(data=>{
    exportVideoData.value=data;
  })
}

const changeSlideParams=(slide)=>{
  selectedVoice.value= slide.soundid;
  selectedAvatarId.value=slide.digitalhunmanid;


  virtualHumanPosition.value.x=slide.dh_posleft;
  virtualHumanPosition.value.y=slide.dh_postop;
  virtualHumanSize.value.x=slide.dh_width;
  virtualHumanSize.value.y=slide.dh_height;

}

const updatePPTName=(value)=>{
  const  name=value.target.value;

  const pptid=selectPPT.value;


  uploadPPTName(pptid,name).then(data=>{
    titleedit.value=false;
    const ppt=allPPT.findById(pptid);
    ppt.name=name;
  })


}

let pageedittype=0;
let selslide=null;

const showRightMenu=(e,slide,index)=>{



  e.preventDefault();

  //show your menu
  ContextMenu.showContextMenu({
    x: e.x,
    y: e.y,
    items: [
      {
        label: "修改页面",
        onClick: () => {
          pageedittype=1;
          selslide=slide;
          currentSlideIndex.value = index;
          showUploadImageDialog.value=true;
        }
      },
      {
        label: "上方插入页面",
        onClick: () => {
          pageedittype=2;
          selslide=slide;
          currentSlideIndex.value = index;
          showUploadImageDialog.value=true;
        }
      },
      {
        label: "下方插入页面",
        onClick: () => {
          pageedittype=3;
          selslide=slide;
          currentSlideIndex.value = index;
          showUploadImageDialog.value=true;
        }
      },
      {
        label: "删除",
        onClick: () => {
          deletePPTPage(slide.id).then(data=>{

            if(data) {
              var min = parseInt(data.videocount / 60);
              var sec = parseInt(data.videocount % 60);
              selectPPTLength.value = (min > 0 ? min + "分" : "") + sec + "秒";
            }
            pptStore.pptSlides.slice(index,1);
            pptSlides.value.splice(index,1);
          })
        }
      },
    ]
  });
}

const uploadFileClick=()=>{
  fileList.value=[];


  showUploadDialog.value = true;
}
// 预览音频
const previewAudio = () => {
  if (!currentSlide.value || !currentSlide.value.pagecontent) {
    ElMessage.warning('请先输入讲解文稿');
    return;
  }
  
  if (!selectedVoice.value) {
    ElMessage.warning('请选择讲解音频');
    return;
  }

  const content=currentSlide.value.pagecontent;
  const voiceid=selectedVoice.value;


  generatePreviewAudio(voiceid,content).then(data=>{

    if(data) {
      previewAudioUrl.value = serverurl + "/" + data.url

    }else{
      ElMessage.warning('生成音频失败,请确认音频服务已经开启');
    }

  })

  

};


const changePPTPageParam=()=>{


  uploadPageParams(currentSlide.value.id,selectedVoice.value,voiceforall.value,selectedAvatarId.value,
   virtualHumanPosition.value.x,virtualHumanPosition.value.y,virtualHumanSize.value.x,virtualHumanSize.value.y,
   avatarforall.value,istranspbg.value).then(data=> {
    const slides = data.pages;

    slides.sort(function (a, b) {
      return a.pageindex - b.pageindex
    });


    slides.forEach((v, i) => {
      v.pageurl = serverurl + "/" + v.pageurl;
    })

    // 更新状态
    pptSlides.value = slides;
    pptStore.setSlides(slides);
  })
}



const changePos=(type)=>{

  if(type==1){

    virtualHumanPosition.value.x=0;
    virtualHumanPosition.value.y=0;

  }else if(type==2){

    virtualHumanPosition.value.x=0;
    virtualHumanPosition.value.y=1080-virtualHumanSize.value.y;

  }else if(type==3){

    virtualHumanPosition.value.x=1920-virtualHumanSize.value.x;
    virtualHumanPosition.value.y=0;

  }else if(type==4){

    virtualHumanPosition.value.x=1920-virtualHumanSize.value.x;
    virtualHumanPosition.value.y=1080-virtualHumanSize.value.y;

  }else if(type==5){

    virtualHumanPosition.value.x=0;
    virtualHumanPosition.value.y=(1080-virtualHumanSize.value.y)/2;

  }else if(type==6){

    virtualHumanPosition.value.x=1920-virtualHumanSize.value.x;
    virtualHumanPosition.value.y=(1080-virtualHumanSize.value.y)/2;

  }else if(type==7){

    virtualHumanPosition.value.x=(1920-virtualHumanSize.value.x)/2;
    virtualHumanPosition.value.y=0;

  }else if(type==8){

    virtualHumanPosition.value.x=(1920-virtualHumanSize.value.x)/2;
    virtualHumanPosition.value.y=1080-virtualHumanSize.value.y;

  }

  changePPTPageParam();
}

const gunLun = (e) => {
   const scale= e.wheelDelta / 1200;

   virtualHumanSize.value.x=parseInt(virtualHumanSize.value.x*(1+scale))
  virtualHumanSize.value.y=parseInt(virtualHumanSize.value.y*(1+scale))

  changePPTPageParam()

}
// 拖拽数字人
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let initialX = 0;
let initialY = 0;

const maxwidth=4960;
const maxheight=2180;

const startDrag = (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartY = e.clientY;
  initialX = virtualHumanPosition.value.x;
  initialY = virtualHumanPosition.value.y;
  
  document.addEventListener('mousemove', onDrag);
  document.addEventListener('mouseup', stopDrag);
};

const onDrag = (e) => {
  if (!isDragging) return;
  
  const dx = e.clientX - dragStartX;
  const dy = e.clientY - dragStartY;

  
  virtualHumanPosition.value = {
    x: Math.max(0, Math.min(maxwidth, initialX + dx)),
    y: Math.max(0, Math.min(maxheight, initialY + dy))
  };
};

const stopDrag = () => {
  isDragging = false;
  document.removeEventListener('mousemove', onDrag);
  document.removeEventListener('mouseup', stopDrag);

  changePPTPageParam()
};


const openVideo=(row)=>{


  window.open(serverurl+"/"+row.video_url)

}


const downloadVideo=(row)=>{


  const link = document.createElement('a')

  let url = serverurl+"/"+row.video_url
  fetch(url)
      .then((res) => res.blob())
      .then((blob) => {

        link.href = URL.createObjectURL(blob)
        link.download = selectPPTName.value // 重命名的名字
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link) // 移除a标签
      })



}

const deleteVideo=(row,index)=>{
  ElMessageBox.confirm(
      '将要删除导出视频，删除之后，将不能恢复，是否继续?',
      '警告',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {

    deleteVideoService(row.id).then(data=>{

      exportVideoData.value = data



    })

  }).catch((err) => {

  })
}


const getContentFromAI=(type)=>{

  const content=currentSlide.value.pagecontent;


  getContentFromAIService(content,type).then(data=>{

    if(data.content){

      currentSlide.value.pagecontent=data.content;
      updateScript();
    }else if(data.msg){
      ElMessage.warning('AI获取内容错误:'+data.msg);
    }

  })


}

// 导出视频
const exportVideo = () => {


  if (!selectPPT.value) {
    ElMessage.warning('请先选择导出PPT');
    return;
  }
  
  if (!selectedAvatarId.value) {
    ElMessage.warning('请选择数字人');
    return;
  }
  
  if (!selectedVoice.value) {
    ElMessage.warning('请选择讲解音频');
    return;
  }


  exortPPT(selectPPT.value).then(data=>{
    exportVideoData.value=data;

  })

};

</script>

<style scoped>
/* 全局样式 */
.container {
  max-width: 98%;
  margin: 0 auto;
  padding: 20px;
  color: #2c3e50;
}

/* 编辑器样式 */
.ppt-editor-container {
  background-color: #f9fafc;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.editor-title {
  font-size: 24px;
  color: #409EFF;
  margin: 0;
}

.new-upload-btn {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ppt-editor {
  display: grid;
  grid-template-columns: 200px 1fr 250px;
  gap: 20px;
  margin-bottom: 30px;
}

/* 左侧缩略图列表 */
.ppt-thumbnails {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 600px;
  overflow-y: auto;
}

.empty-thumbnails {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.upload-empty-btn {
  margin-top: 10px;
}

.ppt-slide {
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 6px;
  margin-bottom: 15px;
  transition: all 0.3s;
  overflow: hidden;
  background-color: #f5f7fa;
}

.ppt-slide:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.ppt-slide.active {
  border: 2px solid #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.thumbnail-image {
  width: 100%;
  height: 120px;
  object-fit: contain;
  background-color: white;
}

.slide-number {
  text-align: center;
  padding: 5px;
  font-size: 12px;
  color: #606266;
  background-color: #f5f7fa;
}

/* 中间内容区域 */
.ppt-content {
  display: flex;
  flex-direction: column;
  gap: 20px;

}


/* 中间内容区域 */
.ppt-content2 {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}
.current-slide {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 960px;
  height: 540px;
}

.slide-image {
  width: 100%;
  height: 540px;
  object-fit: contain;
}

.empty-slide {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #909399;
  font-size: 16px;
}

.section-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 500;
}

.script-editor {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.script-textarea {
  width: 100%;
}

.audio-selector {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.audio-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.voice-select {
  flex: 1;
}

/* 右侧设置区域 */
.settings-panel {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: fit-content;
}

.settings-title {
  font-size: 18px;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
}

.avatar-selector {
  margin-bottom: 20px;
}

.avatar-option {
  margin-bottom: 15px;
  height: 66px;
}

.avatar-preview {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar-image {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.avatar-name {
  font-size: 14px;
}

.position-title {
  font-size: 16px;
  color: #303133;
  margin-bottom: 10px;
  font-weight: 500;
}

.position-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.position-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.coordinate-label {
  width: 60px;
  font-size: 14px;
  color: #606266;
}

.coordinate-input {
  width: 120px;
}

/* 导出按钮 */
.export-section {
  text-align: center;
  margin-top: 20px;
}

.export-btn {
  padding: 12px 25px;
  font-size: 16px;
  background: linear-gradient(135deg, #67C23A 0%, #4caf50 100%);
  border: none;
  border-radius: 8px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.export-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

/* 上传对话框 */
.upload-dialog-content {
  padding: 20px 0;
}

.upload-area {
  width: 100%;
}

/* 数字人 */
.virtual-human {
  position: absolute;
  width: 300px;
  height: 300px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: move;
  filter: drop-shadow(0 0 8px rgba(0, 0, 0, 0.2));
}
</style>