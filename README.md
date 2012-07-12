
# SlidePanels Tool

This tool generates a tabbed slideshow, which you can download as HTML and add to your site.

You may [view a demo][demo] or get to work on [your own slideshow][tool].

[demo]: http://katowulf.github.com/slidepanels/#example
[tool]: http://katowulf.github.com/slidepanels/

# Installation
To use the SlidePanels tool, you need to download a tiny amount of [javascript][1] and [css][2].

[1]: https://raw.github.com/katowulf/slidepanels/master/assets/slidepanel.js
[2]: https://raw.github.com/katowulf/slidepanels/master/assets/slidepanel.css

And add them to your page, with a little code to invoke them:

```html
   <link rel="stylesheet" type="text/javascript" src="slidepanel.css" />
   <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js"></script>
   <script type="text/javascript" src="slidepanel.js"></script>
   <script type="text/javascript">
      jQuery(function($) {
         // runs when the document is done rendering
         // activates the SlidePanel plugin for all elements with class 'SlidePanelInsert'
         $('.SlidePanelInsert').slidePanel();
      });
   </script>
```

Then you [use the tool to generate your slideshow panels][4], and copy/paste them into your HTML document.

[4]: http://katowulf.github.com/slidepanels/

# Getting Help

Get answers to questions, problems, or bugs at [the GitHub repository][3].

[3]: https://github.com/katowulf/slidepanels/issues