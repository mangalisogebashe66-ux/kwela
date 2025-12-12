<template>
  <div>
    <Navbar />

    <div class="form-wrap">
      <h2>Report Missing Person</h2>

      <form @submit.prevent="submitReport">

        <!-- FULL NAME -->
        <label>Full Name</label>
        <input v-model="form.full_name" required />

        <!-- AGE -->
        <label>Age</label>
        <input type="number" v-model.number="form.age" />

        <!-- GENDER -->
        <label>Gender</label>
        <select v-model="form.gender">
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <!-- DESCRIPTION -->
        <label>Description</label>
        <textarea v-model="form.description"></textarea>

        <!-- PHOTO OPTIONS -->
        <label>Photo</label>

        <div class="photo-actions">
          <!-- Select file -->
          <input 
            type="file" 
            accept="image/*" 
            @change="handleFileUpload"
          />

          <!-- Capture Photo -->
          <button type="button" class="camera-btn" @click="captureFromCamera">
            📸 Take Photo
          </button>
        </div>

        <!-- SHOW CAMERA STREAM -->
        <div v-if="showCamera" class="camera-box">
          <video ref="camera" autoplay playsinline></video>

          <button type="button" class="snap-btn" @click="takeSnapshot">
            📷 Capture
          </button>
          <button type="button" class="close-btn" @click="closeCamera">
            ✖ Close
          </button>
        </div>

        <!-- PREVIEW -->
        <div v-if="form.photo_url" class="preview">
          <img :src="form.photo_url" alt="Preview" />
        </div>

        <div v-if="uploading" class="uploading">Uploading photo...</div>

        <!-- LAST SEEN -->
        <label>Last Seen (Date & Time)</label>
        <input type="datetime-local" v-model="form.last_seen" />

        <!-- BUTTON -->
        <div class="actions">
          <button class="btn primary" type="submit">Submit Report</button>
        </div>
      </form>

      <div v-if="success" class="success">{{ success }}</div>
      <div v-if="error" class="error">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import { supabase } from '@/supabase'

export default {
  name: "ReportMissing",
  components: { Navbar },

  data() {
    return {
      form: {
        full_name: "",
        age: null,
        gender: "Male",
        description: "",
        photo_url: "",
        last_seen: null,
      },

      uploading: false,
      success: "",
      error: "",

      showCamera: false,
      cameraStream: null,
    };
  },

  methods: {
    /* ===========================
       FILE UPLOAD (GALLERY)
    =========================== */
    async handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;

      await this.uploadToSupabase(file);
    },

    /* ===========================
       OPEN CAMERA
    =========================== */
    async captureFromCamera() {
      this.showCamera = true;

      try {
        this.cameraStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        this.$refs.camera.srcObject = this.cameraStream;

      } catch (err) {
        this.error = "Camera access denied.";
      }
    },

    /* ===========================
       TAKE SNAPSHOT (Photo Capture)
    =========================== */
    async takeSnapshot() {
      const video = this.$refs.camera;
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        await this.uploadToSupabase(file);
        this.closeCamera();

      }, "image/jpeg");
    },

    /* ===========================
       CLOSE CAMERA
    =========================== */
    closeCamera() {
      this.showCamera = false;
      if (this.cameraStream) {
        this.cameraStream.getTracks().forEach((t) => t.stop());
        this.cameraStream = null;
      }
    },

    /* ===========================
       UPLOAD TO SUPABASE
    =========================== */
    async uploadToSupabase(file) {
      this.uploading = true;
      this.error = "";

      try {
        const fileName = `missing_${Date.now()}_${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(fileName);

        this.form.photo_url = urlData.publicUrl;
      } catch (err) {
        this.error = err.message || "Failed to upload photo";
      }

      this.uploading = false;
    },

    /* ===========================
       SUBMIT REPORT
    =========================== */
    async submitReport() {
      this.error = "";
      this.success = "";

      try {
        const payload = { ...this.form };

        if (payload.last_seen)
          payload.last_seen = new Date(payload.last_seen).toISOString();

        const { error } = await supabase.from("persons").insert([payload]);
        if (error) throw error;

        this.success = "Missing person reported successfully.";

        this.form = {
          full_name: "",
          age: null,
          gender: "Male",
          description: "",
          photo_url: "",
          last_seen: null,
        };
      } catch (err) {
        this.error = err.message;
      }
    },
  },
};
</script>

<style scoped>
.form-wrap {
  max-width: 720px;
  margin: 20px auto;
  background: #fff;
  padding: 22px;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(0,0,0,0.08);
}

label {
  display: block;
  margin-top: 14px;
  color: #1b263b;
  font-weight: 600;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px 12px;
  margin-top: 6px;
  border-radius: 8px;
  border: 1px solid #d9e2ec;
  font-size: 15px;
}

textarea {
  height: 100px;
}

.photo-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.camera-btn {
  padding: 8px 12px;
  background: #0077b6;
  color: white;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.camera-box {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

video {
  width: 100%;
  border-radius: 10px;
}

.snap-btn {
  padding: 10px;
  background: #16a34a;
  color: #fff;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.close-btn {
  padding: 10px;
  background: #b91c1c;
  color: #fff;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.preview img {
  width: 160px;
  border-radius: 8px;
  margin-top: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.12);
}

.btn.primary {
  width: 100%;
  padding: 12px;
  background: #0077b6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 14px;
}

.success {
  margin-top: 14px;
  color: #16a34a;
}

.error {
  margin-top: 14px;
  color: #dc2626;
}
</style>
