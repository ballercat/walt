class Context {
  constructor(parent, isBlock) {
    if (parent) {
      this.globals = parent.globals;
      this.inFunction = true;
    } else {
      this.globals = {};
      this.inFunction = false;
      this.isGlobal = true;
    }

    this.locals = {};
    this.isBlock = isBlock;
  }

  illegalOutBlockDeclaration({ start: { line, col } }) {
    return new Error(`Illegal declaration outside of a block ${line}:${col}`);
  }

  redeclaredError(id, { start: { line, col } }) {
    return new Error(`Cannot re-declare ${id}. Already defined at
                      ${line}:${col}`);
  }

  finalizeDeclaration(decl) {
    if (!this.isGlobal && !this.isBlock)
      throw this.illegalOutBlockDeclaration(decl);

    if (this.isGlobal && this.globals[decl.id])
      throw this.redeclaredError(decl.id, this.globals[decl.id]);

    if (!this.isGlobal && this.locals[decl.id])
      throw this.redeclaredError(decl.id, this.locals[decl.id]);

    decl.isGlobal = this.isGlobal;

    return decl;
  }
}

module.exports = Context;

