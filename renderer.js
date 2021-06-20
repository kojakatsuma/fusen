
const textarea = document.getElementById("post");
textarea.addEventListener('input', (e) => {
  const value = e.target.value
  window.myapi.saveText(value)
});