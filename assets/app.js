(function($) {

   // this will hold the ZeroClip object if it is used
   var zeroClipWidget;

   /** CUSTOM BINDING TO RENDER SlidePanel
    ***********************************************************************/

      // create a custom binding to re-render our slidepanel template every time data changes
      // this also updates the code block shown at the bottom and notifies ZeroClipboard of the new data
   ko.bindingHandlers.slidePanel = {
      update: function(element, valueAccessor, allBindingsAccessor, viewModel) {
         var templateName = viewModel.chooseTemplate(),
         // the template will replace the node, so create an inner element to get replaced
            $e = $('<div />').appendTo($(element).html(''));
         // render the template
         ko.renderTemplate(templateName, viewModel, {}, $e.get(0), 'replaceNode');

         // render the code to copy/paste
         var code = '<!-- These two assets do all the work! Make sure to include them -->\n' +
            '<link rel="stylesheet" type="text/css" href="assets/slidepanel.css">\n' +
            '<script type="text/javascript" src="assets/slidepanel.js"></script>\n\n' +
            _getCode($(element));

         // apply the SlidePanel plugin
         $(element).find('.SlidePanelInsert:first-child').slidePanel();

         // store the code results
         viewModel.code( code );

         // apply updated code to the copy/paste widget if it is enabled
         if( zeroClipWidget ) {
            zeroClipWidget.setText(code);
            zeroClipWidget.reposition();
         }
      }
   };

   /** VIEW MODEL CONTROLLER THINGY FOR KNOCKOUT
    ***********************************************************************/

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

      self.tabGroupStyle = function() {
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
      };

      self.panelClass = function() {
         var c = 'SlidePanelInsert '+self.position();
         return (self.activateMethod() === 'click')? c+' click' : c+' hover';
      };

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
      }).extend({throttle: 500});

      self.panelWrapperStyle = function() {
         return 'width: '+self.panelWidth()+'px; height: '+self.panelHeight()+'px;';
      };

      self.activateSlider = function(element, model) {
         $(element).filter('.SlidePanelInsert').slidePanel();
      };

      self.code = ko.observable('');
   }

   /** RUN STUFF (when the DOM loads)
    ***********************************************************************/
   $(function() { // on dom ready

      // activate our X icons that close/open blurbs of text
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

      // set the "instructions" blurb to closed by default (must do after .hiders are activated)
      $('#instructionsWell').height($('#instructionsWell').find('h5').outerHeight());

      // remove the submit functionality
      $('#configForm').submit(function() { return false; });

      // bind our view model to Knockout.js
      var viewModel = new ViewModel();
      ko.applyBindings(viewModel);

      // creates an example
      $('#exampleTrigger').click(function() {
         viewModel.removeAll();
         viewModel.tabWidth(80);
         viewModel.tabHeight(60);
         viewModel.tabBorderY(1);
         viewModel.tabBorderX(1);
         viewModel.tabBorderColor('#000000');
         viewModel.panelHeight(300);
         viewModel.panelWidth(400);
         viewModel.position('left');
         viewModel.activateMethod('hover');

         var baseUrl = 'images/kitten{num}_thumb.jpg';
         var baseContent = '<img src="images/kitten{num}.jpg" />';
         var i = 0;
         while(++i < 6) {
            viewModel.tabs.push({url: baseUrl.replace('{num}', i), content: baseContent.replace('{num}', i)});
         }
         return false;
      });

      // if #example is added to the end of the URL, then trigger the example right away
      if( window.location.href.match(/#example$/) ) {
         $('#exampleTrigger').click();
      }

      if( window.location.protocol in {'http:': true, 'https:': true} ) {
         _activateClipboardWidget(viewModel);
      }

   });

   /** UTILITIES
    ***********************************************************************/

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
      if( ~~borderY ) {
         css += 'border-top: '+borderY+borderTag;
         if( !vertical || lastTab ) { css += 'border-bottom: '+borderY+borderTag; }
      }
      if( ~~borderX ) {
         css += 'border-left: '+borderX+borderTag;
         if( vertical || lastTab ) { css += 'border-right: '+borderX+borderTag; }
      }
      return css;
   }


   function _getCode($e) {
      return $('<div />')
         .text($e.html()).text()
         .replace(/data-bind='[^']*'/g, '')
         .replace(/data-bind="[^"]*"/g, '')
         .replace(/<img style="top:[^"]+"/g, '<img');
   }

   function _activateClipboardWidget(viewModel) {
      // set up our clipboard
      ZeroClipboard.setMoviePath( 'assets/zeroclip/ZeroClipboard.swf' );
      zeroClipWidget = new ZeroClipboard.Client();
      zeroClipWidget.setHandCursor( true );
      zeroClipWidget.setText(viewModel.code());

      // glue our code copy button to the page
      zeroClipWidget.glue( 'clippy' );

      $(window).on('resize', function() {
         zeroClipWidget.reposition();
      });

      var timer;
      zeroClipWidget.addEventListener( 'complete', function(client, text) {
         if( timer ) { clearTimeout(timer); }
         $('#clippy').addClass('clicked btn-primary');
         timer = setTimeout(function() {
            timer = null;
            $('#clippy').removeClass('clicked btn-primary');
         }, 2000);
      } );
   }

})(jQuery);

