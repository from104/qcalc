<script setup lang="ts" />

<template>
  <q-tooltip class="text-dark bg-yellow text-body2 fa-border-all" anchor="top middle" self="bottom middle"
    style="border: 1px solid black" :delay="500">
    <slot />
  </q-tooltip>
</template>
