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

rules : [
	{checked:true, priority:0, id:'hexadecimal-color',summary:'16进制颜色大写缩写',desc:
		'<p>浏览器会先将小写的颜色值转换成大写，' + 
		'所以写成大写格式可以省略这部分的开销，并且尽量省略，例如：' + 
		'</br><code>color:#ffffff; </code><br/><code>==></code><br/><code>color:#FFF;</code></p>'},
	{checked:false, id:'no-font-family',summary:'不允许业务代码设置字体', desc:
		'fdafdasfdsa'},
	{checked:true, priority:1, id:'combine-into-one',summary:'将可以合并的样式设置合并'},
	{checked:true, priority:2, id:'comment-length',summary:'注释长度小于80个字符'},
	{checked:true, priority:1, id:'css3-with-prefix',summary:'css3前缀相关检查'},
	{checked:true, priority:1, id:'css3-prop-spaces',summary:'css3缩进相关检查'},
	{checked:true, priority:1, id:'no-style-for-simple-selector',summary:'不要为简单选择器设置样式'},
	{checked:true, priority:1, id:'no-style-for-tag',summary:'不要为html tag设置样式'},
	{checked:true, priority:1, id:'font-unit',summary:'字体的单位必须使用px或pt'},
	{checked:true, priority:1, id:'hack-prop',summary:'hack属性时的检查'},
	{checked:true, priority:1, id:'hack-ruleset',summary:'hack规则时的检查'},
	{checked:true, priority:1, id:'high-perf-selector',summary:'针对低性能的选择器的检查'},
	{checked:true, priority:1, id:'multi-line-brace',summary:'代码多行时的括号检查'},
	{checked:true, priority:1, id:'multi-line-selector',summary:'代码多行时的选择器检查'},
	{checked:true, priority:1, id:'multi-line-space',summary:'代码多行时的空格检查'},
	{checked:true, priority:1, id:'add-author',summary:'需要在文件中添加作者信息'},
	{checked:true, priority:1, id:'no-alpha-image-loader',summary:'不要使用AlphaImageLoader'},
	{checked:true, priority:1, id:'no-appearance-word-in-selector',summary:'selector中禁用表现性词汇'},
	{checked:true, priority:1, id:'no-comment-in-value',summary:'不要在css属性中添加注释'},
	{checked:true, priority:1, id:'no-empty-ruleset',summary:'删除空的规则'},
	{checked:true, priority:2, id:'no-expression',summary:'不要使用非一次性表达式'},
	{checked:true, priority:2, id:'number-in-selector',summary:'不要在选择器中使用简单数字'},
	{checked:true, priority:1, id:'no-star-in-selector',summary:'不要在选择器中使用星号'},
	{checked:true, priority:0, id:'del-unit-after-zero',summary:'删除0后面的单位'},
	{checked:true, priority:1, id:'no-zero-before-dot',summary:'删除0.2前面的0'},
	{checked:true, priority:1, id:'no-border-zero',summary:'用border-none替换border:0'},
	{checked:true, priority:1, id:'no-underline-in-selector',summary:'不要在选择器中使用下划线'},
	{checked:true, priority:1, id:'add-semicolon',summary:'为每一个属性后添加分号'},
	{checked:true, priority:2, id:'do-not-use-important',summary:'不要使用important'},
	{checked:true, priority:2, id:'single-line-brace',summary:'单行的括号检查'},
	{checked:true, priority:2, id:'single-line-selector',summary:'单行的选择器检查'},
	{checked:true, priority:2, id:'single-line-space',summary:'单行的空格检查'},
	{checked:true, priority:2, id:'keep-in-order',summary:'属性应该按照推荐的顺序编写'},
	{checked:true, priority:2, id:'no-chn-font-family',summary:'不要出现中文的字体设置'},
	{checked:true, priority:2, id:'unknown-css-prop',summary:'错误的css属性'},
	{checked:true, priority:2, id:'unknown-html-tag',summary:'错误的htmltag'},
	{checked:true, priority:2, id:'lowercase-prop',summary:'属性应该用小写'},
	{checked:true, priority:2, id:'lowercase-selector',summary:'选择器用小写字母'},
	{checked:true, priority:2, id:'single-quotation',summary:'使用单引号'},
	{checked:true, priority:2, id:'z-index-in-range',summary:'z-index取值符合范围要求'},
	{checked:true, priority:2, id:'remove-duplicated-attr',summary:'删除重复的属性设置'}
]};
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