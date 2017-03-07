// Ipij API (c) Copyright 2012, designed by B.Mazin & G.Tartavel

/*
 * TODO :
 * - ImageJS.Ch (= || +=) ImageJS.channels, ImageJS.C (= || +=) ImageJS.crop ...
 *
 * - la fonction crop doit permettre de prendre une sous image avec un objet de type
 *   soit {x: 10, y:10, width:100, height:100} soit {x1: 10, y1:10, x2:100, y2:100}.
 *
 * - creer une fonction 'select' de type '.select([x1, dx, x2], [y1, dy, y2])' ou
 *   '.select([x1, x2], [y1, y2])' qui selectionne une sous partie de l'image
 *   voir fusion éventuel avec crop
 *
 * - getChannels est peut-être inutile est doit pouvoir être fait directement dans .Ch_
 *
 * - filter1d faire 3 boucles 2 pour traiter les bords séparement en fonction des
 *   conditons limites et une pour le traitement principal.
 */

/**
 * @fileOverview ImageJS class definition and basic functions.
 * @author TM = Tartavel & Mazin
 * @version 1.0
 */

/**
 * Create a new image.
 * @class
 *  ImageJS is a JavaScript generic image class. <br />
 *  It is designed to work with floating point precision,
 *  instead of the 0-255 integer of canvas' pixels.
 * @param {int|ImageJS} [arg1 = 0]
 *  a. The width of the new image.<br />
 *  b. An image to copy.
 * @param {int|String} [argBis]
 *  a. Height of the new image.<br />
 *  b. Type of copy: 'copy' (verbatim copy), 'extract' (extract the view)
 *     or 'view' (same data)
 * @param {int} [nchannels = 1]
 *  Number of channels of the image.
 * @param {Object} [optArgs]
 *  An object with specific fields.<br />
 *  - 'dataType': type of the data array, e.g. Float64Array.<br />.
 *  - 'noData': if defined and true, don't create any data array.<br />
 *  - 'c': store channels consecutively for a given
 * @return {ImageJS}
 *  The created image.
 * @example
 *  // Create an empty image:
 *  var im = new ImageJS ();
 *  // Create an empty 256x256 image with one channel:
 *  var im = new ImageJS (256, 256);
 *  // Create a copy of 'imageSrc' and its view:
 *  var im = new ImageJS (imageSrc, 'copy');
 *  // Create an image using an transposed Imterator:
 *  var im = new ImageJS (imageSrc.T(), 'extract');
 */
function ImageJS(arg1, argBis, nchannels, optArgs) {
    'use strict';
    var errMsg = this.constructor.name + ': ';

    // Check arguments
    nchannels = (nchannels === undefined) ? 1 : nchannels;
    if (typeof nchannels !== 'number') {
        throw new Error(errMsg + "optional argument 'nchannels' must be a number");
    }
    if (optArgs === undefined) {
        optArgs = {};
    } else if (optArgs.dataType !== undefined && typeof optArgs.dataType !== 'function') {
        throw new Error(errMsg + 'optArgs.dataType must be an Array constructor');
    }

    if (arg1 instanceof ImageJS) {
        // Copy constructor
        var errBis = "if arg1 is an ImageJS, argBis must be 'copy', 'extract' or 'view'";
        if (typeof argBis !== 'string') {
            throw new Error(errMsg + errBis);
        }
        argBis = argBis.toLowerString();
        if (argBis === 'extract') {
            this.init(arg1.width, arg1.height, arg1.nchannels, optArgs);
            arg1.exportImage(this);
        } else if (argBis === 'copy') {
            arg1.getCopy(this);
        } else if (argBis === 'view') {
            arg1.getView(this);
        } else {
            throw new Error(errMsg + errBis);
        }
    } else if (typeof arg1 === 'number') {
        // Create a zero image
        if (typeof argBis === 'number') {
            this.init(arg1, argBis, nchannels, optArgs);
        } else {
            throw new Error(errMsg + "argBis must be a number if arg is a number");
        }
    } else if (arg1 === undefined) {
        this.init(0, 0, nchannels, optArgs);
    } else {
        // Arguments are non consistent
        throw new Error(errMsg + "first argument can't be of type " + typeof arg1);
    }
}

/** Private<br />Regexp parsing channel strings. */
ImageJS.prototype.channelsRegExp = '^(0?)(1?)(2?)(3?)(4?)(5?)(6?)(7?)(8?)(9?)$';

/** Private<br />Default channels string. */
ImageJS.prototype.defaultChannels = '0123456789';

/* Default data type. */
ImageJS.prototype.dataType = Float64Array;

/** Read only<br />For a given pixel, are the channels stored consecutively? */
ImageJS.prototype.groupChannels = false;

/** Private<br />A HTML canvas, used as a buffer. */
ImageJS.workingCanvas = undefined;


/* ********** PIXEL INDEXING *************** */

/** Conversion to linear indexes.<br />
 * Return the linear index for pixel (x,y) in the c-th channel of the view.<br />
 *  <strong>WARNING</strong>: using this function is slow!<br />
 *  <p>Looping through a view 'im' is equivalent to consider
 *  all 'i0[c] + x*dx + y*dy' with:
 *  <ul>
 *      <li>i0 = im.getI0() and c in 0 .. i0.length-1</li>
 *      <li>dy = im.getDy() and y in 0 .. im.ny-1</li>
 *      <li>dx = im.getDx() and x in 0 .. im.nx-1</li>
 *  </ul>
 * @param {int} x
 *  X coordinate of the pixel.
 * @param {int} y
 *  Y coordinate of the pixel.
 * @param {int} c
 *  Channel of the pixel, from 0 to #(selected channels)-1.
 * @return {int}
 *  Linear index of the pixel in the image data array.
 * @example
 *  // Turn all pixel to 0:
 *  var I0 = this.getI0();     // Channel first indexes
 *  var dx = this.getDx();     // X increment
 *  var dy = this.getDy();     // Y increment
 *  for (var c=0; c&lt;I0.length; c++)         // for each channel
 *      for (var y=0; y&lt;this.ny; y++)       // for each row
 *          for (var x=0; x&lt;this.nx; x++)   // for each pixel of the row
 *              this.data[I0[c] + x*dx + y*dy] = 0;
 *
 *  // The same, but faster:
 *  var d  = this.data, I0 = this.getI0();
 *  var nx = this.nx,   dx = this.getDx();
 *  var ny = this.ny,   dy = this.getDy();
 *  for (var c=0; c&lt;I0.length; c++)
 *      for (var y=0, iy=I0[c]; y&lt;ny; y++, iy+=dy)
 *          for (var x=0, ix=iy; x&lt;nx; x++, ix+=dx)
 *              d[ix] = 0;
 */
ImageJS.prototype.at = function (x, y, c) {
    'use strict';
    // index = (W*H|1)*I0[c] + (X0+x*DX)*TX*(1|NC) + (Y0+y*DY)*TY*(1|NC)
    return this.getI0()[c] + x * this.getDx() + y * this.getDy();
};

/** Linear indexes offset.
 * @see ImageJS#at
 * @return {int[]}
 *  Linear indexes offset of each channel of the view.
 */
ImageJS.prototype.getI0 = function () {
    'use strict';
    var c = this.getChannels(this.chan);
    var i0 = [];
    var dc = (this.groupChannels) ? this.nchannels : 1;
    var dN = (this.groupChannels) ? 1 : this.width * this.height;
    var xy0 = this.x0 * this.tx + this.y0 * this.ty;
    var i;
    for (i = 0; i < c.length; i++) {
        if (c[i]) {
            i0.push(xy0 * dc + i * dN);
        }
    }
    return i0;
};

