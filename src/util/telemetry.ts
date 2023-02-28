import { TelemetryService } from "@redhat-developer/vscode-redhat-telemetry/lib";

const CODE_ACTION_TELEMETRY_EVENT = 'codeAction';
const SUCCEED_VALUE = "succeeded";
const FAIL_VALUE = "failed";

/**
 * Sends a telemetry event to indicate that the given code action was applied.
 *
 * @param telemetryService the telemetry service
 * @param codeActionId the id of the type of code action (not the name, since that might contain context such as variable names)
 * @param succeeded true if the code action was applied successfully, and false otherwise
 * @param error the error message if the code action has failed
 */
export async function sendCodeActionTelemetry(telemetryService: TelemetryService, codeActionId: string, succeeded: boolean, error?) {
  telemetryService.send({
    name: CODE_ACTION_TELEMETRY_EVENT,
    properties: {
      codeActionId: codeActionId,
      status: succeeded ? SUCCEED_VALUE : FAIL_VALUE,
      error_message: error ? `${error}` : undefined
    }
  });
}
