const textarea = document.getElementById("post")

const { ipcRenderer } = require('electron')
const fs = require('fs');

let filepath = ""

ipcRenderer.on('load-post', (_e, m) => {
  textarea.value = m.content
  filepath = m.filepath
  textarea.style.fontSize = `${m.setting.fontSize}px`
})

ipcRenderer.on('change-fontsize', (_e, setting) => {
  textarea.style.fontSize = `${setting.fontSize}px`
})

textarea.addEventListener('change', (e) => {
  const value = e.target.value
  fs.writeFileSync(filepath, value)
})

