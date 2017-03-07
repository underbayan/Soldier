// Ipij API (c) Copyright 2012, designed by B.Mazin & G.Tartavel

/* TO DO:
 *  - toImageG conversions: do it once
 *  - take into account contiguous channels storage
 */
// import  Tools from "./Tools.object"
// import  ImageJS from "./ImageJS.class"
/**
 * @fileOverview Image{RGBA, RGB, GA, G} class defintion and specifics fonctions.
 * @author TM = Tartavel & Mazin
 * @version 1.0
 */


/* ********** CONSTRUCTORS ********** */

/** Create a new image.
 * @class
 *  ImageRGBA is a JavaScript image class inherited from ImageJS class.
 *  It is designed to deal directly with RGBA images.
 * @see ImageJS
 * @param {int|ImageRGBA} [arg1 = 0]
 *  a. The width of the new image.<br />
 *  b. An image to copy.
 * @param {int|String} [argBis]
 *  a. Height of the new image.<br />
 *  b. Type of copy: 'copy' (verbatim copy), 'extract' (extract the view)
 *      or 'view' (same data)
 * @param {Object} [optArgs]
 *  An object with specific fields.<br />
 *  - 'dataType': type of the data array, e.g. Float64Array.<br />.
 *  - 'noData': if defined and true, don't create any data array.<br />
 *  - 'c': store channels consecutively for a given
 * @return {ImageRGBA}
 *  The created image.
 */
function ImageRGBA(arg1, argBis, optArgs) {
    'use strict';
    this.constructor.uber.constructor.call(this, arg1, argBis, 4, optArgs);
}

/** Create a new image.
 * @class
 *  ImageRGB is a JavaScript image class inherited from ImageJS class.
 *  It is designed to deal directly with RGB images.
 * @see ImageJS
 * @param {int|ImageRGB} [arg1 = 0]
 *  a. The width of the new image.<br />
 *  b. An image to copy.
 * @param {int|String} [argBis]
 *  a. Height of the new image.<br />
 *  b. Type of copy: 'copy' (verbatim copy), 'extract' (extract the view)
 *      or 'view' (same data)
 * @param {Object} [optArgs]
 *  An object with specific fields.<br />
 *  - 'dataType': type of the data array, e.g. Float64Array.<br />.
 *  - 'noData': if defined and true, don't create any data array.<br />
 *  - 'c': store channels consecutively for a given
 * @return {ImageRGB}
 *  The created image.
*/
function ImageRGB(arg1, height) {
    'use strict';
    this.constructor.uber.constructor.call(this, arg1, height, 3);
}

/** Create a new image.
 * @class
 *  ImageGA is a JavaScript image class inherited from ImageJS class.
 *  It is designed to deal directly with Gray-Alpha images.
 * @see ImageJS
 * @param {int|ImageGA} [arg1 = 0]
 *  a. The width of the new image.<br />
 *  b. An image to copy.
 * @param {int|String} [argBis]
 *  a. Height of the new image.<br />
 *  b. Type of copy: 'copy' (verbatim copy), 'extract' (extract the view)
 *      or 'view' (same data)
 * @param {Object} [optArgs]
 *  An object with specific fields.<br />
 *  - 'dataType': type of the data array, e.g. Float64Array.<br />.
 *  - 'noData': if defined and true, don't create any data array.<br />
 *  - 'c': store channels consecutively for a given
 * @return {ImageGA}
 *  The created image.
*/
function ImageGA(arg1, height) {
    'use strict';
    this.constructor.uber.constructor.call(this, arg1, height, 2);
}

/** Create a new image.
 * @class
 *  ImageG is a JavaScript image class inherited from ImageJS class.
 *  It is designed to deal directly with gray level images.
 * @see ImageJS
 * @param {int|ImageG} [arg1 = 0]
 *  a. The width of the new image.<br />
 *  b. An image to copy.
 * @param {int|String} [argBis]
 *  a. Height of the new image.<br />
 *  b. Type of copy: 'copy' (verbatim copy), 'extract' (extract the view)
 *      or 'view' (same data)
 * @param {Object} [optArgs]
 *  An object with specific fields.<br />
 *  - 'dataType': type of the data array, e.g. Float64Array.<br />.
 *  - 'noData': if defined and true, don't create any data array.<br />
 *  - 'c': store channels consecutively for a given
 * @return {ImageG}
 *  The created image.
*/
function ImageG(arg1, height) {
    'use strict';
    this.constructor.uber.constructor.call(this, arg1, height, 1);
}

