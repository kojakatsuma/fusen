const textarea = document.getElementById("post")

const { ipcRenderer } = require('electron')
const fs = require('fs');

let filepath = ""

ipcRenderer.on('load-post', (_e, m) => {
  textarea.value = m.content
  filepath = m.filepath
})

textarea.addEventListener('change', (e) => {
  const value = e.target.value
  fs.writeFileSync(filepath, value)
})