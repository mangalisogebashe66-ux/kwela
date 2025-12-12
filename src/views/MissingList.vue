<template>
  <div class="missing-list-page">

   <Navbar />

    <div class="content">
      <div v-if="loading" class="loading">
        Loading missing persons...
      </div>

      <div v-else-if="persons.length === 0" class="empty">
        No missing persons reported.
      </div>

      <div v-else class="cards">
        <div v-for="p in persons" :key="p.id" class="card">
          <img
            v-if="p.photo_url"
            :src="p.photo_url"
            class="person-img"
            alt="Missing person photo"
          />
          <div class="info">
            <h2>{{ p.full_name }}</h2>
            <p><strong>Last Seen:</strong> {{ p.last_seen }}</p>
            <p><strong>Age:</strong> {{ p.age }}</p>
            <p><strong>Gender:</strong> {{ p.gender }}</p>
            <p><strong>Description:</strong> {{ p.description }}</p>
            <p><strong>Reported At:</strong> {{ new Date(p.created_at).toLocaleString() }}</p>
            
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import { ref, onMounted } from 'vue'
import { supabase } from "@/supabase"   // ← uses your supabase.js

const persons = ref([])
const loading = ref(true)
components: { Navbar }
async function loadMissingPersons() {
  loading.value = true
  const { data, error } = await supabase
    .from('persons')
    .select('*',"id, full_name, photo_url")
    .order('created_at',"full_name",{ ascending: false })

  if (error) {
    console.error("Supabase fetch error:", error)
  } else {
    persons.value = data
  }

  loading.value = false
}


onMounted(async () => {
  await loadMissingPersons()

  // Real-time subscriptions
  supabase
    .channel('persons-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'persons' }, payload => {
      console.log("DB change:", payload)
      loadMissingPersons()
    })
    .subscribe()
})
</script>

<style scoped>
.missing-list-page {
  padding: 16px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.logo {
  width: 45px;
  height: auto;
}

h1 {
  font-size: 22px;
  margin: 0;
}

.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 20px;
}

.card {
  background: #ffffff;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  gap: 16px;
}


.info h2 {
  margin: 0;
  font-size: 18px;
}

.loading,
.empty {
  text-align: center;
  margin-top: 40px;
  font-size: 18px;
  color: #777;
}
.person-img {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.info p {
  margin: 6px 0;
  font-size: 15px;
  color: #333;
}
</style>
