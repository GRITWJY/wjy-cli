// 按需加载
import "./css/index.css";
import "./less/index.less";
import "./scss/index.sass";
import "./scss/index.scss";
import "./css/iconfont.css";
import sum from "./js/sum";

document.getElementById("btn").onclick = function () {
  import(/* webpackChunkName:"math" */ "./js/math").then(({ mul }) => {
    console.log(mul(3, 3));
  });
};
console.log(sum(1, 2, 3, 4, 5, 56, 6, 7));

const promise = Promise.resolve();
promise.then(() => {
  console.log("hello promise");
});
