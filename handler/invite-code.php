<?php include 'helper.php'; ?>
<?php
	if (isset($_GET['user'])) {
		echo md5($_GET['user'].time());
	} else {
		echo 'need user param';
	}
?>