/** X increment for linear index.
 * @see ImageJS#at
 * @return {int}
 *  The X increment in linear indexing.
 */
ImageJS.prototype.getDx = function () {
    'use strict';
    var dc = (this.groupChannels) ? this.nchannels : 1;
    return this.dx * this.tx * dc;
};

/** Y increment for linear index.
 * @see ImageJS#at
 * @return {int}
 *  The Y increment in linear indexing.
 */
ImageJS.prototype.getDy = function () {
    'use strict';
    var dc = (this.groupChannels) ? this.nchannels : 1;
    return this.dy * this.ty * dc;
};

/** Get selected channels as a boolean array.
 * @private
 * @return {boolean[]}
 *  The i-th value is true if the i-th channel is selected.
 */
ImageJS.prototype.getChannels = function () {
    'use strict';
    var k;
    var errMsg = this.constructor.name + '.getChannels: ';
    var errMsgFull = errMsg + "invalid channels identifier '" + this.chan + "'";

    // Apply the regexp
    var reg = this.chan.match(this.channelsRegExp);
    if (!reg || !reg[0]) {
        throw new Error(errMsgFull);
    }

    // Extract
    var c = [];
    for (k = 0; k < this.nchannels; k++) {
        c[k] = (reg[k + 1]) ? true : false;
    }

    // Check
    for (k = this.nchannels + 1; k < reg.length; k++) {
        if (reg[k]) {
            throw new Error(errMsgFull);
        }
    }

    return c;
};


/* ********** IMAGE CREATION *************** */

/** Initialize the data structure.
 * @private
 * @param {int} width
 * @param {int} height
 * @param {int} nchannels
 * @param {Object} args
 *  The same as 'optArgs' in the constructor.
 * @return {ImageJS} this
 */
ImageJS.prototype.init = function (width, height, nchannels, args) {
    'use strict';

    // Image size
    /** Read only<br />Width of the image */
    this.width = width;
    /** Read only<br />Height of the image */
    this.height = height;
    /** Read only<br />Number of channels of the image */
    this.nchannels = nchannels;

    // Image data
    delete this.dataType;
    if (args && args.dataType) {
    /** Read only<br />Image data type, e.g. Float64Array. */
        this.dataType = args.dataType;
    }
    if (this.data) {
        delete this.data;
    }
    /** Read only<br />Image data array */
    if (!args || !args.noData) {
        this.data = new this.dataType(nchannels * width * height);
    }

    // Other parameters
    delete this.groupChannels;
    if (args && args.storage && args.storage.toLowerCase() === 'c') {
        this.groupChannels = true;
    }

    // Restore image view
    this.I();
    return this;
};

/** Initialize the image view to the full image.
 * @return {ImageJS}
 *  this
 * @example
 *  var thumb = im.C(50).S(5);  // crop & subsample the view
 *  thumb.draw('canvasId');     // display this thumbnail
 */
ImageJS.prototype.I = function () {
    'use strict';

    /** Public<br />Width of the view: X indice goes from 0 to nx-1
     * @see ImageJS#C */
    this.nx = this.width;
    /** Public<br />Height of the view: Y indice goes from 0 to ny-1
     * @see ImageJS#C */
    this.ny = this.height;

    /** Public<br />X offset of the view: x=0 actually refers to x0
     * @see ImageJS#C */
    this.x0 = 0;
    /** Public<br />Y offset of the view: y=0 actually refers to y0
     * @see ImageJS#C */
    this.y0 = 0;

    /** Public<br />X subsampling of the view: x++ actually moves from dx pixels
     * @see ImageJS#S */
    this.dx = 1;
    /** Public<br />Y subsampling of the view: y++ actually moves from dy pixels
     * @see ImageJS#S */
    this.dy = 1;

    /** Private
     * @see ImageJS.T */
    this.tx = 1;
    /** Private
     * @see ImageJS.T */
    this.ty = this.width;

    this.Ch_();

    return this;
};

/** Initialize an output image of size (nx, ny, nchannels).
 * @private
 * @param {ImageJS|String} [output]
 *  The 'output' argument to be initialized. Can be the string 'this'.
 * @param {boolean} [checkOnly = false]
 *  If true, don't create any output. Return true if it already exist.
 * @return {ImageJS|boolean}
 *  The 'output' argument, initialized.
 * @throws {Error}
 *  If 'output' exists and has invalid dimensions.
 */
ImageJS.prototype.initOutput = function (output, checkOnly) {
    'use strict';
    var errMsg = this.constructor.name + '.initOutput: ';
    if (output === 'this') {
        output = this;
    }
    if (output === undefined && !checkOnly) {
        output = this.getNew();
    } else if (!(output instanceof ImageJS)) {
        throw new Error(errMsg + 'output must be an ImageJS');
    } else if (this.nx !== output.nx || this.ny !== output.ny || this.chan.length !== output.chan.length) {
        throw new Error(errMsg + 'the shape (nx, ny, nc) of the output must be the same!');
    }
    return (!checkOnly) ? output : (output !== undefined);
};

/** Return a new image of the same type. <br />
 * If no argument is specified, the size is the same.
 * @see ImageJS#getCopy
 * @see ImageJS#getView
 * @see ImageJS#exportImage
 * @param {int} [width]
 *  Width of the new image.
 * @param {int} [height]
 *  Height of the new image.
 * @param {Object} [args]
 *  Image parameters, see the constructor.
 * @return {ImageJS}
 *  The new image, filled with zeros.
 */
ImageJS.prototype.getNew = function (width, height, args) {
    'use strict';
    var errMsg = this.constructor.name + '.getNew: ';
    if (!args) {
        args = {};
    }
    if (!args.dataType) {
        args.dataType = this.dataType;
    }

    if (width === undefined) {
        width = this.nx;
        height = this.ny;
    } else if (typeof width !== 'number') {
        throw new Error(errMsg + "invalid type for 'width'");
    } else if (height === undefined) {
        throw new Error(errMsg + "you can't specify 'width' without 'height'");
    } else if (typeof height !== 'number') {
        throw new Error(errMsg + "invalid type for 'height')");
    }

    var output;
    if (this.constructor === ImageJS.prototype.constructor) {
        output = new ImageJS(width, height, this.nchannels, args);
    } else {
        output = new this.constructor(width, height, args);
    }
    output.Ch_(this.chan);
    return output;
};

/** Return a verbatim copy of the image and it's view.
 * @see ImageJS#getView
 * @see ImageJS#exportImage
 * @see ImageJS#getNew
 * @return {ImageJS}
 *  A verbatim copy of this.
 * @example
 *  // Create a copy of im.
 *  var imNew = im.getCopy();
 *  // Get the channels 0 and 1 (nchannels will be im.nchannels).
 *  var imNew = im.Ch('01').getCopy();
 *  // Get the channels 0 and 1 (nchannels will be 2).
 *  var imNew = im.Ch('01').getCopy(2);
 *  // Get 3 times the channel 0 (nchannels will be 3).
 *  var imNew = im.Ch('0').getCopy(3);
 */
ImageJS.prototype.getCopy = function (output) {
    'use strict';
    var errMsg = this.constructor.name + '.getCopy: ';
    if (output !== undefined && !(output instanceof ImageJS)) {
        throw new Error(errMsg + 'output must be an ImageJS');
    }
    output = this.getView(output);
    if (output.data) {
        delete output.data;
    }
    output.data = new this.dataType(this.data);
    return output;
};

/** Return another view of this image.<br />
 *  The underlying image is the <em>same</em>.
 * @see ImageJS#getCopy
 * @see ImageJS#exportImage
 * @return {ImageJS}
 *  Another view of the same image.
 */
