// Ipij API (c) Copyright 2012, designed by B.Mazin & G.Tartavel

/**
 * @fileOverview Wavelet transform and wavelet tools.
 * @author TM = Tartavel & Mazin
 * @version 1.0
 */


/* ********** WAVELET CLASS *************** */

/** Define a wavelet.
 * @class
 *  Provide several wavelets functions.<br />
 *  A wavelet can be either a common wavelet (called by its name)
 *  or any user-defined wavelet from its recursive filters.
 * @param {string} [name='haar']
 *  Name of the wavelet.
 * @return {Wavelet}
 *  The wavelet definition (containing filters and some properties).
 */
function Wavelet(name) {
    'use strict';
    var errMsg = this.constructor.name + ': ';

    // Default arguments
    if (name === undefined) {
        this.name = 'haar';
    } else {
        /** Read only<br />Name of the wavelet. */
        this.name = name.toLowerCase();
    }

    // Pre-defined wavelets
    if (Wavelet.list[this.name]) {
        var wav = Wavelet.list[this.name];
        var normalize = (wav.normalized !== undefined && !wav.normalized)
            ? function (h) {
            return Wavelet.filter(h, 'norm');
        }
            : function (h) {
            return h;
        };
        /** Read only<br />Low-pass recursive decomposition filter. */
        this.filterL = normalize(wav.filterL);
        /** Read only<br />Is the wavelet orthogonal? */
        this.orthogonal = (wav.orthogonal) ? true : false;
        if (wav.filterH) {
            /** Read only<br />High-pass recursive decomposition filter. */
            this.filterH = normalize(wav.filterH);
        }
        if (wav.invFilterL) {
            /** Read only<br />Low-pass recursive reconstruction filter. */
            this.invFilterL = normalize(wav.invFilterL);
        }
        if (wav.invFilterH) {
            /** Read only<br />High-pass recursive reconstruction filter. */
            this.invFilterH = normalize(wav.invFilterH);
        }
    }

    // User-define wavelet
    if (this.filterL === undefined) {
        var errMsgFull = errMsg + "unknown wavelet '" + name + "'. \n";
        errMsgFull += 'User-defined wavelets not implemented yet.';
        throw new Error(errMsgFull);
    }

    // Compute complementary filter
    var conj = function (h, offset) {
        return Wavelet.filter(h, 'conjugate', (offset) ? -1 : 1);
    };
    if (!this.filterH && this.orthogonal) {
        this.filterH = Wavelet.filter(conj(this.filterL), 'mirror');
    }
    if (!this.invFilterL) {
        this.invFilterL = conj(this.filterH, true);
    }
    if (!this.invFilterH) {
        this.invFilterH = conj(this.filterL, false);
    }

    // Return the object
    return this;
}

/** Public<br />List of wavelets. */
Wavelet.list = Wavelet.list || {
        'haar': {
            'orthogonal': true,
            'filterL': [1, 1]
        }
    };

/** Perform an operation on a filter.
 * @param {float[]} h
 *  A filter.
 * @param {String} action
 *  - 'rescale': multiply the filter by a constant.<br />
 *  - 'normalize': normalize the filter (L2 norm).<br />
 *  - 'conjugate': return the filter h[0], -h[1], .., h[n]*(-1)^n.<br />
 *  - 'mirror': return the filter h[n-1] .. h[0].
 * @param {float} [factor=1]
 *  Multiplicative constant.
 * @return {float[]}
 *  A transformed filter.
 */
Wavelet.filter = function (h, action, factor) {
    'use strict';
    var errMsg = 'Wavelet.filter: ';
    if (factor === undefined || factor === 0) {
        factor = 1;
    }
    if (typeof factor !== 'number') {
        throw new Error(errMsg + "argument 'factor' must be a number");
    }
    if (typeof action !== 'string') {
        throw new Error(errMsg + "argument 'action' must be a string");
    }
    action = action.toLowerCase().substr(0, 3);

    var k;
    var N = h.length;
    var out = [];
    var sign = 1, dsign = 1;
    if (action === 'mir') {
        for (k = 0; k < N; k++) {
            out[k] = factor * h[N - 1 - k];
        }
        return out;
    }
    if (action === 'nor') {
        var sum2 = 0;
        for (k = 0; k < N; k++) {
            sum2 += h[k] * h[k];
        }
        factor = (!sum2) ? 1 : 1 / Math.sqrt(sum2);
    } else if (action === 'con') {
        dsign = -1;
    } else if (action !== 'res') {
        throw new Error(errMsg + 'unknown action');
    }

    for (k = 0; k < N; k++, sign *= dsign) {
        out[k] = factor * sign * h[k];
    }

    return out;
};

