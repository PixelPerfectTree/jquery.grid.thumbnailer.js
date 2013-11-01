(function() {

  $.fn.thumbnailer = function(options) { 
    
    //private 

    var grid = this[0],
        items = null,
        isAnimating = false;

    function setImages(newImages) {
  
      if(Array.isArray(newImages) && newImages != [] ) {
        $this.children('li').children().addClass('tt-old')

        // apply effect
        setTimeout( function() {
          
          // append new elements
          [].forEach.call( newImages, function( el, i ) { items[ i ].innerHTML += el; } );


          $(grid).addClass("tt-effect-active");
          
          var onEndAnimFn = function() {
            // remove old elements
            items.forEach( function( el ) {

              var old = el.querySelector( '.tt-old' );
              if( old ) { el.removeChild( old ); }

              $(el).removeClass('tt-empty');
            
              if ( !el.hasChildNodes() ) {
                classie.add( el, 'tt-empty' );
                $(el).addClass('tt-empty' );
              };
            } );

            $(grid).removeClass('tt-effect-active' );
            isAnimating = false;
          };
          if( support ) {
            onAnimationEnd( items, items.length, onEndAnimFn );
          }
          else {
            onEndAnimFn.call();
          }

        }, 25 );
      }
    }

    function setCurrentNav(page) {
      if(options.showNav) {
        $nav.find('a').removeClass('tt-current');
        $nav.find('a').eq(page-1).addClass('tt-current');
      }
    }

    //end private

    var _defaults = {
      paginate: 6, 
      pageChangeCallback: function(curPage, totalPages) {
        console.log(curPage + " of " + totalPages);
      },

      initAjaxCall: false,
      showNav: true,
    }

    var options = $.extend(_defaults, options);
    var imagesData = {};
    $this = $(this);
    $nav = $this.next('nav')
    
    function init() {

      if($this.data('plugin_thumbGrid') === undefined) {

        $this.data('curPage',1);
        $this.data('plugin_thumbGrid', true);
        isAnimating = false,

        originalImages = $this.find('li');

        tempArray = [];

        originalImages.each(function(i){
          tempArray.push(this.innerHTML);
        });

        imagesData = {
          total: $this.find('li').length,
          imagesArray: tempArray.chunk(options.paginate)
        }

        remove = originalImages.slice(options.paginate - 1, originalImages.length -1);
        $(remove).remove();

        items = [].slice.call( grid.querySelectorAll( 'li' ) );

        if(options.showNav) {
          //create dinamic nac 
          for(var i = 0; i < imagesData.imagesArray.length; i++) {
            a = $("<a>");
            $nav.append(a);
          }

          $nav.find('a').each(function(i) {
            $(this).on(eventtype, function(ev) {
              if( isAnimating || $this.data('curPage') === (i+1) ) return false;
              ev.preventDefault();
              publicMethods.goTo(i+1)  
            })
          })
          setCurrentNav($this.data('curPage'));
        }
        
      } 
    }
    
    init();

    var publicMethods  = {
      next: function() {
        _page = $this.data('curPage') + 1;
        this.goTo(_page);
      },
      previous: function()  {
        _page = $this.data('curPage') - 1;
        this.goTo(_page);
      },
      goTo: function(page) {
        if(!isAnimating) {
          setCurrentNav(page)
          isAnimating = true
          $this.data('curPage', page )
          setImages(imagesData.imagesArray[page-1]);
          options.pageChangeCallback($this.data('curPage'), imagesData.imagesArray.length)
        }
      }
    }

    return publicMethods;
  }
})(jQuery);