ImageJS.prototype.getView = function (output) {
    'use strict';
    var errMsg = this.constructor.name + '.getView: ';
    if (output === undefined) {
        output = new this.constructor();
    } else if (!(output instanceof ImageJS)) {
        throw new Error(errMsg + 'output must be an ImageJS');
    }

    output.width = this.width;
    output.height = this.height;
    output.nchannels = this.nchannels;
    output.x0 = this.x0;
    output.y0 = this.y0;
    output.dx = this.dx;
    output.dy = this.dy;
    output.nx = this.nx;
    output.ny = this.ny;
    output.tx = this.tx;
    output.ty = this.ty;
    output.chan = this.chan;

    output.dataType = this.dataType;
    output.groupChannels = this.groupChannels;
    output.data = this.data;
    return output;
};

/** Extract and return a copy of the view.<br />
 *  The new image width is (nx, ny).
 *  Copy can be channel-to-channel or one-to-all.
 * @see ImageJS#getCopy
 * @see ImageJS#getView
 * @param {int|ImageJS} [output]
 *  - Can be the output ImageJS.<br />
 *  - Can be the number of channels (see example).
 * @param {float} [factor=1]
 *  Multiplicative factor.
 * @return {ImageJS}
 *  The output copy.
 * @example
 *  // share the same data as 'im'
 *  imRot = im.R(1);
 *
 *  // Extract the view to DUPLICATE the data:
 *  newIm = imRot.exportImage();
 *
 *  // We can now modify 'newIm' and let 'im' unchanged:
 *  newIm.fill(1);
 */
ImageJS.prototype.exportImage = function (output, factor) {
    'use strict';
    var nc = this.chan.length;

    // Deal with arguments
    var errMsg = this.constructor.name + '.exportImage: ';
    if (factor === undefined) {
        factor = 1;
    } else if (typeof factor !== 'number') {
        throw new Error(errMsg + "the factor must be a number");
    }
    if (output === undefined) {
        output = this.getNew();
    } else if (output instanceof ImageJS) {
        if (output.nx !== this.nx || output.ny !== this.ny) {
            throw new Error(errMsg + "the output image must have the same 'nx' and 'ny'");
        }
        if (nc !== 1 && nc !== output.chan.length) {
            throw new Error(errMsg + "when copying several channels, "
                    + "the number of channels must not change");
        }
    } else if (typeof output === 'number') {
        if (nc !== 1 && nc !== output && this.nchannels !== output) {
            throw new Error(errMsg + "when copying several channels, "
                    + "the number of channels must not change");
        }
        output = this.getNew();
        if (this.nchannels === output) {
            output.I_();
        }
    } else {
        throw new Error(errMsg + 'invalid argument');
    }

    // Get parameters
    var iI0 = this.getI0(), oI0 = output.getI0();
    var iDx = this.getDx(), oDx = output.getDx();
    var iDy = this.getDy(), oDy = output.getDy();
    var idata = this.data,  odata = output.data;
    var nx = this.nx,        ny = this.ny;

    // Copy everything
    var c, y, x;
    var oy_, iy_, ox_, ix_;
    for (c = 0; c < iI0.length || c < oI0.length; c++) {
        var iI0c = (iI0.length === 1) ? iI0[0] : iI0[c];
        var oI0c = oI0[c];
        for (y = 0, oy_ = oI0c, iy_ = iI0c; y < ny; y++, oy_ += oDy, iy_ += iDy) {
            for (x = 0, ox_ = oy_, ix_ = iy_; x < nx; x++, ox_ += oDx, ix_ += iDx) {
                odata[ox_] = factor * idata[ix_];
            }
        }
    }

    // The end
    return output;
};


/* ********** I/O FUNCTIONS *************** */

/** String to describe the picture.
 * @return {String}
 *  Description of the image.
 * @example
 *  // Create an empty 256x256 image:
 *  var im = new ImageJS(256, 256);
 *  // Implicit call to 'toString':
 *  alert(im); // '256x256px ImageJS' will be displayed
 */
ImageJS.prototype.toString = function () {
    'use strict';
    return this.width + 'x' + this.height + 'px ' + this.constructor.name;
};

/** Load an image.<br />
 *  The image can be an URL, a 'canvas' HTML element (or its HTML ID).
 *  If it is an URL, the callback function is called when the loading is over.
 * @see ImageJS#draw
 * @see ImageJS#open
 * @param {String|CanvasElement} source
 *  URL of the image, or a canvas, or a canvas ID.
 * @param {function} [callback]
 *  Callback function. Will be called with the loaded image as only argument.<br />
 *  Not necessary when loading from a canvas.
 * @param {function} [errCallback]
 *  Error callback function. Will be called with two argument:<br />
 *  - a boolean 'isLoaded' telling when the error occured (loading or access to pixels).<br />
 *  - an Event on image loading error (when 'isLoaded' is false),
 *    or a DOM Exception on error while accessing pixels themselves (when 'isLoaded' is true).<br />
 *  Default cause a dialog error and throw the Event/Exception.
 * @return {ImageJS}
 *  this
 * @example
 *  // Create a callback fontion:
 *  var loadFcn = function (image) {
 *      alert('The image is loaded!\n' + image.toString());
 *  };
 *
 *  // If error, display it:
 *  var errFcn = function (isLoaded, e) {
 *      var when = (isLoaded) ? 'pixel access' : 'loading';
 *      alert('Error while ' + when + ': ' + e.toString());
 *  };
 *
 *  // Create an empty image and load from an URL:
 *  im = new ImageJS();
 *  im.load("papillon.jpg", loadFcn, errFcn);
 */
ImageJS.prototype.load = function (source, callback, errCallback) {
    'use strict';
    var errMsg = this.constructor.name + '.load: ';
    // If source is a canvas
    if (typeof source === 'string' && document.getElementById(source)) {
        source = document.getElementById(source);
    }

    // Error callback function
    if (errCallback === undefined) {
        errCallback = function (isLoaded, e) {
            var msgEnd = (isLoaded) ? 'pixel access' : 'loading';
            alert('Error while ' + msgEnd);
            throw e;
        };
    }

    // Get Image data from Canvas
    if (source instanceof HTMLCanvasElement) {
        var imageData;
        var ctx = source.getContext('2d');
        try {
            imageData = ctx.getImageData(0, 0, source.width, source.height);
        } catch (osef) {
            try {
                if (window.netscape) {
                    window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                }
                imageData = ctx.getImageData(0, 0, source.width, source.height);
            } catch (e) {
                errCallback.call(this, true, e);
                return this;
            }
        }

        // Copy it with ImageJS representation conversion
        var param = {'storage': 'c', 'noData': true};
        var canvasImage = new ImageJS(source.width, source.height, 4, param);
        this.init(source.width, source.height, 4);
        canvasImage.data = imageData.data;
        canvasImage.exportImage(this, 1 / 255.0);

        // Call the callback function
        if (callback) {
            callback.call(this, this);
        }
        return this;
    }

    // Put image on working canvas
    if (typeof source === 'string') {
        var im = new Image();
        var thisImage = this;
        im.onerror = function (e) {
            errCallback.call(this, false, e);
        };
        im.onload = function () {
            var myCanvas = ImageJS.getWorkingCanvas();
            myCanvas.width = this.width;
            myCanvas.height = this.height;
            myCanvas.getContext('2d').drawImage(this, 0, 0);
            ImageJS.prototype.load.call(thisImage, myCanvas, callback, errCallback);
        };
        im.src = source; // launch loading
        return this;
    }

    if (source instanceof Image) {
        var myCanvas = ImageJS.getWorkingCanvas();
        myCanvas.width = source.width;
        myCanvas.height = source.height;
        myCanvas.getContext('2d').drawImage(source, 0, 0);
        this.load(myCanvas, callback, errCallback);
        return this;
    }
    throw new Error(errMsg + 'invalid source argument');
};

