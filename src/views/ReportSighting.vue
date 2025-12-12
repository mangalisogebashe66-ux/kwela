<template>
  <div class="sightings-container">
    <Navbar />

    <!-- MAP -->
    <div id="map"></div>

    <!-- REPORT BOX -->
    <div class="report-box">
      <h2>Report a Sighting</h2>

      <!-- Missing person dropdown -->
      <label>Missing Person</label>
      <select v-model="form.person_id" required>
        <option value="">Select person...</option>
        <option v-for="p in persons" :key="p.id" :value="p.id">
          {{ p.full_name }}
        </option>
      </select>

      <!-- Notes -->
      <label>Description</label>
      <textarea v-model="form.notes"></textarea>

      <!-- Location input -->
      <label>Selected Location</label>
      <input type="text" v-model="coords" readonly />

      <!-- GPS buttons -->
      <div class="location-buttons">
        <button class="gps-btn" @click="enableLiveLocation">📍 Use My Live Location</button>
        <button class="gps-off-btn" @click="disableLiveLocation" v-if="gpsActive">✖ Stop Tracking</button>
      </div>

      <!-- PHOTO UPLOAD & CAMERA -->
      <label>Photo of sighting</label>

      <div class="photo-buttons">
        <input type="file" accept="image/*" @change="handleFileUpload" />

        <button type="button" class="camera-btn" @click="openCamera">
          📸 Take Photo
        </button>
      </div>

      <!-- Camera -->
      <div v-if="showCamera" class="camera-box">
        <video ref="camera" autoplay playsinline></video>

        <button class="snap-btn" @click="capturePhoto">📷 Capture</button>
        <button class="close-btn" @click="closeCamera">✖ Close Camera</button>
      </div>

      <!-- Preview -->
      <div v-if="form.photo_url" class="preview">
        <img :src="form.photo_url" />
      </div>

      <!-- MATCH RESULT -->
      <div v-if="matchResult" class="match-box">
        <p><strong>AI Match:</strong> {{ matchResult }}</p>
      </div>

      <!-- SUBMIT -->
      <button class="submit-btn" @click="submitSighting">Submit Sighting</button>

      <p v-if="success" class="success">Sighting submitted successfully.</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import Navbar from "@/components/Navbar.vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/supabase";
import * as faceapi from "face-api.js";

