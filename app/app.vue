<script setup>
useHead({
  meta: [{ name: "viewport", content: "width=device-width, initial-scale=1" }],
  link: [{ rel: "icon", href: "/favicon.ico" }],
  htmlAttrs: {
    lang: "en",
    class: "dark",
  },
});

const title = "Budget Kalkylator";
const description = "En budget kalkylator för alla typer av hushåll.";
/*
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterImage: "https://ui.nuxt.com/assets/templates/nuxt/starter-light.png",
  twitterCard: "summary_large_image",
});
*/
</script>

<template>
  <UApp>
    <UMain>
      <NuxtPage />
    </UMain>
    <USeparator />
    <UFooter>
      <p class="text-sm text-muted">
        BudgetCalc • © {{ new Date().getFullYear() }}
      </p>
    </UFooter>
  </UApp>
</template>
