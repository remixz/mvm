## mvm

A Minecraft version mananger. In Node. Deal with it.

### Installation

```bash
[sudo] npm install -g mvm
```

### Usage

`mvm install <version>` -- Downloads the version specified, and copies it to the Minecraft bin directory.

`mvm use <version>` -- Will use an already-downloaded version and copy it to the Minecraft bin directory.

### Details

This module is very messy, as I mainly wanted it to install new Minecraft "snapshots" (pre-releases) easily without having to copy/paste files all over the place. This will store downloaded copies in `[path to .minecraft]/mvm_bins`, and allow you to quickly switch between them. This won't store any mods or any sorts of that, and merely just replaces the `minecraft.jar` file. Pull Requests are welcome if you want this to be more useful!