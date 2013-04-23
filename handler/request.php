<?php include 'helper.php'; ?>
<?php
	log_start();

	#if (!need_referer()) {
	#	return;
	#}
	loghere('referer');

	// params
	$optype = $_POST['optype'];
	$csscode = $_POST['csscode'];
	if (strlen($csscode) == 0) {
		echo('<p>请输入CSS再进行此操作</p>');
		return;
	}
	if (strlen($csscode) > $max) {
		echo('<p>由于资源的限制，网络在线版只支持 <strong>'.$max.'</strong> 个字符以内的CSS处理(目前为 '.strlen($csscode).' 个)</p>'.
			'<p>如需使用更强大无限制有节操的CKstyle，请 <a target="_blank" href="https://github.com/wangjeaf/CSSCheckStyle#installation">安装到您的机器上</a> 吧~</p>');
		return;
	}
	// safemode
	$safeMode = $_POST['safeMode'];
	$browsers = $_POST['browsers'];

	if ($browsers != '') {
		$browsers = ' --browsers='.$browsers.' ';
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
	
	// make download dir 
	$ip = str_replace('.', '_', get_ip());
	$ts = time();
	$dir = '../cache/task/'.$ts;
	$res_dir = '../cache/result/'.$ts;
	if (!is_dir('../cache')) {
		mkdir('../cache');
	}
	if (!is_dir('../cache/task')) {
		mkdir('../cache/task');
	}
	if (!is_dir($dir)) {
		mkdir($dir);
	}
	if (!is_dir('../cache/result')) {
		mkdir('../cache/result');
	}
	if (!is_dir($res_dir)) {
		mkdir($res_dir);
	}

	// temp css file
	$filename = $dir.'/task.css';
	$commandline_file = $dir.'/task.json';
	$remote_css = '';
	if (preg_match('/^http(s)?:/', $csscode)) {
		echo('<p>资源有限，暂不支持远程文件实时处理</p>');
		return;
		$csspath = $csscode;
		$remote = fopen($csspath, "r");
		if (!$remote) {
			echo('<p>无法下载此文件，请输入正确的CSS文件URL地址</p>');
			return;
		}
		$csscode = read_remote_file($remote);
        if (!isCSS($csscode)) {
        	echo('<p>对不起，请输入正确的CSS文件URL地址</p>');
			return;
        }
        if ($csscode == -1 || strlen($csscode) > $max) {
			echo('<p>由于资源的限制，网络在线版只支持 <strong>'.$max.'</strong> 个字符以内的CSS处理。</p>'.
				'<p>远程文件中包含 '.strlen($csscode).' 个，已超出限制。</p>'.
				'<p>如需使用更强大无限制有节操的CKstyle，请 <a target="_blank" href="https://github.com/wangjeaf/CSSCheckStyle#installation">安装到您的机器上</a> 吧~</p>');
			return;
		}
        fclose($remote);
        write_to_file($filename, $csscode);
        $remote_css = '/* CSS FROM: '.$csspath.' */'.PHP_EOL.$csscode;
	} else {
		write_to_file($filename, $csscode);
	}

	loghere('write_to_file');

	if ($optype == 'fixstyle') {
		// fixstyle
		$result_file = $res_dir.'/result.css';
		$result = wait_for_exec_command($optype, 
			$bin_dir.'ckstyle fix -p '.$command_options.' '.$filename, 
			$commandline_file, 
			$result_file,
			$res_dir,
			'',
			get_ip());
		
		// make download file
		// write_to_file($result_file, str_replace('\n', PHP_EOL, $result));

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
		$result_file = $res_dir.'/result.css';
		$result = wait_for_exec_command($optype, 
			$bin_dir.'ckstyle check -p --json '.$command_options.' '.$filename, 
			$commandline_file, 
			$result_file,
			$res_dir,
			'',
			get_ip());
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
		$result_file = $res_dir.'/result.css';
		$result = wait_for_exec_command($optype, 
			$bin_dir.'ckstyle compress -p '.$command_options.$browsers.' '.$filename, 
			$commandline_file, 
			$result_file,
			$res_dir,
			'',
			get_ip());

		// make download file
		//write_to_file($result_file, str_replace('\n', PHP_EOL, $result));
		$result = str_replace(PHP_EOL, '', $result);

		// return json
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result,
			"download" => $result_file,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else if ($optype == 'yuicompressor') {
		$yui_res = $res_dir.'/result-yui.css';
		write_to_file($dir.'/yui.json', 'go');
		// csscompress
		$result_file = $res_dir.'/result.css';
		$result_ckstyle = wait_for_exec_command($optype, 
			$bin_dir.'ckstyle compress -p '.$command_options.$browsers.' '.$filename, 
			$commandline_file, 
			$result_file,
			$res_dir,
			$yui_res,
			get_ip());
		$result_ckstyle = str_replace(PHP_EOL, '', $result_ckstyle);

		// make csscompress download file
		//write_to_file($result_file, str_replace('\n', PHP_EOL, $result_ckstyle));

		$result_yui = '';
		// get yui output
		if (file_exists($yui_res)) {
			$file = fopen($yui_res, 'r');
			
			while(!feof($file)) {
				$result_yui = $result_yui.fgets($file);
			}
			fclose($file);
			unlink($yui_res);
		}
		rmdir($res_dir);

		if ($result_yui == '') {
			$result_yui = '[CKstyle ERROR] Sorry, yuicompressor failed...';
		}
		// make yui download file
		// $yui_result_file = $dir.'/compress-yui.min.css';
		// write_to_file($yui_result_file, str_replace('\n', PHP_EOL, $result_yui));

		// return json
		$json = array("status" => "ok", "result" => array(
			"compressed" => $result_ckstyle,
			"yuimin" => $result_yui,
			"download" => $result_file,
			"downloadYui" => $yui_res,
			"css" => $remote_css
		));
		echo(json_encode($json));
	} else {
		echo ('错误的optype类型~');
	}
	
	// remove temp file
	// unlink($filename);
	log_end('finish');
?>