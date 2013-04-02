<?php include 'helper.php'; ?>
<?php
	$remote = fopen('http://csscheckstyle.com/tools/bootstrap/css/bootstrap.min.css', 'r');
	$csscode = read_remote_file($remote);
	echo $csscode;
	//phpinfo();
?>
