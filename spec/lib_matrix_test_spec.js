import '../src/lib/prefix'
import Matrix2 from '../src/lib/Matrix2'
describe('Matrix2 ', function () {
    it('Matrix2', function () {
        var tm = new Matrix2(3, 2, Float32Array)
        tm.data.fill(2)

        expect(tm.at(2, 1)).toBe(2);

        var tm2 = new Matrix2(6, 3, Float32Array)
        tm2.data.fill(3)

        tm.multiplyScala(0.1)
        tm.addScala(0.2)

        var tm3 = Matrix2.multiply(tm,tm2)
        expect(tm3.shapes[0]).toBe(6);
        expect(tm3.shapes[1]).toBe(2);
        expect(tm3.at(0, 0)).toBeCloseTo(3.6);
        tm3.set(5,1,100)
        expect(tm3.at(5, 1)).toBeCloseTo(100);
    });
});