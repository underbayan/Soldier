import '../src/lib/prefix'
import Matrix2 from '../src/lib/Matrix2'
import range from 'lodash/range'
describe('Matrix2 ', function () {
    it('Matrix2', function () {
        var tm = new Matrix2(3, 2, Float32Array)
        tm.data.fill(2)
        expect(tm.at(2, 1)).toBe(2);
        var tm2 = new Matrix2(6, 3, Float32Array)
        tm2.data.fill(3)
        tm.multiplyScala(0.1)
        tm.addScala(0.2)
        var tm3 = Matrix2.multiply(tm, tm2)
        expect(tm3.shapes[0]).toBe(6);
        expect(tm3.shapes[1]).toBe(2);
        expect(tm3.at(0, 0)).toBeCloseTo(3.6);
        tm3.set(5, 1, 100)
        expect(tm3.at(5, 1)).toBeCloseTo(100);

    })
    it('Matrix2 add-minus test', function () {
        var tm = new Matrix2(3, 4, Uint8Array)
        var tm2 = new Matrix2(3, 4, Uint8Array)
        tm.data.fill(3)
        tm2.data.fill(1)
        tm.addScala(2)
        tm.minus(tm2)
        expect(tm.at(0, 0)).toBe(4)
        expect(Matrix2.minus(tm, tm2).at(0, 0)).toBe(3)
    })

    it('Matrix2 transpose', function () {
        var tm = new Matrix2(5, 3, Uint8Array)
        for (var i = 0; i < tm.length; i++) {
            tm.data[i] = i + 1
        }
        var tmClone = tm.clone()
        tm.transpose()
        expect(tm.shapes[0]).toBe(tmClone.shapes[1])
        expect(tm.length).toBe(tmClone.length)
        var xAxis = tm.shapes[0]
        var yAxis = tm.shapes[1]
        for (var j = 0; j < yAxis; j++)
            for (var i = 0; i < xAxis; i++) {
                expect(tm.at(i, j)).toBe(tmClone.at(j, i))
            }
    })
    it('Matrix2 concat',function(){
        var tm = new Matrix2(5, 3, Uint8Array)
        for (var i = 0; i < tm.length; i++) {
            tm.data[i] = i + 1
        }
        var tm2=tm.clone()
        expect(Matrix2.concat(tm,tm2).at(9,2)).toBe(Matrix2.concat(tm,tm2,1).at(4,3)*3)
    })
})
