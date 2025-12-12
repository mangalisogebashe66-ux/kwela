<template>
  <div>
    <Navbar />
    <div class="profile" v-if="person">
      <div class="hero">
        <img :src="person.photo_url || placeholder" class="photo" />
        <div class="info">
          <h1>{{ person.full_name }}</h1>
          <p><strong>Age:</strong> {{ person.age }}</p>
          <p><strong>Gender:</strong> {{ person.gender }}</p>
          <p><strong>Last seen:</strong> {{ formatTime(person.last_seen) }}</p>
          <p>{{ person.description }}</p>
        </div>
      </div>

      <section class="sightings">
        <h2>Recent Sightings</h2>
        <div v-for="s in sightings" :key="s.id" class="sighting-card">
          <p><strong>{{ s.reported_by || 'Anonymous' }}</strong> • {{ formatTime(s.created_at) }}</p>
          <p>{{ s.notes }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import { supabase } from '@/supabase'

export default {
  components: { Navbar },
  data() { return { person: null, sightings: [], placeholder:'https://via.placeholder.com/400' } },
  async created() {
    const id = this.$route.params.id
    const { data: person } = await supabase.from('persons').select('*').eq('id', id).single()
    this.person = person
    const { data: sightings } = await supabase.from('sightings').select('*').eq('person_id', id).order('created_at',{ascending:false})
    this.sightings = sightings || []
  },
  methods: { formatTime(t){ if(!t) return 'Unknown'; return new Date(t).toLocaleString() } }
}
</script>

<style scoped>
.hero { display:flex; gap:18px; background:#fff; padding:16px; border-radius:10px }
.photo { width:260px; height:260px; object-fit:cover; border-radius:8px }
.info { flex:1 }
.sightings { margin-top:18px }
.sighting-card { background:#fff; padding:10px; border-radius:8px; margin-bottom:8px }
</style>
