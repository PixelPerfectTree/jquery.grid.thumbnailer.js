(function($) {
  
  var pluginName = "thumbnailer";
    
  $.fn[pluginName] = function(options) {
    var args = arguments;
    
    // Defaults options
    var defaults = {
      paginate: 6, 
      pageChangeCallback: function(curPage, totalPages) {
        console.log(curPage + " of " + totalPages);
      },
      onPaginationStart: $.noop,
      onPaginationEnd: $.noop,
      initAjaxCall: false,
      showNav: true,
      showNavNumbers: false
    }

    var methods = {

      _init: function() {

        //init values

        this.$nav = this.$el.next('nav');
        this.currentPage = 1;
        this.isAnimating = false;
        this.originalImages = this.$el.find('li').clone();
        this.imagesData = {};
        this.items = [];

        this._buildImagesArray();
        this._buildList();
        this._buildNav();

      },

      //Public

      next: function() {
        _page = this.currentPage + 1;
        this.goTo(_page);
      },

      previous: function()  {
        _page = this.currentPage - 1;
        this.goTo(_page);
      },

      goTo: function(page) {
        if(!this.isAnimating && page <= this.imagesData.imagesArray.length) {
          this._setCurrentNav(page);
          this.currentPage = page;
          this.isAnimating = true;
          this._setImages(this.imagesData.imagesArray[page-1]);
          this.options.pageChangeCallback(this.currentPage, this.imagesData.imagesArray.length)
        }
      },
      setPagination: function(page) {
        this.options.paginate = page;
        this._buildImagesArray();
        this._buildList();
        this._buildNav();
      },

      addItem: function(item) {
        this.originalImages.push($(item)[0])
        this._buildImagesArray();
        this._buildList();
        this._buildNav();
      },

      removeItemInCurrentPage: function(index) {
        var finalIndex = (index + ((this.currentPage * this.options.paginate) - this.options.paginate)) - 1
        this.originalImages.splice(finalIndex, 1);
        this._buildImagesArray();
        this._buildList();
        this._buildNav();
      },

      update: function() {
        _super = this;
        if(this.$el.find('li').length > this.options.paginate) {
          var newItems = [].slice.call(this.el.querySelectorAll('li'), this.options.paginate, this.$el.find('li').length )
          
          newItems.forEach(function( el ) {
            _super.originalImages.push(el)
          });

          this._buildImagesArray();
          this._buildList();
          this._buildNav();
        }
      },

      //Privates

      /* 
        Build imageData object with originalImages 
        imageArray property is an array with paginated content
      */

      _buildImagesArray: function() {
        var tempArray = [];

        this.originalImages.each(function(i){
          tempArray.push(this.innerHTML);
        });

        this.imagesData = {
          total: this.originalImages.length,
          imagesArray: tempArray.chunk(this.options.paginate)
        }
      },


      /*
        Build options.paginate's lis for the grid with imagesArray
        Get the images for the current page and insert them.
      */

      _buildList: function() {
        _super = this;
        
        this.$el.find('li').remove();

        // if new imageArray length is less than cureent page, set the currentPage the last page
        if(this.currentPage > this.imagesData.imagesArray.length) {
          this.currentPage = this.imagesData.imagesArray.length; 
        }

        // Get currentPage images
        var images = this.imagesData.imagesArray[this.currentPage - 1] || [];
        
        // Create new empty li's 
        for(var i = 0; i < this.options.paginate; i++)
          _super.$el.append("<li class='tt-empty'>"); 

        // Insert the image in ther respective li and replace tt-empty to tt-visible
        $.each(images, function(key, value) {
          if(value !== undefined) {
            _super.$el.find('li')[key].innerHTML = value;
            $(_super.$el.find('li')[key]).removeClass('tt-empty').addClass('tt-visible');
          }
        })

        this.items = [].slice.call( this.el.querySelectorAll( 'li' ) );

        //hide empty li's for good navigation look
        $('.tt-empty').hide();
      },

      /*
        Build navigation dots with imagesData object
      */

      _buildNav: function() {
        _super = this;
        this.$nav.find('a').remove();

        if(this.options.showNav) {
          //create dinamic nac 
          for(var i = 0; i < this.imagesData.imagesArray.length; i++) {
            if (this.options.showNavNumbers == true) {
              a = $("<a>").html(i + 1);
            } else {
              a = $("<a>");
            }
            this.$nav.append(a);
          }

          this.$nav.find('a').each(function(i) {
            $(this).on(eventtype, function(ev) {
              if( _super.isAnimating || _super.currentPage === (i+1) ) return false;
              ev.preventDefault();
              _super.goTo(i+1)  
            })
          })

          this._setCurrentNav(this.currentPage);
        }
      },

      /*
        Change nav dot current page
      */

      _setCurrentNav: function(page) {
        if(this.options.showNav) {
          this.$nav.find('a').removeClass('tt-current');
          this.$nav.find('a').eq(page-1).addClass('tt-current');
        }
      },

      _setImages: function(newImages) {
        _super = this;

        // show empty lis for good animation event trigger
        $('.tt-empty').show();

        if(Array.isArray(newImages) && newImages != [] ) {
          this.options.onPaginationStart();

          this.$el.children('li').children().addClass('tt-old')

          setTimeout( function() {
            
            // append new elements
            [].forEach.call( newImages, function( el, i ) { 
              _super.items[ i ].innerHTML += el; 
              $(_super.items[ i ]).addClass('tt-visible');
            } );

            _super.$el.addClass("tt-effect-active");
            
            var onEndAnimFn = function() {
              // remove old elements
              _super.items.forEach( function( el ) {
              
                var old = el.querySelector( '.tt-old' );
                if( old ) { el.removeChild( old ); }

                $(el).removeClass('tt-empty');
              
                if ( $(el).children().length == 0 ) {
                  $(el).addClass('tt-empty' );
                };
              } );

              _super.$el.removeClass('tt-effect-active');
              _super.isAnimating = false;
              $('.tt-empty').hide();
              _super.options.onPaginationEnd();
            };

            if( support ) {
              onAnimationEnd( _super.items, _super.items.length, onEndAnimFn );
            }
            else {
              onEndAnimFn.call();
            }

          }, 25 );
        }
      }
    }


    var ret;

    function Plugin (elem, options) {
      this.options = options;
      this.el = elem;
      this.$el = $(elem);
    
      this._init.call(this);
    }

    Plugin.prototype._init = $.noop;

    $.extend(Plugin.prototype, methods)
    this.each(function() {
        if(options && typeof(options) == "string")
          if($(this).data(pluginName)) 
            if($(this).data(pluginName)[options]) {
              ret = $(this).data(pluginName)[options].apply($(this).data(pluginName), [].slice.call(args, 1))
            }

        if(!$(this).data(pluginName)) { 
          options = $.extend({}, defaults, $.fn[pluginName].defaults, options)
          $(this).data(pluginName, new Plugin(this, options)) 
        }
    });

    return (ret === undefined) ? this : ret;

  } 

  //Global defaults
  $.fn[pluginName].defaults = {}


})(jQuery)
