/**
 * @module mdkeywords
 */

import category from '../resources/json/lcc-category.json'
import deliverabletype from '../resources/json/lcc-deliverabletype.json'
import usertype from '../resources/json/lcc-usertype.json'

function asArray () {
  return [category, deliverabletype, usertype]
}
// export default [category, deliverabletype, usertype]
export {
  category,
  deliverabletype,
  usertype,
  asArray
}
