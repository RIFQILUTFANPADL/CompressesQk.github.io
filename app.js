// Sesi Gambar
function compressImage() {
  const input = document.getElementById("imageInput");
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      const img = new Image();
      img.src = reader.result;

      img.onload = function () {
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }

        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          function (blob) {
            const compressedFile = new File([blob], `compressed_${file.name}`, {
              type: file.type,
              lastModified: Date.now(),
            });

            const resultElement = document.getElementById("imageResult");
            resultElement.innerHTML = `
              <div>
                <img src="${URL.createObjectURL(compressedFile)}" alt="Compressed Image" style="max-width: 100%; height: auto;" />
              </div>
              <div>
                <a href="${URL.createObjectURL(compressedFile)}" download="compressed_${file.name}" class="btn btn-primary">Download</a>
              </div>
            `;
            resultElement.classList.remove("hidden");
          },
          file.type,
          0.7 // Mengatur kualitas gambar (0.7 = 70%)
        );
      };
    };
  }
}

// Sesi Audio
function compressAudio() {
  const input = document.getElementById("audioInput");
  const file = input.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const audio = new Audio();
      audio.src = e.target.result;
      audio.controls = true;

      const previewAudio = document.getElementById("previewAudio");
      previewAudio.src = audio.src;
      previewAudio.style.display = "inline";

      const downloadLink = document.getElementById("downloadLink");
      downloadLink.href = audio.src;
      downloadLink.style.display = "inline";

      // Kompresi audio

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioSource = audioContext.createMediaElementSource(audio);
      const audioDestination = audioContext.createMediaStreamDestination();
      const mediaRecorder = new MediaRecorder(audioDestination.stream);
      const chunks = [];

      mediaRecorder.ondataavailable = function (e) {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = function () {
        const compressedBlob = new Blob(chunks, { type: "audio/webm" });
        const compressedAudioUrl = URL.createObjectURL(compressedBlob);

        const compressedAudio = new Audio();
        compressedAudio.src = compressedAudioUrl;
        compressedAudio.controls = true;

        const compressedPreviewAudio = document.getElementById("compressedPreviewAudio");
        compressedPreviewAudio.src = compressedAudio.src;
        compressedPreviewAudio.style.display = "inline";

        const compressedDownloadLink = document.getElementById("compressedDownloadLink");

        // Mengubah jenis file menjadi mp3
        compressedDownloadLink.href = compressedAudio.src;
        compressedDownloadLink.download = file.name.replace(/\.[^/.]+$/, "") + ".mp3";
        compressedDownloadLink.style.display = "inline";

        const audioContainer = document.getElementById("audioContainer");
        audioContainer.innerHTML = ""; // Hapus konten sebelumnya
        audioContainer.appendChild(compressedAudio);
      };

      audioSource.connect(audioDestination);
      audio.play();
      mediaRecorder.start();

      // Menggunakan event 'ended' untuk menghentikan rekaman saat audio selesai diputar
      audio.onended = function () {
        mediaRecorder.stop();
      };

      // Batasi durasi kompresi sesuai dengan durasi audio asli
      audio.onloadedmetadata = function () {
        setTimeout(function () {
          audio.pause();
          mediaRecorder.stop();
        }, audio.duration * 1000);
      };
    };
    reader.readAsDataURL(file);
  }
}

