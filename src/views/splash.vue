<template>
  <div class="splash">
    <div class="center-box">
      <img src="@/assets/khwela_logo.png" class="logo" alt="Khwela Logo" />

      <h1 class="title">Khwela</h1>
      <p class="subtitle">Missing Persons Network</p>

      <div class="loader">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from "@/supabase";

export default {
  name: "SplashScreen",

  mounted() {
    setTimeout(async () => {

      // ✔ Works on Supabase v1
      const session = supabase.auth.session();

      if (session) {
        this.$router.replace("/home");   // user logged in
      } else {
        this.$router.replace("/login");  // guest
      }

    }, 2000);
  }
};
</script>



<style scoped>
.splash {
  height: 100vh;
  width: 100%;
  background: #0f172a;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadein 1.5s ease forwards;
}

.center-box {
  text-align: center;
  animation: floatUp 1.3s ease forwards;
}

.logo {
  width: 110px;
  height: 110px;
  margin-bottom: 20px;
  border-radius: 14px;
  background: white;
  padding: 10px;
  box-shadow: 0 6px 14px rgba(255,255,255,0.2);
}

.title {
  font-size: 34px;
  font-weight: 700;
  margin: 0;
}

.subtitle {
  margin-top: 6px;
  font-size: 15px;
  opacity: 0.8;
}

/* Loading dots */
.loader {
  margin-top: 25px;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.loader span {
  width: 10px;
  height: 10px;
  background: #38bdf8;
  border-radius: 50%;
  animation: bounce 0.8s infinite;
}
.loader span:nth-child(2) { animation-delay: 0.15s; }
.loader span:nth-child(3) { animation-delay: 0.3s; }

/* Animations */
@keyframes bounce {
  0% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(-8px); opacity: 1; }
  100% { transform: translateY(0); opacity: 0.6; }
}

@keyframes fadein {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes floatUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>
