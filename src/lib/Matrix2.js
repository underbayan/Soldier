import {ErrorConsole} from './common'
import isNumber from 'lodash/isNumber'
import * as cv from './convolution'

var Matrix2 = function (xLength: number, yLength: number, dataType = Array) {
    if (!this instanceof Matrix2) {
        ErrorConsole("Matrix2 is only used with new!")
    }
    if (!isNumber(xLength) || !isNumber(yLength) || xLength == 0 || yLength == 0) {
        ErrorConsole('Wrong dimension!')
    }
    this.shapes = [xLength, yLength]
    this.length = xLength * yLength
    this.strides = [1, xLength]
    this.dataType = dataType
    this.data = new dataType(this.length)
}

Matrix2.prototype.at = function (x: number, y: number): number {
    return this.data[x * this.strides[0] + y * this.strides[1]]
}
Matrix2.prototype.set = function (x: number, y: number, value: number): Matrix2 {
    this.data[x * this.strides[0] + y * this.strides[1]] = value
    return this
}
Matrix2.prototype.multiply = function (obj: Matrix2): Matrix2 {
    var result = Matrix2.multiply(this, obj)
    this.copy(result)
    return this
}
Matrix2.prototype.transpose = function (): Matrix2 {
    this.shapes = this.shapes.reverse()
    this.strides = this.strides.reverse()
    return this
}
Matrix2.prototype.format = function (): null {
    var xAxis = this.shapes[0]
    var yAxis = this.shapes[1]
    var outputString = '[\n'
    for (var j = 0; j < yAxis; j++) {
        for (var i = 0; i < xAxis; i++) {
            outputString += this.at(i, j) + ','
        }
        outputString += '\n'
    }
    outputString += ']'
    return (outputString)
}
Matrix2.prototype.multiplyScala = function (value: number): Matrix2 {
    var allLength = this.length
    for (var k = 0; k < allLength; k++) {
        this.data[k] *= value
    }
    return this
}

