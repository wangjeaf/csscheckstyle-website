// extend jquery
$.errorMsg = function(msg, title) {
	var con = $('#error-msg-container');
	if (con.length == 0) {
		con = $('<div class="modal hide fade" id="error-msg-container">\
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

$.hideErrorMsg = function(fade) {
	var ele = $('#error-msg-container');
	if (fade === false) {
		ele.removeClass('fade');
	}
	$('#error-msg-container').modal('hide');
	if (fade === false) {
		ele.addClass('fade');
	}
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
		ckstyle: '{{#hasError}}<h4 class="text-error">errors</h4>{{/hasError}}\
				  {{#errors}}<p class="text-error">{{.}}</p>{{/errors}}\
				  {{#hasWarning}}<hr style="margin:10px 0;"><h4 class="text-warning">warnings</h4>{{/hasWarning}}\
				  {{#warnings}}<p class="text-warning">{{.}}</p>{{/warnings}}\
				  {{#hasLog}}<hr style="margin:10px 0;"><h4 class="muted">logs</h4>{{/hasLog}}\
				  {{#logs}}<p class="muted">{{.}}</p>{{/logs}}',
		ckstyle_noerror: '<p class="text-success">CKstyle没有找到问题，牛逼！</p>',
		fixstyle: '<textarea class="compressed">{{fixed}}</textarea>',
		csscompress: '<h4>CssCompress [{{after}}/{{before}}=<span class="CK">{{rate}}</span>%]</h4>\
					  <textarea>{{compressed}}</textarea>',
		yuicompressor: '<h4>by CKStyle<span class="stumb"></span>[压缩率: {{after1}}/{{before1}}=<span class="CK">{{rate1}}</span>%]</h4>\
						<textarea>{{compressed}}</textarea>\
						<hr style="margin:10px 0;">\
					    <h4>by YUICompressor [压缩率: {{after2}}/{{before2}}=<span class="CK">{{rate2}}</span>%]</h4>\
					    <textarea>{{yuimin}}</textarea>'
	};

	function improve(type, before, result) {
		if (type == 'ckstyle') {
			if (!result.errors && !result.warnings && !result.logs) {
				type = 'ckstyle_noerror';
			} else {
				result.errors && (result.hasError = true);
				result.warnings && (result.hasWarning = true);
				result.logs && (result.hasLog = true);
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

	function handleResponse(e, opType) {
		if (!$('.options-container').is(':hidden')) {
			$('.options-trigger').trigger('click');
		}
		$('.result').hide();
		$('.' + opType + '-result').find('.content').html(improve(opType, $('#editor').val(), e.result)).end().show();
		if (opType == 'ckstyle') {
			return;
		}
		var textareas = $('.' + opType + '-result').find('textarea');
		makeMirror(textareas[0], opType != 'fixstyle');
		if (opType != 'yuicompressor') {
			return;
		}
		makeMirror(textareas[1], true);
	}
	$('form input[type=submit]').click(function() {
		var jqThis = $(this),
			form = jqThis.parents('form'),
			opType = jqThis.data('type'),
			scrollTop = $(window).scrollTop();
		$.errorMsg('<div><div class="progress progress-striped active"><div class="bar" style="width: 100%;">正在处理中，请稍后~~</div>\
			</div></div>', 'CKstyling~~~');
		$.ajax({
			type: 'post',
			url: './test/request.php', 
			data: form.serialize() + '&optype=' + opType,
			dataType: 'json'
		}).success(function(e) {
			$.hideErrorMsg(false);
			if (e.status == 'ok') {
				handleResponse(e, opType);
				var top = $('.result-container').position().top;
				$("html, body").animate({scrollTop: top + "px" }, 1000);
			} else {
				$.errorMsg(e.responseText, '对不起，网络出了点小问题~');
			}
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

	$(Mustache.to_html(ruleTemplate, {rules:rules})).appendTo('.options-container .options');

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