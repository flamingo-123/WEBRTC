let record=document.querySelector("#record");
record.addEventListener("click",async()=>{
    let stream = await navigator.mediaDevices.getDisplayMedia({vedio: true})
    let mediaRecorder = new MediaRecorder(stream,{mimeType: 'video/webm'})
    let chunks=[]
    mediaRecorder.addEventListener('dataavailable',function(e){
    chunks.push(e.data)
    })
    mediaRecorder.addEventListener('stop',function(){
    let blob=new Blob(chunks,{
    type: chunks[0].type
    })
    let url=URL.createObjectURL(blob)
    document.querySelector('video').src = url
    let a=document.createElement('a')
    a.href=url
    a.download='vedio.webm'
    document.body.appendChild(a)
    a.click()
    })
    mediaRecorder.start()
      })