const { spawn } = require('child_process');
let deployPath = process.env.npm_package_config_deploy;

if(deployPath) {
	const build = spawn('npm run build', {shell: '/bin/bash'});
	build.stdout.on('data', function(data){
		console.log(data);
	});

	build.stderr.on('data', function(data){
		console.log(data);
	});

	build.on('close', function (code){
		const copy = spawn('cp', ['-r', '../build/*', deployPath]);
		copy.stdout.on('data', function(data){
			console.log(data);
		});

		copy.stderr.on('data', function(data){
			console.log(data);
		});

		copy.on('close', function(code) {
			process.exit(0);
		});
	});

} else {
	console.error('Set deploy path in package.json');
}
