<!doctype html>
<html>
<head>
	<title>Rich Text Editor Example</title>
	<link rel="stylesheet" type="text/css" href="style.php" />
</head>
<body>

<h1>Rich Text Editor Example</h1>

<form action="addcomment.php" method="get">
	<textarea name="post_content"></textarea>
</form>

<script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
<script src="/atlas_wysiwyg.js"></script>
<script>
	$("textarea").atlas()
</script>

</body>
</html>