/** Display all wavelets in a 'select' element.
 * @param {HTMLSelectElement} [outSelect]
 *  HTML 'select' element to export the list into.<br />
 *  All existing options will be removed.
 * @return {HTMLSelectElement}
 *  The HTML 'select' element.
 */
Wavelet.toHTML = function (outSelect) {
    'use strict';

    // Check arguments
    var errMsg = 'Wavelet.toHTML: ';
    if (outSelect === undefined) {
        outSelect = document.createElement('select');
    } else if (typeof outSelect === 'string') {
        outSelect = document.getElementById(outSelect);
    } else if (!outSelect || !(outSelect instanceof HTMLSelectElement)) {
        throw new Error(errMsg + "argument 'outSelect' must be a valid ID or a 'Select' HTML element");
    }

    // Fill the select
    var key;
    while (outSelect.firstChild) {
        outSelect.removeChild(outSelect.firstChild);
    }
    for (key in Wavelet.list) {
        if (Wavelet.list.hasOwnProperty(key)) {
            outSelect.appendChild(new Option(Wavelet.list[key].name, key));
        }
    }
};


/* ********** WAVELET TRANSFORM CLASS *************** */

/** Compute the Wavelet Transform of an ImageJS.
 * @see Wavelet
 * @see WT#inverse
 * @class
 *  WT (which stands for 'Wavelet Transform') is a class designed
 *  to store the wavelet transform of an ImageJS.
 * @param {ImageJS|WT} image
 *  Image to be transform, or WT to copy.
 * @param {boolean} [redundant=false]
 *  Use a redundant wavelet transform instead.
 * @param {Wavelet|String} wavelet
 *  Wavelet to use, or its name.
 * @param {int} [level=3]
 *  Number of decomposition levels.<br />
 *  - The scale will be from 0 (lowest freq.) to 'level' (highest freq.)<br />
 *  - They are also labelled from -1 (highest freq.) to -level-1 (lowest freq.)
 * @return {WaveletTransform}
 *  The created wavelet transform instance.
 * @example
 *  // Compute the redundant WT
 *  var wt = new WT(im, true);
 *
 *  // Estimate the noise and apply thresholding
 *  var sigma = wt.noiseStd();
 *  wt.threshold(3/2*sigma, 'soft');
 *
 *  // Reconstruct the image
 *  var denoised = wt.inverse();
 */
function WT(im, redundant, wav, level) {
    'use strict';

    if (im instanceof ImageJS) {
        if (redundant !== undefined && typeof redundant !== 'boolean') {
            throw new Error("WT: argument 'redundant' must be boolean");
        }
        if (level === undefined) {
            level = 3;
        } else if (typeof level !== 'number') {
            throw new Error("WT: argument 'level' must be an integer");
        }

        // Arguments
        this.width = im.nx;
        this.height = im.ny;
        this.chan = im.chan;
        this.redundant = (redundant) ? true : false;
        this.level = (level === undefined) ? 3 : level;
        this.wavelet = (wav instanceof Wavelet) ? wav : new Wavelet(wav);

        // Compute and return the transform
        this.tmp = im;
        this.wt2(); // fill this.data

        // Copy constructor
    } else if (im instanceof WT) {
        this.width = im.width;
        this.height = im.height;
        this.chan = im.chan;
        this.redundant = im.redundant;
        this.level = im.level;
        this.wavelet = im.wavelet;
        this.data = im.data.getCopy();
        this.subband = [];
        var k, key;
        for (k = 0; k < im.subband.length; k++) {
            this.subband[k] = {};
            for (key in im.subband[k]) {
                if (im.subband[k].hasOwnProperty(key)
                    && im.subband[k][key] instanceof ImageJS) {
                    this.subband[k][key] = im.subband[k][key].getView();
                    this.subband[k][key].data = this.data.data;
                }
            }
        }
    } else {
        throw new Error("WT: first parameter must be an ImageJS or a WT");
    }
    return this;
}

