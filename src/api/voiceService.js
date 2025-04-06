// 模拟声音克隆服务API

import axios from "axios";


/**
 * 生成预览音频
 * @param {int} id - 声音id
 * @param {string} text - 生成声音文本
 * @returns {Promise<string>} - 音频URL
 */
export async function generatePreviewAudio(id, text) {


  // 模拟API调用
  return new Promise((resolve) => {
    axios.get(voicecloneurl+"?id="+id+"&text="+text, {}, { })
        .then(response=>{
          resolve(response.data)
        })
  })
}

/**
 * 保存声音
 * @param {File} voice - 声音文件
 * @param {string} name - 声音名称
 * @param {string} content - 声音内容
 * @param {int} id - 修改内容
 * @returns {Promise<boolean>} - 保存结果
 */
export async function saveVoice(file,name,content,id) {
  // 模拟API调用
  return new Promise((resolve) => {



    let param = new FormData(); //创建form对象
    if(file) {
      param.append('file', file);//通过append向form对象添加数据
    }
    param.append('name',name);
    param.append('content',content);
    if(id) {
      param.append('id', id);
    }

    let config = {
      headers:{'Content-Type':'multipart/form-data'} //这里是重点，需要和后台沟通好请求头，Content-Type不一定是这个值
    }; //添加请求头
    axios.post(voiceuploadurl,param,config)
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 查询声音

 * @returns {Promise<List>} - 保存结果
 */
export async function getAllVoice() {
  // 模拟API调用
  return new Promise((resolve) => {



    axios.get(voiceurl, {}, {})
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 删除voice
 * @param {Int} id - voice id
 * @returns {Promise<Map>} - 更新状态
 */
export async function deleteVoiceService(id) {
  // 模拟API调用
  return new Promise((resolve) => {
    axios.delete(voiceurl+"/"+id,null, { })
        .then(response=>{
          resolve(response.data)

        })
  })
}
