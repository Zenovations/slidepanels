(function($) {

   ko.bindingHandlers.slidePanel = {
      update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
         var $links = $('#previewPane .SlidePanelInsert .links');

         if( viewModel.activateMethod() === 'click' ) {
            $links.addClass('click');
            $links.removeClass('hover');
         }
         else {
            $links.addClass('hover');
            $links.removeClass('click');
         }
         $links.removeClass('left right top bottom').addClass(viewModel.position());

         var templateName = viewModel.chooseTemplate(),
             e = $('<div />').appendTo($(element).html(''))[0];
         ko.renderTemplate(templateName, viewModel, {}, e, 'replaceNode');
         $(element).slidePanel();
         viewModel.code( '<!-- These two assets do all the work! Make sure to include them -->\n' +
                         '<link rel="stylesheet" type="text/css" href="assets/slidepanel.css">\n' +
                         '<script type="text/javascript" src="assets/slidepanel.js">\n\n' +
                         _getCode($(element)) );
      }
   };

   function _getCode($e) {
      return $('<div />').text($e.html()).text().replace(/data-bind='[^']*'/gi, '').replace(/data-bind="[^"]*"/gi, '');
   }

   function ViewModel() {
      var self = this;
      self.tabs            = ko.observableArray();
      self.tabWidth        = ko.observable(150);
      self.tabHeight       = ko.observable(100);
      self.tabBorderY      = ko.observable(0);
      self.tabBorderX      = ko.observable(0);
      self.tabBorderColor  = ko.observable('#000000');
      self.panelHeight     = ko.observable(400);
      self.panelWidth      = ko.observable(500);
      self.position        = ko.observable('left');
      self.activateMethod  = ko.observable('hover');

      self.removeAll = function() {
         self.tabs.removeAll();
      };

      self.linksStyle = ko.computed(function() {
         switch(self.position()) {
            case 'left':
            case 'right':
               return 'width:'+self.tabWidth()+'px;';
            case 'top':
            case 'bottom':
               return 'height:'+self.tabHeight()+'px;';
            default:
               throw new Error('Invalid position '+self.position());
         }
      }).extend({ throttle: 500 });

      self.tabStyle = function(idx) {
         return _cssFor(self, idx);
      };

      self.chooseTemplate = function() {
         return self.position() === 'bottom'? 'slide-panel-template-bottom' : 'slide-panel-template';
      };

      self.addRow = function(form) {
         var imgUrl = form.elements['imageUrl'].value, content = form.elements['tabContent'].value, c = self.tabs().length+1;
         self.tabs.push({url: imgUrl, content: content});
         var re = new RegExp(c+"((_thumb)?\\.(jpg|gif|png))");
         form.elements['imageUrl'].value = imgUrl.replace(re, (c+1)+"$1");
         form.elements['tabContent'].value = content.replace(re, (c+1)+"$1");
         return false;
      };

      self.deleteRow = function() {
         self.tabs.remove(this);
      };
      self.moveUp = function() {
         var i = self.tabs.indexOf(this);
         if( i > 0 ) {
            var changed = self.tabs.slice(i-1, i+1);
            self.tabs.splice(i-1, 2, changed[1], changed[0]);
         }
      };
      self.moveDown = function() {
         var i = self.tabs.indexOf(this);
         if( i < self.tabs().length-1 ) {
            var changed = self.tabs.slice(i, i+2);
            self.tabs.splice(i, 2, changed[1], changed[0]);
         }
      };
      self.panelRedraw = ko.computed(function() {
         // this exists just to make the slidePanel redraw when there is an update on any
         // of these variables; it doesn't actually do anything except establish dependencies for ko
         self.tabs();
         self.tabWidth();
         self.tabHeight();
         self.tabBorderY();
         self.tabBorderX();
         self.tabBorderColor();
         self.panelHeight();
         self.panelWidth();
         self.position();
         self.activateMethod();
      });

      self.panelWrapperStyle = ko.computed(function() {
         return 'width: '+self.panelWidth()+'px; height: '+self.panelHeight()+'px;';
      });

      self.activateSlider = function(element, model) {
         $(element).filter('.SlidePanelInsert').slidePanel();
      };

      self.code = ko.observable('');
   }

   $(function() { // on dom ready

      var viewModel = new ViewModel();
      ko.applyBindings(viewModel);

      $('.hider').each(function() {
         // scope external to the click function or origHeight will be recalculated on each click event
         var $parent = $(this).closest('.hideable'), origHeight = $parent.height(), smallHeight = $parent.find('h5').outerHeight();
         $(this).click(function() {
            if( $parent.height() === origHeight ) {
               $(this).prev('.title').show();
               $parent.stop().addClass('nopad').animate({height: smallHeight+'px'});
            }
            else {
               $(this).prev('.title').hide();
               $parent.stop().removeClass('nopad').animate({height: origHeight+'px'});
            }
         });
      });

      $('#instructionsWell').height($('#instructionsWell').find('h5').outerHeight());

      $('#configForm').submit(function() { return false; });

      $('#exampleTrigger').click(function() {
         viewModel.removeAll();
         viewModel.tabWidth(80);
         viewModel.tabHeight(60);
//         viewModel.tabBorderY(1);
//         viewModel.tabBorderX(1);
//         viewModel.tabBorderColor('#000000');
         //debug
         viewModel.tabBorderY(5);
         viewModel.tabBorderX(5);
         viewModel.tabBorderColor('red');
//         viewModel.tabBorderInner(true);
         viewModel.panelHeight(300);
         viewModel.panelWidth(400);
         viewModel.position('top'); //debug
         viewModel.activateMethod('hover');

         var baseUrl = 'images/kitten{num}_thumb.jpg';
         var baseContent = '<img src="images/kitten{num}.jpg" />';
         var i = 0;
         while(++i < 6) {
            viewModel.tabs.push({url: baseUrl.replace('{num}', i), content: baseContent.replace('{num}', i)});
         }
         return false;
      });

      $('#exampleTrigger').click();//debug

   });

   function _isVert(pos) {
      switch(pos) {
         case 'top':
         case 'bottom':
            return false;
         default:
            return true;
      }
   }

   function _cssFor(self, idx) {
      var vertical  = _isVert(self.position()),
          lastTab   = (idx === self.tabs().length-1),
          borderY   = self.tabBorderY(),
          borderX   = self.tabBorderX(),
          color     = self.tabBorderColor(),
          css       = 'width:'+self.tabWidth()+'px;height:'+self.tabHeight()+'px;',
          borderTag = 'px solid '+color+';';
      if( borderY ) {
         css += 'border-top: '+borderY+borderTag;
         if( !vertical || lastTab ) { css += 'border-bottom: '+borderY+borderTag; }
      }
      if( borderX ) {
         css += 'border-left: '+borderX+borderTag;
         if( vertical || lastTab ) { css += 'border-right: '+borderX+borderTag; }
      }
      return css;
   }

})(jQuery);
