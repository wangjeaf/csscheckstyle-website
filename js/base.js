$(function() {
	var prefix = '';
	if (window.location.href.indexOf('fed.d.xiaonei.com') != -1) {
		prefix = '/ckstyle/';
		$('.menu a').each(function(_, node) {
			var a = $(node);
			a.attr('href', '/ckstyle' + a.attr('href'));
		});
	}
	$('.img').each(function(_, node) {
		var img = $(node);
		img.attr('src', prefix + img.data('src'));
	});

});