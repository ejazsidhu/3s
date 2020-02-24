(function ($) {

    var Video = function () {
        var _ = {
            initialized: false,
            // Video id
            id: null,
            // Video length
            duration: null,
            // Video.js
            player: null,
            // DOM
            _player: null,
            // jQuery
            $player: null,
            $handle: null,
            $bar: null,
            $progress: null,
            init: function () {
                if ($('.video-js').length === 0)
                    return;
                autoPlaySibmePlayer = false;
                _.id = $('.video-js').first().attr('id');

                _.$player = $('#' + _.id);
                _._player = document.getElementById(_.$player.attr('id'));
                _.player = videojs(_.id);
                _.player.play_stat_added = false;
                _.player.play_state = false;
                _.player.play_seconds = 0;
                _.player.play_interval = null;

                if (_.player && _.player.ready) {
                    _.player.ready($.proxy(function () {
                        _.player.on('loadeddata', function () {

                            _.player.sibme_markers_init = true;
                            _.$bar = $('.vjs-progress-control');
                            _.$handle = $('.vjs-seek-handle');
                            _.$progress = $('.vjs-play-progress');

                            _.duration = _.player.duration();

                            Markers.init();

                            if (!Tooltip.isReady)
                                Tooltip.init();

                            Comments.init();

                            if (!autoPlaySibmePlayer || autoPlaySibmePlayer == false) {
                                _.player.pause();
                            } else {
                                _.player.play();
                            }


                            _.initialized = true;
                        });

                        _.player.on('ended',function() {
                            
                            _.player.play_state = false;
                            clearInterval(_.player.play_interval);

                        });

                         _.player.on('pause', function () {

                            _.player.play_state = false;
                            
                        });

                        _.player.on('play', function () {

                            _.player.play_state = true;
                            if (_.player.play_interval != null) {
                                clearInterval(_.player.play_interval);
                            }
                            _.player.play_interval = setInterval(function() {

                                if (_.player.play_state == true) {
                                    _.player.play_seconds +=1;

                                    if ((_.player.play_seconds % 5) === 0) {

                                        $.ajax({
                                            url: home_url + '/app/add_viewer_history',
                                            method: 'POST',
                                            data: {
                                                document_id: $('#video-id').val(),
                                                user_id: $('#user_id').val(),
                                                minutes_watched: _.player.play_seconds
                                            },
                                            dataType: 'json',
                                            success: function (res) {
                                                console.log(res);
                                            }
                                        });
                                    }
                                }

                            }, 1000);

                            if (!_.player.sibme_markers_init) {

                                _.player.sibme_markers_init = true;
                                _.$bar = $('.vjs-progress-control');
                                _.$handle = $('.vjs-seek-handle');
                                _.$progress = $('.vjs-play-progress');

                                _.duration = _.player.duration();

                                Markers.init();

                                if (!Tooltip.isReady)
                                    Tooltip.init();

                                Comments.init();
                                _.initialized = true;
                            }

                            if (!_.player.play_stat_added) {

                                _.player.play_state = true;
                                var player_id = _.player.id();
                                var player_id_array = player_id.split('_');
                                if (player_id_array.length == 3) {

                                    var document_id = player_id_array[2];
                                    setTimeout(function () {

                                        $.ajax({
                                            type: 'POST',
                                            url: home_url + '/Huddles/update_view_count/' + document_id,
                                            success: function (response) {

                                                _.player.play_stat_added = true;
                                            },
                                            errors: function (response) {
                                            }
                                        });
                                    }, 5000);
                                }

                            }

                        });

                    }, this));
                }

                return _.player;
            },
            /* Methods
             *************************************/
            getOffset: function (time) {
                if (!_.$handle)
                    return 0;

                var progress = time / _.duration,
                        handlePercent = _.$handle.width() ? _.$handle.width() / _.player.width() : 0;

                if (isNaN(progress)) {
                    progress = 0;
                }

                return videojs.round(progress * (1 - handlePercent) * 100, 2) + "%";
            },
            getTime: function () {
                time = Math.floor(_.player.currentTime());
                _.autoScroll(time);
                return _.player.currentTime()
            },
            autoScroll: function (time) {
                var scrolling_div = $('#normal_comment_' + time);
                if (scrolling_div.length > 0 && $('#auto_scroll_switch').is(':checked')) {
                    $('.comments_huddles').removeClass('auto-scroll-highlite');
                    $(scrolling_div).addClass('auto-scroll-highlite');
                    $("#vidCommentsNew").scrollTo(scrolling_div);

                }
            },
        }

        /* Modules
         *************************************/
        var Markers = {
            data: [],
            count: 0,
            init: function () {
                if (_.$player.data('markers')) {
                    Markers.data = _.$player.data('markers');
                    Markers.syn_cls = _.$player.data('cls');
                    for (var i = 0; i < Markers.data.length; i++) {
                        var cls = "short_tag_0";
                        if (typeof (Markers.syn_cls) != "undefined" && Markers.syn_cls.length > 0) {
                            if (Markers.syn_cls[i] > 0) {
                                cls = "short_tag_" + Markers.syn_cls[i];
                            }
                        }
                        Markers.add(Markers.data[i], cls);
                    }
                }
            },
            reinit: function () {
                if (_.$player.data('markers')) {
                    Markers.data = _.$player.data('markers');
                    Markers.syn_cls = _.$player.data('cls');

                    for (var i = 0; i < Markers.data.length; i++) {

                        Markers.remove(Markers.data[i]);
                    }

                    for (var i = 0; i < Markers.data.length; i++) {
                        var cls = "short_tag_0";
                        if (typeof (Markers.syn_cls) != "undefined" && Markers.syn_cls.length > 0) {
                            if (Markers.syn_cls[i] > 0) {
                                cls = "short_tag_" + Markers.syn_cls[i];
                            }
                        }
                        Markers.add(Markers.data[i], cls);
                    }
                }
            },
            /* Methods
             *************************************/
            add: function (time, synchro_time_class) {
                if (_.initialized && $('#for_entire_video') && $('#for_entire_video')[0] && $('#for_entire_video')[0].checked)
                    return;

                time = time || _.getTime();

                if (Math.floor(time) === 0)
                    return;

                $('<div class="vjs-marker ' + synchro_time_class + '"/>')
                        .attr('id', 'marker-' + Markers.count++)
                        .attr('data-time', Math.floor(time))
                        .css('left', _.getOffset(time))
                        .appendTo(_.$bar)
                        .on('click', function () {
                            _.player.pause().currentTime(time);
                            window.location.hash = 'add_comment_button';
                            Tooltip.show();
                        });
            },
            remove: function (time) {
                _.$bar.find('.vjs-marker[data-time=' + time + ']').first().remove();
            }
        }

        var Tooltip = {
            $el: null,
            $timer: null,
            $link: null,
            $link1: null,
            timer: null,
            isReady: false,
            init: function () {
                this.$el = $('<div/>').addClass('vjs-tooltip');
                this.$timer = $('<span/>').addClass('vjs-tooltip-timer').appendTo(this.$el);
                if (location.href.indexOf('MyFiles') >= 0) {
                    this.$link = $('Add Note Here'.link('#')).addClass('vjs-tooltip-link').appendTo(this.$el);
                } else {
                    this.$link = $('Add Comment Here'.link('#')).addClass('vjs-tooltip-link').appendTo(this.$el);
                    //this.$link1  = $('#Question'.link('#')).addClass('vjs-tooltip-link').appendTo(this.$el);
                }


                this.$el.appendTo(_.$bar);

                this.$link.on('click', function (event) {
                    event.preventDefault();
                    _.player.pause().exitFullscreen();
                    Comments.showForm('#add_comment_button');
                    $('input:radio[name=for]')[0].checked = true;
                    Comments.focusForm(Math.floor(_.player.currentTime()));
                });
                _.player.on('timeupdate', function () {
                    Tooltip.onTimeUpdate(_.player.currentTime());
                });

                _.player.on('progress', function () {
                    Tooltip.onTimeUpdate(_.player.currentTime());
                });

                _.$handle.on('mouseenter mouseleave', function (event) {
                    Tooltip[event.type === "mouseenter" ? 'show' : 'hide']();
                });

                Tooltip.isReady = true;
            },
            /* Events
             *************************************/
            onTimeUpdate: function (time) {
                this.$el.css({
                    'left': _.$handle.css('left'),
                    'margin-left': -(this.$el.outerWidth() - _.$handle.width()) / 2
                });

                this.$timer.text(videojs.formatTime(time));
            },
            /* Methods
             *************************************/
            hide: function () {
                Tooltip.timer = setInterval(function () {
                    return Tooltip.$el.removeClass('hover');
                }, 1000);
            },
            show: function () {
                clearInterval(Tooltip.timer);
                return this.$el.addClass('hover');
            }
        }

        var Comments = {
            $c: null,
            btnOpen: null,
            btnClose: null,
            $form: null,
            $replyForm: null,
            $reply: null,
            $textarea: null,
            init: function () {
                Comments.$c = $('#vidComments');
                Comments.$d = $('#docs-container');
                Comments.$cNew = $('#comment_form_main');
                Comments.btnOpen = '#add_comment_button';
                Comments.btnClose = '#close_comment_form';
                Comments.form = '#comment_form';
                Comments.$replyForm = $('#reply-form');
                Comments.$reply = $('#reply');
                Comments.textarea = '#comment_comment';

                $('[name="video_ID"]').val(_.id);

                Comments.synchro();

                Comments.$c.delegate(Comments.btnOpen, 'click', function (event) {
                    Comments.showForm();
                });

                Comments.$c.delegate(Comments.btnClose, 'click', function (event) {
                    Comments.hideForm();
                });

                _.player.on('timeupdate', function () {
                    Comments.updatedRightNow(_.getTime());
                });

                $('.comments').not('.disscussion').find('.comment-reply').on('click', function (event) {
                    event.preventDefault();
                    Comments.$replyForm.insertAfter($(this).closest('.comment').find('> .comment-footer')).fadeIn();
                });

            },
            focusForm: function (time) {
                $('#right-now').attr('checked', '');
                this.updatedRightNow(time).showForm();
            },
            updatedRightNow: function (time) {
                time = Math.floor(time);
                $('[name="synchro_time"]').val(time);

                time = videojs.formatTime(time);
                $('#right-now-time').text(time);

                return this;
            },
            synchro: function () {
                Comments.$d.delegate('.synchro-time', 'click', function () {
                    _.player.pause().currentTime($(this).data('time'));
                    $('[name="synchro_time"]').val($(this).data('time'));

                });
                Comments.$c.delegate('.synchro-time', 'click', function () {
                    _.player.pause().currentTime($(this).data('time'));
                    $('[name="synchro_time"]').val($(this).data('time'));

                });
            },
            showForm: function () {
                Comments.$cNew.find(Comments.form).fadeIn('slow');
                Comments.$cNew.find(Comments.textarea).focus();
                $(Comments.btnOpen).hide();
                Comments.updatedRightNow(_.getTime());

                return this;
            },
            hideForm: function () {
                Comments.$c.find(Comments.form).fadeOut('slow');
                $(Comments.btnOpen).show();

                return this;
            },
            closeReplyForm: function (btn) {
                $(btn).on('click', function (event) {
                    event.preventDefault();

                    Comments.$replyForm.fadeOut();
                    Comments.$reply.val('');
                });
            }
        }


        return {
            videojsPlayer: _.player,
            init: _.init,
            getTime: _.getTime,
            reinitMarker: Markers.reinit,
            addMarker: Markers.add,
            initMarker: Markers.init,
            removeMarker: Markers.remove,
            commentsInit: Comments.init
        };
    };


    $(document).ready(function () {
        window.VideoInstance = new Video();
        VideoInstance.videojsPlayer = VideoInstance.init();
    });

})(jQuery);

function reinit_markers_videos() {

    VideoInstance.reinitMarker();
    VideoInstance.videojsPlayer.sibme_markers_init = false;
    VideoInstance.videojsPlayer.pause();
    VideoInstance.videojsPlayer.play();
}
jQuery.fn.scrollTo = function (elem, speed) {
    $(this).animate({
        scrollTop: $(this).scrollTop() - $(this).offset().top + $(elem).offset().top
    }, speed == undefined ? 1000 : speed);
    return this;
};