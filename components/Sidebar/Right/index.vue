<script setup>
const topicItems = ref([
  {
    title: '#LinduJatim',
    count: '55.2k Tweets',
  },
  {
    title: '#KabarJatim',
    count: '5k Tweets',
  },
  {
    title: 'BMKG',
    count: '70k Tweets',
  },
]);

const followItems = ref([
  {
    name: 'Cicellion',
    handle: '@cicellion_',
    image: 'assets/img/Profile.png',
    link: 'https://www.instagram.com/cicellion_/',
  },
  {
    name: 'Cicellion',
    handle: '@cicellion_',
    image: 'assets/img/Profile.png',
    link: 'https://www.instagram.com/cicellion_/',
  },
  {
    name: 'Cicellion',
    handle: '@cicellion_',
    image: 'assets/img/Profile.png',
    link: 'https://www.instagram.com/cicellion_/',
  },
]);
</script>
<template>
  <div class="flex flex-col">
    <!-- Card Topics -->
    <SidebarRightCard title="What's happening">
      <SidebarRightCardItem v-for="topicItem in topicItems" v-bind:key="topicItem.title">
        <div class="">
          <h2 class="font-bold text-gray-800 text-md dark:text-white">{{ topicItem.title }}</h2>
          <p class="text-xs text-gray-400">{{ topicItem.count }}</p>
        </div>
      </SidebarRightCardItem>
    </SidebarRightCard>

    <!-- Card Follows -->
    <SidebarRightCard title="Who to follow">
      <SidebarRightCardItem v-for="followItem in followItems" v-bind:key="followItem.title">
        <div class="flex flex-row items-center justify-between p-2">
          <div class="flex flex-row">
            <img :src="followItem.image" alt="Cicellion" class="w-10 h-10 rounded-full" />

            <div class="flex flex-col ml-2">
              <h1 class="text-sm font-bold text-gray-900 dark:text-white">{{ followItem.name }}</h1>
              <p class="text-xs text-gray-400">{{ followItem.handle }}</p>
            </div>
          </div>
          <div class="flex h-full">
            <a :href="followItem.link" target="_blank" class="px-4 py-2 rounded-full text-xs font-bold text-white dark:text-black bg-black dark:bg-white hover:bg-dim-900">Follow</a>
          </div>
        </div>
      </SidebarRightCardItem>
    </SidebarRightCard>
  </div>
</template>
