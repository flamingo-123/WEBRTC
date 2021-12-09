// Creating the peer
// 第三次修改
const peer = new RTCPeerConnection({
  iceServers: [
    {
      urls: "stun:stun.stunprotocol.org"
    }
  ]
});
// Connecting to socket
const socket = io('http://localhost:3000');
const onSocketConnected = async () => {
  let btn=document.querySelector("#capture");
  let open=document.querySelector("#open-camera");
  let close=document.querySelector("#close-camera");
  const constraints = {
    audio: true,
    video: true
  };
  btn.addEventListener("click",async()=>{
    let stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    document.querySelector('#localVideo').srcObject = stream;
    stream.getTracks().forEach(track => peer.addTrack(track, stream));
  })
   // 摄像头分享
  open.addEventListener("click",async()=>{
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  document.querySelector('#localVideo').srcObject = stream;
  stream.getTracks().forEach(track => peer.addTrack(track, stream));   
  })
  //屏幕录制
  close.addEventListener("click",async()=>{
    peer.close();  
  })
 
}


let callButton = document.querySelector('#call');
// Handle call button
callButton.addEventListener('click', async () => {
  const localPeerOffer = await peer.createOffer(); //生成一个SDP
  await peer.setLocalDescription(new RTCSessionDescription(localPeerOffer)); //将SDP添加到本地
  sendMediaOffer(localPeerOffer); //发送SDP
});

// Create media offer
socket.on('mediaOffer', async (data) => {
  await peer.setRemoteDescription(new RTCSessionDescription(data.offer));//收到Answer端offer后，我们把远端的SDP加入到本地
  const peerAnswer = await peer.createAnswer();
  await peer.setLocalDescription(new RTCSessionDescription(peerAnswer));
  sendMediaAnswer(peerAnswer, data);
});

// Create media answer
socket.on('mediaAnswer', async (data) => {
  await peer.setRemoteDescription(new RTCSessionDescription(data.answer));
});

// ICE layer
peer.onicecandidate = (event) => {
  sendIceCandidate(event);
}
socket.on('remotePeerIceCandidate', async (data) => {
  try {
    const candidate = new RTCIceCandidate(data.candidate);
    await peer.addIceCandidate(candidate);
  } catch (error) {
    // Handle error, this will be rejected very often
  }
})

peer.addEventListener('track', (event) => {
  const [stream] = event.streams;
  document.querySelector('#remoteVideo').srcObject = stream;
})

let selectedUser;
const sendMediaAnswer = (peerAnswer, data) => {
  socket.emit('mediaAnswer', {
    answer: peerAnswer,
    from: socket.id,
    to:   data.from
  })
}

const sendMediaOffer = (localPeerOffer) => {
  socket.emit('mediaOffer', {
    offer: localPeerOffer,
    from:  socket.id,    
    to:    selectedUser   
  });
};

const sendIceCandidate = (event) => {
  socket.emit('iceCandidate', {
    to: selectedUser,
    candidate: event.candidate,
  });
}
const onUpdateUserList = ({ userIds }) => {
  const usersList = document.querySelector('#usersList');
  const usersToDisplay = userIds.filter(id => id !== socket.id);
  usersList.innerHTML = '';
  usersToDisplay.forEach(user => {
    const userItem = document.createElement('div');
    userItem.innerHTML = user;
    userItem.className = 'user-item';
    userItem.addEventListener('click', () => {
      const userElements = document.querySelectorAll('.user-item');
      userElements.forEach((element) => {
        element.classList.remove('user-item--touched');
      })
       userItem.classList.add('user-item--touched');
       selectedUser = user;
    });
     usersList.appendChild(userItem);
  });
};
socket.on('update-user-list', onUpdateUserList);
const handleSocketConnected = async () => {
  onSocketConnected();
  socket.emit('requestUserList');
};
socket.on('connect', handleSocketConnected);



