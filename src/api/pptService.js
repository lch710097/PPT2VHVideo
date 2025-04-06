

import axios from 'axios';
// 模拟PPT转换服务API




/**
 * 获取所有的ppt
 *
 * @returns {Promise<Array>} - 转换后的PPT页面数组
 */
export async function getAllPPT( ) {
  // 模拟API调用
  return new Promise((resolve) => {

    axios.get(allfileurl,"",null)
        .then(response=>{
          resolve(response.data)
        })
  })
}

/**
 * 上传PPT并转换为图片
 * @param {File} file - PPT文件
 * @returns {Promise<Array>} - 转换后的PPT页面数组
 */
export async function uploadAndConvertPPT(file) {
  // 模拟API调用
  return new Promise((resolve) => {



    let param = new FormData(); //创建form对象
    param.append('file',file);//通过append向form对象添加数据
    param.append('name',file.name);//通过append向form对象添加数据

    let config = {
      headers:{'Content-Type':'multipart/form-data'} //这里是重点，需要和后台沟通好请求头，Content-Type不一定是这个值
    }; //添加请求头
    axios.post(fileuploadurl,param,config)
        .then(response=>{
          resolve(response.data)

        })



    // setTimeout(() => {
    //
    //
    //   // 模拟从服务器获取转换后的PPT页面
    //   const slides = Array.from({ length: 10 }, (_, i) => ({
    //     id: i + 1,
    //     imageUrl: `https://via.placeholder.com/800x450?text=Slide${i + 1}`,
    //     script: `这是第${i + 1}页PPT的默认讲解文稿，请编辑此内容。`
    //   }))
    //
    //   resolve(slides)
    // }, 2000)
  })
}



/**
 * 上传ppt页
 * @param {File} file - PPT页图片
 * @param {int} type - 类型  1 更新 2 上面插入  3 下面插入

 * @param {int} pageid - PPT页id
 * @returns {Promise<Array>} - 转换后的PPT页面数组
 */
export async function uploadPPTPage(file,type,pageid) {
  // 模拟API调用
  return new Promise((resolve) => {
    let param = new FormData(); //创建form对象
    param.append('file',file);//通过append向form对象添加数据
    param.append('type',type);
    param.append('pageid',pageid);
    let config = {
      headers:{'Content-Type':'multipart/form-data'} //这里是重点，需要和后台沟通好请求头，Content-Type不一定是这个值
    }; //添加请求头
    axios.post(pageuploadurl,param,config)
        .then(response=>{
          resolve(response.data)

        })
  })
}




/**
 * 更新ppt page 内容
 * @param {Int} id - PPT page id
 * @param {string} content - PPT page content
 * @returns {Promise<Map>} - 更新状态
 */
export async function uploadPageContent(id,content) {
  // 模拟API调用
  return new Promise((resolve) => {



    axios.put(updatepagecontenturl+"/"+id,null, {params:{
      content:content
    }})
        .then(response=>{
          resolve(response.data)

        })
  })
}



/**
 * 更新ppt page 参数
 * @param {Int} id - PPT page id
 * @param {Int} voiceid - 声音id
 * @param {boolean} voiceforall - 是否全局
 * @param {Int} dgid - 数字人id
 * @param {Int} left - 数字人x
 * @param {Int} top - 数字人y
 * @param {Int} width - 数字人宽度
 * @param {Int} heigth - 数字人高度
 * @param {boolean} dgforall - 是否全局
 * @returns {Promise<Map>} - 更新状态
 */
export async function uploadPageParams(id,voiceid,voiceforall,dgid,left,top,width,height,dgforall,bgtrans) {
    // 模拟API调用
    return new Promise((resolve) => {



        axios.put(updatepageparamurl+"/"+id,null, {params:{
                voiceid:voiceid,
                voiceforall:voiceforall,
                dgid:dgid,
                left:left,
                top:top,
                width:width,
                height:height,
                dgforall:dgforall,
                bgtrans:bgtrans,

            }})
            .then(response=>{
                resolve(response.data)

            })
    })
}




/**
 * 更新ppt 名称
 * @param {Int} id - PPT page id
 * @param {string} name - PPT page content
 * @returns {Promise<Map>} - 更新状态
 */
export async function uploadPPTName(id,name) {
  // 模拟API调用
  return new Promise((resolve) => {



    axios.put(allfileurl+"/"+id,null, {params:{
        name:name
      }})
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 删除ppt page
 * @param {Int} id - PPT page id
 * @returns {Promise<Map>} - 更新状态
 */
export async function deletePPTPage(id) {
  // 模拟API调用
  return new Promise((resolve) => {



    axios.delete(updatepagecontenturl+"/"+id,null, { })
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 删除ppt
 * @param {Int} id - PPT   id
 * @returns {Promise<Map>} - 更新状态
 */
export async function deletePPTService(id) {
  // 模拟API调用
  return new Promise((resolve) => {
    axios.delete(allfileurl+"/"+id,null, { })
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 根据pptid获取页面
 * @param {int} id - PPTid
 * @returns {Promise<Array>} - PPT页面数组
 */
export async function findPageByPPTId(id) {
  // 模拟API调用
  return new Promise((resolve) => {




    let param = {
    }; //创建form对象

    let config = {

    }; //添加请求头
    axios.get(pptpagesurl+"?pptid="+id,param,config)
        .then(response=>{
          resolve(response.data)

      })




  })
}




export async function exortPPT(id) {
    // 模拟API调用
    return new Promise((resolve) => {



        let param = new FormData(); //创建form对象

        param.append('id',id);//通过append向form对象添加数据

        param.append('priority',1);//通过append向form对象添加数据

        axios.post(exportpptsaveurl,param, {})
            .then(response=>{
                resolve(response.data)

            })
    })
}



/**
 * ai生成讲解内容

 * @returns {Promise<Map>} - 保存结果
 */
export async function getContentFromAIService( content,type) {
    // 模拟API调用
    return new Promise((resolve) => {

        let param = new FormData(); //创建form对象

        param.append('content',content);//通过append向form对象添加数据

        param.append('type',type);//通过append向form对象添加数据

        axios.post(aicontenturl, param, {})
            .then(response=>{
                resolve(response.data)

            })
    })
}



export async function getPPTAllExport(id) {
    // 模拟API调用
    return new Promise((resolve) => {

        axios.get(exportpptfindurl+"/"+id, {}, {})
            .then(response=>{
                resolve(response.data)

            })
    })
}

export async function deleteVideoService(id) {
    // 模拟API调用
    return new Promise((resolve) => {
        axios.delete(exportppturl+"/"+id, {}, {})
            .then(response=>{
                resolve(response.data)

            })
    })
}


/**
 * 生成视频
 * @param {Array} slides - PPT页面数组
 * @param {Object} settings - 视频设置
 * @returns {Promise<string>} - 视频URL
 */
export async function generateVideo(slides, settings) {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 模拟视频URL
      const videoUrl = 'https://example.com/video.mp4'
      resolve(videoUrl)
    }, 3000)
  })
}

