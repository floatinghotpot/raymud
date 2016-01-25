'use strict';

const _ = require('underscore');

export class Obj {
  // object feature
  constructor() {
    this._id = _.uniqueId('obj_');
    this._prop = {};
    this._objectp = this;
  }
  is(_className) {
    return this instanceof _className;
  }
  id() {
    return this._id;
  }
  cleanUp(inheritFlag) {
    return inheritFlag || true;
  }
  destruct() {
    this._objectp = null;
  }
  objectp() {
    return this._objectp;
  }

  // property
  set(key, value) {
    this._prop[key] = value;
    return this;
  }
  query(key) {
    return this._prop[key];
  }
  prop() {
    return this._prop;
  }

  // temp property
  setTemp(key, value) {
    this._temp[key] = value;
  }
  queryTemp(key) {
    return this._temp[key];
  }
  temp() {
    return this._temp;
  }

  // basic variables
  setEnv(ob) {
    this.set('env', ob);
    return this;
  }
  env() {
    return this.query('env');
  }
  move(ob) {
    this.set('env', ob);
    return this;
  }
  setName(name) {
    this.set('name', name);
    return this;
  }
  name() {
    return this.query('name') || '叫不出名字的东西';
  }
  short(raw) {
    return this.query('short') || this.name(raw);
  }
  long() {
    return this.query('long') || '';
  }

  // i18n utility
  chineseNumber(n) {
    return n;
  }
}
