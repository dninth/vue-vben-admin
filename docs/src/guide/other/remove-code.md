# 移除代码

## 移除百度统计代码

在对应应用的 `index.html` 文件中，找到如下代码，删除即可：

```html
<!-- apps/web-ele/index.html -->
<script>
  // 生产环境下注入百度统计
  if (window._VBEN_ADMIN_PRO_APP_CONF_) {
    var _hmt = _hmt || [];
    (function () {
      var hm = document.createElement('script');
      hm.src = 'https://hm.baidu.com/hm.js?97352b16ed2df8c3860cf5a1a65fb4dd';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(hm, s);
    })();
  }
</script>
```
