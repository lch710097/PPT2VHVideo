import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePptStore = defineStore('ppt', () => {
  const pptSlides = ref([])
  const currentSlideIndex = ref(0)
  const selectedAvatarId = ref('')
  const selectedVoiceId = ref('')
  
  function setSlides(slides) {
    pptSlides.value = slides
  }
  
  function updateSlideScript(index, script) {

    if (index >= 0 && index < pptSlides.value.length) {
      pptSlides.value[index].pagecontent = script
    }
  }
  
  function selectSlide(index) {
    if (index >= 0 && index < pptSlides.value.length) {
      currentSlideIndex.value = index
    }
  }
  
  function setAvatar(id) {
    selectedAvatarId.value = id
  }
  
  function setVoice(id) {
    selectedVoiceId.value = id
  }
  
  return {
    pptSlides,
    currentSlideIndex,
    selectedAvatarId,
    selectedVoiceId,
    setSlides,
    updateSlideScript,
    selectSlide,
    setAvatar,
    setVoice
  }
})