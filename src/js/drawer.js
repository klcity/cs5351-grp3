let C = {
  BOX_PADX: 10,
  BOX_PADY: 20,
  PAD: 50,
  ClassNameHeight: 30,
  AttributeLineHeight: 20,
  MethodLineHeight: 20,
};

class Drawer
{
  generateGraph(arr)
  {
    let rtn = arr.map( z => new GObj(z) );
    this.setLocation(rtn);
    return rtn;
  }
  setLocation(arr)
  {
    // create backward links
    arr.forEach(x => {
      if (!x.parent) return;
      if (!x.parent.children) x.parent.children = [];
      x.parent.children.push(x);
    });
  
    // find all roots
    let roots = arr.filter(x => null == x.parent);
  
    // recursive location assignment
    this.assignCoord( roots, new GObj() );
  };

  assignCoord(items, /*center*/ o)
  {
    let totalWidth = items.map(x => this.estimateWidth(x)).reduce((a,b) => a+b);
    let curX = o.x + o.w/2;
    curX += ( (items.length - 1) * C.PAD + totalWidth) / -2;
  
    items.forEach(i => {
      i.x = curX + (this.estimateWidth(i)-o.w)/2;
      i.y = o.y + C.PAD + (i.h + o.h)/2;
      curX += this.estimateWidth(i) + C.PAD;
    });
  
    items.forEach(i => {
      if (i.children) this.assignCoord(i.children, i);
    });
  };

  estimateWidth(o){
    if (o.ew) return o.ew;
    if (!o.children) return o.ew = o.w;
    else switch (o.children.length)
    {
      case 0:
        return o.ew = o.w;
      case 1:
        return o.ew = Math.max(o.w, o.children[0].w);
      default:
        return o.ew = o.children.reduce((r, x) =>
            r + this.estimateWidth(x) + C.PAD
          , -C.PAD);
    }
  }
}
