<template>
  <div>
    <input type="file"
           @change="onFileChange" />
    <img :src="image">
    <button type="submit" @click="upload"></button>
  </div>
</template>
<script>
export default {
  data() {
    return {
      files: null,
      formData: null,
      image: null
    }
  },
  methods: {
    upload() {
      this.formData = new FormData()
      this.formData.append("userfile", this.files[0])
      this.formData.append('imgName', this.files[0].name)
      this.http.post('http://localhost:3001/upload', this.formData).then(res => {
        console.log(res.data)
      })
    },
    onFileChange(e) {
      this.files = e.target.files || e.dataTransfer.files
      if (!this.files.length) return
      this.createImage(this.files[0])
    },
    createImage(file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        this.image = e.target.result
      }
      reader.readAsDataURL(file)
    },
  },
}
</script>
<style lang="stylus" scoped>
</style>
