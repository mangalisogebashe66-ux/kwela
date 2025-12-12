<template>
  <div class="home-container">

    <div class="home-box">
      <h1 class="title">Khwela</h1>
      <p class="subtitle">Welcome, {{ userEmail }}</p>

      <!-- Buttons with ROUTING -->
      <button class="home-btn" @click="goTo('/reportmissing')">
        Report Missing Person
      </button>

      <button class="home-btn" @click="goTo('/reportsighting')">
        Report a Sighting
      </button>

      <button class="home-btn" @click="goTo('/missing')">
        View Missing People
      </button>

      <button class="home-btn" @click="goTo('/missingp')">
        Missing Profile
      </button>

      <button class="home-btn" @click="goTo('/alerts')">
        Alerts & Updates
      </button>

      <button class="logout-btn" @click="logout">
        Logout
      </button>

      <p class="footer-text">© 2025 Khwela — User App</p>
    </div>

  </div>
</template>

<script>
import { supabase } from "../supabase";
import { registerPush } from "@/push"; // <-- enables push notifications

export default {
  data() {
    return {
      userEmail: ""
    };
  },

  async created() {
    // Get signed-in user from Supabase
    const user = supabase.auth.user();

    if (!user) {
      return this.$router.push("/");
    }

    this.userEmail = user.email;

    // Enable Push Notifications (service-worker + Supabase)
    registerPush();
  },

  methods: {
    goTo(route) {
      this.$router.push(route);
    },

    async logout() {
      await supabase.auth.signOut();
      this.$router.push("/");
    }
  }
};
</script>

<style>
  /* Fullscreen Center Layout */
.home-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #E6EEF5; /* Soft Khwela Blue */
  padding: 20px;
}

/* Main Card */
.home-box {
  width: 360px;
  background: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.10);
  text-align: center;
  animation: fadeIn 0.6s ease-in-out;
}

/* Title */
.title {
  margin: 0;
  font-size: 34px;
  font-weight: 800;
  color: #1A2A33; /* Deep Khwela Text */
  letter-spacing: 1px;
}

/* Subtitle */
.subtitle {
  margin-top: 6px;
  margin-bottom: 30px;
  color: #586673; /* Softer text */
  font-size: 16px;
}

/* Brand Buttons */
.home-btn {
  width: 100%;
  padding: 14px;
  margin-bottom: 15px;
  background: #1D70A2; /* Khwela Brand Blue */
  color: white;
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.25s ease;
}

.home-btn:hover {
  transform: translateY(-2px);
  background: #15567E; /* Darker Khwela Blue */
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

/* Logout Button */
.logout-btn {
  width: 100%;
  padding: 14px;
  background: #D64545; /* Khwela Alert Red */
  color: white;
  font-size: 17px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.25s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  background: #B93636;
  box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

/* Footer */
.footer-text {
  margin-top: 22px;
  font-size: 14px;
  color: #7B8A99;
}

/* Smooth fade-in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

</style>