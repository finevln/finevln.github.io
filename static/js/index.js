window.HELP_IMPROVE_VIDEOJS = false;

$(document).ready(function() {
    $(".navbar-burger").click(function() {
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    var options = {
			slidesToScroll: 1,
			slidesToShow: 3,
			loop: true,
			infinite: true,
			autoplay: false,
			autoplaySpeed: 3000,
    }

    var carousels = bulmaCarousel.attach('.carousel', options);

    for(var i = 0; i < carousels.length; i++) {
    	carousels[i].on('before:show', state => {
    		console.log(state);
    	});
    }

    var element = document.querySelector('#my-element');
    if (element && element.bulmaCarousel) {
    	element.bulmaCarousel.on('before-show', function(state) {
    		console.log(state);
    	});
    }

    if (typeof bulmaSlider !== 'undefined') {
      bulmaSlider.attach();
    }

    // Hide qualitative placeholders once a video has playable media.
    document.querySelectorAll('.qual-video-frame video, .cmp-pane video').forEach(function(video) {
      var markReady = function() {
        if (video.readyState >= 2 && video.videoWidth > 0) {
          video.setAttribute('data-ready', 'true');
        }
      };
      video.addEventListener('loadeddata', markReady);
      video.addEventListener('error', function() {
        video.removeAttribute('data-ready');
      });
      markReady();
    });

})
