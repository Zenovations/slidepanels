(function($) {

   $.fn.slidePanel = function() {

      return this.each(function() {

         var $slide = $(this),
            $links = $slide.find('.links a[href=#]'),
            $panelContainer = $slide.find('.panelContainer'),
            $panels = $panelContainer.children('.panel'),
            panelHeight = $slide.find('.panelWrapper').height(),
            tabHeight = $links.eq(0).outerHeight(),
            useClick = $slide.find('.links').hasClass('click'),
            useHover = $slide.find('.links').hasClass('hover');

         function switchTo(idx) {
            var pos = $panels.eq(idx).position();
            $panelContainer.stop().animate({top: -pos.top}, {speed: 500});
            $links.removeClass('active').find('img').css('top', 0).end().eq(idx).addClass('active').find('img').css('top', '-'+tabHeight+'px');
         }

         $links.unbind('.slidePanel').each(function(idx, v) {
            $(this).bind('mouseenter.slidePanel', (function(e) {
               if( useHover ) {
                  switchTo(idx);
               }
            }))
            .bind('mouseleave.slidePanel', function() {
               $(this).not('.active').find('img').css({top: 0});
            })
            .bind('click.slidePanel', function() {
               if( useClick ) {
                  switchTo(idx);
               }
               else {
                  return false;
               }
            });
         });

         if( $panels.length ) { switchTo(0); }

         $panelContainer.children('.panel').height(panelHeight).width($slide.find('.panelWrapper').width());

         if( $links.hasClass('top') || $links.hasClass('bottom') ) {
            $slide.width(Math.max($links.first().outerWidth()*$links.length, $panelContainer.outerWidth()));
         }
         else {
            $slide.width($links.first().outerWidth()+$panelContainer.outerWidth());
         }

      });

   }

})(jQuery);