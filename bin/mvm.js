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
var path        = require('path');
var fs          = require('fs');
var http        = require('http');
var ProgressBar = require('progress');
var program     = require('commander');

/**
 * Constructor
 */
function mvm () {};

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

mvm.prototype.paths = {
    mvmPath: mvm.prototype.minecraftPath() + '/mvm_bins',
    binPath: mvm.prototype.minecraftPath() + '/bin'
};

mvm.prototype.use = function (version) {
    var jarPath = this.paths['mvmPath'] + '/' + version + '.jar';

    if (!fs.existsSync(jarPath)) {
        console.error('\033[31mMinecraft %s is not installed.', version);
        return false;
    };

    fs.createReadStream(jarPath).pipe(fs.createWriteStream(this.paths['binPath'] + '/minecraft.jar')).on('close', function() {
        console.log('\033[32mNow using Minecraft %s!\033[0;39m', version);
        process.exit();
    });
};

mvm.prototype.install = function (version) {
    var self = this;

    if (!fs.existsSync(this.paths['mvmPath'])) {
        fs.mkdirSync(this.paths['mvmPath']);
    };

    var filepath = fs.createWriteStream(this.paths['mvmPath'] + '/' + version + '.jar', {flags: 'w'});

    http.get({
        host: 'assets.minecraft.net',
        path: '/' + version.replace(/\./g, '_') + '/minecraft.jar'
    }, function (res) {
        if (res.statusCode === 404) {
            console.error('\033[31mThis version does not exist.');
            fs.unlinkSync(self.paths['mvmPath'] + '/' + version + '.jar');
            return false;
        };

        var len = parseInt(res.headers['content-length'], 10);

        var bar = new ProgressBar('Downloading ' + version + ' [:bar] (:current of :total | :percent | :etas)', {
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

mvm.prototype.list = function () {
    fs.readdir(this.paths['mvmPath'], function(err, files) {
        if (err) throw err;
        if (files.length === 0) {
            console.log("No versions installed.");
            return;
        }

        files.forEach(function(file) {
            var ext = path.extname(file);
            if (ext === ".jar") {
                console.log(path.basename(file, ext));
            }
        });
    });
};

mvm.prototype.stash = function (name) {
    var jarPath = this.paths['binPath'] + '/minecraft.jar'

    fs.createReadStream(jarPath).pipe(fs.createWriteStream(this.paths['mvmPath'] + '/' + name + '.jar')).on('close', function() {
        console.log('\033[32mYour current minecraft.jar has been stashed as %s!', name);
        console.log('Restore it at any time by running: mvm use %s\033[0;39m', name);
        process.exit();
    });
};

/**
 * Command handling
 */
program
    .usage('<option> <version>')
    .version('0.1.0');

program.on('install', function () {
    console.log('\033[1;30mInstalling %s \033[0;39m\n----------------------', program.args[0]);
    mvm.prototype.install(program.args[0]);
});

program.on('use', function () {
    console.log('Setting to %s \n----------------------', program.args[0]);
    mvm.prototype.use(program.args[0]);
});

program.on('list', function () {
    mvm.prototype.list();
});

program.on('stash', function () {
    program.prompt('Name of stash: ', function (name) {
        mvm.prototype.stash(name);
    });
});

program.parse(process.argv);
