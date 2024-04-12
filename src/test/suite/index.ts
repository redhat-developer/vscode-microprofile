import { glob } from "glob";
import * as Mocha from "mocha";
import * as path from "path";

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "bdd",
    color: true,
  });

  const testsRoot = path.resolve(__dirname, "..");
  const files = await glob("**/**.test.js", { cwd: testsRoot });
  files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

  return new Promise((resolve, reject) => {
    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}
