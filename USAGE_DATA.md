# USAGE DATA

vscode-microprofile has opt-in telemetry collection, provided by [vscode-redhat-telemetry](https://github.com/redhat-developer/vscode-redhat-telemetry).

## What's included in the vscode-microprofile telemetry data

vscode-microprofile emits telemetry events when the extension starts and stops,
which contain the common data mentioned on the [vscode-redhat-telemetry page](https://github.com/redhat-developer/vscode-redhat-telemetry/blob/HEAD/USAGE_DATA.md#common-data).

## How to opt in or out

Use the `redhat.telemetry.enabled` setting in order to enable or disable telemetry collection.
Note that this extension abides by Visual Studio Code's telemetry level: if `telemetry.telemetryLevel` is set to off, then no telemetry events will be sent to Red Hat, even if `redhat.telemetry.enabled` is set to true. If `telemetry.telemetryLevel` is set to `error` or `crash`, only events containing an error or errors property will be sent to Red Hat.
