## mvm

A Minecraft version mananger. In Node. Deal with it.

Please note this is early, messy and simple. Please see the [Todos](https://github.com/remixz/mvm/issues/1) issue for planned things.

### Installation

```bash
[sudo] npm install -g mvm
```

### Usage

`mvm install <version>` -- Downloads the version specified, and copies it to the Minecraft bin directory.

`mvm use <version>` -- Will use an already-downloaded version and copy it to the Minecraft bin directory.

`mvm list` -- Lists all currently installed versions.

`mvm stash` -- Stashes the current .jar with a custom name. This is useful for storing and restoring of modded jars quickly.

### Details

This module is pretty messy, as I mainly wanted it to install new Minecraft "snapshots" (pre-releases) easily without having to copy/paste files all over the place. This will store downloaded copies in `[path to .minecraft]/mvm_bins`, and allow you to quickly switch between them. Feature requests are welcome!