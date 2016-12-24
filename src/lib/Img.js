/* flow */
function Img(width=0, height=0, channels = 3, options) {
    if (!this instanceof Img) {
        throw new Error("Img is only used with new")
    }

    this.width = width
    this.height = height
    this.channels = channels
    if (options && options.dataType) {
        this.dataType = options.dataType
    }
    this.data = new this.dataType(channels * width * height)
    return this
}

Img.prototype.dataType = Float64Array


function ImgSub(){}
