
$(function() {
	var options = $('.options-container'),
		ruleTemplate = 
			'{{#rules}}<li>\
				<label class="checkbox" \
					data-content="{{desc}}" title="" \
					data-original-title="{{summary}}">\
					<input type="checkbox" name="{{id}}" {{#checked}}checked=checked{{/checked}}/>{{summary}}\
				</label>\
			</li>{{/rules}}'
		rules = [
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:true},
			{summary:'禁止使用Expression', desc:'由于Expression的使用将会导致IE下性能急剧下降，因此推荐禁止使用此功能', id:'avoid-use-expression', checked:false}
		];

	$('.fork-mask').tooltip({
		placement: 'left'
	});
	$('.guideline-tooltip').tooltip({
		placement: 'top'
	});

	$('.options-trigger').click(function() {
		options.toggle();
		$(this).find('i').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');
	})
	var textarea = $('#editor')[0], 
		Editor = CodeMirror.fromTextArea(textarea, {
	    theme: 'default',
	    lineNumbers: true,
	    indentUnit: 4,
	    autofocus: true
	  });
	Editor.setSelection({line: 0,ch: 0}, {line: 0, ch: textarea.value.length});

	$(Mustache.to_html(ruleTemplate, {rules:rules})).appendTo('.options-container .options');
	$('.options .checkbox').popover({
		trigger: 'hover',
		delay: 300,
		animate: true,
		html: true,
		placement: 'top'
	});
});
