// Ipij API (c) Copyright 2012, designed by B.Mazin & G.Tartavel

/* TO DO:
 *  - how to generate doc. for Tools.Random[*]?
 */

/**
 * @fileOverview Provide general usage functions.
 * @author TM = Tartavel & Mazin
 * @version 1.0
 */

/**
 * @namespace
 *  This object provide general usage functions.
 */
var Tools = {};

/** Make a HTML element draggable: objects can be dropped on it.
 * @memberOf Tools
 * @param {HTMLElement|String} element
 *  HTMLElement or HTMLElement id wich is desired to be draggable.
 * @param {function} callback
 *  Function to be called when files will be drag on element.
 * @param {string} [type='none']
 *  Specify the way of reading the file.<br />
 *  Can be 'DataUrl | url', 'ArrayBuffer | bin | binary', or 'text'.
 * @example
 *  // Drag callback: load the image
 *  var main = function(result) {
 *      // Load callback: display the image
 *      var callback = function(im) {
 *          im.draw(createView(1, 1));
 *      };
 *      // Load the image
 *      var im = new ImageJS().load(result, callback);
 *  };
 *  // Make the canvas with id 'canvas' draggable
 *  Tools.makeDraggable('canvasId', main);
 */
Tools.makeDraggable = function (element, callback, type, id) {
    "use strict";

    // Deal with arguments
    type = (type || 'none').toLowerCase();
    switch (type) {
        case 'dataurl':
        case 'url':
            type = 'url';
            break;
        case 'text':
        case 'txt':
            type = 'txt';
            break;
        case 'arraybuffer':
        case 'binary':
        case 'bin':
            type = 'bin';
            break;
        default:
            type = 'none';
    }

    if (typeof element === 'string') {
        element = document.getElementById(element) || element;
    }

    // Callback functions declarations
    var dragEnter, dragLeave, dragOver;
    dragEnter = dragLeave = dragOver = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
    };

    var drop = function (evt) {
        evt.stopPropagation();
        evt.preventDefault();

        // File handling functions
        var handleFile, newCallback;
        if (type !== 'none') {
            newCallback = function (evt) {
                if (callback) {
                    callback(evt.target.result, evt, id);
                }
            };
            handleFile = function (file) {
                var reader = new FileReader();
                reader.onload = newCallback;
                switch (type) {
                    case 'url':
                        reader.readAsDataURL(file);
                        break;
                    case 'txt':
                        reader.readAsText(file);
                        break;
                    case 'bin':
                        reader.readAsArrayBuffer(file);
                        break;
                }
            };
        } else {
            handleFile = function (file) {
                if (callback) {
                    callback(file);
                }
            };
        }

        // Only call the handler if 1 or more files was dropped.
        if (evt.dataTransfer.files.length) {
            var i;
            for (i = 0; i < evt.dataTransfer.files.length; i++) {
                handleFile(evt.dataTransfer.files[i]);
            }
        }
    };

    // Drag Drop on HTML element.
    element.addEventListener('dragenter', dragEnter, false);
    element.addEventListener('dragleave', dragLeave, false);
    element.addEventListener('dragover', dragOver, false);
    element.addEventListener('drop', drop, false);
};

/** Object prototypal inheritance.<br />
 *  Inherit prototype from an object
 *  and add uber property to acces to parent.
 * @param {function} child
 *  Constructor from which we wish inherit.
 * @param {function} parent
 *  Object constructor from which we wish inherit.
 */
Tools.inheritance = function (child, constructor) {
    "use strict";
    var Inherit = function () {
    };
    Inherit.prototype = constructor.prototype;
    child.prototype = new Inherit();
    child.prototype.constructor = child;
    child.uber = constructor.prototype;
};


/* ********** TIME TOOLS ********** */

/**
 * @namespace
 *  Provide time functions.
 */
Tools.Time = {};

/** List of recorded ticks.
 * @see Tools.Time.interTicks */
Tools.Time.ticks = [];

/** List of recorded ticks differences.
 * @see Tools.Time.interComments */
Tools.Time.interTicks = [];

/** Descriptions for ticks differences.
 * @see Tools.Time.interTicks */
Tools.Time.interComments = [];

/** Record the current timestamp.
 * @see Tools.Time.ticks
 * @see Tools.Time.interTicks
 * @see Tools.Time.interComments
 * @param {boolean|String} [param = '']
 *  If 'false', only add the current timestamp (in ms) to the 'ticks' list.<br />
 *  Otherwise, also add the elapsed time (in ms) since the last tick to the<br/>
 *  'interticks' list and add the string to the 'interComments' list.
 * @return {number}
 *  If 'param' is not false, return the elapsed time since the last tick.<br />
 *  If 'param' is false, return the current timestamp.
 */
