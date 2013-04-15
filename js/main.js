// extend jquery
$.errorMsg = function(msg, title) {
	var con = $('#error-msg-container');
	if (con.length == 0) {
		con = $('<div class="modal hide" id="error-msg-container">\
		  <div class="modal-header">\
		    <h3 style="font-size:16px;" class="title"></h3>\
		  </div>\
		  <div class="modal-body">\
		    <p class="msg"></p>\
		  </div>\
		  <div class="modal-footer">\
		    <a href="#" class="btn" data-dismiss="modal">Close</a>\
		  </div>\
		</div>').appendTo('body');
	}
	con.find('.msg').html(msg).end().find('.title').html(title || '对不起，貌似出了点小问题~~').end().modal('show');
};

$.hideErrorMsg = function() {
	$('#error-msg-container').modal('hide');
};

(function(global) {
	var CKSTYLE_RULES = {
		template:  
		'{{#rules}}<li>\
			<label class="checkbox option-{{priority}}" \
				data-content="{{desc}}" title="" \
				data-original-title="{{summary}}">\
				<input type="checkbox" id="{{id}}" name="{{id}}" {{#checked}}checked=checked{{/checked}}/>{{summary}}\
			</label>\
		</li>{{/rules}}',
		rules: RULES};

	rules = CKSTYLE_RULES.rules;
	rules.sort(function(e1, e2) {
		return e1.priority - e2.priority;
	});

	var i, rule, l, prioritys = ['error', 'warning', 'log'];
	
	for(i = 0, rule, l = rules.length; i < l; i ++) {
		rule = rules[i];
		rule.priority = prioritys[rule.priority] || 'log';
	}
	global.CKSTYLE_RULES = CKSTYLE_RULES;
})(this);

// init tooltip
$(function() {
	$('.fork-mask').tooltip({
		placement: 'left'
	});
	$('.guideline-tooltip').tooltip({
		placement: 'top'
	});
	$('.browsers-trigger').tooltip({
		placement: 'top'
	});
	$('.replace').tooltip({
		placement: 'top'
	});
});

