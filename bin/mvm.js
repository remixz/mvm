#!/usr/bin/env node

/**
 * mvm - Minecraft version manager.
 *
 * Copyright (c) 2013 Zachary Bruggeman <talkto@zachbruggeman.me>
 * mvm is licensed under the MIT license.
 */

/**
 * Dependencies
 */
var ProgressBar = require('progress');
var fs          = require('fs');
var http        = require('http');
var program     = require('commander');

/**
 * Constructor
 */

function mvm () {

};

mvm.prototype.getUserDirectory = function () {
	return process.env[(process.platform === 'win32') ? 'APPDATA' : 'HOME'];
};

mvm.prototype.minecraftPath = function () {
	switch (process.platform) {
		case 'darwin':
			return this.getUserDirectory() + '/Library/Application Support/minecraft';
		break;
		case 'win32':
		case 'linux':
			return this.getUserDirectory() + '/.minecraft';
		break;
	};
};

mvm.prototype.use = function (version) {
	var mvmPath = this.minecraftPath() + '/mvm_bins';
	var binPath = this.minecraftPath() + '/bin';
	var jarPath = mvmPath + '/' + version + '.jar';

	if (!fs.existsSync(jarPath)) {
		console.error('Minecraft ' + version + ' is not installed.');
		return false;
	};

	fs.createReadStream(jarPath).pipe(fs.createWriteStream(binPath + '/minecraft.jar')).on('close', function() {
		console.log('Now using Minecraft ' + version);
		process.exit();
	});
};

mvm.prototype.install = function (version) {
	var self = this;

	var mvmPath = this.minecraftPath() + '/mvm_bins';
	if (!fs.existsSync(mvmPath)) {
		fs.mkdirSync(mvmPath);
	};

	var filepath = fs.createWriteStream(mvmPath + '/' + version + '.jar', {flags: 'w'});

	http.get({
		host: 'assets.minecraft.net',
		path: '/' + version.replace(/\./g, '_') + '/minecraft.jar'
	}, function (res) {
		if (res.statusCode === 404) {
			console.error('This version does not exist.');
			fs.unlinkSync(mvmPath + '/' + version + '.jar');
			return false;
		};

		var len = parseInt(res.headers['content-length'], 10);

		var bar = new ProgressBar('Downloading Minecraft v' + version + ' [:bar] (:percent, :etas)', {
			complete: '=',
			incomplete: ' ',
			width: 20,
			total: len
		});

		res.on('data', function (chunk) {
			bar.tick(chunk.length);
		});

		res.on('end', function () {
			console.log('\n----------------------')
			self.use(version);
		});

		res.pipe(filepath);
	});
};

mvm.prototype.stash = function (name) {
	var mvmPath = this.minecraftPath() + '/mvm_bins';
	var binPath = this.minecraftPath() + '/bin';
	var jarPath = binPath + '/minecraft.jar'

	fs.createReadStream(jarPath).pipe(fs.createWriteStream(mvmPath + '/' + name + '.jar')).on('close', function() {
		console.log('Your current minecraft.jar has been stashed as ' + name);
		console.log('Restore it at any time by running: mvm use ' + name);
		process.exit();
	});
};

/**
 * Command handling
 */

program
	.usage('<option> <version>')
    .version('0.0.4');

program.on('install', function () {
	console.log('Installing ' + program.args[0]);
    mvm.prototype.install(program.args[0]);
});

program.on('use', function () {
	console.log('Using ' + program.args[0]);
    mvm.prototype.use(program.args[0]);
});

program.on('stash', function () {
	program.prompt('Name of stash: ', function (name) {
		mvm.prototype.stash(name);
	});
});

program.parse(process.argv);