/** Inheritance from ImageJS */
Tools.inheritance(ImageRGBA, ImageJS);
Tools.inheritance(ImageRGB, ImageJS);
Tools.inheritance(ImageGA, ImageJS);
Tools.inheritance(ImageG, ImageJS);

/* ********** IMAGE RGBA ********** */

/** Convert image to an ImageRGB.
 *  Alpha channel will be discarded.
 * @see ImageRGB
 */
ImageRGBA.prototype.toImageRGB = function () {
    'use strict';
    var imRGB = new ImageRGB(this.nx, this.ny);
    return this.Ch('012').exportImage(imRGB.Ch('012')).Ch();
};

/** Convert image to an ImageG.
 * Alpha channel will be discarded.
 * @see ImageG
 * @param {string} [channel]
 *  Channel which will represent the gray level. If not specified,
 *  conversion will use standards conbination of RGB channels
 *  (3O% red + 59% green + 11% blue)
 */
ImageRGBA.prototype.toImageG = function (channel) {
    'use strict';
    var errMsg = this.constructor.name + '.toImageG: ';
    var imG = new ImageG(this.nx, this.ny);
    if (typeof channel === 'string') {
        return this.Ch(channel).exportImage(imG.Ch('0')).Ch();
    } else if (channel === undefined) {
        var f = 0.0;
        var add = function (a, b) {
            return a + f * b;
        };
        imG.Ch_('0');
        f = 0.2989;
        imG.operator(add, this.Ch('0'), imG);
        f = 0.5870;
        imG.operator(add, this.Ch('1'), imG);
        f = 0.1140;
        imG.operator(add, this.Ch('2'), imG);
        return imG;
    }
    throw new Error(errMsg + 'unkwnown channel identifyer');
};

/** Convert image to an ImageGA.
 * @see ImageGA
 * @param {string} [channel]
 *  Channel which will represent the gray level. If not specified,
 *  conversion will use standards conbination of RGB channels
 *  (3O% red + 59% green + 11% blue)
 */
ImageRGBA.prototype.toImageGA = function (channel) {
    'use strict';
    var errMsg = this.constructor.name + '.toImageGA: ';
    var imGA = new ImageGA(this.nx, this.ny);
    if (typeof channel === 'string') {
        this.Ch(channel).exportImage(imGA.Ch('0'));
        return this.Ch('3').exportImage(imGA.Ch('1')).Ch();
    }
    if (channel === undefined) {
        var f = 0.0;
        var add = function (a, b) {
            return a + f * b;
        };
        imGA.Ch_('0');
        f = 0.2989;
        imGA.operator(add, this.Ch('0'), imGA);
        f = 0.5870;
        imGA.operator(add, this.Ch('1'), imGA);
        f = 0.1140;
        imGA.operator(add, this.Ch('2'), imGA);
        return this.Ch('3').exportImage(imGA.Ch('1')).Ch();
    }
    throw new Error(errMsg + 'unkwnown channel identifyer');
};


/* ********** IMAGE GA ********** */

/** Convert image to an ImageRGB.
 *  G channel will be replicated in RGB channels in the output image.
 *  Alpha channel will be discarded.
 * @see ImageRGB
 */
ImageGA.prototype.toImageRGB = function () {
    'use strict';
    var imRGB = new ImageRGB(this.nx, this.ny);
    return this.Ch('0').exportImage(imRGB.Ch('012')).Ch();
};

/** Convert image to an ImageG.
 *  Alpha channel will be discarded.
 * @see ImageG
 */
ImageGA.prototype.toImageG = function () {
    'use strict';
    var imG = new ImageG(this.nx, this.ny);
    return this.Ch('0').exportImage(imG.Ch('0')).Ch();
};

/** Convert image to an ImageRGBA.
 *  G channel will be replicated in RGB channels in the output image.
 * @see ImageRGBA
 */
ImageGA.prototype.toImageRGBA = function () {
    'use strict';
    var imRGBA = new ImageRGBA(this.nx, this.ny);
    this.Ch('0').exportImage(imRGBA.Ch('012'));
    return this.Ch('1').exportImage(imRGBA.Ch('3')).Ch();
};

