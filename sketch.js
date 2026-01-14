let video = null;
let camReady = false;
let facemesh;
let predictions = [];
let faceX = 200;
let prevFaceX = 200;

let port;
let reader;
let serialBuffer = "";
let serialReady = false;

// === 안전 상수 & 가드 ===
const EPS = 1e-6;
const MAX_SPEED = 5; // 최대 속도 캡
const MAX_ACCEL = 3; // 최대 가속도 캡
const MAX_DRAG = 8; // 항력의 최대 크기 캡
const MAX_IMPULSE = 6; // (충돌 사용 시) 최대 임펄스 캡

const isFiniteNum = (n) => Number.isFinite(n);
const isFiniteVec = (v) => v && isFiniteNum(v.x) && isFiniteNum(v.y);

//밸브 조절
let valveStep = 0;
let lastDV = 0;

let tearSystem;
let liquid;
let myfont;

function preload() {
  myfont = loadFont("ahn.ttf");
}

function setup() {
  createCanvas(600, 1020);
  textFont(myfont);

  liquid = new Liquid(0, height / 2, width, height / 2, 0.15);
  tearSystem = new TearSystem(liquid);

  textAlign(CENTER, CENTER);
  noStroke();

  video = createCapture(VIDEO);
  video.size(400, 300);
  video.hide();
  facemesh = ml5.faceMesh(video, modelReady);
}

function modelReady() {
  console.log("FaceMesh model ready!");
  facemesh.detectStart(video, gotResults);
}

function gotResults(results) {
  predictions = results;
  if (predictions.length > 0) {
    let nose = predictions[0].keypoints[1];
    faceX = nose.x;
  }
}

function draw() {
  background(255);
  
  const dx = faceX - prevFaceX;
  prevFaceX = faceX;

  tearSystem.update(faceX, dx);
  liquid.show();

  //눈
  fill(255);
  rect(0, 0, width, 60);
  // rect(mouseX+40, 0, 50, 30);
  fill(0);
  rect(faceX - 50, 60, 55, 10);
  rect(faceX + 20, 60, 55, 10);

  //debug
  fill(0);
  textSize(14);
  textAlign(LEFT, TOP);
  text(`dV: ${lastDV.toFixed(1)} mV`, 10, 10);
  text(`Valve step: ${valveStep}`, 10, 28);
}

function startCamera() {
  if (camReady) return;

  video = createCapture(
    {
      video: {
        width: 600,
        height: 1020
      },
      audio: false
    },
    () => {
      console.log("📷 Camera stream started");
      camReady = true;

      facemesh = ml5.faceMesh(
        video,
        {
          maxFaces: 1,
          refineLandmarks: false
        },
        modelReady
      );
    }
  );

  video.hide();
}
