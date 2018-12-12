var assert = require('assert')
var fs = require('fs')

describe('Keyword', function () {

  beforeEach(function () {
    Keyword = require('../index.js').asArray()
  })

  describe('All objects present', function () {
    it('should return ok', function () {
      var all = fs.readdirSync(__dirname + '/../resources/json')

      assert.ok(all.length === Keyword.length)
    })
  })

  describe('#title for each citation', function () {
    it('should return a string', function () {
      Keyword.forEach(function (kw) {
        var v = kw.citation.title
        assert.ok(!!v && typeof v === 'string' || v instanceof String)
      })
    })
  })
})
