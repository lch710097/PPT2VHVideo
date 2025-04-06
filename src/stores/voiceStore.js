import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useVoiceStore = defineStore('voice', () => {
  const voices = ref()
  
  function addVoice(voice) {
    voices.value.push(voice)
  }

  function setVoices(voice) {
    voices.value=voice;
  }

  function removeVoice(id) {
    const index = voices.value.findIndex(v => v.id === id)
    if (index !== -1) {
      voices.value.splice(index, 1)
    }
  }
  
  return {
    voices,
    addVoice,
    setVoices,
    removeVoice
  }
})