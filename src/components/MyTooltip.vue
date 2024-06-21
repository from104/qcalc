<script setup lang="ts" />

<template>
  <q-tooltip
    class="text-green-10 bg-green-2 text-body2 text-center fa-border-all"
    anchor="top middle"
    self="bottom middle"
    style="border: 1px solid black; word-break: break-all; word-wrap: break-word"
    :delay="500"
  >
    <slot />
  </q-tooltip>
</template>
