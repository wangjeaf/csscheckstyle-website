<?php
	function is_from_ckstyle_blog($referer) {
		if (preg_match('/^http:\/\/\w*csscheckstyle\.com/', $referer)) {
			return true;
		} else {
			return false;
		}
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

	$optype = $_POST['optype'];
	$csscode = $_POST['csscode'];
	$ruleIds = '';
	foreach($_POST as $key => $value) {
		if ($value == 'on') {
			$ruleIds = $ruleIds . $key . ',';
		}
	}
	$ruleIds = substr($ruleIds, 0, strlen($ruleIds) - 1);
	$filename = '__ckstyle_web_tmp.css';
	$file = fopen($filename, 'w+');

	fwrite($file, $csscode);
	fclose($file);

	if ($optype == 'fixstyle') {
		$result = exec_command('fixstyle -p '.$filename);
		$json = array("status" => "ok", "result" => array(
			"fixed" => $result
		));
		echo(json_encode($json));
	} else if ($optype == 'ckstyle') {
		echo('{"status":"ok", "result":{
			"errors": ["fda321321321fdasfda", "fdasfdsafdas", "fdafdasfdasfdsa"], 
			"warnings": ["fdafdasfdas", "fdafdasfdas", "fdafdasfdas"], 
			"logs":["fdafdasfdas", "fdafdas", "fdafdasfdasfdas"]
		}}');
	} else if ($optype == 'csscompress') {
		$result = exec_command('csscompress -p '.$filename);
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result
		));
		echo(json_encode($json));
	} else if ($optype == 'yuicompressor') {
		$yui_output = $filename.'.min.css';
		$result_ckstyle = exec_command('csscompress -p '.$filename);
		exec_command('java -jar yuicompressor-2.4.7.jar '.$filename.' -o '.$yui_output.' --charset utf-8 ');

		$file = fopen($yui_output, 'r');
		$result_yui = '';
		while(!feof($file)) {
			$result_yui = $result_yui.fgets($file);
		}
		fclose($file);
		unlink($yui_output);

		$json = array("status" => "ok", "result" => array(
			"compressed" => $result_ckstyle,
			"yuimin" => $result_yui
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