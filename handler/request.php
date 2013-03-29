<?php
	function is_from_ckstyle_blog($referer) {
		if (preg_match('/^http:\/\/\w*csscheckstyle\.com/', $referer)) {
			return true;
		} else {
			return false;
		}
	}

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

	if (!isset($_SERVER['HTTP_REFERER'])) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return;
	}

	$referer = $_SERVER['HTTP_REFERER'];
	if (is_from_ckstyle_blog($referer) == false) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return;
	}

	function write_to_file($filename, $content) {
		$file = fopen($filename, 'w+');

		fwrite($file, $content);
		fclose($file);
	}

	$optype = $_POST['optype'];
	$csscode = $_POST['csscode'];
	$ruleIds = '';
	foreach($_POST as $key => $value) {
		if ($value == 'on') {
			$ruleIds = $ruleIds . $key . ',';
		}
	}
	$ruleIds = str_replace('"', '', $ruleIds);
	$ruleIds = str_replace('\\', '', $ruleIds);
	$ruleIds = substr($ruleIds, 0, strlen($ruleIds) - 1);
	$include = '';
	if (strlen($ruleIds) != 0) {
		$include = '--include '.$ruleIds;
	} else {
		$include = '--include none ';
	}
	$filename = '__ckstyle_web_tmp_'.time().'.css';
	write_to_file($filename, $csscode);
	$ip = md5(get_ip());
	$dir = 'download/'.$ip;

	if (!is_dir('download')) {
		mkdir('download');
	}
	if (!is_dir($dir)) {
		mkdir($dir);
	}

	if ($optype == 'fixstyle') {
		$result = exec_command('fixstyle -p '.$include.' '.$filename);
		$result_file = $dir.'/fixstyle-result.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result));
		$json = array("status" => "ok", "result" => array(
			"fixed" => $result,
			"download" => $result_file
		));
		echo(json_encode($json));
	} else if ($optype == 'ckstyle') {
		$result = exec_command('ckstyle -p --json '.$include.' '.$filename);
		$result = str_replace('\n', '', $result);
		$result = str_replace($filename, 'THIS FILE', $result);
		echo('{"status":"ok","result":'.$result.'}');
	} else if ($optype == 'csscompress') {
		$result = exec_command('csscompress -p '.$include.' '.$filename);
		$result_file = $dir.'/compress-ckstyle.min.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result));
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result,
			"download" => $result_file
		));
		echo(json_encode($json));
	} else if ($optype == 'yuicompressor') {
		$yui_output = $filename.'.min.css';
		$result_ckstyle = exec_command('csscompress -p '.$include.' '.$filename);
		$result_file = $dir.'/compress-ckstyle.min.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result_ckstyle));

		exec_command('java -jar yuicompressor-2.4.7.jar '.$filename.' -o '.$yui_output.' --charset utf-8 ');

		$file = fopen($yui_output, 'r');
		$result_yui = '';
		while(!feof($file)) {
			$result_yui = $result_yui.fgets($file);
		}
		fclose($file);
		unlink($yui_output);

		$yui_result_file = $dir.'/compress-yui.min.css';
		write_to_file($yui_result_file, str_replace('\n', PHP_EOL, $result_yui));
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result_ckstyle,
			"yuimin" => $result_yui,
			"download" => $result_file,
			"downloadYui" => $yui_result_file
		));
		echo(json_encode($json));
	} else {
		echo ('错误的optype类型~');
	}
	
	unlink($filename);
	//echo "$csscode";
	
	/*
	echo('{"status":"ok", "result":{
		"errors": ["fda321321321fdasfda", "fdasfdsafdas", "fdafdasfdasfdsa"], 
		"warnings": ["fdafdasfdas", "fdafdasfdas", "fdafdasfdas"], 
		"logs":["fdafdasfdas", "fdafdas", "fdafdasfdasfdas"],
		"fixed": "fdafdsafdas\n    fda",
		"compressed": "fdafdsafdasfdafdafdsafdasfdafdafdsafdasfdafdsfdafdafdsafdasfda",
		"yuimin": "fdafdasfdasfdas"
	}}');
	*/
?>