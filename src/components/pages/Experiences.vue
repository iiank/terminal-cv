<script setup>
import { toLines } from '../../utils/toLines.js';

const props = defineProps({
  data: { type: Object, required: true }
});

const profile = props.data.profile;
const roles = props.data.roles;
</script>

<template>
  <div class="profile">
    <header class="profile-header">
      <div class="profile-avatar" aria-hidden="true">{{ profile.initials }}</div>
      <div>
        <p class="profile-name">{{ profile.name }}</p>
        <p v-for="(paragraph, part) in toLines(profile.tagline)" :key="part" class="profile-tagline">{{ paragraph }}</p>
        <p class="profile-meta">{{ profile.location }} / {{ roles.length }} entries in experiences.json</p>
      </div>
    </header>

    <ol class="roles">
      <li v-for="role in roles" :key="role.title" class="role">
        <div class="role-logo" aria-hidden="true">{{ role.badge }}</div>
        <div class="role-detail">
          <p class="role-title">{{ role.title }}</p>
          <p class="role-org">{{ role.org }} / {{ role.kind }}</p>
          <p class="role-dates">{{ role.dates }}<span v-if="role.length"> / {{ role.length }}</span></p>
          <ul class="role-points">
            <li v-for="point in role.points" :key="point">{{ point }}</li>
          </ul>
          <p class="role-tags">
            <span v-for="tag in role.tags" :key="tag">{{ tag }}</span>
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>