/* Overloading */
ImageGA.prototype.getImageData = function () {
    'use strict';

    // Temporary canvas
    var myCanvas = ImageJS.getWorkingCanvas();
    myCanvas.width = this.nx;
    myCanvas.height = this.ny;

    // Get image data & fill alpha
    var imageData = myCanvas.getContext('2d').createImageData(this.nx, this.ny);

    // Fill image data
    var param = {'storage': 'c', 'noData': true};
    var canvasImage = new ImageJS(this.nx, this.ny, 4, param);
    canvasImage.data = imageData.data;
    this.Ch('0').exportImage(canvasImage.Ch('012'), 255.0);
    this.Ch('1').exportImage(canvasImage.Ch('3'), 255.0);
    return imageData;
};

/* Overloading */
ImageGA.prototype.load = function (source, callback) {
    'use strict';
    var newCallback = function (thisImageGA) {
        var N = thisImageGA.width * thisImageGA.height;
        var dataTmp = new this.dataType(2 * N);

        // Gray Alpha conversion
        var R = thisImageGA.data.subarray(0, N);
        var G = thisImageGA.data.subarray(N, 2 * N);
        var B = thisImageGA.data.subarray(2 * N, 3 * N);
        var A = thisImageGA.data.subarray(3 * N, 4 * N);

        var i, j;
        for (i = 0, j = N; i < N; i++, j++) {
            dataTmp[i]  = (0.2989 * R[i] + 0.5870 * G[i] + 0.1140 * B[i]);
            dataTmp[j]  = A[i];
        }
        delete thisImageGA.data;

        thisImageGA.data = dataTmp;
        thisImageGA.nchannels = 2;
        this.Ch_();
        if (callback) {
            callback.call(thisImageGA, thisImageGA);
        }
    };

    this.constructor.uber.load.call(this, source, newCallback);
    return this;
};


/* ********** IMAGE RGB ********** */

/** Convert image to an ImageRGBA.
 * Alpha channel will be fill with 1.
 * @see ImageRGBA
 */
ImageRGB.prototype.toImageRGBA = function () {
    'use strict';
    var imRGBA = new ImageRGBA(this.nx, this.ny);
    return this.Ch('012').exportImage(imRGBA.Ch('012')).Ch('3').fill(1.0).Ch();
};

/** Convert image to an ImageG.
 * @see ImageG
 * @param {string} [channel]
 *  Channel which will represent the gray level. If not specified,
 *  conversion will use standards conbination of RGB channels
 *  (3O% red + 59% green + 11% blue)
 */
ImageRGB.prototype.toImageG = function (channel) {
    'use strict';
    var errMsg = this.constructor.name + '.toImageG: ';
    var imG = new ImageG(this.nx, this.ny);
    if (typeof channel === 'string') {
        return this.Ch(channel).exportImage(imG.Ch('0')).Ch();
    }
    if (channel === undefined) {
        var f = 0.0;
        var add = function (a, b) {
            return a + f * b;
        };
        imG.Ch_('0');
        f = 0.2989;
        imG.operator(add, this.Ch('0'), imG);
        f = 0.5870;
        imG.operator(add, this.Ch('1'), imG);
        f = 0.1140;
        imG.operator(add, this.Ch('2'), imG);
        return imG;
    }
    throw new Error(errMsg + 'unkwnown channel identifyer');
};

/** Convert image to an ImageGA.
 *  Alpha channel will be fill with 1.
 * @see ImageGA
 * @param {string} [channel]
 *  Channel which will represent the gray level. If not specified,
 *  conversion will use standards conbination of RGB channels
 *  (3O% red + 59% green + 11% blue)
 */
ImageRGB.prototype.toImageGA = function (channel) {
    'use strict';
    var errMsg = this.constructor.name + '.toImageGA: ';
    var imGA = new ImageGA(this.nx, this.ny);
    if (typeof channel === 'string') {
        return this.Ch(channel).exportImage(imGA.Ch('0')).Ch('1').fill(1.0).Ch();
    }
    if (channel === undefined) {
        var f = 0.0;
        var add = function (a, b) {
            return a + f * b;
        };
        imGA.Ch_('0');
        f = 0.2989;
        imGA.operator(add, this.Ch('0'), imGA);
        f = 0.5870;
        imGA.operator(add, this.Ch('1'), imGA);
        f = 0.1140;
        imGA.operator(add, this.Ch('2'), imGA);
        return imGA.Ch('1').fill(1.0).Ch();
    }
    throw new Error(errMsg + 'unkwnown channel identifyer');
};

