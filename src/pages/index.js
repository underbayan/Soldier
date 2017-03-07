// var window = require("window")
// require('imports-loader?this=>window!../lib/Tools.object.js')
// require('imports-loader?this=>window!../lib/ImageJS.class')
// require('imports-loader?this=>window!../lib/ImageRGBA.class')
// require('imports-loader?this=>window!../lib/Wavelets_list')
// import {Wavelet, WT} from "../lib/wavelets.class"
// import Tools from '../lib/Tools.object.js'
    "use strict";
// Global variables
var imInput = [], imNoisy = [], imIwt = [];
var wt = [];
window.newWt = null
var estimStd = [];
var imDenoised = [], imError = [];
var imputIdArray = ['first', 'second']
var Idwt = []
// Get an element or its value
function $(elmt, type) {
    if (typeof elmt === 'string' && document.getElementById(elmt)) {
        elmt = document.getElementById(elmt);
    }
    if (type === undefined) {
        return elmt;
    }
    if (typeof type !== 'string') {
        throw new Error('Function $: second argument must be a string');
    }
    type = type.toLowerCase();

    if (type.substr(0, 3) === 'str') {
        elmt = elmt.value;
    } else if (type.substr(0, 3) === 'int') {
        elmt = parseInt(elmt.value, 10);
    } else if (type.substr(0, 5) === 'float') {
        elmt = parseFloat(elmt.value);
    } else if (type.substr(0, 5) === 'check') {
        elmt = (elmt.checked) ? true : false;
    } else {
        throw new Error('Function $: second argument value unknown');
    }

    return elmt;
}
// Assume a condition is true, error otherwise
function assert(cond, msg) {
    if (!cond) {
        alert('Error: ' + msg);
        throw new Error(msg);
    }
}
// Initialize the script
function init() {
    document.getElementById('inputArrayZone').innerHTML = imputIdArray.reduce(function (s, id) {
        return s + "" +
            "<div id='" + id + "DragZone' style='min-width: 200px;min-height: 200px ;background-color: #ac2925;display: inline-block;color: white' >" +
            "<canvas style='width: 200px;height: 200px ;background-color: #ac2925;display: inline-block;border: dashed 2px white' id='" + id + "Display' class='input-image'></canvas>" +
            "<canvas style='width: 200px;height: 200px ;background-color: #ac2925;display: inline-block;border: dashed 2px white' id='" + id + "Noise' class='noised-image'></canvas>" +
            "<label>Noise Std</label><input type='number' value=0 id='" + id + "NoiseStd' onchange='doNoise(imInput[\"" + id + "\"],\"" + id + "\")'/>" + "</div>"
            ;
    }, '')
    document.getElementById('DWTArrayZone').innerHTML = imputIdArray.reduce(function (s, id) {
        return s + "<table id='" + id + "tWt'><tbody><tr><td><canvas id='LL0' width='512' height='338'></canvas></td><td rowspan='1'><canvas id='HL1' width='512' height='338'></canvas></td><td rowspan='2' style='display: none;'><canvas id='HL2' width='64' height='43'></canvas></td><td rowspan='3' style='display: none;'><canvas id='HL3' width='128' height='85'></canvas></td><td rowspan='4' style='display: none;'><canvas id='HL4' width='256' height='169'></canvas></td><td rowspan='5' style='display: none;'><canvas id='HL5' width='512' height='338'></canvas></td></tr><tr><td colspan='1'><canvas id='LH1' width='512' height='338'></canvas></td><td><canvas id='HH1' width='512' height='338'></canvas></td></tr><tr style='display: none;'><td colspan='2'><canvas id='LH2' width='64' height='43'></canvas></td><td><canvas id='HH2' width='64' height='43'></canvas></td></tr><tr style='display: none;'><td colspan='3'><canvas id='LH3' width='128' height='85'></canvas></td><td><canvas id='HH3' width='128' height='85'></canvas></td></tr><tr style='display: none;'><td colspan='4'><canvas id='LH4' width='256' height='169'></canvas></td><td><canvas id='HH4' width='256' height='169'></canvas></td></tr><tr style='display: none;'><td colspan='5'><canvas id='LH5' width='512' height='338'></canvas></td><td><canvas id='HH5' width='512' height='338'></canvas></td></tr></tbody></table>";
    }, '')
    document.getElementById('DWTArrayParams').innerHTML = imputIdArray.reduce(function (s, id) {
        return s + "<fieldset> " +
            "<legend>Decomposition</legend> " +
            "<label title='Name of the wavelet'> " +
            "<select id='" + id + "Wavelet'>" +
            "<option value='haar'>Haar / Daubechies 1</option>" +
            "<option value='db2'>Daubechies 2</option>" +
            "<option value='db4'>Daubechies 4</option>" +
            "<option value='db8'>Daubechies 8</option>" +
            "<option value='sym2'>Symlets 2</option>" +
            "<option value='sym4'>Symlets 4</option>" +
            "<option value='sym8'>Symlets 8</option>" +
            "<option value='coif1'>Coiflets 1</option>" +
            "<option value='coif2'>Coiflets 2</option>" +
            "<option value='coif4'>Coiflets 4</option>" +
            "<option value='bi13'>Biorthogonal 1-3</option>" +
            "<option value='bi31'>Biorthogonal 3-1</option>" +
            "<option value='bi68'>Biorthogonal 6-8</option>" +
            "<option value='bi97'>Biorthogonal 9-7</option>" +
            "</select>wavelet </label><br> " +
            "<label title='Number of scales in the decomposition'> " +
            "<input type='number' id='" + id + "TiLevel' size='2' maxlength='2' value='13' onchange='generateIdwtParams()'> levels </label> of decomposition<br> " +
            "<label title='Also called undecimated or translation invariant'> " +
            "<input type='checkbox' id='" + id + "Redundant'> Redundant transform </label><br>" +
            "<input  onclick='doWT(\"" + id + "\")' value=' DWT '> </fieldset>" +
            ""
    }, '')


    imputIdArray.map(function (id) {
        Wavelet.toHTML(id + 'Wavelet');
    })
    imputIdArray.map(function (id, index) {
        Tools.makeDraggable($(id + 'DragZone'), loadImage, 'url', id);
        loadImage('../assets/' + (1 + index) + '.jpg', null, id);
    })
    generateIdwtParams()


}
// Display the input image
function doDisplay(imageData, IDName) {
    assert(imageData, 'no loaded image');
    imageData.draw(IDName + "Display");
}
// Load an image
function loadImage(url, event, id) {
    // if (url.substr(0, 5) !== 'data:') {
    //     assert(null, 'no loaded image');
    // }
    imInput[id] = new ImageRGB().load(url, function () {
        doDisplay(imInput[id], id);
        doNoise(imInput[id], id);
    });
}
// Add noise
function doNoise(imageData, id) {
    assert(imageData, 'no loaded image');
    imNoisy[id] = imageData.addNoise($(id + 'NoiseStd', 'float'));
    imNoisy[id].draw(id + 'Noise');
}
function generateIdwtParams(imageIdList, Level) {
    var imgl = imageIdList || imputIdArray
    var s = ""
    imgl.map(function (o) {
        var level = Level || $(o + 'TiLevel', 'int')
        s += "<div class='idwt-params-line'>"
        for (var i = 0; i < level; i++) {
            s += "<label>" + i + "</label><input  class='idwt-params' onchange='reRunIDwt()' type='checkbox' checked value='1' name='" + o + "__" + i + "'/>"
        }
        s += "</div>"
    })
    document.getElementById("IdwtParams").innerHTML = s
}

