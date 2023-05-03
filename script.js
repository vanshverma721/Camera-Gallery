let video = document.querySelector("video");
let recordBtnCont = document.querySelector(".record-btn-cont");
let recordBtn = document.querySelector(".record-btn");
let captureBtnCont = document.querySelector(".capture-btn-cont");
let captureBtn = document.querySelector(".capture-btn");
let color = "transparent";
let recordFlag = false;

let recorder;
let chunks = [] // media data store in chunks (chunks -> array)

let constraints = {
    video: true,
    audio: true
}

navigator.mediaDevices.getUserMedia(constraints)
.then((stream) => {
    video.srcObject = stream;

    recorder = new MediaRecorder(stream);
    
    recorder.addEventListener("start", (e) => {
        chunks = [];
    })

    recorder.addEventListener("dataavailable", (e) => {
        chunks.push(e.data);
    })

    recorder.addEventListener("stop", (e) => {
        // conversion of chunks data to video
        let blob = new Blob(chunks, { type: "video/mp4" });

        if (db) {
            let videoID = shortid();
            let dbTransaction = db.transaction("video", "readwrite");
            let videoStore = dbTransaction.objectStore("video");
            let videoEntry = {
                id: `vid-${videoID}`,
                blobData: blob
            }
            videoStore.add(videoEntry);
        }
    })
})

recordBtnCont.addEventListener("click", (e) => {
    if (!recorder) {
        return;
    }

    recordFlag = !recordFlag;

    if (recordFlag) { // start recording
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    }
    else { // stop recording
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
})

captureBtn.addEventListener("click", (e) => {
    
    captureBtn.classList.add("scale-capture");
    let canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    let tool = canvas.getContext("2d");
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);

    // adding filter 
    tool.fillStyle = color;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    let imageURL = canvas.toDataURL();

    if (db) {
        let imageID = shortid();
        let dbTransaction = db.transaction("image", "readwrite");
        let imageStore = dbTransaction.objectStore("image");
        let imageEntry = {
            id: `img-${imageID}`,
            url: imageURL
        }
        imageStore.add(imageEntry);
    }
})

let timerID;
let counter = 0; // represent total time in second
let timer = document.querySelector(".timer");

function startTimer() {

    timer.style.display = "block";
    function displayTimer() {
        let totalSeconds = counter;

        let hours = Number.parseInt( totalSeconds / 3600 );
        totalSeconds = totalSeconds % 3600; // remaining value
        
        let minutes = Number.parseInt( totalSeconds / 60 );
        totalSeconds = totalSeconds % 60; // remaining value

        let seconds = totalSeconds

        hours = ( hours < 10 ) ? `0${hours}` : hours;
        minutes = ( minutes < 10 ) ? `0${minutes}` : minutes;
        seconds = ( seconds < 10 ) ? `0${seconds}` : seconds;

        timer.innerText = `${hours}:${minutes}:${seconds}`;

        counter++;
    }

    timerID = setInterval(displayTimer, 1000);
}

function stopTimer() {
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    timer.style.display = "none";
}

let filterLayer = document.querySelector(".filter-layer");
let allFilters = document.querySelectorAll(".filter");
allFilters.forEach( (filterElem) => {
    filterElem.addEventListener("click", (e) => {
        color = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = color;
    })
})
