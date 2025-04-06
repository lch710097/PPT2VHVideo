import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAvatarStore = defineStore('avatar', () => {
  const avatars = ref( )
  
  function addAvatar(avatar) {
    avatars.value.push(avatar)
  }


  function setAvatars(avatar) {
    avatars.value=avatar;
  }
  function removeAvatar(id) {
    const index = avatars.value.findIndex(a => a.id === id)
    if (index !== -1) {
      avatars.value.splice(index, 1)
    }
  }
  
  return {
    avatars,
    setAvatars,
    addAvatar,
    removeAvatar
  }
})