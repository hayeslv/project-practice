interface IImage {
  el: HTMLImageElement;
  src: string;
}

export const defaultImg = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const defaultConfig = {
  root: null,
  rootMargin: "0px",
  threshold: 0,
};

class Lazy {
  private immediateLoad: boolean = true; // 是否立即执行（加载图片）
  private images: IImage[] = []; // 尚未加载的图片
  constructor() {
    if (typeof window === "object") {
      // 看看当前浏览器是否支持 window.IntersectionObserver。浏览器及版本支持度：https://caniuse.com/?search=IntersectionObserver
      // API使用教程：https://www.ruanyifeng.com/blog/2016/11/intersectionobserver_api.html
      this.immediateLoad = !window.IntersectionObserver; // 如果当前浏览器不支持，则图片立即加载（不做懒加载）
    }
  }

  add(el: HTMLImageElement, src: string) {
    this.images.push({ el, src });
  }

  load() {
    // !防止在load过程中，有其他图片add进了this.images
    const images = this.images.slice(0); // 拿出images的备份
    this.images.length = 0; // 清空class中的images
    // 如果不支持 window.IntersectionObserver 则直接加载图片
    if (this.immediateLoad) {
      images.forEach(img => {
        img.el.src = img.src;
      });
    } else {
      const map = new Map();
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          entry.isIntersecting ? onEnter(entry.target as HTMLImageElement) : onExit(entry.target as HTMLImageElement);
        });
      }, defaultConfig);
      // 初始化map，以及监听元素
      images.forEach(img => {
        map.set(img.el, img.src);
        observer.observe(img.el);
      });

      // 当图片进入时
      function onEnter(target: HTMLImageElement) {
        // 没有在加载
        if (!target.dataset.loadState) { // loadState：自定义属性
          target.setAttribute("data-load-state", "pending"); // 设置自定义属性为pending状态
          const value = map.get(target);
          if (value) { // 目标元素有src地址
            target.onload = function() {
              // 图片加载完成后，对缓存进行清理
              map.delete(target);
              observer.unobserve(target);
              target.removeAttribute("data-load-state");
              target.onload = null;
            };
            target.src = value; // 对img的src赋值（赋值后浏览器会自动开始加载）
          }
        }
      }
      // 当图片退出时
      function onExit(target: HTMLImageElement) {
        // 如果图片仍在加载，则停止加载图片
        if (target.dataset.loadState) {
          target.removeAttribute("data-load-state");
          target.onload = null;
          target.src = defaultImg;
        }
      }
    }
  }
}

const lazy = new Lazy();

let lock = false;

function load() {
  if (lock) return;
  lock = true;
  setTimeout(() => { // 这里做成异步：等待lazy.add结束
    lock = false;
    lazy.load();
  }, 0);
}

export function add(el: HTMLImageElement, src: string) {
  lazy.add(el, src);
  load();
}
