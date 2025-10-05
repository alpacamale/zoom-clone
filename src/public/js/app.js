const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      camerasSelect.appendChild(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  muteBtn.innerText = !muted ? "Mute" : "Unmute";
  muted = !muted;
  myStream.getAudioTracks().forEach((track) => (track.enabled = muted));
}

function handleCameraClick() {
  cameraBtn.innerText = !cameraOff ? "Turn Camera Off" : "Turn Camera On";
  cameraOff = !cameraOff;
  myStream.getVideoTracks().forEach((track) => (track.enabled = cameraOff));
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