/** Return the reconstructed image.
 * @see @WT
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  The reconstructed image.
 */
WT.prototype.inverse = function (output, wt2) {
    'use strict';
    return this.iwt2(output, wt2);
};


/* ********** WT VISUALIZATION *************** */

/** Get a view of a subband.
 * @param {int} scale
 *  - 0 is the approximation subband.<br />
 *  - From lowest to highest freq.: 1 to level.<br />
 *  - From highest to lowest freq.: -1 to -level
 * @return {Object}
 *  Object containing views of the subband:<br />
 *  - 'LL' view if scale is 0.<br />
 *  - 'HL', 'LH' and 'HH' views if scale is non-zero.
 */
WT.prototype.getScale = function (scale) {
    'use strict';
    if (typeof scale !== 'number' || Math.abs(scale) > this.level) {
        var errMsg = this.constructor.name + '.getScale: ';
        errMsg += 'scale must be in range -this.level .. this.level';
        throw new Error(errMsg);
    }
    if (scale < 0) {
        scale += this.level + 1;
    }
    var subband = this.subband[scale];

    if (!scale) {
        return {'LL': subband.LL.getView()};
    }
    return {
        'HL': subband.HL.getView(),
        'LH': subband.LH.getView(),
        'HH': subband.HH.getView()
    };
};

/** Return some statistics about the coefficients.
 * @see WT#getScale
 * @see ImageJS#getStatistics
 * @param {int} [scale]
 *  If not specified, compute the statistics of all the coefficients.<br />
 *  If specified (same as in 'getScale'), use only the coefficients in one subband.
 * @return {Object}
 *  The same as the 'getStatistics' method in 'ImageJS'.
 */
WT.prototype.getScaleStatistics = function (scale) {
    'use strict';
    if (scale === undefined) {
        var obj = this.getScaleStatistics(0);
        var k;
        for (k = 1; k <= this.length; k++) {
            var tmp = this.getScaleStatistics(k);
            obj.count += tmp.count;
            obj.nonZero += tmp.nonZero;
            obj.sumX += tmp.sumX;
            obj.sumX2 += tmp.sumX2;
            obj.sumAbsX += tmp.sumAbsX;
        }
        return obj;
    }

    var sub = this.getScale(scale);
    if (!scale) {
        return sub.LL.getStatistics();
    }

    var hl = sub.HL.getStatistics();
    var lh = sub.LH.getStatistics();
    var hh = sub.HH.getStatistics();
    return {
        'count': hl.count + lh.count + hh.count,
        'nonZero': hl.nonZero + lh.nonZero + hh.nonZero,
        'sumX': hl.sumX + lh.sumX + hh.sumX,
        'sumX2': hl.sumX2 + lh.sumX2 + hh.sumX2,
        'sumAbsX': hl.sumAbsX + lh.sumAbsX + hh.sumAbsX
    };
};

/** Display the WT in a table.
 * @param {HTMLTableElement} [outTable]
 *  HTML 'table' element to draw the WT into.
 * @param {function} [canvasClickFcn]
 *  Function called when a canvas is clicked. Is set to each 'canvas.onclick'.
 * @param {float} [redundantScaling = 0.6]
 *  Scale factor for subband display, if the WT is redundant.<br />
 *  With 0.5, the redundant WT display looks the same as a decimamted WT.
 * @return {HTMLTableElement}
 *  The HTML 'table' element.
 */
