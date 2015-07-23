// script.js
// 2015-7-22
// low browser does not support certain features

;(function() {

  function $(selector, elem) {
    elem = elem || document
    var el = elem.querySelectorAll(selector)
    return el.length > 1 ? el : el[0]
  }

  function isTouch() {
    return 'ontouchstart' in document
  }

  function setProp(el, obj) {
    var prefix = ['webkit', 'Webkit', 'Moz', 'ms', 'O']
    obj = obj || {}
    for(var prop in obj) {
      if(el.style[prop] !== undefined) {
        el.style[prop] = obj[prop]
      }
      else {
        for(var i = 0; i < prefix.length; i++) {
          var p = prefix[i]
          if(el.style[p + prop] !== undefined) {
            prop = prop[0].toUpperCase() + prop.substring(1)
            for(var prop in obj) {
              el.style[p + prop] = ob[prop]
              break
            }
          }
        }
      }
    }
  }

  function slideShow(options) {
    if(!(this instanceof slideShow)) {
      return new slideShow(options)
    }
    this.el = $(options.el || '#slide')
    this.child = $(options.selector)
    this.index = options.index || 0
    this.isMoving = false
    this.timediff = this.timediff || 1000
    this.diffX = this.diffY = null
    this.pageX = this.pageY = this.pos = 0
    this.constructor = slideShow
    this.init(options)
  }

  slideShow.prototype.setup = function(options) {
    var viewport = this.child[0].parentNode
    var div = document.createElement('div')
    var child = this.child
    div.className = 'slide-nav'
    for(var i = 0; i < child.length; i++) {
      if(options.hasNav) {
        var span = document.createElement('span')
        span.innerHTML = i + 1
        div.appendChild(span)
        this.el.appendChild(div)
      }
      setProp(this.child[i], {
        width: this.el.offsetWidth + 'px'
      })
    }
    setProp(viewport, {
      position: 'relative',
      left: 0,
      overflow: 'hidden',
      width: this.child.length * this.child[0].offsetWidth + 'px'
    })
    var span = $('.slide-nav span')
    if(span && span.length) {
      span[this.index].className = 'active'
    }
  }

  slideShow.prototype.start = function(e) {
    var viewport = this.child[0].parentNode

    if(!isTouch()) {
      e.preventDefault()
    }
    if(isTouch()) {
      var touches = e.touches[0]
      this.pageX = touches.pageX
      this.pageY = touches.pageY
    }
    else {
      this.pageX = e.pageX
      this.pageY = e.pageY
    }
    if(!this.isMoving) {
      this.isMoving = true
      this.pos = parseInt(viewport.style.left)
      this.startTime = Date.now()
    }

  }

  slideShow.prototype.move = function(e) {
    var viewport = this.child[0].parentNode
    if(isTouch()) {
      var touches = e.touches
      if(touches.length === 1) {
        var touch = touches[0]
        this.diffX = touch.pageX - this.pageX
        this.diffY = touch.pageY - this.pageY
      }

    }
    else {
      this.diffX = e.pageX - this.pageX
      this.diffY = e.pageY - this.pageY
    }
    if(this.isMoving) {
      if(Math.abs(this.diffX) >= Math.abs(this.diffY)) {
        e.preventDefault()
        setProp(viewport, {
          left: this.pos + this.diffX + 'px'
        })
      }
    }
  }

  slideShow.prototype.end = function(e) {
    this.endTime = Date.now()
    var viewport = this.child[0].parentNode
    if(this.isMoving && Math.abs(this.diffX) >= Math.abs(this.diffY)) {
      e.preventDefault()
      var diffTime = this.endTime - this.startTime <= this.timediff
      if(this.diffX >= this.el.offsetWidth / 2 ||
        (this.diffX > 10 && diffTime)) {
        this.diffX = null
        this.index = Math.max(0, this.index -= 1)
      }

      else if(Math.abs(this.diffX) >= this.el.offsetWidth / 2 ||
        (Math.abs(this.diffX) > 10 && diffTime)) {
        this.diffX = null
        this.index = Math.min(this.index += 1, this.child.length - 1)
      }
      this.isMoving = false
    }

    setProp(viewport, {
      left: '-' + this.index * this.child[0].offsetWidth + 'px',
      transition: 'left .3s linear'
    })

  }

  slideShow.prototype.transitionEnd = function(options) {
    var viewport = this.child[0].parentNode
    setProp(viewport, {
      transition: 'none'
    })
    var span = $('.slide-nav span')
    if(span && span.length) {
      for(var i = 0; i < span.length; i++) {
        span[i].className = ''
      }
      span[this.index].className = 'active'
    }

  }

  slideShow.prototype.onResize = function() {
    var viewport = this.child[0].parentNode
    var child = this.child
    for(var i = 0; i < child.length; i++) {
      var childs = this.child[i]
      setProp(childs, {
        width: this.el.offsetWidth + 'px'
      })
    }
    setProp(viewport, {
      left: '-' + this.index * child[0].offsetWidth + 'px',
      width: child.length * child[0].offsetWidth + 'px'
    })
  }

  slideShow.prototype.init = function(options) {
    this.setup(options)
    if(!!window.addEventListener) {
      this.el.addEventListener('mousedown', this.start.bind(this), false)
      this.el.addEventListener('touchstart', this.start.bind(this), false)
      this.el.addEventListener('webkitTransitionEnd', this.transitionEnd.bind(this), false)
      this.el.addEventListener('transitionend', this.transitionEnd.bind(this), false)
      document.addEventListener('mousemove', this.move.bind(this), false)
      document.addEventListener('mouseup', this.end.bind(this), false)
      document.addEventListener('touchmove', this.move.bind(this), false)
      document.addEventListener('touchend', this.end.bind(this), false)
      window.addEventListener('resize', this.onResize.bind(this), false)
    }
    else {
      this.el.onmousedown = this.el.ontouchstart = this.start.bind(this)
      document.onmousemove = document.ontouchmove = this.move.bind(this)
      document.onmouseup = document.ontouchend = this.end.bind(this)
      window.onresize = this.onResize.bind(this)
    }

  }

  window.slideShow = slideShow

})()
