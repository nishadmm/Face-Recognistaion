// variables
const CameraBtn = document.getElementById("camera-btn"),
  uploadBtn = document.getElementById("upload-btn"),
  initalContent = document.getElementById("initial-content"),
  cameracontent = document.getElementById("camera-content"),
  uploadContent = document.getElementById("upload-content"),
  video = document.querySelector("video"),
  nav = document.getElementById("nav"),
  imageUpload = document.getElementById("image-upload"),
  footer = document.getElementById("footer")

// Listners
CameraBtn.addEventListener("click", recognizeFromCamera);
uploadBtn.addEventListener("click", recognizeFromUpload)

// recognize From Camera
function recognizeFromCamera(e) {
  initalContent.style.display = "none"
  cameracontent.style.display = "flex"
  nav.innerHTML = `<ul class="list-inline bg-primary p-3 row align-items-center" id="header">
    <li class="list-inline-item col-sm-2 ">
      <div class="btn btn-danger" id="back-btn"><i class="fas fa-arrow-circle-left"></i> back</div>
    </li>
    <li class="list-inline-item col-sm-8">
      <h1 class="text-white text-center">Lets Recognize Face... <i class="fab fa-accusoft"></i></h1>
    </li>
  </ul>`;

  // Face Api promises
  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models1'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models1'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models1'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models1')
  ]).then(startVideo)

  // start video
  function startVideo() {
    navigator.getUserMedia(
      { video: true },
      stream => video.srcObject = stream,
      err => console.log(err)
    )
  }

  // video listner
  video.addEventListener("playing", () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }

    // Set canvas top 
    document.querySelector("canvas").style.top = `${nav.offsetHeight}px`;

    faceapi.matchDimensions(canvas, displaySize)
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height)

      faceapi.draw.drawDetections(canvas, resizedDetections)
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

      // Add content
      if (detections[0]) {
        document.getElementById("camera-card").style.display = "block"

        const numberOfFace = Object.keys(detections).length;

        let innerHTML = `<li class="list-group-item active">Face Details</li>
        <li class="list-group-item">Number Of Face : <span class="badge bg-danger">${numberOfFace}</span></li>`;

        detections.forEach((detection, index) => {
          let happy = detection.expressions.happy * 10,
            angry = detection.expressions.angry * 10,
            surprise = detection.expressions.surprised * 10,
            sad = detection.expressions.sad * 10

          innerHTML += `
          <a href="#" class="list-group-item list-group-item-action bg-secondary text-white">Details Of Face <span
          class="badge list-group-item-primary">${index + 1}</span></a>
            <li class="list-group-item"><span class="col-sm-6 pe-2">Happy</span> <span class="badge bg-primary          col-sm-6">${happy.toFixed(4)}</span>
            </li>
            <li class="list-group-item "><span class="col-sm-6 pe-3">Angry</span> <span class="badge bg-primary col-sm-6">${angry.toFixed(4)}</span>
            </li>
            <li class="list-group-item "><span class="col-sm-6">Surprise</span> <span class="badge bg-primary col-sm-6 ">${surprise.toFixed(4)}</span>
            </li>
            <li class="list-group-item "><span class="col-sm-6 pe-4">Sad</span> <span class="badge bg-primary col-sm-6 ">${sad.toFixed(4)}</span></li>`;
        })

        document.getElementById("camera-card").innerHTML = innerHTML

      } else {

        document.getElementById("camera-card").style.display = "none"
      }

    }, 100)

    // back btn Listner
    document.getElementById("back-btn").addEventListener("click", backToInitialPage);

  })
  e.preventDefault()
}


