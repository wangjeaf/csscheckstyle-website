<?php

$max = 10000;
if (is_file('dev')) {
	$bin_dir = '';
	$debug = false;
} else {
	$bin_dir = '~/bin/';
	$debug = false;
}

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

function need_referer() {
	// referer
	if (!isset($_SERVER['HTTP_REFERER'])) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return false;
	}

	$referer = $_SERVER['HTTP_REFERER'];
	if (is_from_ckstyle_blog($referer) == false) {
		echo('{"status":"error", "旁门已关，请走正门~ :-)"}');
		return false;
	}
	return true;
}

// simple check css
function isCSS($content) {
	if (strlen($content) == 0) {
		return true;
	}
	return strpos($content, '{') != -1 && strpos($content, '}') != -1 && strpos($content, '.') != -1;
}

function read_remote_file($remote) {
	global $max;
	$lines = array();
	$counter = 0;
	while (!feof ($remote)) {
    	$line = fgets ($remote, 1024);
    	$counter = $counter + strlen($line);
    	if ($counter > $max) {
    		return -1;
    	}
    	array_push($lines, $line);
    }
    return join('', $lines);
}

function read_remote_file_nolimit($remote) {
	$lines = array();
	$counter = 0;
	while (!feof ($remote)) {
    	$line = fgets ($remote, 1024);
    	array_push($lines, $line);
    }
    return join('', $lines);
}

function is_valid_invitecode($code, $ip) {
	$filename = 'private/.ckstyle_invitecode';
	if (!is_file($filename)) {
		write_to_file($filename, '');
	}
	$content = file_get_contents($filename);
	$obj = json_decode($content, true);
	if (isset($obj[$code])) {
		return $obj[$code] == $ip;
	} else {
		return false;
	}
}

$last_ = -1;
function log_start() {
	global $debug;
	if (!$debug) {
		return;
	}
	global $last_;
	$last_ = microtime(true)*1000;
}

$log_times = array();
function loghere($text) {
	global $debug;
	if (!$debug) {
		return;
	}
	global $last_;
	global $log_times;
	$current = microtime(true)*1000;
	array_push($log_times, $text.' : '.($current - $last_));
	$last_ = $current;
}

function log_end($text) {
	global $debug;
	if (!$debug) {
		return;
	}
	global $log_times;
	loghere($text);
	echo '<br>----------<br>'.join('<br>', $log_times);
}
//var_dump(read_remote_file(fopen('http://s.xnimg.cn/a54813/n/core/home-frame2-all-min.css', 'r')));
?>