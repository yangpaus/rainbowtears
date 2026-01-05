function parseSerial(line) {
  const v = parseFloat(line);
  if (!Number.isFinite(v)) return;

  lastDV = v;

  const DV_DEAD = 12; // 닫힘 dead zone
  const DV_FULL = 255; // 완전 개방 기준 (절대값)

  const dvAbs = Math.abs(v);

  if (dvAbs <= DV_DEAD) {
    valveStep = 0;
  } else {
    const t = (dvAbs - DV_DEAD) / (DV_FULL - DV_DEAD);
    valveStep = Math.floor(constrain(t, 0, 0.999) * 10);
  }
}

async function setupSerial() {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    reader = port.readable.getReader();
    serialReady = true;

    console.log("✅ Serial connected");
    readSerialLoop();
  } catch (err) {
    console.error("❌ Serial connection failed", err);
  }
}

async function readSerialLoop() {
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    serialBuffer += decoder.decode(value);

    // 줄 단위 처리 (CRLF 대응)
    const lines = serialBuffer.split(/\r?\n/);
    serialBuffer = lines.pop();

    for (const line of lines) {
      parseSerial(line.trim()); // 🔥 네가 이미 만든 함수
    }
  }
}

function mousePressed() {
  if (!serialReady) {
    setupSerial(); // 🔌 첫 클릭 = 시리얼 연결
    return;
  }

  // (선택) 이미 연결된 후 디버그용 리셋
  tearSystem.reset();
  startCamera();
}