export default {
  components: { Navbar },
  data() {
    return {
      map: null,
      marker: null,
      gpsMarker: null,
      watchId: null,

      gpsActive: false,
      coords: "",
      persons: [],
      matchResult: "",
      showCamera: false,
      cameraStream: null,

      form: {
      person_id: "",
      notes: "",
      lat: null,
      lng: null,
},
      success: false,
      error: "",
    };
  },

  async created() {
    const { data } = await supabase
      .from("persons")
      .select("id, full_name, photo_url");

    this.persons = data || [];

    // Load face models from /public/models/
    await faceapi.nets.tinyFaceDetector.load("/models/");
    await faceapi.nets.faceLandmark68Net.load("/models/");
    await faceapi.nets.faceRecognitionNet.load("/models/");
  },

  mounted() {
    this.$nextTick(() => {
      this.initMap();
      setTimeout(() => this.map.invalidateSize(), 500);
    });
  },

  methods: {
    /* ------------------------ MAP ------------------------ */
    initMap() {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
        iconUrl: require("leaflet/dist/images/marker-icon.png"),
        shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
      });

      this.map = L.map("map").setView([-26.2041, 28.0473], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(this.map);

      this.map.on("click", (e) => {
        if (this.gpsActive) return;
        const { lat, lng } = e.latlng;
        this.updateManualMarker(lat, lng);
      });
    },

    updateManualMarker(lat, lng) {
      this.coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      this.form.lat = lat;
      this.form.lng = lng;

      if (this.marker) this.map.removeLayer(this.marker);

      this.marker = L.marker([lat, lng]).addTo(this.map);
    },

    enableLiveLocation() {
      this.gpsActive = true;

      this.watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          this.form.lat = lat;
          this.form.lng = lng;
          this.coords = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;

          if (!this.gpsMarker) {
            this.gpsMarker = L.circleMarker([lat, lng], {
              radius: 8,
              color: "#0077b6",
              fillColor: "#0096c7",
              fillOpacity: 0.8,
            }).addTo(this.map);

            this.map.setView([lat, lng], 14);
          } else {
            this.gpsMarker.setLatLng([lat, lng]);
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true }
      );
    },

    disableLiveLocation() {
      this.gpsActive = false;

      if (this.watchId) {
        navigator.geolocation.clearWatch(this.watchId);
        this.watchId = null;
      }

      if (this.gpsMarker) {
        this.map.removeLayer(this.gpsMarker);
        this.gpsMarker = null;
      }
    },

    /* ------------------- PHOTO UPLOAD ------------------- */
    async handleFileUpload(e) {
      const file = e.target.files[0];
      if (!file) return;
      await this.uploadPhoto(file);
    },

    async openCamera() {
      this.showCamera = true;
      this.cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.$refs.camera.srcObject = this.cameraStream;
    },

    capturePhoto() {
      const video = this.$refs.camera;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob(async (blob) => {
        const file = new File([blob], `capture_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        await this.uploadPhoto(file);
      });
    },

    closeCamera() {
      this.showCamera = false;
      if (this.cameraStream)
        this.cameraStream.getTracks().forEach((t) => t.stop());
    },

    /* ------------------ SUPABASE UPLOAD (correct bucket) ------------------ */
    async uploadPhoto(file) {
      const fileName = `sighting_${Date.now()}_${file.name}`;

      const { error } = await supabase.storage
        .from("images")   //<<<<<<<<<< CORRECT BUCKET HERE
        .upload(fileName, file);

      if (error) {
        this.error = error.message;
        return;
      }

      const { data } = supabase.storage
        .from("images")
        .getPublicUrl(fileName);

      this.form.photo_url = data.publicUrl;

      await this.performFaceMatch();
    },

    /* ------------------- FACE MATCH AI ------------------- */
    async performFaceMatch() {
      this.matchResult = "Analyzing photo...";

      const img = await faceapi.fetchImage(this.form.photo_url);

      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        this.matchResult = "No face detected.";
        return;
      }

      let closest = null;
      let bestDist = 1;

      for (const p of this.persons) {
        if (!p.photo_url) continue;

        const refImg = await faceapi.fetchImage(p.photo_url);

        const ref = await faceapi
          .detectSingleFace(refImg, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!ref) continue;

        const distance = faceapi.euclideanDistance(
          detection.descriptor,
          ref.descriptor
        );

        if (distance < bestDist) {
          bestDist = distance;
          closest = p.full_name;
        }
      }

      if (!closest) {
        this.matchResult = "No match found.";
        return;
      }

      const confidence = ((1 - bestDist) * 100).toFixed(1);
      this.matchResult = `Possible match: ${closest} (${confidence}% similar)`;
    },

    /* ------------------ SUBMIT ------------------ */
    async submitSighting() {
      if (!this.form.lat || !this.form.lng) {
        this.error = "Location required.";
        return;
      }

      const { error } = await supabase
        .from("sightings")
        .insert([this.form]);

      if (error) this.error = error.message;
      else this.success = true;
    },
  },
};
</script>
<style scoped>
.sightings-container {
  font-family: "Inter", sans-serif;
  background: #f5f7fa;
  min-height: 100vh;
}

/* Top Bar */
.topbar {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
.logo {
  width: 45px;
  margin-right: 10px;
}
.topbar h1 {
  font-size: 22px;
  color: #0d1b2a;
  font-weight: 600;
}

/* MAP */
#map {
  height: 65vh;
  width: 100%;
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
}

/* Report Box */
.report-box {
  background: white;
  margin: 20px;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.report-box h2 {
  margin-bottom: 12px;
  font-size: 20px;
  color: #0d1b2a;
}

label {
  display: block;
  font-weight: 600;
  margin-top: 12px;
  margin-bottom: 4px;
}

input,
textarea,
select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}

textarea {
  height: 90px;
}

/* GPS Buttons */
.location-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.gps-btn {
  background: #0096c7;
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}

.gps-off-btn {
  background: #d62828;
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.camera-btn {
  background: #0077b6;
  color: white;
  padding: 10px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.photo-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}
.camera-box {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
video {
  width: 450px;
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


.submit-btn {
  width: 100%;
  padding: 12px;
  background: #0077b6;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
}
.submit-btn:hover {
  background: #005f8d;
}

.success {
  color: #2d6a4f;
  margin-top: 12px;
}
.error {
  color: #d62828;
  margin-top: 12px;
}
</style>
