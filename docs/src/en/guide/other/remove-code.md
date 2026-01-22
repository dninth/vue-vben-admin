# Remove Code

## Remove Code

In the corresponding application's `index.html` file, find the following code and delete it:

```html
<!-- apps/web-ele/index.html -->
<script>
  // Inject Baidu analytics in production only
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
