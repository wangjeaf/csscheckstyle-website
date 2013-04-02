(function(win) {
	var styles = document.getElementsByTagName('link'),
		i, l = styles.length, link, url, code, inputed;
	var domain = 'http://csscheckstyle.com/';
	// var domain = 'http://fed.d.xiaonei.com/ckstyle/'   // for fed.d.xiaonei.com

	function getDownloadUrl(url) {
		return domain + 'handler/' + url;
	}

	if (win.ckstyle_inited) {
		if ($('ckstyle-placeholder')) {
			var p = $('ckstyle-placeholder').parentNode.parentNode;
			p.removeChild($('ckstyle-placeholder').parentNode);
		}
	}

	win.ckstyle_inited = true;

	function showInviteCodeInputer() {
		var inputed = prompt('please input your CKstyle Invite Code here... \n\n\
			localStorage can not cross domain, sorry ~~~');
		if (inputed) {
			var flag = confirm('please confirm your invite code: \n\n' + inputed);
			if (flag) {
				win.localStorage.setItem('ckstyle-invite-code', inputed);
				return inputed;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	win.showInviteCodeInputer = showInviteCodeInputer;

	if (win.localStorage) {
		code = win.localStorage.getItem('ckstyle-invite-code');
		if (!code) {
			code = showInviteCodeInputer();
			if (!code) {
				return;
			}
		}
	}
	function getUrl(src) {
		var a = document.createElement('a');
		a.href = src;
		return encodeURIComponent(a.href);
	}
	var urls = [];
	for (i = 0; i < l; i++) {
		link = styles[i];
		if (link.getAttribute('rel') != 'stylesheet') {
			continue;
		}
		url = link.getAttribute('href');
		if (!url) {
			continue;
		}
		urls.push(getUrl(url));
	}
	var html = 
		'<div id="ckstyle-placeholder" style="width:100%;background-color:#EEE;\
			position:fixed;top:0;right:0;z-index:10000;border:1px solid #000;box-shadow: 1px 1px 10px #000;opacity:0.9;">\
			<span id="ckstyle-close" style="float:right;margin-right:10px;font-size:20px;margin-top:3px;cursor:pointer;">&times;</span>\
			<h3 style="padding:5px;margin:0;font-size:16px;line-height:22px;border-bottom:1px solid #000;">CKStyle Service</h3>\
			<p id="ckstyle-loading" style="padding:5px;margin:0;">CKstyling...</p>\
			<div id="ckstyle-content" style="padding:5px;display:none;">321321</div>\
		</div><div id="ckstyle-trigger" style="border:1px solid #000; box-shadow:1px 1px 2px #000;\
			display:none;top:0;right:0;position:fixed;z-index:10000;background-color:#EEE;padding:5px;cursor:pointer;">CKstyle</div>';
	var div = document.createElement('div');
	div.innerHTML = html;
	document.body.appendChild(div);

	var container = $('ckstyle-placeholder');
	function $(id) {
		return document.getElementById(id);
	}

	$('ckstyle-close').onclick = function() {
		this.parentNode.style.display = 'none';
		$('ckstyle-trigger').style.display = 'block';
	};
	$('ckstyle-trigger').onclick = function() {
		this.style.display = 'none';
		container.style.display = 'block';
	};
	var cbName = 'ckstyleCallback';

	function trim(str) {
		return str.replace(/^\s+|\s+$/g, '');
	}
	function cut(url) {
		if (url.length > 80) {
			url = url.substring(0, 80) + '...';
		}
		return url;
	}
	
	function buildContent(array) {
		var result = ['<table width="100%" style="text-align:left;"><thead><tr><th width="40%">URL</th>\
			<th>before</th><th>after</th><th>delta</th><th>% (delta/before)</th><th>约每千万PV节省</th><th>压缩后代码下载</th><th>替换</th></tr></thead><tbody>'], current;
		for (var i = 0, l = array.length; i < l; i ++) {
			current = array[i];
			current.delta = current.before - current.after;
			result.push('<tr><td><a target="_blank" href="' + current.url + '">' + cut(current.url) + '</a></td><td>' + 
				current.before + '</td><td>' + 
				current.after + '</td><td>' + 
				current.delta + 
				'</td><td>' + ((current.delta / current.before) * 100).toFixed(4) + 
				'</td><td>' + (current.delta * 2 * 1000 * 10000 / 1024 / 1024 / 1024).toFixed(4) + 'G' +  
				'</td><td><a target="_blank" href="' + getDownloadUrl(current.download) + '">compressed</a></td>' + 
				'<td>\
					<a href="javascript:;" \
						onclick="ckstyleReplaceUrl(this, \'' + encodeURIComponent(trim(current.url)) + '\', \'' + 
							encodeURIComponent(trim(current.download)) + '\')">替换CSS</a></td>' + 
				'<tr>');
		}
		result.push('</tbody></table>');
		return result.join('');
	}
	function returnFalse() {
		return false;
	}

	win['ckstyleReplaceUrl'] = function(node, from, to) {
		from = decodeURIComponent(from);
		to = getDownloadUrl(decodeURIComponent(to));
		if (node.innerHTML == '恢复') {
			var tmp = to;
			to = from;
			from = tmp;
		}
		container.style.display = 'none';
		setTimeout(function() {
			var links = document.getElementsByTagName('link');
			for (var i = 0, l = links.length; i < l; i++) {
				if (links[i].href == from) {
					links[i].href = to;
					setTimeout(function() {
						if (node.innerHTML == '恢复') {
							node.innerHTML = '替换CSS'
						} else {
							node.innerHTML = '恢复';
						}
						container.style.display = 'block';
					}, 1000);
					return;
				}
			}
			container.style.display = 'block';
		}, 500)
		
	}
	win[cbName] = function(res) {
		if (res.status != 'ok') {
			$('ckstyle-loading').innerHTML = res.msg;
			return;
		}
		$('ckstyle-loading').style.display = 'none';
		var content = $('ckstyle-content');
		content.innerHTML = buildContent(res.files);
		content.style.display = 'block';
	};
	
	var optype = 'ckstyle';
	var script = document.createElement('script');
	script.async = true;
	script.type = 'text/javascript';
	script.src = domain + 'handler/service.php?invitecode=' + code + '&ckcallback=' + cbName + '&optype=' + optype + '&cssurls=' + urls.join('__seperator__');
	document.body.appendChild(script);
})(this);