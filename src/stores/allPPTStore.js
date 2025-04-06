import { defineStore } from 'pinia'
import { ref } from 'vue'

export const allPPTStore = defineStore('allppt', () => {
  const ppts = ref([
  ])


  function  setPPTS(p){
    ppts.value=p;
  }
  function addPPT(ppt) {
    ppts.value.push(ppt)
  }

  function  findById(id){
    const index = ppts.value.findIndex(v => v.id === id)
    if (index !== -1) {
      return ppts.value[index]
    }else{
      return  null;
    }
  }

  function removePPT(id) {
    const index = ppts.value.findIndex(v => v.id === id)
    if (index !== -1) {
      ppts.value.splice(index, 1)
    }
  }
  
  return {
    ppts,
    setPPTS,
    findById,
    addPPT,
    removePPT
  }
})