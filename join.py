files = ['js/lib/jquery.js',
	'tools/bootstrap/js/bootstrap.min.js',
	'tools/codemirror/lib/codemirror.js',
	'tools/codemirror/mode/css/css.js',
	'js/lib/mustache.js',
	'js/lib/json2.js',
	'js/lib/modernizr-2.0.6.js',
	'js/rules.js',
	'js/main.js',
	'js/lib/highcharts.js',
	'js/lib/exporting.js'
]

collector = ''
for f in files:
	collector = collector + open(f, 'r').read()

open('js/ckstyle.js', 'w').write(collector)

# then
# node D:\performance\UglifyJS\bin\uglifyjs -o "js/ckstyle.min.js" "js/ckstyle.js"
