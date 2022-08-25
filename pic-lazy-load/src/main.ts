import { createSSRApp, createApp as VueCreateApp } from "vue";
import App from "./App.vue";
import { add, defaultImg } from "./utils/lazy";

// const app = createApp(App);
// app.use(router);
// app.mount("#app");

export function createApp(data: any) {
  const app = VueCreateApp(App, data);
  // 全局添加directive
  app.directive("src", {
    // 在绑定元素的 attribute 前或事件监听器应用前调用
    created: (el: HTMLImageElement) => {
      // 设置默认图片
      el.src = defaultImg;
    },
    // 在绑定元素的父组件及他自己的所有子节点都挂载完成后调用
    mounted: (el: HTMLImageElement, binding) => {
      add(el, binding.value);
    },
  });

  return app;
}
