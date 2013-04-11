(function(win) {
	var code, inputed;
	var domain = 'http://www.csscheckstyle.com/';
	// var domain = 'http://fed.d.xiaonei.com/ckstyle/'   // for fed.d.xiaonei.com
	function getDownloadUrl(url) {
		return domain + 'handler/' + url;
	}

	function showInviteCodeInputer(shouldNotInit) {
		var inputed = prompt('please input your CKstyle Invite Code here... \n\n\
			localStorage can not cross domain, sorry ~~~');
		if (inputed) {
			win.localStorage.setItem('ckstyle-invite-code', inputed);
			if (!shouldNotInit) {
				init();
			}
			return inputed;
		} else {
			return false;
		}
	}

	function getUrl(src) {
		var a = document.createElement('a');
		a.href = src;
		return encodeURIComponent(a.href);
	}

	function $(id) {
		return document.getElementById(id);
	}

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
			<th>before</th><th>after</th><th>delta</th><th>% (delta/before)</th><th>Saved Per 10,000,000 PVs</th><th>compressed CSS</th><th>Replace CSS \
				<a href="javascript:;" style="color:red;" title="Because compressed CSS is placed in CKstyle server, relative background image url will become INVALID.">(hover here)</a></th></tr></thead><tbody>'], current;
		for (var i = 0, l = array.length; i < l; i ++) {
			current = array[i];
			current.delta = current.before - current.after;
			result.push('<tr><td><a target="_blank" href="' + current.url + '">' + cut(current.url) + '</a></td><td>' + 
				current.before + '</td><td>' + 
				current.after + '</td><td>' + 
				current.delta + 
				'</td><td>' + ((current.delta / current.before) * 100).toFixed(4) + 
				'</td><td>' + (current.delta * 2 * 1000 * 10000 / 1024 / 1024 / 1024).toFixed(4) + ' GB' +  
				'</td><td><a target="_blank" href="' + getDownloadUrl(current.download) + '">compressed</a></td>' + 
				'<td>\
					<a href="javascript:;"\
						onclick="ckstyle.replaceUrl(this, \'' + encodeURIComponent(trim(current.url)) + '\', \'' + 
							encodeURIComponent(trim(current.download)) + '\')">Replace CSS</a></td>' + 
				'<tr>');
		}
		result.push('</tbody></table>');
		return result.join('');
	}

	function returnFalse() {
		return false;
	}

	function getHttpCssFiles() {
		var urls = [],
			styles = document.getElementsByTagName('link'),
			i, l = styles.length, link, url;
		for (i = 0; i < l; i++) {
			link = styles[i];
			if (link.getAttribute('rel') != 'stylesheet') {
				continue;
			}
			url = link.getAttribute('href');
			if (!url) {
				continue;
			}
			if (getUrl(trim(url)).indexOf('http') != 0) {
				continue;
			}
			urls.push(getUrl(url));
		}
		return urls;
	}
	
	function rebuildHTML() {
		var html = 
			'<div id="ckstyle-placeholder" style="width:100%;background-color:#EEE;\
				position:fixed;top:0;right:0;z-index:10000;border:1px solid #000;box-shadow: 1px 1px 10px #000;opacity:0.9;">\
				<span id="ckstyle-close" style="float:right;margin-right:10px;font-size:20px;margin-top:3px;cursor:pointer;">&times;</span>\
				<h3 style="padding:5px;margin:0;font-size:16px;line-height:22px;border-bottom:1px solid #000;">CKStyle Service\
					<a href="https://github.com/wangjeaf/CSSCheckStyle" target="_blank"><img width="15" style="vertical-align:middle" src="https://a248.e.akamai.net/assets.github.com/images/modules/dashboard/octofication.png?d11794be" /></a></h3>\
				<p id="ckstyle-loading" style="padding:5px;margin:0;">CKstyling <span id="ckstyle-file-count"></span> CSS Files ...</p>\
				<div id="ckstyle-content" style="padding:5px;display:none;">321321</div>\
			</div><div id="ckstyle-trigger" style="border:1px solid #000; box-shadow:1px 1px 2px #000;\
				display:none;top:0;right:0;position:fixed;z-index:10000;background-color:#EEE;padding:5px;cursor:pointer;">CKstyle</div>';
		var div = document.createElement('div');
		div.innerHTML = html;
		document.body.appendChild(div);
	}

	function bindEvents(urls) {
		var container = $('ckstyle-placeholder');
		$('ckstyle-file-count').innerHTML = urls.length;
		$('ckstyle-close').onclick = function() {
			this.parentNode.style.display = 'none';
			$('ckstyle-trigger').style.display = 'block';
		};
		$('ckstyle-trigger').onclick = function() {
			this.style.display = 'none';
			container.style.display = 'block';
		};
		return container;
	}
	
	function removeOldNode() {
		if ($('ckstyle-placeholder')) {
			var p = $('ckstyle-placeholder').parentNode.parentNode;
			p.removeChild($('ckstyle-placeholder').parentNode);
		}
	}

	function replaceUrl(node, from, to) {
		var container = $('ckstyle-placeholder');
		from = decodeURIComponent(from);
		to = getDownloadUrl(decodeURIComponent(to));
		if (node.innerHTML != 'Replace CSS') {
			var tmp = to;
			to = from;
			from = tmp;
		}
		container.style.display = 'none';
		setTimeout(function() {
			var links = document.getElementsByTagName('link');
			for (var i = 0, l = links.length; i < l; i++) {
				if (links[i].href == from) {
					//links[i].href = 'undefined';
					//setTimeout(function() {
						links[i].href = to;
						setTimeout(function() {
							if (node.innerHTML != 'Replace CSS') {
								node.innerHTML = 'Replace CSS';
							} else {
								node.innerHTML = '&radic; Recover CSS';
							}
							container.style.display = 'block';
						}, 500);
					//}, 500);
					
					return;
				}
			}
			container.style.display = 'block';
		}, 500)
	}

	function ckstyleCallback(res) {
		if (res.status != 'ok') {
			$('ckstyle-loading').innerHTML = res.msg;
			return;
		}
		$('ckstyle-loading').style.display = 'none';
		var content = $('ckstyle-content');
		content.innerHTML = buildContent(res.files);
		content.style.display = 'block';
	}
		

	
	win.ckstyle = {};
	win.ckstyle.replaceUrl = replaceUrl;
	win.ckstyle.ckstyleCallback = ckstyleCallback;
	win.ckstyle.showInviteCodeInputer = showInviteCodeInputer;

	function isValidInviteCode() {
		if (win.localStorage) {
			code = win.localStorage.getItem('ckstyle-invite-code');
			if (!code) {
				code = showInviteCodeInputer(true);
				if (!code) {
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		}
	}

	function appendScript(urls) {
		var optype = 'ckstyle';
		var script = document.createElement('script');
		script.async = true;
		script.type = 'text/javascript';
		script.src = domain + 'handler/service.php?invitecode=' + code + '&ckcallback=ckstyle.ckstyleCallback&optype=' + optype + '&cssurls=' + urls.join('__seperator__');
		document.body.appendChild(script);
	}

	function removeLoading() {
		var ele = document.getElementById('ckservice-loading');
		if (ele) {
			ele.parentNode.removeChild(ele);
		}
	}

	function clean() {
		if ($('ckstyle-placeholder')) {
			removeOldNode();
		}
	}

	function init(direct) {
		if (!direct) {
			if (!isValidInviteCode()) {
				return;
			}
		}
		var urls = getHttpCssFiles();
		clean();
		rebuildHTML();
		bindEvents(urls);
		appendScript(urls);
	}

	removeLoading();
	init();
	
})(this);