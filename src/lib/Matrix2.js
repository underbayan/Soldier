import {ErrorConsole} from './common'
import isNumber from 'lodash/isNumber'
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

Matrix2.prototype.at = function (x: number, y: number) {
    return this.data[x + y * this.strides[1]]
}

Matrix2.prototype.set = function (x: number, y: number, value: number) {
    this.data[x + y * this.strides[1]] = value
    return this
}
Matrix2.prototype.multiply = function (obj) {
    var result = Matrix2.multiply(this, obj)
    this.shapes = result.shapes
    this.strides = result.strides
    this.length = result.length
    this.data = result.data
    return this
}
Matrix2.prototype.multiplyScala = function (value: number) {
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
        this.data[k] += obj[k]
    }
    return this
}
Matrix2.prototype.addScala = function (value: number) {
    var allLength = this.length
    for (var k = 0; k < allLength; k++) {
        this.data[k] += value
    }
    return this
}

Matrix2.add = function (obj: Matrix2, obj2: Matrix2) {
    if (obj.shapes[0] != obj2.shapes[0] || obj.shapes[1] != obj2.shapes[1]) {
        ErrorConsole('Dimension does not match!')
    }
    var result = new Matrix2(obj.shapes[0], obj.shapes[1], obj.dataType)
    var allLength = result.length
    for (var k = 0; k < allLength; k++) {
        result.data[k] += obj[k] + obj2[k]
    }
    return result
}
Matrix2.multiply = function (obj: Matrix2, obj2: Matrix2) {
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