/** Draw an image in a canvas.
 * @see ImageJS#open
 * @see ImageJS#load
 * @param {String|CanvasElement} canvas
 *  Out canvas or its HTML ID.
 * @param {float} [scale=1]
 * - If scale &gt; 1, image will be zommed.<br />.
 * - If scale &lt; 1, image will be reduced.<br />.
 * - If 'CANVAS_DIM', image will fit the canvas (warning: image ratio isn't preserved).<br />.
 * - If 'CANVAS_WIDHT' (resp. 'CANVAS_HEIGHT'), image will fit the
 *      canvas' width (resp. height), preserving image ratio.<br />.
 * - If 'CANVAS_OR_LESS' (resp. 'CANVAS_OR_MORE'), image will be thebiggest one
 *      included in (resp. the smallest one containing) the canvas, preserving image ratio.
 * @return {number}
 *  Scale of the display.
 * @example
 *  // Declare a callback function to draw an image
 *  var loadedFct = function (image) {
 *      // Draw the image on a canvas at its original dimensions
 *      var canvas = document.getElementById('canvasId');
 *      image.draw(canvas);
 *      // Or with 'canvasId' as parameter and fits the canvas' size
 *      image.draw('canvasId', 'CANVAS_DIM');
 *  };

 *  // Load an image and draw it in the canvas
 *  var im = new ImageJS().load("papillon.jpg", loadedFct);
 */
ImageJS.prototype.draw = function (canvas, scale) {
    'use strict';
    var errMsg = this.constructor.name + '.draw: ';

    // Optional parameters
    if (typeof canvas === 'string' && document.getElementById(canvas)) {
        canvas = document.getElementById(canvas);
    }
    if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error(errMsg + 'invalid canvas');
    }
    if (scale === undefined) {
        scale = 1;
    } else if (typeof scale === 'string') {
        scale = scale.toUpperCase();
    } else if (typeof scale !== 'number') {
        throw new Error(errMsg + 'scale must be a number or a string');
    }

    // Get working canvas
    var myCanvas = ImageJS.getWorkingCanvas();
    myCanvas.width = this.nx;
    myCanvas.height = this.ny;
    var myCtx = myCanvas.getContext('2d');

    // TODO: tester putImageData vs. draw
    var imageData = this.getImageData();
    myCtx.putImageData(imageData, 0, 0);

    if (scale === 'CANVAS_DIM') {
        canvas.getContext('2d').drawImage(myCanvas,
            0, 0, imageData.width, imageData.height,
            0, 0, canvas.width, canvas.height);
    } else {
        // Compute the scale
        var hScale = canvas.width / this.nx;
        var vScale = canvas.height / this.ny;
        if (typeof scale === 'string') {
            switch (scale) {
            case 'CANVAS_WIDTH':
                scale = hScale;
                break;
            case 'CANVAS_HEIGHT':
                scale = vScale;
                break;
            case 'CANVAS_OR_LESS':
                scale = Math.min(hScale, vScale);
                scale = scale > 1 ? 1 : scale;
                break;
            case 'CANVAS_OR_MORE':
                scale = Math.max(hScale, vScale);
                scale = scale < 1 ? 1 : scale;
                break;
            default:
                throw new Error(errMsg + 'unknown scale parameter "' + scale + '"');
            }
        }
        canvas.width = Math.round(this.nx * scale);
        canvas.height = Math.round(this.ny * scale);

        // Get and draw image data
        myCtx.putImageData(imageData, 0, 0);
        canvas.getContext('2d').drawImage(myCanvas,
                0, 0, imageData.width, imageData.height,
                0, 0, canvas.width, canvas.height);
    }

    return scale;
};

/** Display the image in the browser.
 *  Open it in a new tab (if no argument) or in a new window
 * (if argument is 'popup' or window properties).
 * @see ImageJS#draw, ImageJS#load
 * @param {String} [param]
 *  Parameters of the new window, the same as 'window.open' third argument.
 *  If 'popup', the window size fit the image.
 * @return {window}
 *  Opened window.
 * @example
 *  // Open the image a new tab
 *  im.open();
 *  // Open it in a new window with the right size.
 *  im.open('popup');
 *  // Open it in a custom window
 *  im.open('width=320, height=240, top=250, left=400');
 */
ImageJS.prototype.open = function (param) {
    'use strict';
    var canvas = ImageJS.getWorkingCanvas();
    this.draw(canvas);

    if (param && param.toLowerCase() === 'popup') {
        var left = Math.floor((screen.width - this.width) / 2);
        var top = Math.floor((screen.height - this.height) / 2);
        param = 'dependent:no,menubar:yes,location:no,'
              + 'width=' + this.width + ',height=' + this.height + ','
              + 'left=' + left + ',top=' + (top - 64);
    }

    return window.open(canvas.toDataURL(), undefined, param);
};

/** Get PNG image in base64.
 * @return {string}
 *  Data URL.
 * @example
 *  // Get png image
 *  im.toDataURL();
 */
ImageJS.prototype.toDataURL = function () {
    'use strict';
    var canvas = ImageJS.getWorkingCanvas();
    this.draw(canvas);
    return canvas.toDataURL();
};

/** Return a CanvasPixelArray structure of the image.
 * @return {canvasPixelArray} Canvas' data structure for image pixels
 * @example
 * // Get a 100x100 CanvasPixelArray structure whose top-left corner is (50, 50) in the image
 * var canvasPixelArray = im.getImageData ();
 * // Put it into a canvas at(0,0)
 * var ctx = document.getElementById('canvasId').getContext('2d');
 * ctx.putImageData(canvasPixelArray, 0, 0);
 */
ImageJS.prototype.getImageData = function () {
    'use strict';

    // Temporary canvas
    var myCanvas = ImageJS.getWorkingCanvas();
    myCanvas.width = this.nx;
    myCanvas.height = this.ny;

    // Get image data & fill alpha
    var imageData = myCanvas.getContext('2d').createImageData(this.nx, this.ny);
    var nx = this.nx, ny = this.ny;
    var out = imageData.data;
    var x, y, x_, y_;
    var nx4 = 4 * nx;
    for (y = 0, y_ = 3; y < ny; y++, y_ += nx4) {
        for (x = 0, x_ = y_; x < nx; x++, x_ += 4) {
            out[x_] = 255;
        }
    }

    // Fill image data
    var param = {'storage': 'c', 'noData': true};
    var canvasImage = new ImageJS(this.nx, this.ny, 4, param);
    canvasImage.data = imageData.data;
    switch (this.chan.length) {
	case 1:
        canvasImage.Ch('012');
        this.exportImage(canvasImage, 255.0);
        break;

	case 2:
        canvasImage.Ch('012');
        this.Ch(this.chan[0]).exportImage(canvasImage, 255.0);
        canvasImage.Ch('3');
        this.Ch(this.chan[1]).exportImage(canvasImage, 255.0);
        break;

    case 3:
    case 4:
        canvasImage.Ch(this.chan);
        this.exportImage(canvasImage, 255.0);
        break;

	default:
        break;
    }
    return imageData;
};

/** Return the Working Canvas (a HTML 'canvas' entity).
 * @private
 * @return {HTML Element}
 *  A temporary 'canvas' element.
 */
ImageJS.getWorkingCanvas = function () {
    'use strict';
    if (!ImageJS.workingCanvas) {
        ImageJS.workingCanvas = document.createElement("canvas");
    }
    return ImageJS.workingCanvas;
};


/* ********** IMAGE OPERATORS *************** */

/** Fill the image.
 * @see ImageJS#map
 * @param {float} value
 *  Value to fill the image with.
 * @return {ImageJS}
 *  this
 */