WT.prototype.toHTML = function (outTable, canvasClickFcn, redundantScaling) {
    'use strict';

    // Check arguments
    var errMsg = this.constructor.name + '.toHTML: ';
    if (canvasClickFcn !== undefined && typeof canvasClickFcn !== 'function') {
        throw new Error(errMsg + "argument 'canvasClickFcn' must be a function");
    }
    if (redundantScaling === undefined) {
        redundantScaling = 0.6;
    } else if (typeof redundantScaling !== 'number') {
        throw new Error(errMsg + "parameter 'redundantScaling' must be scalare");
    }
    if (outTable === undefined) {
        outTable = document.createElement('table');
    } else if (typeof outTable === 'string' && document.getElementById(outTable)) {
        outTable = document.getElementById(outTable);
    } else if (!(outTable instanceof HTMLTableElement)) {
        throw new Error(errMsg + "argument 'outTable' must be a valid ID or a 'Table' HTML element");
    }

    // Dom elements
    var k, tr, td, c;
    var addElmt = function (parent, tag) {
        // Create a 'tag' element, append it and return it
        var elmt = document.createElement(tag);
        parent.appendChild(elmt);
        return elmt;
    };
    var getChild = function (parent, index, tag) {
        // Get the child, create it if doesn't exist, exception if wrong type
        var child = parent.childNodes[index];
        if (!child) {
            child = addElmt(parent, tag);
        } else if (child.nodeName.toLowerCase() !== tag.toLowerCase()) {
            throw new Error(errMsg + 'unexpected table structure');
        }
        return child;
    };

    // Init table
    var t = getChild(outTable, 0, 'tbody');
    if (t.firstNode && !(t.firstNode instanceof HTMLTableRowElement)) {
        while (t.firstNode) {
            t.removeChild(t.firstNode);
        }
    }

    // Init WT
    var views = [], size = [];
    for (k = 0; k <= this.level; k++) {
        views[k] = this.getScale(k);
    }
    var factor = (this.redundant) ? redundantScaling : 1;
    var curSize;
    for (k = this.level, curSize = factor; k > 0; k--, curSize *= factor) {
        size[k] = curSize;
    }
    size[0] = size[1] || 1;

    // Scale 0
    tr = getChild(t, 0, 'tr');
    td = getChild(tr, 0, 'td');
    c = getChild(td, 0, 'canvas');
    c.id = 'LL0';
    views[0].LL.setDynamic('abs').draw(c, size[0]);
    if (canvasClickFcn) {
        c.onclick = canvasClickFcn;
    }

    // Scales 1 .. level, HL
    for (k = 1; k <= this.level; k++) {
        td = getChild(tr, k, 'td');
        td.setAttribute('rowspan', k);
        td.style.display = '';
        c = getChild(td, 0, 'canvas');
        c.id = 'HL' + k;
        views[k].HL.setDynamic('abs').draw(c, size[k]);
        if (canvasClickFcn) {
            c.onclick = canvasClickFcn;
        }
    }

    // Hide next columns
    for (k = this.level + 1; k < tr.childNodes.length; k++) {
        tr.childNodes[k].style.display = 'none';
    }

    // Scales 1 .. level, LH & HH
    for (k = 1; k <= this.level; k++) {
        tr = getChild(t, k, 'tr');
        tr.style.display = '';
        // LH
        td = getChild(tr, 0, 'td');
        td.setAttribute('colspan', k);
        c = getChild(td, 0, 'canvas');
        c.id = 'LH' + k;
        views[k].LH.setDynamic('abs').draw(c, size[k]);
        if (canvasClickFcn) {
            c.onclick = canvasClickFcn;
        }
        // HH
        td = getChild(tr, 1, 'td');
        c = getChild(td, 0, 'canvas');
        c.id = 'HH' + k;
        views[k].HH.setDynamic('abs').draw(c, size[k]);
        if (canvasClickFcn) {
            c.onclick = canvasClickFcn;
        }
    }

    // Hide next rows
    for (k = this.level + 1; k < t.childNodes.length; k++) {
        t.childNodes[k].style.display = 'none';
    }

    return outTable;
};

/** Process the WT displayed.
 * @param {HTMLTableElement} [table]
 *  The HTML 'table' element containing the display.
 * @param {function} [processingFct]
 *  Function applied to each view of the display.<br />
 *  Called with the canvas as 'this' and its WT view (ImageJS) as argument.
 * @return {WT}
 *  this
 */
