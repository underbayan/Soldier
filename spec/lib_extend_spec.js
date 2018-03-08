import '../src/lib/prefix'
import * as ex from '../src/lib/extend'
import range from 'lodash/range'
describe('Extend Data Test', function () {
  it('extend', function () {
    const localInput = range(-10, 10, 1)
    expect(ex.extend('MODE_SYMMETRIC', localInput, 8)[0]).toBeCloseTo(-7)
    expect(ex.extend('MODE_REFLECT', localInput, 8)[0]).toBeCloseTo(-6)
    expect(ex.extend('MODE_CONSTANT_EDGE', localInput, 8)[0]).toBeCloseTo(-10)
    expect(ex.extend('MODE_SMOOTH', localInput, 8)[0]).toBeCloseTo(-14)
    expect(ex.extend('MODE_PERIODIC', localInput, 8)[0]).toBeCloseTo(-10)
    expect(ex.extend('MODE_ZEROPAD', localInput, 8)[0]).toBeCloseTo(0)
  })
});
