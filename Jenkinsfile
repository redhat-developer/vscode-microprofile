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
            git url: "https://github.com/${params.FORK}/vscode-microprofile.git"
        }
    }

    stage('Install requirements') {
        def nodeHome = tool 'nodejs-14.19.1'
        env.PATH="${env.PATH}:${nodeHome}/bin"
        sh 'npm install -g typescript'
        sh 'npm install -g -f "@vscode/vsce"'
    }

    stage('Build') {
        env.JAVA_HOME="${tool 'openjdk-17'}"
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

    env.publishPreReleaseFlag = ""
    if(publishPreRelease.equals('true')){
        stage("Prepare for pre-release") {
            dir ('vscode-microprofile') {
                sh "npx gulp prepare_pre_release"
                env.publishPreReleaseFlag = "--pre-release"
            }
        }
    }

    stage('Package') {
        dir ('vscode-microprofile') {
            def packageJson = readJSON file: 'package.json'
            sh "vsce package ${env.publishPreReleaseFlag} -o ../vscode-microprofile-${packageJson.version}-${env.BUILD_NUMBER}.vsix"
            sh "npm pack && mv vscode-microprofile-${packageJson.version}.tgz ../vscode-microprofile-${packageJson.version}-${env.BUILD_NUMBER}.tgz"
        }
    }

    if(params.UPLOAD_LOCATION) {
        stage('Snapshot') {
            def filesToPush = findFiles(glob: '**.vsix')
            sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-microprofile/ <<< \$'put -p ${filesToPush[0].path}'"
            stash name:'vsix', includes:filesToPush[0].path
            def tgzFilesToPush = findFiles(glob: '**.tgz')
            stash name:'tgz', includes:tgzFilesToPush[0].path
            sh "sftp -C ${UPLOAD_LOCATION}/snapshots/vscode-microprofile/ <<< \$'put -p ${tgzFilesToPush[0].path}'"
        }
    }

    if('true'.equals(publishToMarketPlace) || 'true'.equals(publishToOVSX) || 'true'.equals(publishPreRelease)){
        if ('true'.equals(publishToMarketPlace) || 'true'.equals(publishToOVSX)) {
            timeout(time:5, unit:'DAYS') {
                input message:'Approve deployment?', submitter: 'fbricon,rgrunber,azerr,davthomp'
            }
        }

        stage("Publish to Marketplaces") {
            unstash 'vsix'
            unstash 'tgz'
            def vsix = findFiles(glob: '**.vsix')

            if ('true'.equals(publishToMarketPlace) || 'true'.equals(publishPreRelease)) {
                // VS Code Marketplace
                withCredentials([[$class: 'StringBinding', credentialsId: 'vscode_java_marketplace', variable: 'TOKEN']]) {
                    sh 'vsce publish -p ${TOKEN} --packagePath' + " ${vsix[0].path}"
                }
            }

            if ('true'.equals(publishToOVSX)) {
                // open-vsx Marketplace
                sh 'npm install -g ovsx'
                withCredentials([[$class: 'StringBinding', credentialsId: 'open-vsx-access-token', variable: 'OVSX_TOKEN']]) {
                sh 'ovsx publish -p ${OVSX_TOKEN}' + " ${vsix[0].path}"
                }
            }

            archiveArtifacts artifacts:"**.vsix,**.tgz"

            if ('true'.equals(publishToMarketPlace)) {
                stage "Promote the build to stable"
                sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-microprofile/ <<< \$'put -p ${vsix[0].path}'"
                def tgz = findFiles(glob: '**.tgz')
                sh "sftp -C ${UPLOAD_LOCATION}/stable/vscode-microprofile/ <<< \$'put -p ${tgz[0].path}'"
            }
        }
    }
}