function reRunIDwt() {
    var result = {};
    //
    // var tmpList = Array.prototype.slice.call(document.getElementsByClassName("idwt-params"));
    // tmpList.map(function (o) {
    //     var idAndLevel = o.name.split("__")
    //     result[idAndLevel[0]] = !!result[idAndLevel[0]] ? result[idAndLevel[0]] : []
    //     if (o.checked) {
    //         result[idAndLevel[0]].push(idAndLevel[1] - 0)
    //     }
    // })
    // var le = result.length
    // for (var rIndx in result) {
    //     var o = result[rIndx]
    //     console.log(o, rIndx)
    //     window.newWt = !!window.newWt ? window.newWt : jQuery.extend(true, window.newWt, wt[rIndx])
    //     assert(wt[rIndx], 'no loaded image');
    //     for (var i = 0; i < window.newWt.level; i++) {
    //         var tmpSub = window.newWt.subband[i]
    //         for (var keyString in tmpSub) {
    //             if (o.indexOf(i) !== -1) {
    //                 console.log(keyString, tmpSub[keyString], wt[rIndx].subband[i], wt[rIndx])
    //                 var ttt = tmpSub[keyString].data.map(function (tmpo, i) {
    //                     return (tmpo + wt[rIndx].subband[i][keyString].data[i]) / le
    //                 })
    //                 tmpSub[keyString].data = ttt
    //             }
    //             else {
    //             }
    //         }
    //     }
    // }

    doIWT()
    // Idwt
}
// Compute WT
function doWT(id) {
    assert(imNoisy[id], id + 'noisy image required');
    wt[id] = new WT(
        imNoisy[id],
        $(id + 'Redundant', 'check'),
        $(id + 'Wavelet', 'str'),
        $(id + 'TiLevel', 'int'));
    estimStd = wt[id].noiseStd();
    $(id + 'NoiseStd').value = estimStd;

    var toggleCanvas = function () {
        this.style.borderColor = (!this.style.borderColor) ? 'red' : '';
    };
    wt[id].toHTML(id + 'tWt', toggleCanvas, .75);
}

// Compute the IWT

function doIWT(id) {
    // assert(wt[id], 'no WT computed');
    var processFromCanvas = function (view) {
        if (this.style.borderColor) {
            view.fill(0);
        }
    };
    console.log(window.newWt)
    console.log(wt['first'])
    var wtBis = new WT(wt['first']).processHTML('first' + 'tWt', processFromCanvas);

    // Thresold and inverse
    var t = $(id + 'Threshold', 'float');
    var type = $(id + 'SoftThreshold', 'check') ? 'soft' : 'hard';
    wtBis.threshold($(id + 'Threshold', 'float'), type);
    var imRec = wtBis.inverse(undefined, wt['second']);

    // Display
    imRec.draw('cDenoised');
    var imError = imRec.getNew();
    var psnr = imRec.psnr(imInput['first'], imError);
    // $('toPsnr').value = psnr;
    imError.setDynamic('abs');
    imError.draw('first' + 'Error');
}

init()
