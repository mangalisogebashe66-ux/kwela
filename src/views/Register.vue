<template>
  <div class="login-container">

    <div class="login-box">
      <h1 class="title">Khwela</h1>
      <p class="subtitle">Create your account</p>

      <input 
        v-model="name" 
        type="text" 
        placeholder="Full Name"
        class="input"
      />

      <input 
        v-model="email" 
        type="email" 
        placeholder="Email Address"
        class="input"
      />

      <input 
        v-model="password" 
        type="password" 
        placeholder="Password"
        class="input"
      />

      <input 
        v-model="confirmPassword" 
        type="password" 
        placeholder="Confirm Password"
        class="input"
      />

      <button class="login-btn" @click="register">
        Register
      </button>

      <p><span><RouterLink to="/">Already Have An Account</RouterLink></span></p>

      <p class="error" v-if="error">{{ error }}</p>

      <p class="footer-text">© 2025 Khwela — User</p>
    </div>

  </div>
</template>

<script>
import { supabase } from "../supabase";

export default {
  data() {
    return {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      error: ""
    };
  },

  methods: {
    async register() {
      this.error = "";

      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match.";
        return;
      }

      // Supabase v1 SIGN-UP
      const { user, error } = await supabase.auth.signUp({
        email: this.email,
        password: this.password
      }, {
        data: {
          name: this.name
        }
      });

      if (error) {
        this.error = error.message;
        return;
      }

      // Redirect after registering
      this.$router.push("/Home");
    }
  }
};
</script>

<style>
/* SAME STYLE AS LOGIN PAGE */
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #eef1f5;
}

.login-box {
  width: 350px;
  background: white;
  padding: 35px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  text-align: center;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: bold;
  color: #222;
}

.subtitle {
  margin-top: 5px;
  margin-bottom: 25px;
  color: #666;
}

.input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  font-size: 15px;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline: none;
  box-sizing: border-box;
}

.input:focus {
  border-color: #2980b9;
}

.login-btn {
  width: 100%;
  padding: 12px;
  margin-top: 5px;
  background: #2980b9;
  color: white;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.login-btn:hover {
  background: #1f6fa0;
}

.error {
  margin-top: 10px;
  color: #d9534f;
  font-size: 14px;
}

.footer-text {
  margin-top: 20px;
  font-size: 13px;
  color: #aaa;
}
</style>
