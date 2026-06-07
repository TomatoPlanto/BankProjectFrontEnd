<template>
    <div class="app">
        <div>{{ $route.params.accountId }}</div>
    </div>
</template>

<script setup>
    import { onMounted } from "vue";
    import { ref } from 'vue';
    import { useRoute } from 'vue-router';

    const route = useRoute();

    onMounted(async () => {
        console.log(route.params.accountId);
    })
</script>