WT.prototype.processHTML = function (table, processingFcn) {
    'use strict';

    // Check arguments
    var errMsg = this.constructor.name + '.processHTML: ';
    if (typeof processingFcn !== 'function') {
        throw new Error(errMsg + "argument 'processingFcn' must be a function");
    }
    if (typeof table === 'string') {
        table = document.getElementById(table);
    } else if (!table || !(table instanceof HTMLTableElement)) {
        throw new Error(errMsg + "argument 'table' must be a valid ID or a 'Table' HTML element");
    }

    // Dom elements
    var tr, c;
    var getChild = function (parent, index, tag) {
        // Get the child, exception if doesn't exist or if wrong type
        var child = parent.childNodes[index];
        if (!child || child.nodeName.toLowerCase() !== tag.toLowerCase()) {
            throw new Error(errMsg + 'unexpected table structure');
        }
        return child;
    };

    // Init
    var k;
    var t = getChild(table, 0, 'tbody');
    var views = [];
    for (k = 0; k <= this.level; k++) {
        views[k] = this.getScale(k);
    }

    // Scale 0
    tr = getChild(t, 0, 'tr');
    c = getChild(getChild(tr, 0, 'td'), 0, 'canvas');
    processingFcn.call(c, views[0].LL);

    // Scales 1 .. level, HL
    for (k = 1; k <= this.level; k++) {
        c = getChild(getChild(tr, k, 'td'), 0, 'canvas');
        processingFcn.call(c, views[k].HL);
    }

    // Scales 1 .. level, LH & HH
    for (k = 1; k <= this.level; k++) {
        tr = getChild(t, k, 'tr');
        c = getChild(getChild(tr, 0, 'td'), 0, 'canvas');
        processingFcn.call(c, views[k].LH);
        c = getChild(getChild(tr, 1, 'td'), 0, 'canvas');
        processingFcn.call(c, views[k].HH);
    }

    return this;
};


/* ********** DENOISING TOOLS *************** */

/** Estimate the noise standard deviation.<br />
 *  Assume the noise to be gaussian additive with zero-mean.<br />
 *  Estimation is based on the median value in the finest scale.
 * @return {float}
 *  The estimated standard deviation of the noise.
 */
WT.prototype.noiseStd = function () {
    'use strict';
    var errMsg = this.constructor.name + '.noiseStd: ';
    var sub = this.getScale(-1);
    if (!sub.HH) {
        throw new Error(errMsg + 'there is no details subband');
    }

    // Extract the finest scale coefficients
    var tabHH = sub.HH.toArray();
    var k;
    for (k = 0; k < tabHH.length; k++) {
        tabHH[k] = Math.abs(tabHH[k]);
    }

    // Compute median and deduce std assuming gaussian
    var median = Tools.Stat.rank(tabHH);
    var std = median / 0.6745;
    return std;
};

/** Apply a threshold to each scale.
 * @see ImageJS#threshold
 * @param {float|float[]} T
 *  Threshold value(s):<br />
 *  - float: the same threshold for all scales.<br />
 *  - array of floats: one threshold for each scale (use -1 not to filter a scale).
 * @param {String|function} [fcn = 'hard']
 *  Thresholding function:<br />
 *  - 'hard' or 'soft' threshold.<br />
 *  - any function (value, T) returning x thresholded by T.
 * @param {boolean} [evenLL=false]
 *  If true, the approximation subband (scale 0) is thresholded too.
 * @return {WaveletTransform}
 *  this, thresholded.
 */
WT.prototype.threshold = function (T, fcn, evenLL) {
    'use strict';
    var errMsg = this.constructor.name + '.threshold: ';

    // Check arguments
    var k, t;
    if (fcn === undefined) {
        fcn = 'hard';
    }
    var minScale = (evenLL) ? 0 : 1;
    if (typeof T === 'number') {
        t = T;
        T = [];
        for (k = minScale; k <= this.level; k++) {
            T.push(t);
        }
    } else {
        if (evenLL === undefined) {
            minScale = this.level + 1 - T.length;
        }
        if (T.length !== this.level + 1 - minScale || minScale < 0 || minScale > 1) {
            throw new Error(errMsg + "incompatible length of 'T'");
        }
    }

    // Threshold
    for (k = this.level; k >= minScale; k--) {
        t = T.pop();
        if (t >= 0) {
            var sub = this.getScale(k);
            if (sub.LL) {
                sub.LL.threshold(t, fcn);
            } else {
                sub.HL.threshold(t, fcn);
                sub.LH.threshold(t, fcn);
                sub.HH.threshold(t, fcn);
            }
        }
    }

    // The end
    return this;
};

/** Apply the SURE thresholding to each scale.
 * @return {WT}
 *  this
 */
