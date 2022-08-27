properties([
  buildDiscarder(logRotator(artifactDaysToKeepStr: '', artifactNumToKeepStr: '', daysToKeepStr: '7', numToKeepStr: '7'))
])

def publish_branches = ["development", "master"]

stage('Build and publish Docker image in CI repository') {
  node('docker') {
    checkout scm
    echo 'Building image ...'
    def mqtt = docker.build("devicehiveci/devicehive-mqtt:${BRANCH_NAME}", '--pull -f Dockerfile .')

    echo 'Pushing image to CI repository ...'
    docker.withRegistry('https://registry.hub.docker.com', 'devicehiveci_dockerhub'){
      mqtt.push()
    }
  }
}

if (publish_branches.contains(env.BRANCH_NAME)) {
  stage('Publish image in main repository') {
    node('docker') {
      // Builds from 'master' branch will have 'latest' tag
      def IMAGE_TAG = (env.BRANCH_NAME == 'master') ? 'latest' : env.BRANCH_NAME

      docker.withRegistry('https://registry.hub.docker.com', 'devicehiveci_dockerhub'){
        sh """
          docker tag devicehiveci/devicehive-mqtt:${BRANCH_NAME} registry.hub.docker.com/devicehive/devicehive-mqtt:${IMAGE_TAG}
          docker push registry.hub.docker.com/devicehive/devicehive-mqtt:${IMAGE_TAG}
        """
      }
    }
  }
}
