<template>
  <div class="alerts-wrapper">

    <Navbar />

    <div class="page-content">
      <!-- Sub Header -->
      <p class="sub">Real-time safety & missing person alerts</p>

      <!-- Empty State -->
      <div v-if="alerts.length === 0" class="empty">
        <img src="@/assets/empty_alerts.svg" class="empty-img" />
        <p>No active alerts</p>
      </div>

      <!-- Alerts List -->
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="alert-card"
        :class="'alert-' + alert.alert_type"
      >
        <div class="alert-header">
          <span class="chip" :class="'chip-' + alert.alert_type">
            {{ formatType(alert.alert_type) }}
          </span>
          <small class="time">{{ formatTime(alert.created_at) }}</small>
        </div>

        <h2 class="title">{{ alert.title }}</h2>
        <p class="message">{{ alert.message }}</p>

        <div v-if="alert.location" class="location">
          📍 {{ alert.location }}
        </div>

        <div v-if="alert.extra_info" class="extra">
          {{ alert.extra_info }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import { supabase } from "@/supabase";

export default {
  components: { Navbar },
  data() {
    return { alerts: [] };
  },

  async created() {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .order("created_at", { ascending: false });

    this.alerts = data || [];

    // Real-time updates
    supabase
      .channel("alerts-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          this.alerts.unshift(payload.new);
        }
      )
      .subscribe();
  },

  methods: {
    formatTime(t) {
      return t ? new Date(t).toLocaleString() : "Unknown";
    },
    formatType(t) {
      return t ? t.toUpperCase() : "ALERT";
    }
  }
};
</script>

<style scoped>

/* ---------------------------- */
/* BRAND COLOUR SYSTEM          */
/* ---------------------------- */
:root {
  --khwela-dark: #0d1b2a;
  --khwela-blue: #1a73e8;
  --khwela-light-blue: #e3f0ff;
  --khwela-red: #e63946;
  --khwela-green: #2d6a4f;
  --khwela-gray: #6c757d;
  --bg: #f2f4f7;
}

/* ---------------------------- */
/* PAGE WRAPPER                 */
/* ---------------------------- */
.alerts-wrapper {
  min-height: 100vh;
  background: var(--bg);
  padding-bottom: 40px;
}

/* ---------------------------- */
/* KHWELE HEADER (BRANDED)      */
/* ---------------------------- */
.khwela-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 22px;
  background: white;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.khwela-header .logo {
  height: 40px;
}

.khwela-header h1 {
  font-size: 22px;
  margin: 0;
  font-weight: 700;
  color: var(--khwela-dark);
}

/* ---------------------------- */
/* CONTENT                      */
/* ---------------------------- */
.page-content {
  max-width: 700px;
  margin: 20px auto;
  padding: 0 20px;
  text-align: center;
}

.sub {
  color: #555;
  font-size: 15px;
  margin-bottom: 25px;
}

/* ---------------------------- */
/* EMPTY STATE                  */
/* ---------------------------- */
.empty {
  margin-top: 50px;
  color: #777;
}

.empty-img {
  width: 130px;
  margin-bottom: 8px;
}

/* ---------------------------- */
/* ALERT CARD                   */
/* ---------------------------- */
.alert-card {
  background: white;
  border-radius: 14px;
  padding: 18px 20px;
  margin-bottom: 18px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.08);
  text-align: left;
  border-left: 6px solid var(--khwela-blue);
}

/* Different colors per alert type */
.alert-MISSING {
  border-left-color: var(--khwela-red);
}

.alert-SAFETY {
  border-left-color: var(--khwela-blue);
}

.alert-INFO {
  border-left-color: var(--khwela-green);
}

.alert-OTHER {
  border-left-color: var(--khwela-gray);
}

/* Header inside card */
.alert-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.time {
  font-size: 12px;
  color: #777;
}

.title {
  margin: 6px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--khwela-dark);
}

.message {
  color: #444;
  margin-bottom: 8px;
}

.location {
  font-weight: 600;
  color: var(--khwela-blue);
  margin-bottom: 6px;
}

.extra {
  background: var(--khwela-light-blue);
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--khwela-blue);
}

/* Chip badges */
.chip {
  padding: 4px 12px;
  font-size: 11px;
  border-radius: 20px;
  color: white;
  font-weight: 600;
}

.chip-MISSING {
  background: var(--khwela-red);
}

.chip-SAFETY {
  background: var(--khwela-blue);
}

.chip-INFO {
  background: var(--khwela-green);
}

.chip-OTHER {
  background: var(--khwela-gray);
}
</style>
