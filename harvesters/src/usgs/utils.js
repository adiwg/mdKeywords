const regex = /insert into term \(code,name,parent,scope\) values \((.*)\);$/gm;

const COLUMN = Object.freeze({
  CODE: 0,
  NAME: 1,
  PARENT: 2,
  SCOPE: 3,
});

module.exports = { regex, COLUMN };
