<script setup>
const { twitterBorderColor, defaultTransition } = useTailwindConfig();

const wrapClasses = computed(() => `${twitterBorderColor} ${defaultTransition}`);
</script>

<template>
  <div class="p-3 border-b cursor-pointer hover:bg-gray-100 dark:hover:bg-dim-300" :class="wrapClasses">
    <slot></slot>
  </div>
</template>
