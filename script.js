document.querySelectorAll("button.encode, button.decode").forEach(btn => {
  btn.addEventListener("click", e => e.preventDefault());
});

function previewDecodeImage() {
  const file = document.querySelector('input[name=decodeFile]').files[0];
  loadImageToCanvas(file, ".decode canvas", () => {
    document.querySelector(".decode").style.display = "block";
  });
}

function previewEncodeImage() {
  const file = document.querySelector("input[name=baseFile]").files[0];
  document.querySelector(".images .nulled").style.display = "none";
  document.querySelector(".images .message").style.display = "none";

  loadImageToCanvas(file, ".original canvas", () => {
    document.querySelector(".images .original").style.display = "block";
    document.querySelector(".images").style.display = "block";
  });
}

function loadImageToCanvas(file, selector, onLoadCallback) {
  const reader = new FileReader();
  const img = new Image();
  const canvas = document.querySelector(selector);
  const ctx = canvas.getContext('2d');

  if (file) reader.readAsDataURL(file);

  reader.onloadend = () => {
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      onLoadCallback();
    };
  };
}

function encodeMessage() {
  $(".error, .binary").hide();

  const msg = $("textarea.message").val();
  const $orig = $(".original canvas");
  const $norm = $(".nulled canvas");
  const $msg = $(".message canvas");

  const ctxOrig = $orig[0].getContext("2d");
  const ctxNorm = $norm[0].getContext("2d");
  const ctxMsg = $msg[0].getContext("2d");

  const width = $orig[0].width;
  const height = $orig[0].height;

  if (msg.length * 8 > width * height * 3) {
    $(".error").text("Pesan terlalu panjang untuk gambar yang dipilih....").fadeIn();
    return;
  }

  [$norm, $msg].forEach($c => {
    $c.prop({ width, height });
  });

  const imgData = ctxOrig.getImageData(0, 0, width, height);
  const px = imgData.data;
  for (let i = 0; i < px.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      if (px[i + j] % 2 !== 0) px[i + j]--;
    }
  }
  ctxNorm.putImageData(imgData, 0, 0);

  let bin = [...msg].map(ch => ch.charCodeAt(0).toString(2).padStart(8, "0")).join("");
  $(".binary textarea").text(bin);

  const newImg = ctxNorm.getImageData(0, 0, width, height);
  const newPx = newImg.data;
  let idx = 0;

  for (let i = 0; i < newPx.length && idx < bin.length; i += 4) {
    for (let j = 0; j < 3 && idx < bin.length; j++) {
      newPx[i + j] += parseInt(bin[idx++]);
    }
  }

  ctxMsg.putImageData(newImg, 0, 0);
  $(".binary, .images .nulled, .images .message").fadeIn();
}

function decodeMessage() {
  const $canvas = $(".decode canvas");
  const ctx = $canvas[0].getContext("2d");
  const { width, height } = $canvas[0];
  const imgData = ctx.getImageData(0, 0, width, height).data;

  let binMsg = "";
  for (let i = 0; i < imgData.length; i += 4) {
    for (let j = 0; j < 3; j++) {
      binMsg += (imgData[i + j] % 2 !== 0) ? "1" : "0";
    }
  }

  let decoded = "";
  for (let i = 0; i < binMsg.length; i += 8) {
    const byte = binMsg.slice(i, i + 8);
    if (byte.length === 8) decoded += String.fromCharCode(parseInt(byte, 2));
  }

  $(".binary-decode textarea").text(decoded);
  $(".binary-decode").fadeIn();
}