Matrix2.prototype.add = function (obj: Matrix2) {
    if (obj.shapes[0] != this.shapes[0] || obj.shapes[1] != this.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var allLength = this.length
    for (var k = 0; k < allLength; k++) {
        this.data[k] += obj.data[k]
    }
    return this
}
Matrix2.prototype.minus = function (obj: Matrix2): Matrix2 {
    if (obj.shapes[0] != this.shapes[0] || obj.shapes[1] != this.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var allLength = this.length
    for (var k = 0; k < allLength; k++) {
        this.data[k] -= obj.data[k]
    }
    return this
}
Matrix2.prototype.addScala = function (value: number): Matrix2 {
    var allLength = this.length
    for (var k = 0; k < allLength; k++) {
        this.data[k] += value
    }
    return this
}
Matrix2.prototype.clone = function (): Matrix2 {
    var result = new Matrix2(this.shapes[0], this.shapes[1], this.dataType)
    for (var i = 0; i < this.length; i++) {
        result.data[i] = this.data[i]
    }
    return result
}
Matrix2.prototype.copy = function (obj: Matrix2 ): Matrix2 {
    this.shape = obj.shapes
    this.strides = obj.strides
    this.data = obj.data
    this.dataType=obj.dataType
    this.length=obj.length
    return this
}
Matrix2.prototype.getRow = function (rowValue: number): Array {
    var rowLength = this.shapes[0]
    var row = new this.dataType(rowLength)
    for (var i = 0; i < rowLength; i++) {
        row[i] = this.at(i, rowValue)
    }
    return row
}
Matrix2.prototype.setRow = function (rowValue: number, setArray: Array): null {
    var rowLength = this.shapes[0]
    if (rowLength != setArray.length) {
        ErrorConsole('Invalid input array')
    }
    for (var i = 0; i < rowLength; i++) {
        this.set(rowLength, rowValue, setArray[i]);
    }
}
Matrix2.prototype.concat = function (obj: Matrix2, axis = 0): null {
    var result = Matrix2.concat(this, obj,axis)
    this.copy(result)
    return this
}
Matrix2.prototype.cov = function (filter: Array) {
    var row = this.shapes[1]
    var col = this.shapes[0]
    for (var i = 0; i < row; i++) {
        var tmp = this.getRow(i)
        this.setRow(cv.downsampling_convolution_periodization(tmp, tmp.length, filter, filter.length, 1, 1))
    }
}
Matrix2.prototype.wt2 = function (wavelet: DiscreteWavelet, level) {
    var row = this.shapes[1]
    var col = this.shapes[0]
    //calculate the proper level
    level = Math.min(Math.floor(Math.log2(col)), level)
    var RfilterH = wavelet.dec_hi
    var RfilterL = wavelet.dec_lo
    for (var j = 0; j < level; j++) {
        for (var i = 0; i < row; i++) {
            var tmp = this.getRow(i)
            var L = cv.downsampling_convolution_periodization(tmp, tmp.length, RfilterL, RfilterL.length, 2, 1)
            var H = cv.downsampling_convolution_periodization(tmp, tmp.length, RfilterH, RfilterH.length, 2, 1)
        }
    }
}

Matrix2.concat = function (obj: Matrix2, obj2: Matrix2, axis = 0): Matrix2 {
    if (!axis ? obj.shapes[1] != obj2.shapes[1] : obj.shapes[0] != obj2.shapes[0]) {
        ErrorConsole("Invalid input Matrix2 shapes")
    }
    var result
    if (axis) {
        result = new Matrix2(obj.shapes[0], obj.shapes[1] + obj2.shapes[1], obj.dataType)
        var originalHeight = obj.shapes[1]
        var xAxis = result.shapes[0]
        var yAxis = result.shapes[1]
        for (var j = 0; j < yAxis; j++) {
            for (var i = 0; i < xAxis; i++) {
                result.set(i, j, originalHeight > j ? obj.at(i, j) : obj2.at(i, j - originalHeight))
            }
        }
    } else {
        result = new Matrix2(obj.shapes[0] + obj2.shapes[0], obj.shapes[1], obj.dataType)
        var originalWidth = obj.shapes[0]
        var xAxis = result.shapes[0]
        var yAxis = result.shapes[1]
        for (var j = 0; j < yAxis; j++) {
            for (var i = 0; i < xAxis; i++) {
                result.set(i, j, originalWidth > i ? obj.at(i, j) : obj2.at(i - originalWidth, j))
            }
        }
    }
    return result
}
Matrix2.add = function (obj: Matrix2, obj2: Matrix2): Matrix2 {
    if (obj.shapes[0] != obj2.shapes[0] || obj.shapes[1] != obj2.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var result = new Matrix2(obj.shapes[0], obj.shapes[1], obj.dataType)
    var allLength = result.length
    for (var k = 0; k < allLength; k++) {
        result.data[k] = obj.data[k] + obj2.data[k]
    }
    return result
}
Matrix2.minus = function (obj: Matrix2, obj2: Matrix2): Matrix2 {
    if (obj.shapes[0] != obj2.shapes[0] || obj.shapes[1] != obj2.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var result = new Matrix2(obj.shapes[0], obj.shapes[1], obj.dataType)
    var allLength = result.length
    for (var k = 0; k < allLength; k++) {
        result.data[k] = obj.data[k] - obj2.data[k]
    }
    return result
}
Matrix2.multiply = function (obj: Matrix2, obj2: Matrix2): Matrix2 {
    if (obj.shapes[0] != obj2.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var mid = obj.shapes[0]
    var newXLength = obj2.shapes[0]
    var newYLength = obj.shapes[1]
    var result = new Matrix2(newXLength, newYLength, obj.dataType)
    for (var j = 0; j < newYLength; j++) {
        for (var i = 0; i < newXLength; i++) {
            var sum = 0
            for (var k = 0; k < mid; k++) {
                sum += obj.at(k, j) * obj2.at(i, k)
            }
            result.set(i, j, sum)
        }
    }
    return result
}
export default Matrix2