// init editor
$(function() {
	var jqTextarea = $('#editor'),
		textarea = jqTextarea[0], top,
	Editor = CodeMirror.fromTextArea(textarea, {
	    theme: 'default',
	    lineNumbers: true,
	    indentUnit: 4,
	    autofocus: true
	});
	Editor.on('change', function() {
		textarea.value = Editor.getValue();
	})
	Editor.setSelection({line: 0,ch: 0}, {line: 100, ch: textarea.value.length});
	//jqTextarea.attr('placeholder', jqTextarea.val());
	// locate to error pos 
	top = $(textarea).next('.CodeMirror').position().top - 10;

	function focusToLine(selector) {
		var css = Editor.getValue(),
			reg = new RegExp('\\s*' + selector + '\\s*{'),
			matched = reg.exec(css);
		if (matched) {
			index = matched.index;
			lineNo = css.substring(0, index).split('\n').length;
			Editor.setSelection({ line: lineNo, ch: 0 }, { line: lineNo, ch:100});
			scrollTo(0, top);
			Editor.scrollIntoView({line: lineNo, ch:0}, 90);
		} else {

		}
	}

	$('.ckstyle-result').delegate('li[data-pos]', 'click', function() {
		var pos = $(this).data('pos');
		if (!pos) {
			Editor.setSelection({ line: 0, ch: 0 }, { line: 0, ch: textarea.value.split('\n')[0].length });
		    scrollTo(0, top);
		    return;
		}
		focusToLine(pos);
	});


	var templates = {
		ckstyle: '{{#hasError}}<h4 class="text-error">{{totalError}} error{{#manyErrors}}s{{/manyErrors}}</h4>{{/hasError}}\
			      {{#hasError}}<ol>{{/hasError}}\
				  	  {{#errors}}<li class="text-error" data-pos="{{selector}}">{{errorMsg}}</li>{{/errors}}\
				  {{#hasError}}</ol>{{/hasError}}\
				  {{#hasWarning}}<hr style="margin:10px 0;">\
				  	  <h4 class="text-warning">{{totalWarning}} warning{{#manyWarnings}}s{{/manyWarnings}}</h4>{{/hasWarning}}\
				  {{#hasWarning}}<ol>{{/hasWarning}}\
				  	  {{#warnings}}<li class="text-warning" data-pos="{{selector}}">{{errorMsg}}</li>{{/warnings}}\
				  {{#hasWarning}}</ol>{{/hasWarning}}\
				  {{#hasLog}}<hr style="margin:10px 0;">\
				  	  <h4 class="muted">{{totalLog}} suggest{{#manyLogs}}s{{/manyLogs}}</h4>{{/hasLog}}\
				  {{#hasLog}}<ol>{{/hasLog}}\
				      {{#logs}}<li class="muted" data-pos="{{selector}}">{{errorMsg}}</li>{{/logs}}\
				  {{#hasLog}}</ol>{{/hasLog}}',
		ckstyle_noerror: '<p class="text-success">CKstyle没有找到问题，牛逼！</p>',
		fixstyle: '<textarea class="compressed">{{fixed}}</textarea>',
		csscompress: '<h4>CssCompress [节省空间: {{after}}/{{before}}=<span class="CK">{{rate}}</span>%]</h4>\
					  <textarea>{{compressed}}</textarea>',
		yuicompressor: '<h4>by CKStyle<span class="stumb"></span>[节省空间: {{after1}}/{{before1}}=<span class="CK">{{rate1}}</span>%\
						{{#greater}}，比YUICompressor多节省 <span class="CK">{{delta}}</span>%] <span class="ml10">;-)</span> {{/greater}}\
						{{#equal}}，与YUICompressor<span class="ok">持平] :-o</span>{{/equal}}\
						{{#worse}}，比YUICompressor<span class="muted">还低</span>] :-( ，<a href="https://github.com/wangjeaf/CSSCheckStyle/issues/new" target="_blank">报bug去</a>{{/worse}}\
						</h4>\
						<textarea>{{compressed}}</textarea>\
						<hr style="margin:10px 0;">\
					    <h4>by YUICompressor [节省空间: {{after2}}/{{before2}}=<span class="CK">{{rate2}}</span>%]</h4>\
					    <textarea>{{yuimin}}</textarea>\
					    <hr style="margin:10px 0;">\
					    <div id="highchart-container" style="width: 600px; height: 300px; margin: 0 auto;box-shadow: 1px 1px 2px #ccc;"></div>'
	};

	function improve(type, before, result) {
		if (type == 'ckstyle') {
			result = result.checkresult;
			if (!result.errors && !result.warnings && !result.logs) {
				type = 'ckstyle_noerror';
			} else {
				if (result.errors && result.errors.length != 0) {
					result.hasError = true;
					result.totalError = result.errors.length;
					if (result.totalError > 1) {
						result.manyErrors = true;
					}
				}
				if (result.warnings && result.warnings.length != 0) {
					result.hasWarning = true;
					result.totalWarning = result.warnings.length;
					if (result.totalWarning > 1) {
						result.manyWarnings = true;
					}
				}
				if (result.logs && result.logs.length != 0) {
					result.hasLog = true;
					result.totalLog = result.logs.length;
					if (result.totalLog > 1) {
						result.manyLogs = true;
					}
				}
			}
		} else if (type == 'csscompress') {
			result.before = before.length;
			result.after = before.length - result.compressed.length;
			result.rate = (result.after / result.before * 100).toFixed(4);
		} else if (type == 'yuicompressor') {
			result.before1 = before.length;
			result.before2 = before.length;
			result.after1 = before.length - result.compressed.length;
			result.after2 = before.length - result.yuimin.length;
			result.rate1 = (result.after1 / result.before1 * 100).toFixed(4);
			result.rate2 = (result.after2 / result.before2 * 100).toFixed(4);
			result.delta = (result.rate1 - result.rate2).toFixed(4);
			result.greater = result.delta > 0;
			result.equal = result.delta == 0;
			result.worse = result.delta < 0;
		} else if (type == 'fixstyle') {
			result.fixed = result.fixed.replace(/\\n/g, '\n');
		}
		return Mustache.to_html(templates[type], result);
	}

	function makeMirror(textarea, cut) {
		var mirror = CodeMirror.fromTextArea(textarea, {
			mode: 'css',
		    theme: 'default',
		    lineNumbers: true,
		    indentUnit: 4,
		    readOnly: true
		});
		cut && $(textarea).next('.CodeMirror').css('height', '50px');
		return mirror;
	}

	function highChart(result) {
		$(function () {
	        $('#highchart-container').highcharts({
	            chart: {
	                type: 'column',
	                margin: [ 50, 50, 100, 80]
	            },
	            title: {
	                text: 'CKstyle和YUICompressor压缩后字符数对比'
	            },
	            xAxis: {
	                categories: [
	                    '压缩前',
	                    'YUICompressor',
	                    'CKstyle'
	                ],
	                labels: {
	                    align: 'center',
	                    style: {
	                        fontSize: '14px',
	                        fontFamily: '\'Microsoft Yahei\', serif, Verdana, sans-serif'
	                    }
	                }
	            },
	            yAxis: {
	                min: 0,
	                title: {
	                    text: '代码字符数'
	                }
	            },
	            legend: {
	                enabled: false
	            },
	            tooltip: {
	                formatter: function() {
	                    return '<b>'+ this.x +'</b><br/>'+
	                        '代码长度: '+ this.y +
	                        ' 字符';
	                }
	            },
	            series: [{
	                name: '代码字符数',
	                data: [result.before1, result.before1 - result.after2, result.before1 - result.after1],
	                dataLabels: {
	                    enabled: true,
	                    color: '#333',
	                    align: 'center',
	                    x: 4,
	                    y: -2,
	                    style: {
	                        fontSize: '13px',
	                        fontFamily: 'Verdana, sans-serif'
	                    }
	                }
	            }]
	        });
	    });
	}

	var prefix = document.location.href.toLowerCase().indexOf('fed.d.xiaonei.com') != -1 ? '/ckstyle' : '';
	function handleResponse(e, opType) {
		if (e.result.css) {
			Editor.setValue(e.result.css);
		}
		var resultContainer = $('.' + opType + '-result');
		if ($('.options-container').is(':visible')) {
			$('.options-trigger').trigger('click');
		}
		if ($('.tools-container').is(':visible')) {
			$('.tools-trigger').trigger('click');
		}
		//if ($('.browsers-container').is(':visible')) {
			//$('.browsers-trigger').trigger('click');
		//}
		$('.result-container .result').hide();
		resultContainer.find('.content').html(improve(opType, $('#editor').val(), e.result)).end().show();
		resultContainer.find('.download').attr('href', prefix + '/handler/' + e.result.download)
		if (opType == 'ckstyle') {
			return;
		}
		var textareas = $('.' + opType + '-result').find('textarea');
		var mirror1 = makeMirror(textareas[0], opType != 'fixstyle');

		if (opType != 'yuicompressor') {
			return;
		}
		resultContainer.find('.download.extra').attr('href', prefix + '/handler/' + e.result.downloadYui)
		var mirror2 = makeMirror(textareas[1], true);
		// you scroll, i scroll
		mirror1.on('scroll', function(e) {
			mirror2.scrollTo(e.getScrollInfo().left, 0);
		})
		highChart(e.result);
	}

	function trim(str) {
		return str.replace('/^\s+|\s+$/g', '');
	}

	$('form input[type=submit]').click(function() {
		var jqThis = $(this),
			form = jqThis.parents('form'),
			opType = jqThis.data('type'),
			scrollTop = $(window).scrollTop();
		if (trim(textarea.value) == '' || 
			jqTextarea.val() == jqTextarea.attr('placeholder')) {
			Editor.setSelection({line: 0,ch: 0}, {line: 100, ch: textarea.value.length});
			Editor.focus();
			return;
		}
		$.errorMsg('<div><div class="progress progress-striped active"><div class="bar" style="width: 100%;font-size:14px;">正在处理中，请稍候~~</div>\
			</div></div>', 'CKstyling~~~');
		//$("html, body").scrollTop(0);
		$.ajax({
			type: 'post',
			url: './handler/request.php', 
			data: form.serialize() + '&optype=' + opType,
			dataType: 'json'
		}).success(function(e) {
			if (e.status == 'ok') {
				handleResponse(e, opType);
				var top = $('.result-container').position().top;
				$("html, body").animate({scrollTop: top - 10 + "px" }, 1000);
			} else {
				$.errorMsg(e.responseText, '对不起，网络出了点小问题~');
			}
			$.hideErrorMsg();
		}).error(function(e) {
			$.hideErrorMsg();
			$.errorMsg(e.responseText, '对不起，网络出了点小问题~');
		});
	});

	$('.result .close').click(function() {
		$(this).parents('.result').hide();
	});
});