Tools.Time.tick = function (param) {
    "use strict";
    var errMsg = 'Tools.Time.tick: ';
    if (param === undefined || param === true) {
        param = '';
    }
    if (typeof param !== 'string' && param !== false) {
        throw new Error(errMsg + "'param' must be a string or a boolean");
    }

    // Time and last time
    var t = new Date().getTime();
    var timeDiff = -1;

    // Inter-ticks
    if (param !== false && Tools.Time.ticks.length > 0) {
        timeDiff = t - Tools.Time.ticks[Tools.Time.ticks.length - 1];
        Tools.Time.interTicks.push(timeDiff);
        Tools.Time.interComments.push(param);
    }

    // Add the time
    Tools.Time.ticks.push(t);
    return (timeDiff < 0) ? t : timeDiff;
};


/* ********** ARRAY TOOLS ********** */

/**
 * @namespace
 *  Provide array functions.
 */
Tools.Array = {};

/** Sort a numeric array.
 * @param {Array} array
 *  Array to be sorted.
 * @param {boolean} [ascending = true]
 *  Sort the array in ascending / descending order.
 * @return {void}
 *  The array, sorted on place.
 */
Tools.Array.sort = function (t, ascending) {
    'use strict';
    var errMsg = 'Tools.Array.sort: ';
    if (!t || t.length === undefined) {
        throw new Error(errMsg + 'first argument must be an array');
    }
    if (ascending === false) {
        Array.prototype.sort.call(t, function (a, b) {
            return b - a;
        });
    } else if (ascending === undefined || ascending === true) {
        Array.prototype.sort.call(t, function (a, b) {
            return a - b;
        });
    } else {
        throw new Error(errMsg + "invalid type for 'ascending' parameter");
    }
    return t;
};

/** Return the indices that sort a numeric array.
 * @param {Array} array
 *  Array to be sorted.
 * @param {boolean} [ascending = true]
 *  Sort the array in ascending / descending order.
 * @return {Array}
 *  The indices I s.t. array[I] is sorted.
 */
Tools.Array.argSort = function (t, ascending) {
    'use strict';
    var errMsg = 'Tools.Array.sort: ';
    if (!t || t.length === undefined) {
        throw new Error(errMsg + 'first argument must be an array');
    }
    // Create index array
    var k, N = t.length;
    var ArrayType = Int32Array || Array;
    var I = new ArrayType(N);
    for (k = 0; k < N; k++) {
        I[k] = k;
    }
    // Sort
    if (ascending === false) {
        Array.prototype.sort.call(I, function (a, b) {
            return t[b] - t[a];
        });
    } else if (ascending === undefined || ascending === true) {
        Array.prototype.sort.call(I, function (a, b) {
            return t[a] - t[b];
        });
    } else {
        throw new Error(errMsg + "invalid type for 'ascending' parameter");
    }
    return I;
};

/** Is a 2D array rectangular?
 * @param {Array} array
 *  An array of arrays.
 * @return {boolean}
 *  True iff all the sub-arrays have the same length.
 */
Tools.Array.isRectangle = function (a) {
    'use strict';
    if (!a || !a.length || a[0].length === undefined) {
        return false;
    }
    var i, N = a.length;
    var P = a[0].length;
    for (i = 1; i < N; i++) {
        if (a[i].length !== P) {
            return false;
        }
    }
    return true;
};

/** Transpose an array of arrays.
 * @param {Array} a
 *  Array to be transposed.
 * @return {Array}
 *  Transposed array.
 */
Tools.Array.transpose = function (a) {
    'use strict';
    var errMsg = 'Tools.Array.transpose: ';
    if (!Tools.Array.isRectangle(a)) {
        throw new Error(errMsg + 'cannot transpose a non-rectangular array');
    }
    var i, N = a.length;
    var j, P = a[0].length;
    var aOut = new a.constructor(P);
    for (j = 0; j < P; j++) {
        aOut[j] = new a[0].constructor(N);
        for (i = 0; i < N; i++) {
            aOut[j][i] = a[i][j];
        }
    }
    return aOut;
};

/** Apply a function to each value of an array or an array of arrays.
 * @param {Array} array
 * @param {function} f
 *  Function to be applied to each element of the array.
 * @return {Array}
 *  Array of f(t) for all t in the input array.
 */
