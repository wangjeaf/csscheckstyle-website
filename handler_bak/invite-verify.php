<?php include 'helper.php'; ?>
<?php
        if (!isset($_GET['code'])) {
                echo 'need code param';
        } else {
                var_dump(get_ip());
                var_dump(is_valid_invitecode($_GET['code'], get_ip()));
        }
?>