// init options
$(function() {
	var optionsContainer = $('.options-container'),
		toolsContainer = $('.tools-container'),
		browsersContainer = $('.browsers-container'),
		browserHidden = $('.browsers-hidden'),
		supportLocalStorage = Modernizr.localstorage,
		selectedOptions, options,
		i, current, l,
		storage = window.localStorage,
		exIds = ['select-all'],
		selectAll;

	$('.options-trigger').click(function() {
		optionsContainer.toggle();
		$(this).find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
	});

	$('.tools-trigger').click(function() {
		toolsContainer.toggle();
		$(this).find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
	});

	$('.browsers-trigger').click(function() {
		browsersContainer.toggle();
		$(this).find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
	});

	browsersContainer.find('button').click(function() {
		var jqThis = $(this);
		browsersContainer.find('i').hide();
		if (jqThis.find('i').length == 0) {
			$('<i class="icon-ok icon-white"></i>').appendTo(jqThis);
		}
		jqThis.find('i').show();
		browserHidden.val(jqThis.data('value'));
	});

	$(Mustache.to_html(CKSTYLE_RULES.template, {rules:CKSTYLE_RULES.rules})).appendTo('.options-container .options');

	options = $('.tools .checkbox, .options .checkbox');
	options.popover({
		trigger: 'hover',
		delay: 300,
		animate: true,
		html: true,
		placement: 'top'
	});

	selectAll = $('#select-all-wrapper');
	selectAll.click(function() {
		options.find('input').attr('checked', !!$(this).find('input').attr('checked'));
	});

	$('.safe-mode-btn').click(function() {
		$('#safeModeInput').val(!$(this).hasClass('active'));
		$(this).find('i').toggleClass('icon-remove').toggleClass('icon-ok');
	});
	// reset rules
	$('.reset-rules').click(function() {
		if ($('.options-container').is(':hidden')) {
			$('.options-trigger').trigger('click');
		}
		var top = $('.tools-container').position().top;
		$("html, body").animate({scrollTop: top + "px" }, 500);
		var rules = CKSTYLE_RULES.rules, i, l, rule, current;
		for(var i = 0, l = rules.length; i < l; i++) {
			rule = rules[i];
			current = $('#' + rule.id);
			if (!!current.attr('checked') != rule.checked) {
				current.attr('checked', rule.checked);
				blinkElement(current);
			} else {
				current.attr('checked', rule.checked);
			}
		}

		saveToLocalStorage();

		function blinkElement(current) {
			return current.parents('li')
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100)
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100)
				.animate({opacity: 0.1}, 400).animate({opacity: 1}, 100);
		}
	});

	function saveToLocalStorage() {
		var selects = [], counter = 0;
		options.each(function(i, ele) {
			var input = $(ele).find('input');
			if (exIds.indexOf(input.attr('id')) != -1) {
				return;
			}
			if (!!input.attr('checked')) {
				counter ++;
			}
		});
		selectAll.find('input').attr('checked', counter === options.length - 2);
		options.each(function(i, ele) {
			var input = $(ele).find('input');
			selects[selects.length] = {id:input.attr('id'), checked:!!input.attr('checked')};
		});
		window.localStorage.setItem('ckstyle-options', JSON.stringify(selects));
	}

	if (supportLocalStorage) {
		options.click(saveToLocalStorage);

		selectedOptions = window.localStorage.getItem('ckstyle-options');
		if (selectedOptions) {
			selectedOptions = JSON.parse(selectedOptions);
			for (i = 0, l = selectedOptions.length; i < l; i++) {
				current = selectedOptions[i];
				$('#' + current.id).attr('checked', current.checked);
			}
		}
	}
});

