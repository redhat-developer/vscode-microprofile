import { RelativePattern, Uri, workspace, WorkspaceFolder } from "vscode";

/**
 * Returns a list of all files that match the given glob in the given workspace.
 *
 * @param workspaceFolder the workspace to search
 * @param glob the glob of the files to match
 * @returns a list of all files that match the given glob in the given workspace
 */
export async function getFilePathsFromWorkspace(
  workspaceFolder: WorkspaceFolder,
  glob: string
): Promise<Uri[]> {
  return await getFilePathsFromFolder(workspaceFolder.uri.fsPath, glob);
}

/**
 * Returns a list of all files that match the given glob in the given folder.
 *
 * @param folderPath the folder to search
 * @param glob the glob of the files to match
 * @returns a list of all files that match the given glob in the given folder
 */
export async function getFilePathsFromFolder(
  folderPath: string,
  glob: string
): Promise<Uri[]> {
  return await workspace.findFiles(new RelativePattern(folderPath, glob), null);
}