/* Overloading */
ImageRGB.prototype.getImageData = function () {
    'use strict';

    // Temporary canvas
    var myCanvas = ImageJS.getWorkingCanvas();
    myCanvas.width = this.nx;
    myCanvas.height = this.ny;

    // Get image data & fill alpha
    var imageData = myCanvas.getContext('2d').createImageData(this.nx, this.ny);

    // Fill alpha channel
    var nx = this.nx, ny = this.ny;
    var out = imageData.data;
    var y, y_, x, x_;
    for (y = 0, y_ = 3; y < ny; y++, y_ += 4 * nx) {
        for (x = 0, x_ = y_; x < nx; x++, x_ += 4) {
            out[x_] = 255;
        }
    }

    // Fill image data
    var param = {'storage': 'c', 'noData': true};
    var canvasImage = new ImageJS(this.nx, this.ny, 4, param);
    canvasImage.data = imageData.data;
    this.Ch('012').exportImage(canvasImage.Ch('012'), 255.0);
    return imageData;
};

/* Overloading */
ImageRGB.prototype.load = function (source, callback) {
    'use strict';
    var newCallback = function (thisImageRGB) {
        var N = thisImageRGB.width * thisImageRGB.height;
        var thisImageDataRGB = thisImageRGB.data.subarray(0, 3 * N);
        var dataTmp = new this.dataType(3 * N);
        dataTmp.set(thisImageDataRGB);
        delete thisImageDataRGB.data;
        thisImageRGB.data = dataTmp;
        thisImageRGB.nchannels = 3;
        this.Ch_();
        if (callback) {
            callback.call(thisImageRGB, thisImageRGB);
        }
    };

    this.constructor.uber.load.call(this, source, newCallback);
    return this;
};


/* ********** IMAGE G ********** */

/** Convert image to an ImageRGBA.
 *  G channel will be replicated in RGB channels in the output image.
 *  Alpha channel will be fill with 1.
 * @see ImageRGBA
 */
ImageG.prototype.toImageRGBA = function () {
    'use strict';
    var imRGBA = new ImageRGBA(this.nx, this.ny);
    return this.Ch('0').exportImage(imRGBA.Ch('012')).Ch('3').fill(1.0).Ch();
};

/** Convert image to an ImageRGB.
 *  G channel will be replicated in RGB channels in the output image.
 * @see ImageRGB
 */
ImageG.prototype.toImageRGB = function () {
    'use strict';
    var imRGB = new ImageRGB(this.nx, this.ny);
    return this.Ch('0').exportImage(imRGB.Ch('012')).Ch();
};

/** Convert image to an ImageGA.
 *  Alpha channel will be fill with 1.
 * @see ImageGA
 */
ImageG.prototype.toImageGA = function () {
    'use strict';
    var imGA = new ImageGA(this.nx, this.ny);
    return this.Ch('0').exportImage(imGA.Ch('0')).Ch('1').fill(1.0).Ch();
};

/* Overloaded */
ImageG.prototype.getImageData = function () {
    'use strict';

    // Temporary canvas
    var myCanvas = ImageJS.getWorkingCanvas();
    myCanvas.width = this.nx;
    myCanvas.height = this.ny;

    // Create structure
    var param = {'storage': 'c', 'noData': true};
    var canvasImage = new ImageJS(this.nx, this.ny, 4, param);
    var imageData = myCanvas.getContext('2d').createImageData(this.nx, this.ny);
    canvasImage.data = imageData.data;

    // Fill alpha channel
    var nx = this.nx, ny = this.ny;
    var out = imageData.data;
    var y, y_, x, x_;
    for (y = 0, y_ = 3; y < ny; y++, y_ += 4 * nx) {
        for (x = 0, x_ = y_; x < nx; x++, x_ += 4) {
            out[x_] = 255;
        }
    }

    canvasImage.Ch_('012');
    this.exportImage(canvasImage, 255.0);
    return imageData;
};

/* Overloaded */
ImageG.prototype.load = function (source, callback) {
    'use strict';

    var newCallback = function (thisImageG) {
        var N = thisImageG.width * thisImageG.height;
        var dataTmp = new this.dataType(N);

        // Grey conversion
        var R = thisImageG.data.subarray(0, N);
        var G = thisImageG.data.subarray(N, 2 * N);
        var B = thisImageG.data.subarray(2 * N, 3 * N);

        var i;
        for (i = 0; i < N; i++) {
            dataTmp[i]  = (0.2989 * R[i] + 0.5870 * G[i] + 0.1140 * B[i]);
        }

        delete thisImageG.data;
        thisImageG.data = dataTmp;
        thisImageG.nchannels = 1;
        this.Ch_();

        if (callback) {
            callback.call(thisImageG, thisImageG);
        }
    };
    this.constructor.uber.load.call(this, source, newCallback);
    return this;
};