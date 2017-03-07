/**
 * @description
 * @parmas string mother
 * @params ??     k
 * @params ??scale
 * @params param
 * @return [daughter,fourierFctor,coi,dofmin]
 **/
function wave_bases(mother, k, scale, param) {
    var kLength, daughter, k0, dofmin, coi, fourier_factor
    switch (mother) {
        case'MORLET':
            if (param == -1) {
                param = 6.
            }


            k0 = 6
            fourier_factor = (4 * Math.PI) / (k0 + Math.sqrt(2 + k0 ** 2)) // # Scale-->Fourier [Sec.3h]
            coi = fourier_factor / Math.sqrt(2)
            dofmin = 2  //# Degrees of freedom
            kLength = k.length

            daughter = k.map(function (o) {
                var kplus = o != 0 ? 1 : 0
                var expnt = -((scale * o - k0) ** 2) / 2. * kplus
                var norm = Math.sqrt(scale * o) * (Math.PI ** (-0.25)) * Math.sqrt(kLength)  //# total energy=N   [Eqn(7)]
                return norm * Math.exp(expnt) * kplus
            })


            /////


            break;
            // case'PAUL':
            //     if (param == -1)
            //         param = 4.
            //     m = param
            //     expnt = -scale * k * kplus
            //     norm = Math.sqrt(scale * k[1]) * (2 ** m / Math.sqrt(m * Math.prod(Math.arange(1, (2 * m))))) * Math.sqrt(n)
            //     daughter = norm * ((scale * k) ** m) * Math.exp(expnt) * kplus
            //     fourier_factor = 4 * Math.PI / (2 * m + 1)
            //     coi = fourier_factor * Math.sqrt(2)
            //     dofmin = 2
            //     break;
            // case 'DOG':
            //     if (param == -1)
            //         param = 2.
            //     m = param
            //     expnt = -(scale * k) ** 2 / 2.0
            //     norm = Math.sqrt(scale * k[1] / gamma(m + 0.5)) * Math.sqrt(n)
            //     daughter = -norm * (1
            //     j ** m
            // ) *
            //     ((scale * k) ** m) * Math.exp(expnt)
            //     fourier_factor = 2 * Math.PI * Math.sqrt(2. / (2 * m + 1))
            //     coi = fourier_factor / Math.sqrt(2)
            //     dofmin = 1
            break;
        default:
            console.log('Mother must be one of MORLET, PAUL, DOG')
    }
    document.write(daughter)
    return [daughter, fourier_factor, coi, dofmin]

}
var motherFunction = function (t, scale) {
    var c1 = (1 + Math.exp(- (scale ** 2)) - 2 * Math.exp(-3 / 4 * scale ** 2)) ** .5
    var c2 = (Math.PI ** (-0.25)) * Math.exp(-.5 * t ** 2)
    var k = .5 * Math.exp(-.5 * scale ** 2)
    return c1 * c2 * (Math.exp(scale * t) - k)
}
// var ttt=[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((o)=>{ return motherFunction(o,2)})
// document.write(ttt)
var tttt=[-13,-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0]
var tt=[0,1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0].map((o)=>{return .5*o/Math.PI/tttt.length})
console.log(wave_bases('MORLET', tt, 1, -1))