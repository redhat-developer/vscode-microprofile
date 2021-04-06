#!/usr/bin/env groovy

node('rhel8'){
    stage('Checkout repos') {
        deleteDir()
        def hasLsp4mpDir = fileExists 'lsp4mp'
        if (!hasLsp4mpDir){
            sh 'mkdir lsp4mp'
        }
        dir ('lsp4mp') {
            echo "Checking out LSP4MP ${params.LSP4MP_TAG}"
            git url: 'https://github.com/eclipse/lsp4mp.git'
            sh "git checkout ${params.LSP4MP_TAG}"
        }
        def hasClientDir = fileExists 'vscode-microprofile'
        if (!hasClientDir) {
            sh 'mkdir vscode-microprofile'
        }
        dir ('vscode-microprofile') {
            git url: 'https://github.com/redhat-developer/vscode-microprofile.git'
        }
    }

    stage('Install requirements') {
        def nodeHome = tool 'nodejs-12.13.1'
        env.PATH="${env.PATH}:${nodeHome}/bin"
        sh "npm install -g typescript vsce"
    }

    stage('Build') {
        env.JAVA_HOME="${tool 'openjdk-11'}"
        env.PATH="${env.JAVA_HOME}/bin:${env.PATH}"
        dir ('vscode-microprofile') {
            sh "npm install --ignore-scripts"
            sh "npm install"
            sh "npm run build"
            sh "npm run vscode:prepublish"
        }
    }

    withEnv(['JUNIT_REPORT_PATH=report.xml']) {
        stage('Test') {
            wrap([$class: 'Xvnc']) {
                dir ('vscode-microprofile') {
                    sh "npm test --silent"
                    //junit 'report.xml'
                }
            }
        }
    }

    stage('Package') {
        dir ('vscode-microprofile') {
            def packageJson = readJSON file: 'package.json'
            sh "vsce package -o ../vscode-microprofile-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
            sh "npm pack && mv vscode-microprofile-${packageJson.version}.tgz ../vscode-microprofile-${packageJson.version}-${env.BUILD_NUMBER}.tgz"
        }
    }

    if(params.UPLOAD_LOCATION) {
        stage('Snapshot') {
            def filesToPush = findFiles(glob: '**.vsix')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${filesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/vscode-microprofile/"
            stash name:'vsix', includes:filesToPush[0].path
            def tgzFilesToPush = findFiles(glob: '**.tgz')
            stash name:'tgz', includes:tgzFilesToPush[0].path
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgzFilesToPush[0].path} ${UPLOAD_LOCATION}/snapshots/vscode-microprofile/"
        }
    }

    if('true'.equals(publishToMarketPlace)){
        timeout(time:5, unit:'DAYS') {
            input message:'Approve deployment?', submitter: 'fbricon,rgrunber,azerr,davthomp'
        }

        stage("Publish to Marketplaces") {
            unstash 'vsix'
            unstash 'tgz'
            def vsix = findFiles(glob: '**.vsix')
            // VS Code Marketplace
            withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
            }

            // open-vsx Marketplace
            sh "npm install -g ovsx"
            withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
              sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
            }

            archiveArtifacts artifacts:"**.vsix,**.tgz"

            stage "Promote the build to stable"
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${vsix[0].path} ${UPLOAD_LOCATION}/stable/vscode-microprofile/"
            def tgz = findFiles(glob: '**.tgz')
            sh "rsync -Pzrlt --rsh=ssh --protocol=28 ${tgz[0].path} ${UPLOAD_LOCATION}/stable/vscode-microprofile/"
        }
    }
}