Tools.Array.mapRec = function (a, f) {
    'use strict';
    var i, N = a.length;
    var aOut = new a.constructor(N);
    for (i = 0; i < N; i++) {
        if (a[i].length !== undefined && typeof a[i] !== 'string') {
            aOut[i] = Tools.Array.mapRec(a[i], f);
        } else {
            aOut[i] = f(a[i]);
        }
    }
    return aOut;
};


/* ********** MATH TOOLS ********** */

/**
 * @namespace
 *  Provide mathematical functions.
 */
Tools.Math = {};

/** Return binomial coefficients.
 * @param {int|Array} n
 *  - integer n parameter in 'n choose k' coefficients.<br />
 *  - array 'binom': coefficients array 'n-1 choose *'
 * @return {Array}
 *  Array of size n+1 containing all 'n choose *' coefficients.
 */
Tools.Math.binomial = function (n) {
    "use strict";
    var k, i;
    var errMsg = 'Tools.Math.binomial: ';

    // Initial array
    var t;
    if (n instanceof Array) {
        t = n;
        n = t.length;
    } else if (typeof n !== 'number' || n < 0) {
        throw new Error(errMsg + "parameter 'n' must be a positive integer or an Array");
    }

    // Fill output array
    var out = [];
    out[0] = 1;
    if (t) {
        for (k = n - 1; k > 0; k--) {
            out[k] = t[k] + t[k - 1];
        }
        out[n] = 1;
    } else {
        for (k = 1; k <= n; k++) {
            out[k] = 0;
        }
        for (i = 1; i <= n; i++) {
            for (k = i; k > 0; k--) {
                out[k] = out[k] + out[k - 1];
            }
        }
    }

    return out;
};

/**
 * Compute modulus after division. Returns x - n*m where n = floor(x/m).
 * Matlab like function
 * @param {number} x
 *  Number.
 * @param {int} m
 *  modulo.
 * @return {Array}
 *  Modulus after division.
 */
Tools.Math.mod = function (x, m) {
    'use strict';
    var out;
    if (m !== 0) {
        out = x - Math.floor(x / m) * m;
    } else {
        out = x;
    }
    return out;
};

/**
 * Decompose number to exponential notation.
 * @param {number} n
 *  Number to decompose.
 * @param {int} [precision=3]
 *  Number of significant digits.
 * @return {Array}
 *  Array containing the significand and the exponent.
 */
Tools.toExponential = function (n, precision) {
    'use strict';
    precision = precision || 3;

    n = parseFloat(n.toPrecision(precision)).toExponential(precision).split('e');
    n[0] = parseFloat(n[0]);
    n[1] = parseFloat(n[1]);

    return n;
};

/* ********** STAT TOOLS ********** */

/**
 * @namespace
 *  Provide statistic functions.
 */
Tools.Stat = {};

/** Get the median value of an array.<br />
 * More generaly, get an element by its rank in a non-sorted array.<br />
 * Complexity is linear.<br />
 * WARNING: the order of the elements in the array will change.<br />
 * NOTE: for several rank search in the same array, it may be
 *  faster to sort it to get directly the n-th value.
 * @param {Array} t
 *  Any array with comparable elements.
 * @param {float} [rank=0.5]
 *  Relative rank of the element: 0 is the first one, 1 the last one.
 * @return {typeof t[0]}
 *  The value of an element with the given rank.
 */
Tools.Stat.rank = function (t, rank) {
    "use strict";
    var errMsg = 'Tools.Stat..rank: ';

    // Initialize arguments
    if (!t || !t.length) {
        throw new Error(errMsg + 'first argument must be a non-empty array');
    }
    if (rank === undefined) {
        rank = 0.5;
    } else if (typeof rank !== 'number' || rank < 0 || rank > 1) {
        throw new Error(errMsg + "if specified, 'rank' must be a value between 0 and 1");
    }

    // Sort the array and return the rank
    var i = Math.round(rank * (t.length - 1));
    Tools.Array.sort(t);
    return t[i];
};

/** Get the expectation of a function.
 * @param {function} f
 *  Evaluate the expectation of this function.
 * @param {Array|function} t
 *  Array of random samples, or function returning a random value.
 * @param {number} [N = t.length]
 *  Number of samples to take into account.
 * @return {Object}
 *  - 'expectation': expectation of f under the values of t.<br />
 *  - 'variance': variance of f.<br />
 *  - 'confidence': confidence value, e.g. 95% is this * 1.96
 */