ImageJS.prototype.fill = function (value) {
    'use strict';

    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();

    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                d[x_] = value;
            }
        }
    }
    return this;
};

/** Apply a function to each element.
 * @see ImageJS#operator
 * @see ImageJS#accumulate
 * @see ImageJS#fill
 * @param {function} fcn
 *  Function to be applied. Take at most 3 parameters:<br />
 *  the pixel value t and its coordinates x and y.
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  output
 * @example
 *  // Function adding noise to a value
 *  var addNoise = function (t, x, y) {
 *      return t + Math.random();
 *  };
 *
 *  // Add noise to an image
 *  var noisy = im.map(addNoise);
 *
 *  // Modify the image itself
 *  im.map(addNoise, im);
 */
ImageJS.prototype.map = function (fcn, output) {
    'use strict';
    output = this.initOutput(output);
    var idata = this.data, iI0 = this.getI0();
    var nx = this.nx, idx = this.getDx();
    var ny = this.ny, idy = this.getDy();

    var c, x, y;
    if (output === this) {
        var x_, y_;
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, y_ = iI0[c]; y < ny; y++, y_ += idy) {
                for (x = 0, x_ = y_; x < nx; x++, x_ += idx) {
                    idata[x_] = fcn(idata[x_], x, y);
                }
            }
        }
    } else {
        var odata = output.data,    odx = output.getDx();
        var oI0 = output.getI0(),   ody = output.getDy();
        var ix_, iy_, ox_, oy_;
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += idy, oy_ += ody) {
                for (x = 0, ix_ = iy_, ox_ = oy_; x < nx; x++, ix_ += idx, ox_ += odx) {
                    odata[ox_] = fcn(idata[ix_], x, y);
                }
            }
        }
    }

    return output;
};

/** Apply an element-wise operator.
 * @see ImageJS#map
 * @param {function} op
 *  Operator to be applied. Take 2 parameters: the 2 pixel values
 * @param {ImageJS} im
 *  Second image, same shape (or eventually 1 channel)
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  The output image, obtained by combining 'this' and 'im' with the operator.
 * @example
 *  // Apply a fuzzy mask
 *  var op = function (a, b)
 *      { return a*b; };
 *  var imMasked = im.operator(op, mask);
 */
ImageJS.prototype.operator = function (op, im, output) {
    'use strict';

    // Deal with arguments
    var errMsg = this.constructor.name + '.operator: ';
    if (typeof op !== 'function') {
        throw new Error(errMsg + "the operator must be a function");
    }
    output = this.initOutput(output);
    if (!(im instanceof ImageJS)) {
        throw new Error(errMsg + "second argument must be an ImageJS");
    } else if (im.nx !== this.nx || im.ny !== this.ny) {
        throw new Error(errMsg + "the second image must have the same size");
    } else if (this.chan.length !== im.chan.length && im.chan.length !== 1) {
        throw new Error(errMsg + "the second image must have one or the same number of channels");
    }

    // Get parameters
    var iI0 = this.getI0(), eI0 = im.getI0(), oI0 = output.getI0();
    var iDx = this.getDx(), eDx = im.getDx(), oDx = output.getDx();
    var iDy = this.getDy(), eDy = im.getDy(), oDy = output.getDy();
    var idata = this.data,  edata = im.data,  odata = output.data;
    var nx = this.nx,       ny = this.ny;

    // Apply
    var c, x, y;
    var ix_, ex_, ox_, iy_, ey_, oy_;
    for (c = 0; c < iI0.length; c++) {
        var eI0c = (eI0.length === 1) ? eI0[0] : eI0[c];
        for (y = 0, oy_ = oI0[c], ey_ = eI0c, iy_ = iI0[c]; y < ny; y++, oy_ += oDy, ey_ += eDy, iy_ += iDy) {
            for (x = 0, ox_ = oy_, ex_ = ey_, ix_ = iy_; x < nx; x++, ox_ += oDx, ex_ += eDx, ix_ += iDx) {
                odata[ox_] = op(idata[ix_], edata[ex_]);
            }
        }
    }

    // The end
    return output;
};

/** Apply a function to each pixel & accumulate a single result.<br />
 * Algorithm is:<br />
 *  - Init. x with x0;<br />
 *  - For each s in image: x <- f(x, value(s)).
 * @see ImageJS#map
 * @param {function} fcn
 *  Function to be applied.
 * @param {T} [x0 = 0]
 *  Initial value for x.
 * @return {T}
 *  The accumulated value.
 * @example
 *  // Return the maximum value in the image:
 *  var max = im.accumulate(Math.max, -Infinity);
 */
ImageJS.prototype.accumulate = function (fcn, x0) {
    'use strict';
    var errMsg = this.constructor.name + '.accumulate: ';
    if (typeof fcn !== 'function') {
        throw new Error(errMsg + 'first argument must be a function');
    }
    if (x0 === undefined) {
        x0 = 0;
    }

    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();
    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                x0 = fcn(x0, d[x_]);
            }
        }
    }

    return x0;
};

/** Return the minimum and maximum value of the image.
 * @return {Object}
 *  - 'min': minimum value.<br />
 *  - 'max': maximum value.
 */
ImageJS.prototype.extrema = function () {
    'use strict';

    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();
    var min = Infinity, max = -Infinity;

    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                if (d[x_] > max) {
                    max = d[x_];
                }
                if (d[x_] < min) {
                    min = d[x_];
                }
            }
        }
    }
    return {'min': min, 'max': max};
};

/** Set the dynamic of the image.
 * @param [string] [method = 'linear']
 *  - 'linear' or 'lin': range min..max mapped to 0..1.<br />
 *  - 'clamp': convert ]-oo,0] to 0 and [1,+oo[ to 1.<br />
 *  - 'absolute' or 'abs': absolute value range 0..M mapped to 0..1.<br />
 *  - 'symmetric' or 'sym': symmetric range -M..0..M mapped to 0..1/2..1.<br />
 *  - 'logarithmic' or 'log': compute the log. of abs. value and map it to 0..1.
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  The output image with values in 0..1.
 */
ImageJS.prototype.setDynamic = function (method, output) {
    'use strict';
    var zero = 1e-9;
    var errMsg = this.constructor.name + '.setDynamic: ';
    if (method === undefined) {
        method = 'linear';
    } else if (typeof method !== 'string') {
        throw new Error(errMsg + 'first argument must be a string');
    }
    method = method.substr(0, 3).toLowerCase();
    var isLog = (method === 'log');

    if (isLog) {
        var dB = 10 / Math.LN10;
        var log = function (t) {
            return dB * Math.log(Math.abs(t) + zero);
        };
        output = this.map(log, output);
        method = 'lin';
    }

    var f, m, M, a, c;
    if (method === 'abs') {
        M = this.extrema();
        m = Math.max(Math.abs(M.max), Math.abs(M.min));
        c = (m === 0) ? 1 : 1 / m;
        f = function (t) {
            return c * t;
        };
        var abs = function (t) {
            return Math.abs(t);
        };
        output = this.map(abs, output).map(f, output);
    } else if (method === 'cla') {
        f = function (t) {
            return (t < 0) ? 0 : (t > 1) ? 1 : t;
        };
        output = this.map(f, output);
    } else if (method === 'lin') {
        var im = (isLog) ? output : this;
        M = im.extrema();
        c = -M.min;
        a = (M.max === M.min) ? 1 : 1 / (M.max - M.min);
        f = function (t) {
            return a * (t + c);
        };
        output = im.map(f, output);
    } else if (method === 'sym') {
        M = this.extrema();
        m = Math.max(Math.abs(M.max), Math.abs(M.min));
        c = (m === 0) ? 1 : 1 / (2 * m);
        f = function (t) {
            return c * (t + m);
        };
        output = this.map(f, output);
    } else {
        throw new Error(errMsg + 'unknown method');
    }

    return output;
};

