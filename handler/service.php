<?php include 'helper.php'; ?>
<?php

	// params
	//$optype = $_POST['optype'];
	//$csscode = $_POST['csscode'];
	$optype = $_GET['optype'];
	$callback = $_GET['ckcallback'];
	$cssurls = $_GET['cssurls'];
	$code = $_GET['invitecode'];
	if (!$code || !is_valid_invitecode($code, get_ip())) {
		echo $callback.'({"status":"error", "msg":"由于服务器资源有限，目前只对部分用户开放，请<a href=\"javascript:;\" onclick=\"showInviteCodeInputer()\">输入您的邀请码</a>后再操作."})';
		return;
	}
	if ($cssurls == '') {
		echo $callback.'({"status":"error", "msg":"no css file url detected."})';
		return;
	}

	$urls = explode('__seperator__', $cssurls);

	// make download dir 
	$ip = md5(get_ip());
	$dir = 'download/'.$ip;
	if (!is_dir('cache')) {
		mkdir('cache');
	}
	if (!is_dir('download')) {
		mkdir('download');
	}
	if (!is_dir($dir)) {
		mkdir($dir);
	}
	$total = array();
	array_walk($urls, function($url) {
		global $dir;
		global $total;
		$filename = '__ckstyle_web_tmp_'.time().'.css';
		$remote_css = '';
		if (!preg_match('/^http(s)?:/', $url)) {
			echo '<p>对不起，请输入正确的CSS文件URL地址</p>';
			return;
		}
		$md5_url = md5($url);
		$cache_file = 'cache/'.$md5_url.'.json';
		$cache_css = 'cache/'.$md5_url.'.css';
		// load from cache, 需要考虑url不变，文件内容改变的情况
		if (is_file($cache_file)) {
			$result_content = file_get_contents($cache_file);
			array_push($total, $result_content);
			return;
		} else {
			//recalculate
			$csspath = $url;
			$remote = fopen($csspath, "r");
			if (!$remote) {
				echo $csspath.'对应的网络文件不存在';
				return;
			}

	        $csscode = read_remote_file($remote);
	        if (!isCSS($csscode)) {
	        	echo '<p>对不起，请输入正确的CSS文件URL地址</p>';
				return;
	        }
	        
	        write_to_file($filename, $csscode);
	        fclose($remote);

	        $before = strlen($csscode);
	        $result = exec_command('csscompress -p '.$filename);

			// make download file
			write_to_file($cache_css, str_replace('\n', PHP_EOL, $result));
			$after = strlen($result);
			$json_result = json_encode(array(
				"after" => $after,
				"before" => $before,
				"download" => $cache_css,
				"url" => $url
			));

			array_push($total, $json_result);
			write_to_file($cache_file, $json_result);
			unlink($filename);
		}
		
		
	});
	
	echo $callback.'({"status":"ok", "files":['.join(',', $total).']})';

	return;
	// safemode
	$safeMode = $_POST['safeMode'];

	if ($safeMode == 'true') {
		$safeMode = ' --safeMode ';
	} else {
		$safeMode = '';
	}
	
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
	$command_options = '';
	if (strlen($ruleIds) != 0) {
		$command_options = '--include '.$ruleIds.$safeMode;
	} else {
		$command_options = '--include none '.$safeMode;
	}

	
	// temp css file
	$filename = '__ckstyle_web_tmp_'.time().'.css';

	$remote_css = '';
	if (preg_match('/^http(s)?:/', $csscode)) {
		$csspath = $csscode;
		$remote = fopen($csspath, "r");
        $csscode = fread($remote, 2*1024*1024);
        if (!isCSS($csscode)) {
        	echo '<p>对不起，请输入正确的CSS文件URL地址</p>';
			return;
        }
        
        fclose($remote);
        write_to_file($filename, $csscode);
        $remote_css = '/* CSS FROM: '.$csspath.' */'.PHP_EOL.$csscode;
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
		$result = exec_command('fixstyle -p '.$command_options.' '.$filename);
		
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
		$result = exec_command('ckstyle -p --json '.$command_options.' '.$filename);
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
		$result = exec_command('csscompress -p '.$command_options.' '.$filename);

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
		$result_ckstyle = exec_command('csscompress -p '.$command_options.' '.$filename);

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