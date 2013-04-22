<?php

function get_code(){
	if (isset($_GET['user'])) {
		echo md5($_GET['user'].time()).'-'.md5(get_ip());
	} else {
		echo 'need user as param: xxx.php?user=xxxx';
	}
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

?>
