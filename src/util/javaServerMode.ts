import { extensions, window, commands } from "vscode";

const JAVA_EXTENSION_ID = "redhat.java";

export enum ServerMode {
  STANDARD = "Standard",
  LIGHTWEIGHT = "LightWeight",
  HYBRID = "Hybrid",
}

/**
 * Waits for the java language server to launch in standard mode
 * Before activating Tools for MicroProfile.
 * If java ls was started in lightweight mode, It will prompt user to switch
 */
export async function waitForStandardMode(): Promise<void>  {
  const vscodeJava = extensions.getExtension(JAVA_EXTENSION_ID);
  if (!vscodeJava) {
    await promptToInstallJava();
  }

  const api = await vscodeJava.activate();
  if (!api) {
    throw new Error("VSCode java api not found");
  }

  // If hybrid, standard mode is being launched. Wait for standard mode then resolve.
  if (api.serverMode === ServerMode.HYBRID) {
    return new Promise((resolve) => {
      api.onDidServerModeChange((mode: string) => {
        if (mode === ServerMode.STANDARD) {
          resolve();
        }
      });
    });
    // If Lightweight. Prompt to switch then wait for Standard mode.
    // Even if they do not select Yes on the prompt. This still waits for standard mode
    // since standard mode switch can be triggered other ways.
  } else if (api.serverMode === ServerMode.LIGHTWEIGHT) {
    window.showInformationMessage(
        "Tools for MicroProfile requires the Java language server to run in Standard mode. " +
        "Do you want to switch it to Standard mode now?",
        "Yes",
        "Later"
      )
      .then((answer) => {
        if (answer === "Yes") {
          commands.executeCommand("java.server.mode.switch", ServerMode.STANDARD, true);
        }
      });
    return new Promise((resolve) => {
      api.onDidServerModeChange((mode: string) => {
        if (mode === ServerMode.STANDARD) {
          resolve();
        }
      });
    });
  }
}

async function promptToInstallJava(): Promise<void> {
  const YES = 'Install vscode-java';
  const NO = 'Don\'t install';
  const choice = await window.showErrorMessage("vscode-java is needed in order for vscode-microprofile to work. Install it now?", YES, NO);
  if (choice === YES) {
    await commands.executeCommand('workbench.extensions.installExtension', JAVA_EXTENSION_ID);
  } else {
    throw new Error("vscode-microprofile cannot work without vscode-java installed");
  }
}
