window.addEventListener('keydown', function (event) {
	if(event['keyCode'] === 27) {
		location.replace('/main.html');
	}

	return;
});

window.addEventListener('dblclick', function () {
	location.replace('/main.html');

	return;
});