const CONTAINER_ID = "video-container"
const PLAYER_ID = "player"
const PLAYER_WIDTH = 250;
const TECHS = [
  , 'dailymotion'
  , 'deezer'
  , 'jamendo'
  , 'mixcloud'
  , 'soundcloud'
  , 'spotify'
  , 'vimeo'
  , 'youtube'
  , 'html5'
];

function urlToVjsSource(url) {
  const tech = new URL(url).pathname.split(".")[0].toLowerCase();
  if (!TECHS.includes(tech)) {
    throw `unsupported url: ${url}`
  }

  return {
    tech: `${tech[0].toUpperCase()}${tech.substr(1)}`,
    src: url,
    type: url
  }
}

function getPlayConfig() {
  return {
    controls: true,
    autoplay: 0,
    width: PLAYER_WIDTH,
    techOrder: TECHS
  }
}

/**
 * Used to determine how we will be switching the source
 */
class SourceSwitcher {

  /**
   * Helper to get rid of the existing player, if it exists
   *
   * @return {Promise}
   *    fulfilled once the player is disposed and the element destroyed
   */
  removePlayer() {
    return new Promise((resolve, reject) => {
      if (document.getElementById(PLAYER_ID)) {
        videojs("player").on("dispose", () => {
          setTimeout(() => {
            resolve()
          }, 10)

        }).dispose()
      } else {
        resolve()
      }

    }).then(function () {
      var videoContainer = document.getElementById(CONTAINER_ID)
      Array.prototype.forEach.call(videoContainer.children, videoContainer.removeChild);
    })

  }

  /**
   * Doesn't recreate a player and simply tells videojs to switch to it
   *
   * @param {Object} source
   *      A videojs source object with src and type
   */
  dynamically(source) {
    if (document.getElementById(PLAYER_ID)) {
      videojs("player").src(source)
    } else {
      this.recreateJavascript(source)
    }
  }

  /**
   * Recreates the videojs player and passed the source to the constructor
   *
   * @param source {Object}
   *      A videojs source object with src and type
   */
  recreateJavascript(source) {
    this.removePlayer().then(function () {
      var container = document.getElementById(CONTAINER_ID);
      var video = document.createElement('video');
      video.id = 'player'
      video.width = `${PLAYER_WIDTH}px`;
      video.className = 'video-js vjs-fluid vjs-default-skin'
      video.crossOrigin = true
      video.setAttribute('crossorigin', true)
      container.appendChild(video)
      var playerConfig = getPlayConfig()
      playerConfig.sources = [source]
      var player = videojs('player', playerConfig)
    })
  }

  /**
   * Destroys the existing player and recreates it.
   * The source is created as a DOM element (<source>)
   *
   * @param source {Object}
   *      A videojs source object with src and type
   */
  recreateWithTag(source) {
    this.removePlayer().then(function () {
      var container = document.getElementById(CONTAINER_ID);
      var video = document.createElement('video');
      video.id = 'player'
      video.width = `${PLAYER_WIDTH}px`;
      video.className = 'video-js vjs-fluid vjs-default-skin'
      video.crossOrigin = true
      video.setAttribute('crossorigin', true)
      var sourceTag = document.createElement("source")
      sourceTag.src = source.src
      sourceTag.type = source.type
      video.appendChild(sourceTag)

      container.appendChild(video)
      var player = videojs('player', getPlayConfig())
    })
  }

}

function DemoController($scope) {

  $scope.sources = [
    {
      tech: "Dailymotion",
      src: "http://www.dailymotion.com/video/x56imdz_une-pluie-d-hommages-pour-le-chanteur-george-michael-sur-les-reseaux-sociaux_news",
      type: "video/dailymotion"
    },
    {
      tech: "Deezer",
      src: "http://www.deezer.com/track/1167893",
      type: "audio/deezer"
    },
    {
      tech: "Jamendo",
      src: "https://www.jamendo.com/track/1466090/universal-funk",
      type: "audio/jamendo"
    },
    {
      tech: "Mixcloud",
      src: "https://www.mixcloud.com/johndigweed/transitions-with-john-digweed-and-dj-vibe/",
      type: "audio/mixcloud"
    },
    {
      tech: "Soundcloud",
      src: "https://soundcloud.com/yozzie-b/rhiana-where-have-u-been-ukg",
      type: "audio/soundcloud"
    },
    {
      tech: "Vimeo",
      src: "https://vimeo.com/210321457",
      type: "video/vimeo"
    },
    {
      tech: "Youtube",
      src: "https://www.youtube.com/watch?v=DIDp05SHJVk",
      type: "video/youtube"
    }
  ]

  $scope.creationTypes = {
    "dynamically": "Dynamic source change",
    "recreateJavascript": "recreate player with javascript source",
    "recreateWithTag": "recreate player with audio/video tag",
  }

  $scope.selected = {
    creationType: Object.keys($scope.creationTypes)[0],
    source: $scope.sources[0],

  }

  $scope.load = function () {
    new SourceSwitcher()[$scope.selected.creationType]($scope.selected.source)
  }
}

angular.module("demoApp", ["ui.bootstrap"])
  .controller("DemoController", DemoController);


