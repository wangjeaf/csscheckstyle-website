<?php
	//$remote = fopen('http://csscheckstyle.com/tools/bootstrap/css/bootstrap.min.css', 'r');

	//if (!$remote) {
		//echo 'file not exists';
	//}
	#$csscode = read_remote_file($remote);
	#echo $csscode;
	//phpinfo();

	echo exec('whoami');
	echo exec('~/bin/ckstyle -p test.css');
?>