$(function() {
	var prefix = '', 
		supportHistory = !!window.history.pushState;

	if (window.location.href.indexOf('fed.d.xiaonei.com') != -1) {
		prefix = '/ckstyle/';
	}

	// support html5 history
	if (supportHistory) {
		if (!window.location.hash) {
			window.history.pushState({
				href: '#index'
			}, document.title, window.location.href);
		}
		window.addEventListener('popstate', function(e) {
			if (e.state) {
				handleHash(e.state.href);
			}
		});
	}

	function activeImg(element) {
		if (!element.data('inited')) {
			element.data('inited', true);
		}
		element.find('.img[data-src]').each(function(_, node) {
			var img = $(node);
			img.attr('src', prefix + img.data('src'));
			img.removeAttr('data-src');
		});
	}
	function handleHash(href) {
		items.removeClass('current');
		wrappers.hide();
		$(href).show();
		$('.menu a[href=' + href+']').addClass('current');
		var ele = $(window.location.hash)
		ele.show();
		activeImg(ele);
	}

	var wrappers = $('.wrapper'),
		items = $('.menu a[href^=#]');
	items.click(function(e) {
		items.removeClass('current');
		e.preventDefault();
		wrappers.hide();
		var href = $(this).addClass('current').attr('href');
		if (supportHistory) {
			window.history.pushState({
				href: href
			}, document.title, window.location.href.split('#')[0] + href);
		}
		var ele = $(href);
		ele.show();
		activeImg(ele);
	});

	if (window.location.hash) {
		if (window.location.hash != '#index') {
			handleHash(window.location.hash);
		}
	}
});