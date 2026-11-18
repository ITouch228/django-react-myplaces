// MyPlaces CI: existing Jenkins controller + one shared, unprivileged agent.
// No Android builds, Docker socket, application database, or deployment access.
pipeline {
    agent { label 'shared-ci' }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '5'))
        timeout(time: 35, unit: 'MINUTES')
        timestamps()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    environment {
        SECRET_KEY = 'jenkins-ci-only-not-for-production'
        DEBUG = 'False'
        DJANGO_ALLOWED_HOSTS = 'localhost,127.0.0.1'
    }

    stages {
        stage('Checkout & runtimes') {
            steps {
                checkout scm
                sh '''
                    set -eu
                    git rev-parse --short HEAD
                    python3.12 --version
                    node --version
                    npm --version
                '''
            }
        }

        stage('Python dependencies') {
            steps {
                sh '''
                    set -eu
                    python3.12 -m venv .ci-venv
                    . .ci-venv/bin/activate
                    python -m pip install --disable-pip-version-check -r backend/requirements.txt -r backend/requirements-dev.txt
                    python -m pip install --disable-pip-version-check -r docs/requirements.txt
                '''
            }
        }

        stage('Backend quality') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu
                        . ../.ci-venv/bin/activate
                        ruff check .
                        ruff format --check .
                        mypy .
                        python manage.py check
                        python manage.py makemigrations --check --dry-run
                    '''
                }
            }
        }

        stage('Backend tests') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu
                        . ../.ci-venv/bin/activate
                        coverage run manage.py test
                        coverage report
                        coverage xml -o coverage.xml
                    '''
                }
            }
        }

        stage('Frontend dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm ci --no-audit --no-fund'
                }
            }
        }

        stage('Frontend quality') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu
                        npm run lint
                        npm run build
                        npm run test:ci
                    '''
                }
            }
        }

        stage('MkDocs strict') {
            steps {
                sh '''
                    set -eu
                    . .ci-venv/bin/activate
                    python -m mkdocs build --strict
                    test -s site/index.html
                    grep -q 'MyPlaces' site/index.html
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'backend/coverage.xml', allowEmptyArchive: true
            sh 'rm -rf .ci-venv site || true'
        }
    }
}
