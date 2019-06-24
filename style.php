<?php
	header('Content-Type: text/css');
	require_once 'scssphp/scss.inc.php';
	use Leafo\ScssPhp\Compiler;

	$scss = new Compiler();
	$scss->setImportPaths('');
	$scss->setSourceMap(Compiler::SOURCE_MAP_INLINE);
	$scss->setFormatter('Leafo\ScssPhp\Formatter\Compact');

	$data = $scss->compile('
		@import "atlas_wysiwyg.scss";
	');
	file_put_contents("atlas_wysiwyg.css", $data);

	include("atlas_wysiwyg.css");
?>