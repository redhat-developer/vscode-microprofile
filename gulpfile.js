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

const microprofileServerName = 'org.eclipse.lsp4mp.ls-uber.jar';
const microprofileServerDir = '../lsp4mp/microprofile.ls/org.eclipse.lsp4mp.ls';

const microprofileExtensionDir = '../lsp4mp/microprofile.jdt';
const microprofileExtension = 'org.eclipse.lsp4mp.jdt.core';


gulp.task('buildServer', (done) => {
  cp.execSync(mvnw() + ' clean install -DskipTests', { cwd: microprofileServerDir , stdio: 'inherit' });
  gulp.src(microprofileServerDir + '/target/' + microprofileServerName)
    .pipe(gulp.dest('./server'));
  done();
});

gulp.task('buildExtension', (done) => {
  cp.execSync(mvnw() + ' -pl "' + microprofileExtension + '" clean verify -DskipTests', { cwd: microprofileExtensionDir, stdio: 'inherit' });
  gulp.src(microprofileExtensionDir + '/' + microprofileExtension + '/target/' + microprofileExtension + '-!(*sources).jar')
    .pipe(rename(microprofileExtension + '.jar'))
    .pipe(gulp.dest('./jars'));
  done();
});

gulp.task('build', gulp.series('buildServer', 'buildExtension'));

function mvnw() {
	return isWin() ? 'mvnw.cmd' : './mvnw';
}

function isWin() {
	return /^win/.test(process.platform);
}
