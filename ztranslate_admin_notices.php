<?php
function ztrans_admin_notices() {
	if($_SERVER['REQUEST_METHOD']!='GET') return;
	$qtx_agree_missing=false;
	if(isset($_REQUEST['qtx_action'])){
		$qtx_action=$_REQUEST['qtx_action'];
		if(isset($_REQUEST['_wpnonce']) && !wp_verify_nonce($_REQUEST['_wpnonce'], 'qtx_admin_notice')) die('qtx_admin_notice submitted twice?');
		switch($qtx_action){
			case 'remind':
				$n=time()+rand(2*24*60,4*24*60)*60;
				update_option('ztranslate_next_admin_notice_qtx',$n);
				return;
			case 'dismiss':
				if(!isset($_REQUEST['qtx_agree'])||$_REQUEST['qtx_agree']=='off'){
					$qtx_agree_missing=true;
					break;
				}else{
					update_option('ztranslate_next_admin_notice_qtx',0x7fffffff);
					return;
				}
			default: return;
		}
	}else{
		//if(!empty($_REQUEST)) return;
	}
	if(is_plugin_active('qtranslate-x/qtranslate.php')) return;
	$n=get_option('ztranslate_next_admin_notice_qtx');
	if($n!==FALSE){
		$t=time();
		if($n > $t) return;
	}
?>
<div class="update-nag">
<form id="qtx_admin_notice_form" method="get">
<?php
	if($qtx_agree_missing){
		echo '<p><span style="color: red; font-weight: bold;">Please check the agreement box below button "Dismiss this notice permanently", if you intend to dismiss this notice permanently.</span></p>';
	}
?>
	<p><strong><?php _e('Plugin <a href="https://wordpress.org/plugins/ztranslate/" target=_blank"><span style="color:magenta">zTranslate</span></a> has moved to <a href="https://wordpress.org/plugins/qtranslate-x/" target=_blank"><span style="color:blue">qTranslate&#8209;X</span></a>, where its developing will continue.');?></strong> <?php _e('After a few more updates zTranslate will auto-replace itself with qTranslate&#8209;X, while no additional action is required from you.', 'ztranslate' ); ?>
<?php
	$qtxfile=WP_CONTENT_DIR.'/plugins/qtranslate-x/qtranslate.php';
	if ( file_exists($qtxfile) ) {
		$nonce = wp_create_nonce('activate-plugin_qtranslate-x/qtranslate.php');
?>
	<?php _e('However, you already have qTranslate&#8209;X installed and if you wish to be proactive, you may switch to qTranslate&#8209;X now manually. Please, choose one of the following:', 'ztranslate' ); ?></p>
	<p><a class="button" href="<?php echo home_url('/wp-admin/plugins.php'); ?>?action=activate&plugin=qtranslate-x%2Fqtranslate.php&plugin_status=all&paged=1&s&_wpnonce=<?php echo $nonce; ?>"><?php _e('Activate <strong>qTranslate&#8209;X</strong> plugin now manually', 'ztranslate' ); ?></a>
<?php
	}else{
		$nonce = wp_create_nonce('install-plugin_qtranslate-x');
?>
	<?php _e('However, if you wish to be proactive, you may switch to qTranslate&#8209;X now manually. Please, choose one of the following:', 'ztranslate' ); ?></p>
	<p><a class="install-now button" href="<?php echo home_url('/wp-admin/update.php'); ?>?action=install-plugin&plugin=qtranslate-x&_wpnonce=<?php echo $nonce; ?>"><?php _e('Install <strong>qTranslate&#8209;X </strong> plugin now manually', 'ztranslate' ); ?></a>
<?php
}
	$nonce = wp_create_nonce('qtx_admin_notice');
?>
<input type="hidden" name="_wpnonce" value="<?php echo $nonce; ?>">
	<br><?php _e('In case of a problem, please deactivate qTranslate&#8209;X, re-activate zTranslate again, and e-mail to <a href="mailto:qtranslateteam@gmail.com">qTranslate&nbsp;Team</a> or report the issue on <a href="https://wordpress.org/support/plugin/qtranslate-x" target=_blank"><span style="white-space: nowrap;">qTranslate&#8209;X&nbsp;support&nbsp;forum</span></a>.','ztranslate')?>
	</p>
	<p><a class="button" href="?qtx_action=remind&_wpnonce=<?php echo $nonce; ?>"><?php _e('Remind me in a few days', 'ztranslate' ); ?></a></p>
	<p><button name="qtx_action" value="dismiss" form="qtx_admin_notice_form" class="button"><?php _e('Dismiss this notice permanently', 'ztranslate' ); ?></button><br>
<?php
	if($qtx_agree_missing){
		echo '<span style="color: red; font-weight: bold;">Please check the box to confirm the statement below:</span><br>';
	}
?>
	<input type="checkbox" name="qtx_agree">&nbsp;<?php _e('I understand that zTranslate plugin will replace itself with qTranslate&#8209;X on one of the next updates and I will get another administrative notice, when it happens.','ztranslate')?></p>
</form>
</div>
<?php
}
add_action('admin_notices', 'ztrans_admin_notices');
?>
