define(function() {
	$('<style type="text/css">\
	.version-tip-top {border-bottom:2px solid #ccc;padding:10px 10px 10px 0;}\
	.version-tip-bottom {border-top:2px solid #ccc;padding:10px 10px 0 0;margin-top:10px;}\
</style>\
<div class="modal hide fade" id="too-old-version">\
  <div class="modal-body">\
    <p class="version-tip-top">为了获得更好的互联网使用体验，建议您使用最新的浏览器，比如：</p>\
    <div class="clearfix browser-list">\
		<a href=""><img src="img/chrome.png"/></a>\
		<a href=""><img src="img/firefox.png"/></a>\
		<a href=""><img src="img/safari_logo.gif"/></a>\
		<a href=""><img src="img/opera.png"/></a>\
		<a href=""><img src="img/IE10.jpg"/></a>\
    </div>\
    <p class="version-tip-bottom">同时也欢迎您访问<a href="http://noie6.renren.com" target="_blank">http://noie6.renren.com</a> 参与人人前端的呼吁~</p>\
  </div>\
  <div class="modal-footer">\
    <a href="#" class="btn btn-link" data-dismiss="modal">关闭</a>\
    <a href="#" class="btn btn-primary">下载Google Chrome</a>\
  </div>\
</div>\
<script>\
	$(function() {\
		$("#too-old-version").modal("show");\
	})\
</script>').appendTo('body');
});
