<script setup lang="ts">
interface Props {
  textColor?: string
  bgColor?: string
  delay?: number
}

withDefaults(defineProps<Props>(), {
  textColor: 'green-10',
  bgColor: 'green-2',
  delay: 500
})
</script>

<template>
  <q-tooltip
    :class="[`text-${textColor}`, `bg-${bgColor}`, 'text-body2 text-center fa-border-all']"
    style="border: 1px solid black; word-break: break-all; word-wrap: break-word"
    anchor="top middle"
    self="bottom middle"
    :delay="delay"
  >
    <slot />
  </q-tooltip>
</template>
