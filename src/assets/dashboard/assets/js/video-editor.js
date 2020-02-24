(function($){

  window.VideoEditor = function(el) {

    var selt       = this;
    var $wrapper   = $(el);
    var $video     = $wrapper.find('.video-editor__video');
    var $trimmer   = $wrapper.find('.video-editor__trimmer');
    var $slider    = $trimmer.find('.video-editor__trimmer-slider');
    var $timeStart = $trimmer.find('.video-editor__trimmer-time--start');
    var $timeEnd   = $trimmer.find('.video-editor__trimmer-time--end');
    var $trimmertimeStart = $trimmer.find('.video-editor__trimmer-time--start-user');
    var $trimmertimeEnd   = $trimmer.find('.video-editor__trimmer-time--end-user');
    var video;
    var timer;

    var _ = {
      init: function() {
        videojs($video.attr('id')).ready(function() {
          video = this;
          $video.load();
          video.on('loadedmetadata', function() {
            $wrapper.addClass('video-editor--loaded');
            _.initTrimmer(0, Math.floor(video.duration()));
            _.initPreviewButton('.js-preview-video');
            _.initDoneButton('.js-done-video');
          });
        });
      },

      initTrimmer: function(min, max) {
        $slider.noUiSlider({
          start: [min, max],
          connect: true,
          step: 1,
          behaviour: 'none',
          range: {
            'min': min,
            'max': max
          }
        }).on('slide', $.debounce(50, function(){
          var time = $(this).find('.noUi-active').hasClass('noUi-handle-lower') ? $(this).val()[0] : $(this).val()[1];

          $('.js-start-time').val($(this).val()[0]);
          $('.js-end-time').val($(this).val()[1]);

          $trimmertimeStart.html(_.formatTime($(this).val()[0]));
          $trimmertimeEnd.html(_.formatTime($(this).val()[1]));

          $video.parent().addClass('vjs-has-started');
          video.pause();
          video.currentTime(time);
        }));

        $timeStart.html('00:00');
        $timeEnd.html(_.formatTime(max));

        $trimmertimeStart.html('00:00');
        $trimmertimeEnd.html(_.formatTime(max));
        $('.js-start-time').val(min);
        $('.js-end-time').val(max);
      },

      initPreviewButton: function(el) {
        $(el).on('click', function() {
          //alert($slider.val()[0]);
          //alert($slider.val()[1]);
          video.currentTime($slider.val()[0]).play();
          clearInterval(timer);
          timer = setInterval(function() {
            if ($slider.val()[1] - video.currentTime() <= 0.10) {
              clearInterval(timer);
              video.pause();
            }
          }, 10);
        });
      },

      initDoneButton: function(el) {
        $(el).on('click', function() {

          var startVideo = $slider.val()[0];
          var endVideo = $slider.val()[1];

          $.ajax({
              url: window.home_url + "/Huddles/submit_trim_request/" + $('#video_hidden_id').val() + '/' + $('#huddle_hidden_id').val(),
              data: {startVideo: startVideo, endVideo: endVideo},
              type: 'POST',
              success: function(response) {
                  var pathname = parent.location.pathname.toLowerCase();
                  var parts = pathname.split('/').slice(1);
                  var mainPart = parts[0] == 'app' ? parts[1] : parts[0];
                  var href = (mainPart == 'huddles') ?
                    home_url + "/Huddles/view/" + $('#huddle_hidden_id').val() :
                    home_url + "/MyFiles"
                  ;
                  parent.$.fancybox.close();
                  parent.location.href = href;
                  //$('body').html(response);
              },
              error: function() {
                  alert("Network Error Occured");
              }
          });

        });
      },

      formatTime: function(seconds) {
        var h, m, s, result='';
        // HOURs
        h = Math.floor(seconds/3600);
        seconds -= h*3600;
        if(h) result = h<10 ? '0'+h+':' : h+':';
        // MINUTEs
        m = Math.floor(seconds/60);
        seconds -= m*60;
        result += m<10 ? '0'+m+':' : m+':';
        // SECONDs
        s =Math.floor(seconds%60);
        result += s<10 ? '0'+s : s;
        return result;
      }
    };

    _.init();
  };



})(jQuery);