WT.prototype.thresholdSURE = function () {
    'use strict';
    var sigma = this.noiseStd();
    var sigma2 = sigma * sigma;

    // Compute the SURE value from an image coefficients
    var getSURE = function (t) {
        var N = t.length;
        var k, n;
        for (k = 0; k < N; k++) {
            t[k] = Math.abs(t[k]);
        }
        Array.prototype.sort.call(t, function (a, b) {
            return a - b;
        });
        var cumSum2 = 0, imin = 0, minRisk2 = Infinity;
        for (n = 0; n < N; n++) {
            var X2 = t[n] * t[n];
            cumSum2 += X2 - sigma2;
            var risk2 = cumSum2 + (N - n - 1) * (sigma2 + X2);
            if (risk2 < minRisk2) {
                imin = n;
                minRisk2 = risk2;
            }
        }
        return t[imin];
    };

    // Apply the threshold to each scale
    var k, s, c;
    for (k = this.level; k > 0; k--) {
        var subband = this.getScale(k);
        var views = [subband.HL, subband.LH, subband.HH];
        for (s = 0; s < views.length; s++) {
            var view = views[s];
            var chan = view.chan;
            for (c = 0; c < chan.length; c++) {
                view.Ch_(chan[c]);
                var T = getSURE(view.toArray());
                view.threshold(T, 'soft');
            }
        }
    }

    return this;
};


/* ********** WT COMPUTATION *************** */

/** Compute each scale properties:<br />
 *  - shape 'width' and 'height' of the coefficients.<br />
 *  - 'pow' is the subsampling factor.<br />
 *  - 'cumWidth' and 'cumHeight' from scale 0 to current.
 * @private
 * @return {Array of Object}
 *  The properties for each scale.
 */
WT.prototype.getScalesParameters = function () {
    'use strict';
    var w = this.width;
    var h = this.height;
    var pow = 1;
    var list = [];
    var k;
    for (k = this.level; k > 0; k--, pow *= 2) {
        if (!this.redundant) {
            w = Math.ceil(w / 2);
            h = Math.ceil(h / 2);
        }
        list[k] = {
            'width': w,
            'height': h,
            'pow': pow,
            'cumWidth': 0,
            'cumHeight': 0
        };
    }
    list[0] = {
        'width': w,
        'height': h,
        'pow': pow,
        'cumWidth': 0,
        'cumHeight': 0
    };

    w = h = 0;
    for (k = 0; k <= this.level; k++) {
        list[k].cumWidth = w;
        list[k].cumHeight = h;
        w += list[k].width;
        h += list[k].height;
    }
    return list;
};

/** Perform the 2D wavelet transform
 *  from the image stored in 'this.tmp'.
 *  Use 'this.data' to store the coefficients
 *  and 'this.subband' to store the scale views.
 * @see WT
 * @private
 */
WT.prototype.wt2 = function () {
    'use strict';
    var wav = this.wavelet;
    var input = this.tmp;
    var scaleList = this.getScalesParameters();

    // Create output image
    var lastScale = scaleList[scaleList.length - 1];
    var dataWidth = lastScale.cumWidth + lastScale.width;
    var dataHeight = lastScale.cumHeight + lastScale.height;
    if (this.redundant) {
        dataHeight = 3 * input.ny;
    }
    this.data = input.getNew(dataWidth, dataHeight);
    var viewLL = this.data.getView();
    var viewHL = this.data.getView();
    var viewLH = this.data.getView();
    var viewHH = this.data.getView();
    this.subband = [];
    if (this.redundant) {
        viewLL.y0 = viewHH.y0 = input.ny;
        viewLH.y0 = 2 * input.ny;
    }

    // Buffer image
    var halfWidth = (this.redundant) ? this.width : Math.ceil(this.width / 2);
    var buffer = input.getNew(2 * halfWidth, this.height);
    var buffL = buffer.getView();
    var buffH = buffer.getView();
    buffL.nx = buffH.nx = buffH.x0 = halfWidth;

    // Process each scale
    while (scaleList.length > 1) {
        var scale = scaleList.pop();
        var D = (this.redundant) ? {'Dker': scale.pow} : {'Dout': 2};

        // H filtering from image to buffer
        buffL.nx = buffH.nx = scale.width;
        input.filter1d(wav.filterL, 'per', 'cl', D, buffL);
        input.filter1d(wav.filterH, 'per', 'cl', D, buffH);

        // Select each subband
        viewLL.nx = viewHL.nx = viewLH.nx = viewHH.nx = scale.width;
        viewLL.ny = viewHL.ny = viewLH.ny = viewHH.ny = scale.height;
        if (this.redundant) {
            viewHL.x0 = viewLH.x0 = viewHH.x0 = scale.cumWidth;
        } else {
            viewHL.x0 = viewHH.x0 = scale.cumWidth;
            viewLH.y0 = viewHH.y0 = scale.cumHeight;
        }
        this.subband[scaleList.length] = {
            'HL': viewHL.getView(),
            'LH': viewLH.getView(),
            'HH': viewHH.getView()
        };

        // V filtering from buffer to data
        buffL.T().filter1d(wav.filterL, 'per', 'cl', D, viewLL.T());
        buffL.T().filter1d(wav.filterH, 'per', 'cl', D, viewLH.T());
        buffH.T().filter1d(wav.filterL, 'per', 'cl', D, viewHL.T());
        buffH.T().filter1d(wav.filterH, 'per', 'cl', D, viewHH.T());

        // Be ready for next scale
        buffL.ny = buffH.ny = scale.height;
        input = viewLL;
    }
    this.subband[0] = {'LL': input.getView()};
};

