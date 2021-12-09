let btn=document.querySelector(".record-btn");
btn.addEventListener("click",async function(){	
const constraints = {
        audio: true,
        video: true
      };
let stream = await navigator.mediaDevices.getDisplayMedia(constraints)
document.querySelector('.vedio').srcObject = stream;
})