Tools.Stat.expectation = function (f, t, N) {
    "use strict";
    var k;
    var errMsg = 'Tools.Stat.expectation: ';

    // Check arguments
    if (typeof f !== 'function') {
        throw new Error(errMsg + 'f must be a function');
    }
    if (!t) {
        throw new Error(errMsg + 't must be a function or an array');
    }
    if (N === undefined) {
        N = t.length;
    } else if (typeof N !== 'number') {
        throw new Error(errMsg + 'N must be an integer');
    }

    var isArray = (t.length) ? true : false;
    if (!isArray && typeof f !== 'function') {
        throw new Error(errMsg + 't must be a function or an array');
    }

    var sumX = 0, sumX2 = 0;
    for (k = 0; k < N; k++) {
        var x = (isArray) ? t[k] : t();
        var fx = f(x);
        sumX += fx;
        sumX2 += fx * fx;
    }

    var obj = {};
    obj.expectation = sumX / N;
    obj.variance = sumX2 / N - obj.mean * obj.mean;
    obj.confidence = Math.sqrt(obj.variance / N);
    return obj;
};

/** Linear regression.
 * @param {Array} y
 *  An array.
 * @param {Array} x
 *  Another array of the same size.
 * @return {Object}
 *  Values 'a' and 'b' minimizing the squarred sum of: y[i] - (a*x[i] + b).
 */
Tools.Stat.linearRegression = function (y, x) {
    "use strict";
    var k;
    var errMsg = 'Tools.Stat.linearRegression: ';
    if (!x || !y || !x.length || !y.length || x.length !== y.length) {
        throw new Error(errMsg + 'x and y must be arrays of the same length');
    }

    // Compute sums
    var N = x.length;
    var xm = 0, ym = 0;
    var xx = 0, xy = 0;
    for (k = 0; k < N; k++) {
        xm += x[k];
        ym += y[k];
        xx += x[k] * x[k];
        xy += x[k] * y[k];
    }

    // Compute mean / covariances
    xm /= N;
    ym /= N;
    xx = xx / N - xm * xm;
    xy = xy / N - xm * ym;

    // Compute coefficients
    var obj = {};
    obj.a = xy / xx;
    obj.b = ym - obj.a * xm;
    return obj;
};

/** Compute an histogram from values.<br />
 *  WARNING: the input arrays will be sorted.
 * @param {Array} y
 *  An array.
 * @param {int|Array} [bins]
 *  Number of bins, or bins array.
 * @param {Array} [edges]
 *  Edges array: in that case, use [] as bins array.
 * @return {Object}
 *  Object containing arrays 'edges', 'bins', 'count', 'proba' and 'density'.
 */
Tools.Stat.histogram = function (y, bins, edges) {
    "use strict";
    var i, k;
    var errMsg = 'Tools.Stat.histogram: ';

    // Check arguments
    if (y === undefined || !y.length) {
        throw new Error(errMsg + 'first argument must be an array.');
    }
    if (bins === undefined) {
        bins = 10;
    } else if (edges === undefined && typeof bins !== 'number' && !bins.length) {
        throw new Error(errMsg + 'if specified, the second argument must be an integer or an array.');
    } else if (edges === undefined || !edges.length) {
        throw new Error(errMsg + 'if specified, the third argument must be an array.');
    }

    // Initialize array and output
    var hist = {};
    Tools.Array.sort(y);

    // Generate bins array
    if (edges !== undefined) {
        Tools.Array.sort(edges);
        hist.edges = edges;
    } else if (bins.length) {
        Tools.Array.sort(bins);
        hist.bins = bins;
    } else {
        hist.bins = [];
        var iMin = Math.round((y.length - 1) / (2 * bins));
        var binMin = y[iMin];
        var binMax = y[y.length - 1 - iMin];
        for (k = 0; k < bins; k++) {
            hist.bins.push(binMin + (binMax - binMin) * k / (bins - 1));
        }
    }

    // Generate edges array
    if (!hist.edges) {
        hist.edges = [];
        for (k = 1; k < hist.bins.length; k++) {
            hist.edges.push((hist.bins[k - 1] + hist.bins[k]) / 2);
        }
    }

    // Generate bins array
    if (!hist.bins) {
        hist.bins = [0];
        for (k = 1; k < hist.edges.length; k++) {
            hist.bins.push((hist.edges[k - 1] + hist.edges[k]) / 2);
        }
        var lastBin = hist.bins[hist.bins.length - 1];
        var lastEdge = hist.edges[hist.edges.length - 1];
        hist.bins.push(2 * lastEdge - lastBin);
        hist.bins[0] = (2 * hist.edges[0] - hist.bins[1]);
    }

    // Generate histogram
    hist.count = [];
    var N = y.length;
    for (i = 0, k = 0; k < hist.edges.length; k++) {
        var nextEdge = hist.edges[k];
        var first = i;
        while (i < N && y[i] < nextEdge) {
            i++;
        }
        hist.count.push(i - first);
    }
    hist.count.push(N - i);

    // Normalize histogram
    hist.proba = [];
    for (k = 0; k < hist.count.length; k++) {
        hist.proba.push(hist.count[k] / N);
    }

    // Compute density
    hist.density = [];
    hist.density.push(0);
    for (k = 1; k < hist.proba.length - 1; k++) {
        var width = hist.edges[k] - hist.edges[k - 1];
        hist.density.push(hist.proba[k] / width);
    }
    hist.density.push(0);

    // The end
    return hist;
};


