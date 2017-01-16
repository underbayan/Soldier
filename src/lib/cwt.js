/* @flow */
'use strict'
var gaus = function (input: Array<number>, length: number, N: number, output: Array<number>) {
    var i = 0;
    output = !!output ? output : [];
    for (i = 0; i < length; i++) {
        switch (N) {
            case 1:
                output[i] = -2 * input[i] * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(Math.sqrt(Math.PI / 2));
                break;
            case 2:
                output[i] = -2 * (2 * Math.pow(input[i], 2.0) - 1) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(3 * Math.sqrt(Math.PI / 2));
                break;
            case 3:
                output[i] = -4 * (-2 * Math.pow(input[i], 3.0) + 3 * input[i]) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(15 * Math.sqrt(Math.PI / 2));
                break;
            case 4:
                output[i] = 4 * (-12 * Math.pow(input[i], 2.0) + 4 * Math.pow(input[i], 4.0) + 3) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(105 * Math.sqrt(Math.PI / 2));
                break;
            case 5:
                output[i] = 8 * (-4 * Math.pow(input[i], 5.0) + 20 * Math.pow(input[i], 3.0) - 15 * input[i]) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(105 * 9 * Math.sqrt(Math.PI / 2));
                break;
            case 6:
                output[i] = -8 * (8 * Math.pow(input[i], 6.0) - 60 * Math.pow(input[i], 4.0) + 90 * Math.pow(input[i], 2.0) - 15) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(105 * 9 * 11 * Math.sqrt(Math.PI / 2));
                break;
            case 7:
                output[i] = -16 * (-8 * Math.pow(input[i], 7.0) + 84 * Math.pow(input[i], 5.0) - 210 * Math.pow(input[i], 3.0) + 105 * (input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(105 * 9 * 11 * 13 * Math.sqrt(Math.PI / 2));
                break;
            case 8:
                output[i] = 16 * (16 * Math.pow(input[i], 8.0) - 224 * Math.pow(input[i], 6.0) + 840 * Math.pow(input[i], 4.0) - 840 * Math.pow(input[i], 2.0) + 105) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(105 * 9 * 11 * 13 * 15 * Math.sqrt(Math.PI / 2));
                break;
        }
    }
    return output;
}


var mexh = function (input: Array<number>, length: number, output: Array<number>) {
    var i = 0;
    output = !!output ? output : [];

    for (i = 0; i < length; i++) {
        output[i] = (1 - Math.pow(input[i], 2.0)) * Math.exp(-Math.pow(input[i], 2.0) / 2) * 2 / (Math.sqrt(3) * Math.sqrt(Math.sqrt(Math.PI)));
    }
    return output;
}

var morl = function (input: Array<number>, length: number, output: Array<number>) {
    var i = 0;
    output = !!output ? output : [];

    for (i = 0; i < length; i++) {
        output[i] = Math.cos(5 * input[i]) * Math.exp(-Math.pow(input[i], 2.0) / 2);
    }
    return output;
}
var cgau = function (input: Array<number>, length: number, N: number, output_r: Array<number>, output_i: Array<number>) {
    var i = 0;
    output_r = !!output_r ? output_r : [];
    output_i = !!output_i ? output_i : [];

    for (i = 0; i < length; i++) {
        switch (N) {
            case 1:
                output_r[i] = (-2 * input[i] * Math.cos(input[i]) - Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(2 * Math.sqrt(Math.PI / 2));
                output_i[i] = (2 * input[i] * Math.sin(input[i]) - Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(2 * Math.sqrt(Math.PI / 2));
                break;
            case 2:
                output_r[i] = (4 * Math.pow(input[i], 2.0) * Math.cos(input[i]) + 4 * input[i] * Math.sin(input[i]) - 3 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(10 * Math.sqrt(Math.PI / 2));
                output_i[i] = (-4 * Math.pow(input[i], 2.0) * Math.sin(input[i]) + 4 * input[i] * Math.cos(input[i]) + 3 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(10 * Math.sqrt(Math.PI / 2));
                break;
            case 3:
                output_r[i] = (-8 * Math.pow(input[i], 3.0) * Math.cos(input[i]) - 12 * Math.pow(input[i], 2.0) * Math.sin(input[i]) + 18 * input[i] * Math.cos(input[i]) + 7 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(76 * Math.sqrt(Math.PI / 2));
                output_i[i] = (8 * Math.pow(input[i], 3.0) * Math.sin(input[i]) - 12 * Math.pow(input[i], 2.0) * Math.cos(input[i]) - 18 * input[i] * Math.sin(input[i]) + 7 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(76 * Math.sqrt(Math.PI / 2));

                break;
            case 4:
                output_r[i] = (16 * Math.pow(input[i], 4.0) * Math.cos(input[i]) + 32 * Math.pow(input[i], 3.0) * Math.sin(input[i]) - 72 * Math.pow(input[i], 2.0) * Math.cos(input[i]) - 56 * input[i] * Math.sin(input[i]) + 25 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(764 * Math.sqrt(Math.PI / 2));
                output_i[i] = (-16 * Math.pow(input[i], 4.0) * Math.sin(input[i]) + 32 * Math.pow(input[i], 3.0) * Math.cos(input[i]) + 72 * Math.pow(input[i], 2.0) * Math.sin(input[i]) - 56 * input[i] * Math.cos(input[i]) - 25 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(764 * Math.sqrt(Math.PI / 2));

                break;
            case 5:
                output_r[i] = (-32 * Math.pow(input[i], 5.0) * Math.cos(input[i]) - 80 * Math.pow(input[i], 4.0) * Math.sin(input[i]) + 240 * Math.pow(input[i], 3.0) * Math.cos(input[i]) + 280 * Math.pow(input[i], 2.0) * Math.sin(input[i]) - 250 * input[i] * Math.cos(input[i]) - 81 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(9496 * Math.sqrt(Math.PI / 2));
                output_i[i] = (32 * Math.pow(input[i], 5.0) * Math.sin(input[i]) - 80 * Math.pow(input[i], 4.0) * Math.cos(input[i]) - 240 * Math.pow(input[i], 3.0) * Math.sin(input[i]) + 280 * Math.pow(input[i], 2.0) * Math.cos(input[i]) + 250 * input[i] * Math.sin(input[i]) - 81 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(9496 * Math.sqrt(Math.PI / 2));

                break;
            case 6:
                output_r[i] = (64 * Math.pow(input[i], 6.0) * Math.cos(input[i]) + 192 * Math.pow(input[i], 5.0) * Math.sin(input[i]) - 720 * Math.pow(input[i], 4.0) * Math.cos(input[i]) - 1120 * Math.pow(input[i], 3.0) * Math.sin(input[i]) + 1500 * Math.pow(input[i], 2.0) * Math.cos(input[i]) + 972 * input[i] * Math.sin(input[i]) - 331 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(140152 * Math.sqrt(Math.PI / 2));
                output_i[i] = (-64 * Math.pow(input[i], 6.0) * Math.sin(input[i]) + 192 * Math.pow(input[i], 5.0) * Math.cos(input[i]) + 720 * Math.pow(input[i], 4.0) * Math.sin(input[i]) - 1120 * Math.pow(input[i], 3.0) * Math.cos(input[i]) - 1500 * Math.pow(input[i], 2.0) * Math.sin(input[i]) + 972 * input[i] * Math.cos(input[i]) + 331 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(140152 * Math.sqrt(Math.PI / 2));

                break;
            case 7:
                output_r[i] = (-128 * Math.pow(input[i], 7.0) * Math.cos(input[i]) - 448 * Math.pow(input[i], 6.0) * Math.sin(input[i]) + 2016 * Math.pow(input[i], 5.0) * Math.cos(input[i]) + 3920 * Math.pow(input[i], 4.0) * Math.sin(input[i]) - 7000 * Math.pow(input[i], 3.0) * Math.cos(input[i]) - 6804 * Math.pow(input[i], 2.0) * Math.sin(input[i]) + 4634 * input[i] * Math.cos(input[i]) + 1303 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(2390480 * Math.sqrt(Math.PI / 2));
                output_i[i] = (128 * Math.pow(input[i], 7.0) * Math.sin(input[i]) - 448 * Math.pow(input[i], 6.0) * Math.cos(input[i]) - 2016 * Math.pow(input[i], 5.0) * Math.sin(input[i]) + 3920 * Math.pow(input[i], 4.0) * Math.cos(input[i]) + 7000 * Math.pow(input[i], 3.0) * Math.sin(input[i]) - 6804 * Math.pow(input[i], 2.0) * Math.cos(input[i]) - 4634 * input[i] * Math.sin(input[i]) + 1303 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(2390480 * Math.sqrt(Math.PI / 2));

                break;
            case 8:
                output_r[i] = (256 * Math.pow(input[i], 8.0) * Math.cos(input[i]) + 1024 * Math.pow(input[i], 7.0) * Math.sin(input[i]) - 5376 * Math.pow(input[i], 6.0) * Math.cos(input[i]) - 12544 * Math.pow(input[i], 5.0) * Math.sin(input[i]) + 28000 * Math.pow(input[i], 4.0) * Math.cos(input[i]) + 36288 * Math.pow(input[i], 3.0) * Math.sin(input[i]) - 37072 * Math.pow(input[i], 2.0) * Math.cos(input[i]) - 20848 * input[i] * Math.sin(input[i]) + 5937 * Math.cos(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(46206736 * Math.sqrt(Math.PI / 2));
                output_i[i] = (-256 * Math.pow(input[i], 8.0) * Math.sin(input[i]) + 1024 * Math.pow(input[i], 7.0) * Math.cos(input[i]) + 5376 * Math.pow(input[i], 6.0) * Math.sin(input[i]) - 12544 * Math.pow(input[i], 5.0) * Math.cos(input[i]) - 28000 * Math.pow(input[i], 4.0) * Math.sin(input[i]) + 36288 * Math.pow(input[i], 3.0) * Math.cos(input[i]) + 37072 * Math.pow(input[i], 2.0) * Math.sin(input[i]) - 20848 * input[i] * Math.cos(input[i]) - 5937 * Math.sin(input[i])) * Math.exp(-Math.pow(input[i], 2.0)) / Math.sqrt(46206736 * Math.sqrt(Math.PI / 2));

                break;
        }
    }
    return {output_r, output_i}

}


var shan = function (input: Array<number>, length: number, FB: number, FC: number, output_r: Array<number>, output_i: Array<number>) {
    var i = 0;
    output_r = !!output_r ? output_r : [];
    output_i = !!output_i ? output_i : [];

    for (i = 0; i < length; i++) {
        output_r[i] = Math.cos(2 * Math.PI * FC * input[i]) * Math.sqrt(FB);
        output_i[i] = Math.sin(2 * Math.PI * FC * input[i]) * Math.sqrt(FB);
        if (input[i] != 0) {
            output_r[i] *= Math.sin(input[i] * FB * Math.PI) / (input[i] * FB * Math.PI);
            output_i[i] *= Math.sin(input[i] * FB * Math.PI) / (input[i] * FB * Math.PI);
        }
    }
    return {output_r, output_i}

}

var fbsp = function (input: Array<number>, length: number, M: number, FB: number, FC: number, output_r: Array<number>, output_i: Array<number>) {
    var i = 0;

    output_r = !!output_r ? output_r : [];
    output_i = !!output_i ? output_i : [];

    for (i = 0; i < length; i++) {
        if (input[i] != 0) {
            output_r[i] = Math.cos(2 * Math.PI * FC * input[i]) * Math.sqrt(FB) * Math.pow(Math.sin(Math.PI * input[i] * FB / M) / (Math.PI * input[i] * FB / M), M);
            output_i[i] = Math.sin(2 * Math.PI * FC * input[i]) * Math.sqrt(FB) * Math.pow(Math.sin(Math.PI * input[i] * FB / M) / (Math.PI * input[i] * FB / M), M);
        }
        else {
            output_r[i] = Math.cos(2 * Math.PI * FC * input[i]) * Math.sqrt(FB);
            output_i[i] = Math.sin(2 * Math.PI * FC * input[i]) * Math.sqrt(FB);
        }
    }
    return {output_r, output_i}
}


var cmor = function (input: Array<number>, length: number, FB: number, FC: number, output_r: Array<number>, output_i: Array<number>) {
    var i = 0;
    output_r = !!output_r ? output_r : [];
    output_i = !!output_i ? output_i : [];
    for (i = 0; i < length; i++) {
        output_r[i] = Math.cos(2 * Math.PI * FC * input[i]) * Math.exp(-Math.pow(input[i], 2.0) / FB) / Math.sqrt(Math.PI * FB);
        output_i[i] = Math.sin(2 * Math.PI * FC * input[i]) * Math.exp(-Math.pow(input[i], 2.0) / FB) / Math.sqrt(Math.PI * FB);
    }
    return {output_r, output_i}

}
export  {gaus, fbsp, cmor, shan, cgau, morl, mexh}