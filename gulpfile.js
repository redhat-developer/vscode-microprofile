/**
 * Copyright 2019 Red Hat, Inc. and others.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gulp = require('gulp');
const rename = require('gulp-rename');
const cp = require('child_process');
const fse = require('fs-extra');

const microprofileServerName = 'org.eclipse.lsp4mp.ls-uber.jar';
const microprofileServerDir = '../lsp4mp/microprofile.ls/org.eclipse.lsp4mp.ls';

const microprofileExtensionDir = '../lsp4mp/microprofile.jdt';
const microprofileExtension = 'org.eclipse.lsp4mp.jdt.core';
const microprofileSite = 'org.eclipse.lsp4mp.jdt.site';

gulp.task('buildServer', (done) => {
  cp.execSync(mvnw() + ' clean install -B -DskipTests', { cwd: microprofileServerDir , stdio: 'inherit' });
  gulp.src(microprofileServerDir + '/target/' + microprofileServerName, { encoding: false })
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildExtension', (done) => {
  cp.execSync(mvnw() + ' clean verify -B -DskipTests', { cwd: microprofileExtensionDir, stdio: 'inherit' });
  gulp.src(microprofileExtensionDir + '/' + microprofileExtension + '/target/' + microprofileExtension + '-!(*sources).jar', { encoding: false })
    .pipe(rename(microprofileExtension + '.jar'))
    .pipe(gulp.dest('./jars'));
  gulp.src(microprofileExtensionDir + '/' + microprofileSite + '/target/repository/plugins/wrapped*.jar', { encoding: false })
    .pipe(rename(function (path, _file) {
      const patt = /wrapped\.([^_]+).*/;
      const result = path.basename.match(patt);
      path.basename = result[1];
    }))
    .pipe(gulp.dest('./jars'));
  gulp.src(microprofileExtensionDir + '/' + microprofileSite + '/target/repository/plugins/org.jboss.logging*.jar', { encoding: false })
    .pipe(rename(function (path, _file) {
      const patt = /([^_]+).*/;
      const result = path.basename.match(patt);
      path.basename = result[1];
    }))
    .pipe(gulp.dest('./jars'));
  done();
});

gulp.task('build', gulp.series('buildServer', 'buildExtension'));

gulp.task('prepare_pre_release', function (done) {
  const json = JSON.parse(fse.readFileSync("./package.json").toString());
  const stableVersion = json.version.match(/(\d+)\.(\d+)\.(\d+)/);
  const major = stableVersion[1];
  const minor = stableVersion[2];
  const date = new Date();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const patch = `${date.getFullYear()}${prependZero(month)}${prependZero(day)}${prependZero(hours)}`;
  const insiderPackageJson = Object.assign(json, {
    version: `${major}.${minor}.${patch}`,
  });
  fse.writeFileSync("./package.json", JSON.stringify(insiderPackageJson, null, 2));
  done();
});

function mvnw() {
	return isWin() ? 'mvnw.cmd' : './mvnw';
}

function isWin() {
	return /^win/.test(process.platform);
}

function prependZero(number) {
  if (number > 99) {
    throw "Unexpected value to prepend with zero";
  }
  return `${number < 10 ? "0" : ""}${number}`;
}
