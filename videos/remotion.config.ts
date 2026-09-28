import { existsSync } from "node:fs";

import { Config } from "@remotion/cli/config";

// In the cloud container, use the preinstalled headless Chromium instead of downloading one.
const headless = "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
if (existsSync(headless)) Config.setBrowserExecutable(headless);
