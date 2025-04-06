// 模拟数字人生成服务API

import axios from "axios";

/**
 * 生成数字人
 * @param {File} imageFile - 用户上传的图片
 * @param {string} name - 数字人名称
 * @param {int} id - 数字人id
 * @returns {Promise<Array>} - 生成的数字人数组
 */
export async function generateAvatarServer(file, name,id) {
  // 模拟API调用
  return new Promise((resolve) => {
    let param = new FormData(); //创建form对象
    if(file) {
      param.append('file', file);//通过append向form对象添加数据
    }
    param.append('name',name);

    if(id) {
      param.append('id', id);
    }

    let config = {
      headers:{'Content-Type':'multipart/form-data'} //这里是重点，需要和后台沟通好请求头，Content-Type不一定是这个值
    }; //添加请求头
    axios.post(avataruploadurl,param,config)
        .then(response=>{
          resolve(response.data)

        })
  })
}


/**
 * 查询所有数字人

 * @returns {Promise<boolean>} - 保存结果
 */
export async function getAllAvatar( ) {
  // 模拟API调用
  return new Promise((resolve) => {

    axios.get(avatarurl, {}, {})
        .then(response=>{
          resolve(response.data)

        })
  })
}





/**
 * 保存数字人
 * @param {Object} avatar - 数字人对象
 * @returns {Promise<boolean>} - 保存结果
 */
export async function saveAvatar(avatar) {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true)
    }, 500)
  })
}


/**
 * 删除数字人
 * @param {int} id - 数字人id
 * @returns {Promise<array>} - 保存结果
 */
export async function deleteAvatarService(id) {
  // 模拟API调用
  return new Promise((resolve) => {
    axios.delete(avatarurl+"/"+id, {}, {})
        .then(response=>{
          resolve(response.data)

        })
  })
}