/** Generate a noisy version of the image.<br />
 *  The noise is white gaussian additive.
 * @param {float} sigma
 *  Standard deviation of the noise.
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  A noisy version of this image.
 */
ImageJS.prototype.addNoise = function (sigma, output) {
    'use strict';
    var errMsg = this.constructor.name + '.addNoise: ';
    if (typeof sigma !== 'number') {
        throw new Error(errMsg + 'incorrect sigma value');
    }
    output = this.initOutput(output);

    var sample = Tools.Random.Normal.sample;
    var iI0 = this.getI0(), oI0 = output.getI0();
    var idx = this.getDx(), odx = output.getDx();
    var idy = this.getDy(), ody = output.getDy();
    var idata = this.data, odata = output.data;

    var nx = this.nx, ny = this.ny;
    var c, x, y;
    var iy_, oy_, ix_, ox_;
    for (c = 0; c < iI0.length; c++) {
        for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += idy, oy_ += ody) {
            for (x = 0, ix_ = iy_, ox_ = oy_; x < nx; x++, ix_ += idx, ox_ += odx) {
                odata[ox_] = idata[ix_] + sigma * sample();
            }
        }
    }

    return output;
};

/** Apply a threshold to the image.
 * @param {float} T
 *  Threshold value.
 * @param {String|function} [fcn = 'binary'] thresholding function:<br />
 *  - 'hard' or 'soft' or 'binary' threshold.<br />
 *  - any function (value, t) returning the float value thresholded by t.
 * @return {ImageJS}
 *  this, thresholded.
 */
ImageJS.prototype.threshold = function (T, fcn) {
    'use strict';
    var errMsg = this.constructor.name + '.thresholding: ';

    // Check the arguments
    if (typeof T !== 'number') {
        throw new Error(errMsg + 'the threshold value must be a number');
    }
    if (fcn === undefined) {
        fcn = 'bin';
    }
    if (typeof fcn === 'string') {
        fcn = fcn.substr(0, 4).toLowerCase();
        if (fcn === 'bin' || fcn === 'bina') {
            fcn = function (x, t) {
                return (Math.abs(x) < t) ? 0 : 1;
            };
        } else if (fcn === 'hard') {
            fcn = function (x, t) {
                return (Math.abs(x) < t) ? 0 : x;
            };
        } else if (fcn === 'soft') {
            fcn = function (x, t) {
                return (x > t) ? x - t : (x < -t) ? x + t : 0;
            };
        } else {
            throw new Error(errMsg + "the 'fcn' argument must be 'binary', 'hard', 'soft', or a function");
        }
    }

    // Perform thresholding
    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();
    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                d[x_] = fcn(d[x_], T);
            }
        }
    }
    return this;
};

/** Compute the PNSR of an image.<br />
 *  Assume the range of values is 0..1.
 * @param {ImageJS} imRef
 *  Original image.
 * @param {ImageJS} [outDiff]
 *  Fill this image with the (signed) difference image.
 * @return
 *  The PSNR value, i.e. - 10.log10(MSE)
 */
ImageJS.prototype.psnr = function (imRef, outDiff) {
    'use strict';
    var errMsg = this.constructor.name + '.psnr: ';
    if (!this.initOutput(imRef, true)) {
        throw new Error(errMsg + 'first argument must be the original image');
    }
    outDiff = this.initOutput(outDiff);

    var iI0 = this.getI0(), rI0 = imRef.getI0(), oI0 = outDiff.getI0();
    var iDx = this.getDx(), rDx = imRef.getDx(), oDx = outDiff.getDx();
    var iDy = this.getDy(), rDy = imRef.getDy(), oDy = outDiff.getDy();
    var idata = this.data,  rdata = imRef.data,  odata = outDiff.data;
    var nx = this.nx,       ny = this.ny;

    var ssd = 0;
    var c, x, y;
    var ox_, rx_, ix_, oy_, ry_, iy_;
    for (c = 0; c < iI0.length; c++) {
        for (y = 0, oy_ = oI0[c], ry_ = rI0[c], iy_ = iI0[c]; y < ny; y++, oy_ += oDy, ry_ += rDy, iy_ += iDy) {
            for (x = 0, ox_ = oy_, rx_ = ry_, ix_ = iy_; x < nx; x++, ox_ += oDx, rx_ += rDx, ix_ += iDx) {
                odata[ox_] = idata[ix_] - rdata[rx_];
                ssd += odata[ox_] * odata[ox_];
            }
        }
    }

    var psnr = 10 * Math.log(nx * ny * iI0.length / ssd) / Math.LN10;
    return psnr;
};


/* ********** VIEW TRANSFORMATIONS *************** */

/** Same as Ch, but in place.
 * @see ImageJS#Ch
 * @return {ImageJS} this
 */
ImageJS.prototype.Ch_ = function (channels) {
    'use strict';
    var errMsg = this.constructor.name + '.Ch: ';
    if (channels === undefined || channels === '') {
        this.chan = this.defaultChannels.substr(0, this.nchannels);
    } else if (typeof channels === 'string') {
        /** Read-only<br />Selected channels. */
        this.chan = channels;
        // Check identifier
        try {
            this.getChannels();
        } catch (e) {
            var errMsgFull = errMsg + "invalid channels identifier '" + channels + "'";
            throw new Error(errMsgFull);
        }
    } else {
        var str = "channels specifier must be empty or a string";
        throw new Error(errMsg + str);
    }
    return this;
};

/** Same as T, but in place.
 * @see ImageJS#T
 * @return {ImageJS} this
 */
ImageJS.prototype.T_ = function () {
    'use strict';
    var tmp;

    tmp = this.nx;
    this.nx = this.ny;
    this.ny = tmp;

    tmp = this.dx;
    this.dx = this.dy;
    this.dy = tmp;

    tmp = this.tx;
    this.tx = this.ty;
    this.ty = tmp;

    tmp = this.x0;
    this.x0 = this.y0;
    this.y0 = tmp;

    return this;
};

/** Same as S, but in place.
 * @return {ImageJS} this
 * @see ImageJS#S
 */
ImageJS.prototype.S_ = function (X, Y) {
    'use strict';

    // Check arguments
    var errMsg = this.constructor.name + '.S_: ';
    if (X === undefined) {
        throw new Error(errMsg + 'at least one argument is expected');
    } else if (typeof X === 'number') {
        X = (X > 0) ? [0, X, -1] : [-1, X, 0];
    } else if (X.length === 2) {
        X[2] = X[1];
        X[1] = 1;
    } else if (X.length !== 3) {
        throw new Error(errMsg + 'first argument must be a number or an array');
    }
    if (Y === undefined) {
        Y = X;
    } else if (typeof Y === 'number') {
        Y = (Y > 0) ? [0, Y, -1] : [-1, Y, 0];
    } else if (Y.length === 2) {
        Y[2] = Y[1];
        Y[1] = 1;
    } else if (Y.length !== 3) {
        throw new Error(errMsg + 'second argument must be a number or an array');
    }

    // Check size
    var clampSize = function (value, max) {
        if (value < 0) {
            value += max;
        }
        if (value < 0 || value >= max) {
            throw new Error(errMsg + 'index out of bound');
        } else if (value !== Math.round(value)) {
            throw new Error(errMsg + 'values must be integers');
        }
        return value;
    };
    var x0 = clampSize(X[0], this.nx);
    var xf = clampSize(X[2], this.nx);
    var y0 = clampSize(Y[0], this.ny);
    var yf = clampSize(Y[2], this.ny);
    var dx = X[1];
    var dy = Y[1];
    var nx = Math.abs(xf - x0) + 1;
    var ny = Math.abs(yf - y0) + 1;

    // Check signs and numbers
    if (dx === 0 || Math.round(dx) !== dx) {
        throw new Error(errMsg + 'dx must be a non-zero integer');
    } else if ((xf - x0) * dx < 0) {
        throw new Error(errMsg + 'invalid sign for dx');
    }
    if (dy === 0 || Math.round(dy) !== dy) {
        throw new Error(errMsg + 'dy must be a non-zero integer');
    } else if ((yf - y0) * dy < 0) {
        throw new Error(errMsg + 'invalid sign for dy');
    }

    // Apply all
    this.x0 += this.dx * x0;
    this.y0 += this.dy * y0;
    this.dx *= dx;
    this.dy *= dy;
    this.nx = Math.ceil(nx / Math.abs(dx));
    this.ny = Math.ceil(ny / Math.abs(dy));

    // Return
    return this;
};

