<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const emit = defineEmits(["open-modal"]);

const openModal = () => {
  emit("open-modal");
};

const headerRef = ref(null);
const headerHeight = ref(0);
const updateHeaderHeight = () => {
  if (headerRef.value) {
    headerHeight.value = headerRef.value.offsetHeight;
    document.documentElement.style.setProperty(
      "--header-height",
      `${headerHeight.value}px`
    );
  }
};

onMounted(() => {
  updateHeaderHeight();
  window.addEventListener("resize", updateHeaderHeight);
  const observer = new MutationObserver(updateHeaderHeight);
  if (headerRef.value) {
    observer.observe(headerRef.value, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }
  onUnmounted(() => {
    window.removeEventListener("resize", updateHeaderHeight);
    observer.disconnect();
  });
});
</script>

<template lang="pug">
header.header(ref="headerRef")
  .container
    nav
      ul.navigation
        li
          div.flex
            button.action-btn
              router-link.link.default(@click="openModal" :to="{ name: 'list' }")
                i.material-symbols-outlined search
                span.link-text СПИСОК


        li
          div.flex
            button.action-btn
              router-link.link.default(@click="openModal" :to="{name: 'createComposition'}") 
                i.material-symbols-outlined add_ad
                span.link-text ДОБАВИТЬ
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=add,add_ad,save,scan_delete,search,stacks");

.material-symbols-outlined {
  font-variation-settings: "FILL" 0, "wght" 400, "GRAD" 0, "opsz" 24;
  color: rgb(186, 58, 58) 0;
  font-size: clamp(25px, calc(1vw + 1.5vh), 50px);
}
.action-btn {
  background-color: rgba(0, 0, 0, 0);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}
.material-symbols-outlined:hover {
  color: #000000;
}
.navigation {
  padding-left: 0px;
}
.action-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}
span {
  font-size: clamp(8px, calc(1vh), 50px);
  font-weight: 600;
  padding-top: 1px;
}
.action-btn:disabled {
  opacity: 0.8;
  cursor: progress;
  transform: none !important;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
}
.header {
  background-color: #ffffff;
  color: rgb(0, 0, 0);
  font-family: "Roboto", sans-serif;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}
.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 75%;
  justify-content: center;
  margin: 0 auto;
}
.link {
  cursor: pointer;
  font-weight: 500;
  color: #6f6f6f;
  font-size: clamp(14px, calc(0.5vw + 0.5vh), 50px);
  display: flex;
  flex-direction: column;
}
.logo img {
  height: 50px;
}
.link:hover {
  color: #2b2b2b;
  transition: opacity 0.3s ease, filter 0.3s ease;
}
.navigation {
  list-style: none;
  display: flex;
  gap: 2rem;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  justify-content: center;
  align-items: center;
}
.navigation li {
  position: relative;
}
.navigation a {
  text-decoration: none;
  color: #6f6f6f;
  font-weight: 400;
  transition: color 0.3s, background-color 0.3s;
  border-radius: 4px;
}
.navigation a:hover {
  color: #000000;
}
.flex {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.link-text {
  animation: fadeInDown 0.3s ease forwards;
}
.header {
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform: translateY(0);
  opacity: 1;
}
.header--hidden {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}
.default:hover {
  color: rgb(131, 38, 251);
}
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .link-text {
    animation: fadeOutDown 0.3s ease forwards;
  }
}
@media (max-height: 768px) {
  .link-text {
    animation: fadeOutDown 0.3s ease forwards;
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(10px);
    height: 0;
    margin: 0;
    padding: 0;
  }
}
</style>
