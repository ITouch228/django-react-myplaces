// Runs on the EXISTING Jenkins controller (MyInventory), using a compatible agent.
// No new controller, Docker socket, application DB, or deployment privileges.
pipeline {
    agent { label 'myplaces-python312-node22' }

    options {
        skipDefaultCheckout(true)
        disableConcurrentBuilds(abortPrevious: true)
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
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git rev-parse --short HEAD && python3.12 --version && node --version && npm --version'
            }
        }

        stage('Python dependencies') {
            steps {
                sh '''
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
                        . ../.ci-venv/bin/activate
                        coverage run manage.py test
                        coverage report
                        coverage xml -o coverage.xml
                    '''
                }
            }
        }

        stage('Frontend quality') {
            steps {
                dir('frontend') {
                    sh '''
                        npm ci --no-audit --no-fund
                        npm run lint
                        npm run build
                        npm run test -- --run --passWithNoTests
                    '''
                }
            }
        }

        stage('MkDocs strict and smoke') {
            steps {
                sh '''
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
            archiveArtifacts artifacts: 'backend/coverage.xml', allowEmptyArchive: true, fingerprint: false
            sh 'rm -rf .ci-venv site || true'
        }
    }
}
