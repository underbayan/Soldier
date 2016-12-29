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
Img.prototype.getCopy=function(output){
    if (output !== undefined && !(output instanceof ImageJS)) {
        throw new Error('output must be an ImageJS');
    }
    output = this.getView(output);
    if (output.data) {
        delete output.data;
    }
    output.data = new this.dataType(this.data);
    return output;
}

Img.prototype.dataType = Float64Array
// getChannels?

function ImgSub(){}
