const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const compressBtn = document.getElementById("compressBtn");
const qualityInput = document.getElementById("quality");
const downloadAllBtn = document.getElementById("downloadAllBtn");

const results = document.getElementById("results");
const progressBar = document.getElementById("progressBar");
const progressContainer = document.getElementById("progressContainer");

let files = [];
let compressedFiles = [];

/* CLICK */
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  files = [...e.target.files];
  previewFiles(files);
});

/* DRAG */
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  files = [...e.dataTransfer.files];
  previewFiles(files);
});

/* PREVIEW */
function previewFiles(files) {
  results.innerHTML = "";

  files.forEach((file, index) => {
    if (!file.type.startsWith("image/")) return;

    const url = URL.createObjectURL(file);

    const div = document.createElement("div");
    div.classList.add("result-item");

    div.innerHTML = `
      <div class="image-wrapper">
        <button class="remove-btn" data-index="${index}">✖</button>
        <img src="${url}">
      </div>
      <p>Original: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
    `;

    results.appendChild(div);
  });

  addRemoveEvents();
}

function addRemoveEvents() {
  const buttons = document.querySelectorAll(".remove-btn");

  buttons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const index = e.target.dataset.index;

      // Supprimer du tableau
      files.splice(index, 1);

      // Rafraîchir affichage
      previewFiles(files);
    });
  });
}

/* DETECT WEBP SUPPORT */
function supportsWebP() {
  try {
    return document.createElement('canvas')
      .toDataURL('image/webp')
      .indexOf('data:image/webp') === 0;
  } catch {
    return false;
  }
}

const useWebP = supportsWebP();

/* COMPRESSION */
compressBtn.addEventListener("click", async () => {
  if (files.length === 0) return alert("Ajoute des images");

  compressedFiles = [];
  results.innerHTML = "";
  progressContainer.classList.remove("hidden");
  progressBar.style.width = "0%";

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.type.startsWith("image/")) continue;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1280,
      initialQuality: Math.min(parseFloat(qualityInput.value), 0.6),
      useWebWorker: true,
      fileType: useWebP ? "image/webp" : undefined // 🔥 ici
    };

    const compressedFile = await imageCompression(file, options);
    compressedFiles.push(compressedFile);

    const url = URL.createObjectURL(compressedFile);

    const div = document.createElement("div");
    div.classList.add("result-item");

    div.innerHTML = `
  <div class="image-wrapper">
    <button class="remove-btn" data-index="${i}">✖</button>
    <img src="${url}">
  </div>
  <p>
    ${(file.size / 1024 / 1024).toFixed(2)} MB →
    ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB
  </p>
  <a href="${url}" download="compressed_${file.name}" class="download">
    Télécharger
  </a>
`;

    results.appendChild(div);

    progressBar.style.width = ((i + 1) / files.length) * 100 + "%";
  }

  downloadAllBtn.classList.remove("hidden");
});
/* ZIP DOWNLOAD */
downloadAllBtn.addEventListener("click", async () => {
  if (compressedFiles.length === 0) return;

  const zip = new JSZip();

  compressedFiles.forEach((file, index) => {
    zip.file(`image_${index}.jpg`, file);
  });

  const content = await zip.generateAsync({ type: "blob" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(content);
  link.download = "images_compressed.zip";
  link.click();
});