/** Same as R, but in place.
 * @return {ImageJS} this
 * @see ImageJS#R
 */
ImageJS.prototype.R_ = function (deg90) {
    'use strict';

    // Check arguments
    var errMsg = this.constructor.name + '.R_: ';
    if (deg90 === undefined) {
        deg90 = 1;
    } else if (typeof deg90 !== 'number') {
        throw new Error(errMsg + 'argument must be an integer');
    } else {
        deg90 %= 4;
        if (deg90 < 0) {
            deg90 += 4;
        }
    }

    // Rotate
    if (deg90 === 2) {
        this.S_(-1, -1);
    } else if (deg90 === 1) {
        this.S_(-1, 1).T_();
    } else if (deg90 === 3) {
        this.S_(1, -1).T_();
    }

    // Return
    return this;
};

/** Select some channels.
 * @param {string} [channels] Selected channels, default is all.
 * @return {ImageJS} new view with selected channels.
 */
ImageJS.prototype.Ch = function (channels) {
    'use strict';
    return this.getView().Ch_(channels);
};

/** Transpose the view.
 * @return {ImageJS} transposed view
 */
ImageJS.prototype.T = function () {
    'use strict';
    return this.getView().T_();
};

/** Select a sub-image
 * @param {Array|int} X
 *  - Array [x0, dx, xf]: select x in range x0 .. xf with step dx.<br />
 *  - Array [x0, xf] assume the step dx = 1.<br />
 *  - Integer dx assume x0 = 0 and xf = -1.<br />
 *  A negative value is the position from the right (-1 mean nx-1)
 * @param {Array|int} [Y=X]
 *  The same as X, but along Y.
 * @return {ImageJS}
 *  The sub-image.
 * @example
 *  // Select one pixel out of 2 along X and Y:
 *  var view2 = im.S(2);
 *
 *  // Flip the image along Y
 *  var mirror = im.S(1,-1);
 *
 *  // Remove 5 pixels on each side
 *  var cropped = im.S([5, -6]);
 */
ImageJS.prototype.S = function (X, Y) {
    'use strict';
    return this.getView().S_(X, Y);
};

/** Rotate the view.
 * @param {int} [deg90=1]
 *  Rotation angle (times 90 degrees).
 * @return {ImageJS}
 *  rotated view
 */
ImageJS.prototype.R = function (deg90) {
    'use strict';
    return this.getView().R_(deg90);
};


/* ********** STATISTICS FUNCTION *************** */

/** Export the image values into an array.
 * @return {Array}
 *  Typed array containing the values of the image.
 */
ImageJS.prototype.toArray = function () {
    'use strict';

    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();
    var k = 0;

    var outArray = new this.dataType(nx * ny * I0.length);
    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx, k++) {
                outArray[k] = d[x_];
            }
        }
    }

    return outArray;
};

/** Compute some statistics on the image.
 * @return {Object}
 *  An object containing:<br />
 *  - 'count': the number of values;<br />
 *  - 'nonZero': the number of non-zero values;<br />
 *  - 'sumX': the sum of the values;<br />
 *  - 'sumX2': the sum of squarred values;<br />
 *  - 'sumAbsX': the sum of absolute values.
 */
ImageJS.prototype.getStatistics = function () {
    'use strict';

    var d = this.data, I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();

    var count = 0;
    var nonZero = 0;
    var sumX = 0;
    var sumX2 = 0;
    var sumAbsX = 0;

    var c, x, y, x_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                var X = d[x_];
                count++;
                if (X) {
                    nonZero++;
                }
                sumX += X;
                sumX2 += X * X;
                sumAbsX += (X >= 0) ? X : -X;
            }
        }
    }

    return {
        'count':    count,
        'nonZero':  nonZero,
        'sumX':     sumX,
        'sumX2':    sumX2,
        'sumAbsX':  sumAbsX
    };
};


/* ********** ELEMENTARY FILTERING FUNCTIONS *************** */

/** Elementary 1D erosion.<br />
 * Each pixel (x, y) value will be the min. among (x-1, y) and (x, y).
 * @see ImageJS#dilate1d
 * @return {ImageJS}
 *  this
 * @example
 *  // Perform erosion with mask [1, 1, 1] along X:
 *  im.erode1d().F().erode1d();
 *
 *  // Perform erosion of radius 1 using 8-conexity:
 *  for (var dir=0; dir<4; dir++)
 *      im.R(k).erode1d();
 *
 *  // Perform closure with mask [1, 1]:
 *  im.erode1d().F().dilate1d();
 */
ImageJS.prototype.erode1d = function () {
    'use strict';

    var data = this.data;
    var I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();

    var c, x, y;
    var xl_, xr_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 1, xl_ = y_, xr_ = y_ + dx; x < nx; x++, xl_ += dx, xr_ += dx) {
                if (data[xr_] < data[xl_]) {
                    data[xl_] = data[xr_];
                }
            }
        }
    }

    return this;
};

/** Elementary 1D dilation.<br />
 * Each pixel (x, y) value will be the max. among (x-1, y) and (x, y).
 * @see ImageJS#erode1d
 * @return {ImageJS}
 *  this
 */
ImageJS.prototype.dilate1d = function () {
    'use strict';

    var data = this.data;
    var I0 = this.getI0();
    var nx = this.nx, dx = this.getDx();
    var ny = this.ny, dy = this.getDy();

    var c, x, y;
    var xl_, xr_, y_;
    for (c = 0; c < I0.length; c++) {
        for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
            for (x = 1, xl_ = y_, xr_ = y_ + dx; x < nx; x++, xl_ += dx, xr_ += dx) {
                if (data[xr_] > data[xl_]) {
                    data[xl_] = data[xr_];
                }
            }
        }
    }

    return this;
};

/** 1D convolution.
 * @param {float[]} kernel
 *  Convolution kernel.
 * @param {String|float} [boundary = 'symmetric']
 *  Boundary processing:<br />
 *  - any float value: value assumed outside the image domain;<br />
 *  - float 0 value is equivalent to 'constant' or 'const';<br />
 *  - 'symmetric' or 'sym';<br />
 *  - 'periodic' or 'per'.
 * @param {int|string} [origin = 'C']
 *  Origin of the kernel:<br :>
 *  - positive integer: origin position;<br />
 *  - negative integer: origin position, from the end;<br />
 *  - 'L'/'R' for (resp.) left/right, the same as (resp.) 0/-1;<br />
 *  - 'C' for center,'CL'/'CR' for rounding (resp.) left/right.
 * @param {int|Object} [subsample = 1]
 *  Subsampling factor:<br />
 *   - integer D: the same as filtering and then subsampling with a factor D;<br />
 *   - Object {'Dout':D1, 'Dker':D2, 'round':fcn}: <br />
 *       * 'Dout' integer (def. 1) is the subsampling factor for the output (previously called D);<br />
 *       * 'Dker' integer (def. 1) is the kernel subsampling factor.<br />
 *  Note that using Dout = Dker is the same (except maybe on boundary) as
 *      subsampling the image firse, and then filtering with Dout = Dker = 1.
 * @param {ImageJS} [output]
 *  Output image
 * @param {boolean} [add = false]
 *  Add to the output, instead of erasing it.
 * @returns {ImageJS}
 *  Output image
 * @example
 *  // Computing the X derivative:
 *  var gradX = im.filter1d([-1, 0, 1], 'periodic');
 *
 *  // Resize image to half its size(with a separable average):
 *  var ker = [1/3, 1/3, 1/3];
 *  var tmp = im.filter1d(ker, 'symmetric', 'L', 3).T();    // X filtering then transpose
 *  var out = tmp.filter1d(ker, 'symmetric', 'L', 3).T();   // Y filtering then transpose back
 */