/** Perform the inverse wavelet transform.
 * @see WT#inverse
 * @private
 * @param {ImageJS} [output]
 *  Output image.
 * @return {ImageJS}
 *  The reconstructed image.
 */
WT.prototype.iwt2 = function (output, wt2) {
    'use strict';
    var re = this.redundant;
    var factor = (re) ? 0.5 : 1;
    var filterL = Wavelet.filter(this.wavelet.invFilterL, 'rescale', factor);
    var filterH = Wavelet.filter(this.wavelet.invFilterH, 'rescale', factor);

    // If not redundant, oversampled image
    var decimView2;
    if (!re) {
        var data2 = this.data.getNew(2 * this.data.width, 2 * this.data.height);
        this.data.exportImage(data2.S(2));
        decimView2 = function (view) {
            view.data = data2.data;
            view.width = data2.width;
            view.height = data2.height;
            view.x0 *= 2;
            view.y0 *= 2;
            view.nx *= 2;
            view.ny *= 2;
            if (view.tx !== 1) {
                view.tx *= 2;
            }
            if (view.ty !== 1) {
                view.ty *= 2;
            }
        };
    }

    // Buffer image
    var roundedWidth = (re) ? this.width : 2 * Math.ceil(this.width / 2);
    var roundedHeight = (re) ? this.height : 2 * Math.ceil(this.height / 2);
    var outBuffer = this.data.getNew(roundedWidth * 2 * factor, roundedHeight * 2 * factor);
    var buffer = this.data.getNew(2 * roundedWidth, roundedHeight);
    var buffL = buffer.getView();
    var buffH = buffer.getView();
    buffL.nx = buffH.nx = buffH.x0 = roundedWidth;

    // Process each scale
    var k, decim = Math.pow(2, this.level - 1);
    var viewLL = this.getScale(0).LL;
    if (!re) {
        decimView2(viewLL);
    }
    for (k = 1; k <= this.level; k++, decim /= 2) {
        var view = k % 2 == 0 ? wt2.getScale(k) : this.getScale(k);
        var D = (!re) ? 1 : {'Dker': decim};

        // Adapt buffer size
        if (!re) {
            decimView2(view.HL);
            decimView2(view.LH);
            decimView2(view.HH);
            viewLL.dx = viewLL.dy = 1;
            buffL.nx = buffH.nx = viewLL.nx = view.HH.nx;
            buffL.ny = buffH.ny = viewLL.ny = view.HH.ny;
        }

        // V filtering
        viewLL.T().filter1d(filterL, 'per', 'cr', D, buffL.T(), false);
        view.LH.T().filter1d(filterH, 'per', 'cr', D, buffL.T(), true);
        view.HL.T().filter1d(filterL, 'per', 'cr', D, buffH.T(), false);
        view.HH.T().filter1d(filterH, 'per', 'cr', D, buffH.T(), true);

        // H filtering
        viewLL = outBuffer.getView();
        if (!re) {
            viewLL.S_(2);
            viewLL.nx = buffL.nx;
            viewLL.ny = buffL.ny;
        }
        buffL.filter1d(filterL, 'per', 'cr', D, viewLL, false);
        buffH.filter1d(filterH, 'per', 'cr', D, viewLL, true);
    }

    // Copy the result
    viewLL.nx = this.width;
    viewLL.ny = this.height;
    return viewLL.exportImage(output);
};
// export  {Wavelet, WT}