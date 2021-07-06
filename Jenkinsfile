pipeline {
    agent {
        node {
            label 'std-webpack-app'
        }
    }
    // agent {
    //     docker {
    //         image 'node:12'
    //         args '-p 3000:3000'
    //     }
    // }
    // environment {
    //         CI = 'true'
    // }
    stages {
        stage('Build') {
            steps {
                sh 'yarn'
                sh 'yarn build'
            }
        }
    }
}
