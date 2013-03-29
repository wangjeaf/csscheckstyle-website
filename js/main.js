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

// init tooltip
$(function() {
	$('.fork-mask').tooltip({
		placement: 'left'
	});
	$('.guideline-tooltip').tooltip({
		placement: 'top'
	});
});

// init editor
$(function() {
	var textarea = $('#editor')[0], 
	Editor = CodeMirror.fromTextArea(textarea, {
	    theme: 'default',
	    lineNumbers: true,
	    indentUnit: 4,
	    autofocus: true
	});
	Editor.on('change', function() {
		textarea.value = Editor.getValue();
	})
	Editor.setSelection({line: 0,ch: 0}, {line: 4, ch: textarea.value.length});
});

// handle ajax requests
$(function() {
	var templates = {
		ckstyle: '{{#hasError}}<h4 class="text-error">{{totalError}} error{{#manyErrors}}s{{/manyErrors}}</h4>{{/hasError}}\
			      {{#hasError}}<ol>{{/hasError}}\
				  	  {{#errors}}<li class="text-error">{{.}}</li>{{/errors}}\
				  {{#hasError}}</ol>{{/hasError}}\
				  {{#hasWarning}}<hr style="margin:10px 0;">\
				  	  <h4 class="text-warning">{{totalWarning}} warning{{#manyWarnings}}s{{/manyWarnings}}</h4>{{/hasWarning}}\
				  {{#hasWarning}}<ol>{{/hasWarning}}\
				  	  {{#warnings}}<li class="text-warning">{{.}}</li>{{/warnings}}\
				  {{#hasWarning}}</ol>{{/hasWarning}}\
				  {{#hasLog}}<hr style="margin:10px 0;">\
				  	  <h4 class="muted">{{totalLog}} suggest{{#manyLogs}}s{{/manyLogs}}</h4>{{/hasLog}}\
				  {{#hasLog}}<ol>{{/hasLog}}\
				      {{#logs}}<li class="muted">{{.}}</li>{{/logs}}\
				  {{#hasLog}}</ol>{{/hasLog}}',
		ckstyle_noerror: '<p class="text-success">CKstyle没有找到问题，牛逼！</p>',
		fixstyle: '<textarea class="compressed">{{fixed}}</textarea>',
		csscompress: '<h4>CssCompress [压缩率: {{after}}/{{before}}=<span class="CK">{{rate}}</span>%]</h4>\
					  <textarea>{{compressed}}</textarea>',
		yuicompressor: '<h4>by CKStyle<span class="stumb"></span>[压缩率: {{after1}}/{{before1}}=<span class="CK">{{rate1}}</span>%，比YUICompressor牛逼 <span class="CK">{{delta}}</span>%]</h4>\
						<textarea>{{compressed}}</textarea>\
						<hr style="margin:10px 0;">\
					    <h4>by <a href="http://yui.github.com/yuicompressor/" target="_blank">YUICompressor</a> [压缩率: {{after2}}/{{before2}}=<span class="CK">{{rate2}}</span>%]</h4>\
					    <textarea>{{yuimin}}</textarea>\
					    <hr style="margin:10px 0;">\
					    <div id="highchart-container" style="width: 600px; height: 300px; margin: 0 auto;box-shadow: 1px 1px 2px #ccc;"></div>'
	};

	function improve(type, before, result) {
		if (type == 'ckstyle') {
			if (!result.errors && !result.warnings && !result.logs) {
				type = 'ckstyle_noerror';
			} else {
				if (result.errors) {
					result.hasError = true;
					result.totalError = result.errors.length;
					if (result.totalError > 1) {
						result.manyErrors = true;
					}
				}
				if (result.warnings) {
					result.hasWarning = true;
					result.totalWarning = result.warnings.length;
					if (result.totalWarning > 1) {
						result.manyWarnings = true;
					}
				}
				if (result.logs) {
					result.hasLog = true;
					result.totalLog = result.logs.length;
					if (result.totalLog > 1) {
						result.manyLogs = true;
					}
				}
			}
		} else if (type == 'csscompress') {
			result.before = before.length;
			result.after = result.compressed.length;
			result.rate = (result.after / result.before * 100).toFixed(4);
		} else if (type == 'yuicompressor') {
			result.before1 = before.length;
			result.before2 = before.length;
			result.after1 = result.compressed.length;
			result.after2 = result.yuimin.length;
			result.rate1 = (result.after1 / result.before1 * 100).toFixed(4);
			result.rate2 = (result.after2 / result.before2 * 100).toFixed(4);
			result.delta = (result.rate2 - result.rate1).toFixed(4);
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
	}

	function highChart(result) {
		$(function () {
	        $('#highchart-container').highcharts({
	            chart: {
	                type: 'column',
	                margin: [ 50, 50, 100, 80]
	            },
	            title: {
	                text: 'CKstyle和YUICompressor压缩后字节数对比'
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
	                    text: '代码字节数'
	                }
	            },
	            legend: {
	                enabled: false
	            },
	            tooltip: {
	                formatter: function() {
	                    return '<b>'+ this.x +'</b><br/>'+
	                        '代码长度: '+ this.y +
	                        ' 字节';
	                }
	            },
	            series: [{
	                name: '代码字节数',
	                data: [result.before1, result.after2, result.after1],
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

	function handleResponse(e, opType) {
		var resultContainer = $('.' + opType + '-result');
		if (!$('.options-container').is(':hidden')) {
			$('.options-trigger').trigger('click');
		}
		$('.result').hide();
		resultContainer.find('.content').html(improve(opType, $('#editor').val(), e.result)).end().show();
		resultContainer.find('.download').attr('href', '/handler/' + e.result.download)
		if (opType == 'ckstyle') {
			return;
		}
		var textareas = $('.' + opType + '-result').find('textarea');
		makeMirror(textareas[0], opType != 'fixstyle');
		if (opType != 'yuicompressor') {
			return;
		}
		resultContainer.find('.download.extra').attr('href', '/handler/' + e.result.downloadYui)
		makeMirror(textareas[1], true);
		highChart(e.result);
	}
	
	$('form input[type=submit]').click(function() {
		var jqThis = $(this),
			form = jqThis.parents('form'),
			opType = jqThis.data('type'),
			scrollTop = $(window).scrollTop();
		$.errorMsg('<div><div class="progress progress-striped active"><div class="bar" style="width: 100%;">正在处理中，请稍后~~</div>\
			</div></div>', 'CKstyling~~~');
		$("html, body").scrollTop(0);
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
			$.hideErrorMsg(false);
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

	$(Mustache.to_html(CKSTYLE_RULES.template, {rules:CKSTYLE_RULES.rules})).appendTo('.options-container .options');

	options = $('.options .checkbox');
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

	if (supportLocalStorage) {
		options.click(function() {
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
			selectAll.find('input').attr('checked', counter === options.length - 1);
			options.each(function(i, ele) {
				var input = $(ele).find('input');
				selects[selects.length] = {id:input.attr('id'), checked:!!input.attr('checked')};
			});
			window.localStorage.setItem('ckstyle-options', JSON.stringify(selects));
		});

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