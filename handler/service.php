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
		echo $callback.'({"status":"error", "msg":"由于服务器资源有限，目前只对部分用户开放，请<a href=\"javascript:;\" onclick=\"ckstyle.showInviteCodeInputer()\">输入您的正确的邀请码</a>后再操作."})';
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
		global $callback;
		$filename = '__ckstyle_web_tmp_'.time().'.css';
		$remote_css = '';
		if (!preg_match('/^http(s)?:/', $url)) {
			echo $callback.'({"status":"error", "msg":"sorry~ '.$url.' is not correct for me."})';
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
				echo $callback.'({"status":"error", "msg":"sorry~ '.$url.' file is not exist."})';
				exit;
			}

	        $csscode = read_remote_file($remote);
	        if (!isCSS($csscode)) {
	        	echo $callback.'({"status":"error", "msg":"sorry~ '.$url.' is not correct CSS for me."})';
				exit;
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
?>