/* ********** RANDOM TOOLS ********** */

/**
 * @namespace
 *  Provide random samplers.
 */
Tools.Random = {};

Tools.Random.Normal = {
    'sample': function () {
        "use strict";
        var t = 2 * Math.PI * Math.random();
        var r = Math.sqrt(-2 * Math.log(1 - Math.random()));
        return r * Math.sin(t);
    }
};

Tools.Random.Bernoulli = {
    'sample': function (p) {
        "use strict";
        return (Math.random() < p);
    }
};

Tools.Random.Exponential = {
    'sample': function (lambda) {
        "use strict";
        return -Math.log(1 - Math.random()) / lambda;
    }
};


/* ********** KERNEL TOOLS ********** */

/**
 * @namespace
 * Holds kernels generation for filtering.
 */
Tools.Kernel = {};

/** Normalize a kernel.<br />
 *   Normalization such that its L1 norm is 1.
 * @param {Array} kernel
 *  The kernel.
 * @return {Array}
 *  The same array, but normalized.
 */
Tools.Kernel.normalize = function (kernel) {
    "use strict";
    var i;
    var N = kernel.length;

    // L1 norm of the kernel
    var sum = 0;
    for (i = 0; i < N; i++) {
        sum += Math.abs(kernel[i]);
    }

    // Normalize
    if (sum !== 0) {
        for (i = 0; i < N; i++) {
            kernel[i] /= sum;
        }
    }

    // Return it
    return kernel;
};

/** Compute a gaussian kernel and its derivatives.
 * @param {float} sigma
 *   Standard deviation of kernel
 * @param {int} [order=0]
 *   Derivative order: 0, 1 or 2
 * @param {float} [precision=3.0]
 *   Precision of the kernel
 * @returns {Float32Array}
 *   The gaussian Kernel
 */
Tools.Kernel.gaussian = function (sigma, order, precision) {
    "use strict";
    var i, x;

    // Kernel parameters
    if (precision === undefined) {
        precision = 3;
    }
    if (order === undefined) {
        order = 0;
    }

    var size = 1 + 2 * Math.ceil(sigma * Math.sqrt(precision * 2 * Math.log(10)));
    var kerOut = new Float64Array(size);
    var shift = (size - 1) / 2;
    var sum = 0;
    for (i = 0; i < (size + 1) / 2; i++) {
        x = i - shift;
        var tmp = 1 / (Math.sqrt(2 * Math.PI) * sigma);
        tmp *= Math.exp(-(x * x) / (2 * sigma * sigma));
        kerOut[i] = kerOut[size - 1 - i] = tmp;
    }

    // Generate the kernel
    switch (order) {

        case 0:
            for (i = 0, sum = 0; i < kerOut.length; i++) {
                sum += kerOut[i];
            }
            break;

        case 1:
            for (i = 0, sum = 0; i < kerOut.length; i++) {
                x = i - shift;
                kerOut[i] *= -x / Math.pow(sigma, 2);
                sum += x * kerOut[i];
            }
            break;

        case 2:
            for (i = 0, sum = 0; i < kerOut.length; i++) {
                x = i - shift;
                kerOut[i] *= (x * x / Math.pow(sigma, 4) - 1 / Math.pow(sigma, 2));
                sum += kerOut[i];
            }
            sum /= kerOut.length;
            for (i = 0; i < kerOut.length; i++) {
                kerOut[i] -= sum;
            }
            for (i = 0, sum = 0; i < kerOut.length; i++) {
                x = i - shift;
                sum += 0.5 * x * x * kerOut[i];
            }
            break;

        default:
            throw new Error('Kernel.gaussian: Derive order can be 0,1 or 2 but not ' + order);
    }

    if (sum !== 0) {
        for (i = 0; i < kerOut.length; i++) {
            kerOut[i] /= sum;
        }
    }

    return kerOut;
}
// export default Tools