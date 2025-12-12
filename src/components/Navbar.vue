<template>
  <nav class="khwela-nav">
    <div class="nav-inner">

      <!-- BRAND -->
      <router-link to="/Home" class="brand">
        <img src="@/assets/khwela_logo.png" class="logo" alt="Khwela Logo" width="50px" />
      </router-link>

      <!-- DESKTOP LINKS -->
      <div class="links desktop-only">
        <router-link to="/missing" active-class="active">Missing</router-link>
        <router-link to="/reportmissing" active-class="active">Report</router-link>
        <router-link to="/reportsighting" active-class="active">Report Sighting</router-link>
        <router-link to="/alerts" active-class="active">Alerts</router-link>
      </div>

      <!-- HAMBURGER MENU BUTTON (mobile) -->
      <div class="hamburger mobile-only" @click="open = !open">
        <span :class="{ open }"></span>
        <span :class="{ open }"></span>
        <span :class="{ open }"></span>
      </div>

    </div>

    <!-- MOBILE DROPDOWN MENU -->
    <transition name="slide">
      <div v-if="open" class="mobile-menu mobile-only">
        <router-link to="/missing" @click="close" active-class="active">Missing</router-link>
        <router-link to="/report-missing" @click="close" active-class="active">Report</router-link>
        <router-link to="/report-sighting" @click="close" active-class="active">Report Sighting</router-link>
        <router-link to="/alerts" @click="close" active-class="active">Alerts</router-link>
      </div>
    </transition>

  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return { open: false };
  },
  methods: {
    close() {
      this.open = false;
    }
  }
};
</script>

<style scoped>
/* ------------------------------------------------------ */
/* NAVBAR SHELL */
/* ------------------------------------------------------ */
.khwela-nav {
  background: #ffffff;
  border-bottom: 1px solid #e5e8ef;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.nav-inner {
  max-width: 1200px;
  margin: auto;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* BRAND */
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 20px;

  font-size: 20px;
  font-weight: 800;
  color: #0d1b2a;
  text-decoration: none;
}

.logo {
  height: 34px;
  width: auto;
}

/* DESKTOP LINKS */
.links a {
  margin-left: 20px;
  font-size: 15px;
  font-weight: 600;

  color: #1a73e8;
  padding: 6px 10px;
  border-radius: 6px;
  text-decoration: none;
  transition: 0.15s;
}

.links a:hover {
  background: #e8f1ff;
}

.active {
  background: #1a73e8 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(26,115,232,0.25);
}

/* ------------------------------------------------------ */
/* HAMBURGER MENU */
/* ------------------------------------------------------ */

.hamburger {
  width: 28px;
  cursor: pointer;
}

.hamburger span {
  display: block;
  height: 3px;
  background: #0d1b2a;
  margin: 5px 0;
  border-radius: 4px;
  transition: 0.3s;
}

/* turns hamburger to X */
.hamburger span.open:nth-child(1) {
  transform: rotate(45deg) translateY(8px);
}
.hamburger span.open:nth-child(2) {
  opacity: 0;
}
.hamburger span.open:nth-child(3) {
  transform: rotate(-45deg) translateY(-8px);
}

/* ------------------------------------------------------ */
/* MOBILE MENU */
/* ------------------------------------------------------ */

.mobile-menu {
  background: white;
  padding: 15px 20px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #e5e8ef;
}

.mobile-menu a {
  padding: 12px 0;
  color: #1a73e8;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
}

.mobile-menu a.active {
  background: #1a73e8;
  color: white;
  padding: 12px 10px;
  border-radius: 6px;
}

/* Slide-down animation */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter {
  opacity: 0;
  transform: translateY(-6px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* ------------------------------------------------------ */
/* RESPONSIVE BREAKPOINTS */
/* ------------------------------------------------------ */

.mobile-only { display: none; }
.desktop-only { display: flex; }

@media (max-width: 760px) {
  .desktop-only { display: none; }
  .mobile-only { display: block; }
}
</style>
