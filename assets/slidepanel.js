(function($) {

   $.fn.slidePanel = function() {

      return this.each(function() {

         var $slide = $(this),
            $links = $slide.find('.links a[href=#]'),
            $panelContainer = $slide.find('.panelContainer'),
            $panelWrapper = $slide.find('.panelWrapper'),
            $panels = $panelContainer.children('.panel'),
            panelHeight = $panelWrapper.height(),
            panelWidth = $panelWrapper.width(),
            tabHeight = $links.eq(0).outerHeight(),
            useClick = $slide.hasClass('click'),
            useHover = $slide.hasClass('hover'),
            isHoriz  = $slide.hasClass('top') || $slide.hasClass('bottom');

         function switchTo(idx) {
            var pos = $panels.eq(idx).position(), newPos = isHoriz? {left: -pos.left} : {top: -pos.top};
            $panelContainer.stop().animate(newPos, {speed: 500});
            $links.removeClass('active').find('img').css('top', 0).end().eq(idx).addClass('active').find('img').css('top', '-'+tabHeight+'px');
         }

         // when slidePanel is invoked, we call unbind() first because this essentially resets the panel
         // which allows slidePanel to be called after any changes to update the behaviors
         $links.unbind('.slidePanel').each(function(idx, v) {
            $(this).bind('mouseenter.slidePanel', function(e) {
               $(this).find('img').css({top: '-'+tabHeight+'px'});
               if( useHover ) {
                  switchTo(idx);
               }
            })
            .bind('mouseleave.slidePanel', function() {
               $(this).not('.active').find('img').css({top: 0});
            })
            .bind('click.slidePanel', function() {
               if( useClick ) {
                  switchTo(idx);
               }
               return false;
            });
         });

         $panels.height(panelHeight).width(panelWidth);

         var outerPanelWidth = $panelWrapper.outerWidth();
         if( isHoriz ) {
            $slide.width(Math.max($links.first().outerWidth()*$links.length, outerPanelWidth));
            var combinedWidth = 0;
            $panels.each(function() {
               combinedWidth += $(this).outerWidth(true)+1;
            });
            $panelContainer.width(combinedWidth);
         }
         else {
            $slide.width($links.first().outerWidth()+outerPanelWidth);
         }

         if( $panels.length ) { switchTo(0); }

      });

   }

})(jQuery);