ImageJS.prototype.filter1d = function (kernel, boundary, origin, subsample, output, add) {
    'use strict';

    // 1. ARGUMENTS
    var errMsg = this.constructor.name + '.filter1d: ';
    kernel = new this.dataType((kernel && kernel.length) ? kernel : [kernel]);
    var K = kernel.length;
    var Dout = 1, Dker = 1, bg = 0;
    var c, x, y;
    var x_, y_;
    var nx, ny, dx, dy;

    // if output is this
    if (output === this) {
        if (kernel.length > 1) {
            throw new Error(errMsg + "if the output is the image itself, the kernel must be a scalar");
        } else {
            kernel = kernel[0];
            var d  = this.data, I0 = this.getI0();
            dx = this.getDx();
            dy = this.getDy();
            nx = this.nx;
            ny = this.ny;
            for (c = 0; c < I0.length; c++) {
                for (y = 0, y_ = I0[c]; y < ny; y++, y_ += dy) {
                    for (x = 0, x_ = y_; x < nx; x++, x_ += dx) {
                        d[x_] *= kernel;
                    }
                }
            }
            return this;
        }
    }

    // add
    if (add === undefined) {
        add = false;
    } else if (typeof add !== 'boolean' && add !== 0 && add !== 1) {
        throw new Error(errMsg + "'add' argument must be boolean");
    }

    // subsample
    if (typeof subsample === 'number') {
        Dout = subsample;
    } else if (typeof subsample === 'object') {
        Dout = subsample.Dout || Dout;
        Dker = subsample.Dker || Dker;
    }

    // boundary
    if (boundary === undefined) {
        boundary = 'sym';
    } else if (typeof boundary === 'number') {
        bg = boundary;
        boundary = 'const';
    } else if (typeof boundary !== 'string') {
        throw new Error(errMsg + "invalid type for 'boundary' argument");
    }
    boundary = boundary.toLowerCase().substr(0, 3); // 'con', 'per', 'sym'
    if (boundary === 'sym' && K < this.nx) {
        boundary = 'sym_optimized';
    }

    // output
    if (output === undefined) {
        output = this.getNew(Math.ceil(this.nx / Dout), this.ny);
        output.Ch_(this.chan);
    }
    if (output instanceof ImageJS) {
        var nxError = (this.nx - 1) - (output.nx - 1) * Dout;
        var ncError = this.chan.length - output.chan.length;
        if (nxError < 0 || nxError >= Dout || this.ny !== output.ny || ncError) {
            throw new Error(errMsg + 'output shape (nx, ny, nc) must match');
        }
        // If output is specified but not add thne fill with 0.
        if (!add) {
            output.fill(0);
        }
    } else {
        throw new Error(errMsg + "invalid type for 'output' argument");
    }

    // origin
    if (origin === undefined) {
        origin = 'C';
    }
    if (typeof origin === 'string') {
        origin = origin.toUpperCase();
        if (origin === 'C' || origin === 'CL') {
            origin = Math.floor((K - 1) / 2);
        } else if (origin === 'CR') {
            origin = Math.ceil((K - 1) / 2);
        } else if (origin === 'L') {
            origin = 0;
        } else if (origin === 'R') {
            origin = K - 1;
        } else {
            throw new Error(errMsg + "unknown origin position '" + origin + "'");
        }
    } else if (typeof origin  === 'number') {
        if (origin < 0) {
            origin += K;
        }
        if (origin < 0 || origin >= K) {
            throw new Error(errMsg + "origin value must satisfy : |origin| < kernel.length");
        }
    }

    // 2. Filtering
    var iI0 = this.getI0(), oI0 = output.getI0();
    var iDx = this.getDx(), oDx = output.getDx();
    var iDy = this.getDy(), oDy = output.getDy();
    var idata = this.data,  odata = output.data;
    nx = this.nx;
    ny = this.ny;
    var nx2 = 2 * nx;
    var iy_, oy_, ox_;
    var k, s, sTmp, sum;

    // Constant boundary
    if (boundary === 'con' || boundary === 'bla') {
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += iDy, oy_ += oDy) {
                for (x = 0, ox_ = oy_; Dout * x < nx; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sum += kernel[k] * ((s >= 0 && s < nx) ? idata[iy_ + s * iDx] : bg);
                    }
                    odata[ox_] += sum;
                }
            }
        }
    // Periodic boundary
    } else if (boundary === 'per') {
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += iDy, oy_ += oDy) {
                for (x = 0, ox_ = oy_; Dout * x < nx; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sTmp = s;
                        while (sTmp < 0) {
                            sTmp += nx;
                        }
                        while (sTmp >= nx) {
                            sTmp -= nx;
                        }
                        sum += kernel[k] * idata[iy_ + sTmp * iDx];
                    }
                    odata[ox_] += sum;
                }
            }
        }
    // Symmetric boundary
    } else if (boundary === 'sym') {
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += iDy, oy_ += oDy) {
                for (x = 0, ox_ = oy_; Dout * x < nx; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sTmp = s;
                        while (sTmp < 0) {
                            sTmp += nx2;
                        }
                        while (sTmp >= nx2) {
                            sTmp -= nx2;
                        }
                        if (sTmp >= nx) {
                            sTmp = nx2 - 1 - sTmp;
                        }
                        sum += kernel[k] * idata[iy_ + sTmp * iDx];
                    }
                    odata[ox_] += sum;
                }
            }
        }
    } else if (boundary === 'sym_optimized') {
        var stop = nx - origin;
        for (c = 0; c < iI0.length; c++) {
            for (y = 0, iy_ = iI0[c], oy_ = oI0[c]; y < ny; y++, iy_ += iDy, oy_ += oDy) {
                // Initial boundary condition
                for (x = 0, ox_ = oy_; Dout * x < origin; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sTmp = s;
                        if (sTmp < 0) {
                            sTmp = -1 - sTmp;
                        }
                        sum += kernel[k] * idata[iy_ + sTmp * iDx];
                    }
                    odata[ox_] += sum;
                }

                // Central loop
                for (x, ox_; Dout * x < stop; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sum += kernel[k] * idata[iy_ + s * iDx];
                    }
                    odata[ox_] += sum;
                }

                // Final boundary condition
                for (x, ox_; Dout * x < nx; x++, ox_ += oDx) {
                    sum = 0;
                    s = Dout * x + Dker * origin;
                    for (k = 0; k < K; k++, s -= Dker) {
                        sTmp = s;
                        if (sTmp >= nx) {
                            sTmp = nx2 - 1 - sTmp;
                        }
                        sum += kernel[k] * idata[iy_ + sTmp * iDx];
                    }
                    odata[ox_] += sum;
                }
            }
        }
    } else {
        throw new Error(errMsg + "unknown boundary conditions");
    }

    // Return the result
    return output;
};
// export  default ImageJS