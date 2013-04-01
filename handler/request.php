<?php
	// referer
	function is_from_ckstyle_blog($referer) {
		return preg_match('/^http:\/\/.*csscheckstyle\.com/', $referer) 
			|| preg_match('/^http:\/\/fed\.d\.xiaonei\.com/', $referer);
	}

	// get remote ip, for download dir
	function get_ip(){ 
		if (getenv("HTTP_CLIENT_IP") && strcasecmp(getenv("HTTP_CLIENT_IP"), "unknown")) {
			$ip = getenv("HTTP_CLIENT_IP"); 
		} else if (getenv("HTTP_X_FORWARDED_FOR") && strcasecmp(getenv("HTTP_X_FORWARDED_FOR"), "unknown"))  {
			$ip = getenv("HTTP_X_FORWARDED_FOR"); 
		} else if (getenv("REMOTE_ADDR") && strcasecmp(getenv("REMOTE_ADDR"), "unknown"))  {
			$ip = getenv("REMOTE_ADDR"); 
		} else if (isset($_SERVER['REMOTE_ADDR']) && $_SERVER['REMOTE_ADDR'] && strcasecmp($_SERVER['REMOTE_ADDR'], "unknown")) {
			$ip = $_SERVER['REMOTE_ADDR']; 
		} else { 
			$ip = "somebody".time(); 
		}
		return ($ip); 
	}

	function exec_command($cmd) {
		exec($cmd, $output_array, $retval);
		if ($retval != 0) {
			return '服务器错误';
		}
		return join('\n', $output_array);
	}


	function write_to_file($filename, $content) {
		$file = fopen($filename, 'w+');

		fwrite($file, $content);
		fclose($file);
	}

	// referer
	if (!isset($_SERVER['HTTP_REFERER'])) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return;
	}

	$referer = $_SERVER['HTTP_REFERER'];
	if (is_from_ckstyle_blog($referer) == false) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return;
	}

	// params
	$optype = $_POST['optype'];
	$csscode = $_POST['csscode'];

	
	// rule included
	$ruleIds = '';
	foreach($_POST as $key => $value) {
		if ($value == 'on') {
			$ruleIds = $ruleIds . $key . ',';
		}
	}

	// hack??
	$ruleIds = str_replace('"', '', $ruleIds);
	$ruleIds = str_replace('\\', '', $ruleIds);

	// format as commandline option
	$ruleIds = substr($ruleIds, 0, strlen($ruleIds) - 1);
	$include = '';
	if (strlen($ruleIds) != 0) {
		$include = '--include '.$ruleIds;
	} else {
		$include = '--include none ';
	}

	// temp css file
	$filename = '__ckstyle_web_tmp_'.time().'.css';

	$remote_css = '';
	if (preg_match('/^http(s)?:/', $csscode)) {
		if (!preg_match('/.css$/', $csscode)) {
			echo '<p>对不起，<code>CSS</code> 文件必须以 <code>.css</code> 结尾</p>';
			return;
		} else {
			$csspath = $csscode;
			$remote = fopen($csspath, "r");
	        $csscode = fread($remote, 2*1024*1024);
	        fclose($remote);
	        write_to_file($filename, $csscode);
	        $remote_css = '/* CSS FROM: '.$csspath.' */'.PHP_EOL.$csscode;
		}
	} else {
		write_to_file($filename, $csscode);
	}

	// make download dir 
	$ip = md5(get_ip());
	$dir = 'download/'.$ip;

	if (!is_dir('download')) {
		mkdir('download');
	}
	if (!is_dir($dir)) {
		mkdir($dir);
	}

	if ($optype == 'fixstyle') {
		// fixstyle
		$result = exec_command('fixstyle -p '.$include.' '.$filename);
		
		// make download file
		$result_file = $dir.'/fixstyle-result.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result));

		$returned_css = 
		// return json
		$json = array("status" => "ok", "result" => array(
			"fixed" => $result,
			"download" => $result_file,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else if ($optype == 'ckstyle') {
		// ckstyle
		$result = exec_command('ckstyle -p --json '.$include.' '.$filename);
		$result = str_replace('\n', '', $result);
		$result = str_replace($filename, 'THIS FILE', $result);

		// return json
		$json = array("status" => "ok", "result" => array(
			"checkresult" => json_decode($result),
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else if ($optype == 'csscompress') {
		// csscompress
		$result = exec_command('csscompress -p '.$include.' '.$filename);

		// make download file
		$result_file = $dir.'/compress-ckstyle.min.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result));

		// return json
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result,
			"download" => $result_file,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else if ($optype == 'yuicompressor') {
		// csscompress
		$result_ckstyle = exec_command('csscompress -p '.$include.' '.$filename);

		// make csscompress download file
		$result_file = $dir.'/compress-ckstyle.min.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result_ckstyle));

		// yuicompressor
		$yui_output = $filename.'.min.css';
		exec_command('java -jar yuicompressor-2.4.7.jar '.$filename.' -o '.$yui_output.' --charset utf-8 ');

		// get yui output
		$file = fopen($yui_output, 'r');
		$result_yui = '';
		while(!feof($file)) {
			$result_yui = $result_yui.fgets($file);
		}
		fclose($file);
		unlink($yui_output);

		// make yui download file
		$yui_result_file = $dir.'/compress-yui.min.css';
		write_to_file($yui_result_file, str_replace('\n', PHP_EOL, $result_yui));

		// return json
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result_ckstyle,
			"yuimin" => $result_yui,
			"download" => $result_file,
			"downloadYui" => $yui_result_file,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else {
		echo ('错误的optype类型~');
	}
	
	// remove temp file
	unlink($filename);
?>