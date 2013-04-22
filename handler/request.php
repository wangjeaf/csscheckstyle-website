<?php include 'helper.php'; ?>
<?php
	log_start();

	if (!need_referer()) {
		return;
	}
	loghere('referer');

	// params
	$optype = $_POST['optype'];
	$csscode = $_POST['csscode'];
	if (strlen($csscode) > $max) {
		echo '<p>由于资源的限制，网络在线版只支持 <strong>'.$max.'</strong> 个字符以内的CSS处理(目前为 '.strlen($csscode).' 个)</p>'.
			'<p>如需使用更强大无限制有节操的CKstyle，请 <a target="_blank" href="https://github.com/wangjeaf/CSSCheckStyle#installation">安装到您的机器上</a> 吧~</p>';
		return;
	}
	// safemode
	$safeMode = $_POST['safeMode'];
	$browsers = $_POST['browsers'];

	if ($browsers != '') {
		$browsers = ' --browsers="'.$browsers.'" ';
	}

	if ($safeMode == 'true') {
		$safeMode = ' --safeMode ';
	} else {
		$safeMode = '';
	}
	
	// rule included
	$ruleIds = '';
	foreach($_POST as $key => $value) {
		if ($value == 'on') {
			$key_rep = str_replace(' ', '', $key);
			$ruleIds = $ruleIds . $key_rep . ',';
		}
	}

	// hack??
	$ruleIds = str_replace('"', '', $ruleIds);
	$ruleIds = str_replace('\\', '', $ruleIds);

	// format as commandline option
	$ruleIds = substr($ruleIds, 0, strlen($ruleIds) - 1);
	$command_options = '';
	if (strlen($ruleIds) != 0) {
		$command_options = '--include='.$ruleIds.$safeMode;
	} else {
		$command_options = '--include=none '.$safeMode;
	}
	loghere('params');
	// temp css file
	$filename = '__ckstyle_web_tmp_'.time().'.css';
	$remote_css = '';
	if (preg_match('/^http(s)?:/', $csscode)) {
		$csspath = $csscode;
		$remote = fopen($csspath, "r");
		if (!$remote) {
			echo '<p>无法下载此文件，请输入正确的CSS文件URL地址</p>';
			return;
		}
		$csscode = read_remote_file($remote);
        if (!isCSS($csscode)) {
        	echo '<p>对不起，请输入正确的CSS文件URL地址</p>';
			return;
        }
        if ($csscode == -1 || strlen($csscode) > $max) {
			echo '<p>由于资源的限制，网络在线版只支持 <strong>'.$max.'</strong> 个字符以内的CSS处理。</p>'.
				'<p>远程文件中包含 '.strlen($csscode).' 个，已超出限制。</p>'.
				'<p>如需使用更强大无限制有节操的CKstyle，请 <a target="_blank" href="https://github.com/wangjeaf/CSSCheckStyle#installation">安装到您的机器上</a> 吧~</p>';
			return;
		}
        fclose($remote);
        write_to_file($filename, $csscode);
        $remote_css = '/* CSS FROM: '.$csspath.' */'.PHP_EOL.$csscode;
	} else {
		write_to_file($filename, $csscode);
	}

	loghere('write_to_file');

	// make download dir 
	$ip = str_replace('.', '_', get_ip());
	$dir = '../cache/tmp/'.$ip;

	if (!is_dir('../cache')) {
		mkdir('../cache');
	}
	if (!is_dir('../cache/tmp')) {
		mkdir('../cache/tmp');
	}
	if (!is_dir($dir)) {
		mkdir($dir);
	}

	if ($optype == 'fixstyle') {
		// fixstyle
		$result = exec_command($bin_dir.'fixstyle -p '.$command_options.' '.$filename);
		
		// make download file
		$result_file = $dir.'/fixstyle-result.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result));

		// return json
		$json = array("status" => "ok", "result" => array(
			"fixed" => $result,
			"download" => $result_file,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else if ($optype == 'ckstyle') {
		loghere('start ckstyle');
		// ckstyle
		$result = exec_command($bin_dir.'ckstyle -p --json '.$command_options.' '.$filename);
		loghere('end ckstyle');
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
		$result = exec_command($bin_dir.'csscompress -p '.$command_options.$browsers.' '.$filename);

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
		$result_ckstyle = exec_command($bin_dir.'csscompress -p '.$command_options.$browsers.' '.$filename);

		// make csscompress download file
		$result_file = $dir.'/compress-ckstyle.min.css';
		write_to_file($result_file, str_replace('\n', PHP_EOL, $result_ckstyle));

		// yuicompressor
		$yui_output = $filename.'.min.css';
		exec_command('java -Xmx256M -jar yuicompressor-2.4.7.jar '.$filename.' -o '.$yui_output.' --charset utf-8 ');

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
	log_end('finish');
?>