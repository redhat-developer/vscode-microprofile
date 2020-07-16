import { expect } from "chai";
import { parseMajorVersion } from "../../../languageServer/requirements";

describe("Language server java requirements", () => {
  it("Should parse the correct java version from OpenJDK 1.8", () => {
    const openJDK8 = `openjdk version "1.8.0_212"
    OpenJDK Runtime Environment (AdoptOpenJDK)(build 1.8.0_212-b03)
    OpenJDK 64-Bit Server VM (AdoptOpenJDK)(build 25.212-b03, mixed mode)`;

    expect(parseMajorVersion(openJDK8)).to.equal(8);
  });

  it("Should parse the correct java version from AdoptOpenJDK with OpenJ9", () => {
    const adoptOpenJ9 = `openjdk version "11.0.6" 2020-01-14
    OpenJDK Runtime Environment AdoptOpenJDK (build 11.0.6+10)
    Eclipse OpenJ9 VM AdoptOpenJDK (build openj9-0.18.1, JRE 11 Mac OS X amd64-64-Bit Compressed References 20200122_450 (JIT enabled, AOT enabled)
    OpenJ9   - 51a5857d2
    OMR      - 7a1b0239a
    JCL      - da35e0c380 based on jdk-11.0.6+10)`;

    expect(parseMajorVersion(adoptOpenJ9)).to.equal(11);
  });

  it("Should parse the correct java version from Java SE 12", () => {
    const javaSE12 = `java version "12.0.1" 2019-04-16
    Java(TM) SE Runtime Environment (build 12.0.1+12)
    Java HotSpot(TM) 64-Bit Server VM (build 12.0.1+12, mixed mode, sharing)`;

    expect(parseMajorVersion(javaSE12)).to.equal(12);
  });

  it("Should return 0 if it cannot find a java version", () => {
    const javaNotFound = "bash: java: command not found";

    expect(parseMajorVersion(javaNotFound)).to.equal(0);
  });
});
