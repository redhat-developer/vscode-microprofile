import * as vscode from 'vscode';

import { expect } from 'chai';
import { describe, it } from 'mocha';

describe('VS Code extension tests', () => {

  it('should be present', () => {
    expect(vscode.extensions.getExtension('redhat.vscode-microprofile')).to.be.ok;
  });
});
