<script setup>
import data from '../../data/experiences.json';

const profile = data.profile;
const roles = data.roles;
</script>

<template>
  <div class="profile">
    <header class="profile__header">
      <div class="profile__avatar" aria-hidden="true">{{ profile.initials }}</div>
      <div>
        <p class="profile__name">{{ profile.name }}</p>
        <p class="profile__tagline">{{ profile.tagline }}</p>
        <p class="profile__meta">{{ profile.location }} / {{ roles.length }} entries in experiences.json</p>
      </div>
    </header>

    <ol class="roles">
      <li v-for="role in roles" :key="role.title" class="role">
        <div class="role__logo" aria-hidden="true">{{ role.badge }}</div>
        <div class="role__detail">
          <p class="role__title">{{ role.title }}</p>
          <p class="role__org">{{ role.org }} / {{ role.kind }}</p>
          <p class="role__dates">{{ role.dates }}<span v-if="role.length"> / {{ role.length }}</span></p>
          <ul class="role__points">
            <li v-for="point in role.points" :key="point">{{ point }}</li>
          </ul>
          <p class="role__tags">
            <span v-for="tag in role.tags" :key="tag">{{ tag }}</span>
          </p>
        </div>
      </li>
    </ol>
  </div>
</template>