// Recognize From Upload
function recognizeFromUpload(e) {

  initalContent.style.display = "none"
  uploadContent.style.display = "block"

  nav.innerHTML = `<ul class="list-inline bg-primary p-3 row align-items-center" id="header">
    <li class="list-inline-item col-sm-2 ">
      <div class="btn btn-danger"  id="back-btn"><i class="fas fa-arrow-circle-left"></i> back</div>
    </li>
    <li class="list-inline-item col-sm-8">
      <h1 class="text-white text-center">Lets Recognize Face... <i class="fab fa-accusoft"></i></h1>
    </li>
  </ul>`;
  footer.style.display = "none"

  Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models2'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models2'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models2'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models1')
  ]).then(start)

  async function start() {

    const container = document.createElement("div")
    container.style.position = "relative"
    // container.className = "row"
    document.body.append(container)
    const labeledFaceDescriptors = await loadLabeledImages()

    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    let image, canvas, ul, ulDiv

    document.getElementById("upload-notification").textContent = "Please Choose file For Recognize"
    document.getElementById("upload-notification").classList.remove("text-warning")
    document.getElementById("upload-notification").classList.add("text-info")
    imageUpload.style.display = "block"
    footer.style.display = "block"

    imageUpload.addEventListener("change", async () => {
      if (image) image.remove()
      if (canvas) canvas.remove()
      if (ulDiv) ulDiv.remove()
      image = await faceapi.bufferToImage(imageUpload.files[0])
      image.style.marginBottom = "1rem"
      // image.className = "col-md-8"

      container.append(image)
      canvas = faceapi.createCanvasFromMedia(image)
      // canvas.className = "col-md-8"
      container.append(canvas)

      // Create upload content
      ulDiv = document.createElement("div")
      ulDiv.className = "row"
      ul = document.createElement("ul")
      ul.className = "list-group text-dark col-sm-6 offset-3"
      ul.id = "upload-card"
      ulDiv.append(ul)
      container.append(ulDiv)


      const displaySize = { width: image.width, height: image.height }
      faceapi.matchDimensions(canvas, displaySize)

      const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()


      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))

      createContent(detections, results)

      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box
        const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
        drawBox.draw(canvas)
      })

      function createContent(detections, results) {

        document.getElementById("upload-card").style.display = "block"

        let innerHTML = `<li class="list-group-item active">Face Details</li>
        <li class="list-group-item">Number Of Face : <span class="badge bg-danger">${results.length}</span></li>`;

        detections.forEach((detection, index) => {
          let happy = detection.expressions.happy * 10,
            angry = detection.expressions.angry * 10,
            surprise = detection.expressions.surprised * 10,
            sad = detection.expressions.sad * 10

          innerHTML += `
          <a href="#" class="list-group-item list-group-item-action bg-secondary text-white">${results[index].label}</a>
            <li class="list-group-item "><span class=" col-sm-6 pe-2">Happy</span> <span class="col-sm-6 badge bg-primary">${happy.toFixed(4)}</span>
            </li>
            <li class="list-group-item  "><span class="col-sm-6  pe-3">Angry</span> <span class="col-sm-6 badge bg-primary ">${angry.toFixed(4)}</span>
            </li>
            <li class="list-group-item  "><span class="col-sm-6 pe-3">Surprise</span> <span class="col-sm-6 badge bg-primary  ">${surprise.toFixed(4)}</span>
            </li>
            <li class="list-group-item  "><span class="col-sm-6  pe-4">Sad</span> <span class="col-sm-6 badge bg-primary  ">${sad.toFixed(4)}</span></li>`;
        })
        document.getElementById("upload-card").innerHTML = innerHTML
      }

    })
  }

  // load labeled images
  function loadLabeledImages() {
    const labels = ['Black Widow', 'Captain America', 'Captain Marvel', 'Hawkeye', 'Jim Rhodes', 'nishad', 'shahiMon', 'Thor', 'Tony Stark']

    return Promise.all(
      labels.map(async label => {
        const descriptions = []
        for (let i = 1; i <= 2; i++) {
          const img = await faceapi.fetchImage(`./labeled_images/${label}/${i}.jpg`)

          const detections = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
          descriptions.push(detections.descriptor)
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions)
      })
    )
  }

  // back btn Listner
  document.getElementById("back-btn").addEventListener("click", backToInitialPage);

  e.preventDefault()
}

function backToInitialPage() {
  window.location.reload()
}

