const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const convertBtn = document.getElementById("convertBtn");
const formatSelect = document.getElementById("format");
const result = document.getElementById("result");

const previewContainer = document.getElementById("previewContainer");
const previewImage = document.getElementById("previewImage");

let file = null;

function showPreview(file) {
  if (!file.type.startsWith("image/")) return;

  const url = URL.createObjectURL(file);
  previewImage.src = url;
  previewContainer.classList.remove("hidden");
}

// CLICK
dropZone.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", (e) => {
  file = e.target.files[0];
  showPreview(file);
});

// DROP
dropZone.addEventListener("dragover", (e) => e.preventDefault());

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  file = e.dataTransfer.files[0];
  showPreview(file);
});

// CONVERT
convertBtn.addEventListener("click", async () => {
  if (!file) return alert("Ajoute une image");

  const format = formatSelect.value;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    // PDF
    if (format === "pdf") {
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();

      const imgData = canvas.toDataURL("image/jpeg", 0.9);
      pdf.addImage(imgData, "JPEG", 10, 10, 180, 0);

      pdf.save("converted.pdf");
      return;
    }

    // IMAGE
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);

      result.innerHTML = `
        <a href="${url}" download="converted">
          Télécharger le fichier
        </a>
      `;
    }, format, 0.9);
  };
});