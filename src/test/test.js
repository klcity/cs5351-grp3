let C = {
  PAD: 50,
};

Array.prototype.min = function(f) { return Math.min.apply(null, f?this.map(f):this); };
Array.prototype.max = function(f) { return Math.max.apply(null, f?this.map(f):this); };
Array.prototype.avg = function(f) { return Math.avg.apply(null, f?this.map(f):this); };

class GObj
{
  constructor(w, h, name) {
    this.x = 0;
    this.y = 0;
    this.w = w;
    this.h = h;
    this.name = name;
    this.parent = null;
    // Ken: add
    this.attrs = [];
    this.methods = [];
  }
  get X() { return this.x - this.w/2; }
  get Y() { return this.y - this.h/2; }
}


function getRandomSize1() {
  let x = Math.random() * 200
        + Math.random() * 120
        + Math.random() * 70
        + Math.random() * 40
        + Math.random() * 20
  return Math.floor(x / 5);
}

function getRandomSize2() {
  let x = Math.random() * 300
        + Math.random() * 280
        + Math.random() * 100
        + Math.random() * 100
        + Math.random() * 20
  return Math.floor(x / 5);
}

function setLocation(arr)
{
  // create backward links
  arr.forEach(x => {
    if (!x.parent) return;
    if (!x.parent.children) x.parent.children = [];
    x.parent.children.push(x);
  });

  // find all roots
  let roots = arr.filter(x => null == x.parent);
  console.log(roots);

  // recursive location assignment
  assignCoord(roots, new GObj(0,0));

}

function assignCoord(items, /*center*/ o)
{
  let totalWidth = items.map(x => estimateWidth(x)).reduce((a,b) => a+b);
  let curX = o.x + o.w/2;
  curX += ( (items.length - 1) * C.PAD + totalWidth) / -2;

  items.forEach(i => {
    i.x = curX + (estimateWidth(i)-o.w)/2;
    i.y = o.y + C.PAD + (i.h + o.h)/2;
    curX += estimateWidth(i) + C.PAD;
  });

  items.forEach(i => {
    if (i.children) assignCoord(i.children, i);
  });
}
function estimateWidth(o) {
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
          r + estimateWidth(x) + C.PAD
        , -C.PAD);
  }
}

function setLinks(arr)
{

}

let arr = [];
for (var i = 0; i < 10; i++)
{
  let w = 80 + getRandomSize1();
  let h = 50 + getRandomSize2();

  arr.push(new GObj(w, h, `C${i}`));
}

// arr[1].parent = arr[0];
// arr[2].parent = arr[0];
// arr[3].parent = arr[0];
// arr[4].parent = arr[1];
// arr[5].parent = arr[1];
// arr[6].parent = arr[5];
// arr[7].parent = arr[5];
// arr[8].parent = arr[2];
// arr[9].parent = arr[3];

// Assign random parent
arr[1].parent = arr[0];
if (Math.round(Math.random()) == 0){
    arr[2].parent = arr[Math.round(Math.random())];
}
arr[3].parent = arr[Math.round(Math.random())*2];
arr[4].parent = arr[Math.round(Math.random())*3];
arr[5].parent = arr[Math.round(Math.random())*4];
arr[6].parent = arr[Math.round(Math.random())*5];
arr[7].parent = arr[Math.round(Math.random())*6];
arr[8].parent = arr[Math.round(Math.random())*7];
arr[9].parent = arr[Math.round(Math.random())*8];


// Input random text to attributes and methods
arr.forEach(x => {
    var age = { modifier: "+", name: "age", type: "int"};
    x.attrs.push(age);
    if (Math.round(Math.random()) == 0) {
        var gender = { modifier: "~", name: "gender", type: "string"};
        x.attrs.push(gender);
    }
    if (Math.round(Math.random()) == 1) {
        var name = { modifier: "+", name: "name", type: "string"};
        x.attrs.push(name);
    }
    if (Math.round(Math.random()) == 0) {
        var gender = { modifier: "~", name: "height", type: "int"};
        x.attrs.push(gender);
    }
    if (Math.round(Math.random()) == 1) {
        var name = { modifier: "+", name: "weight", type: "int"};
        x.attrs.push(name);
    }
    var cookFood = { modifier: "#", name: "cookFood", parameters: "int no_of_dishes", type: "int"};
    x.methods.push(cookFood);
    if (Math.round(Math.random()) == 0) {
        var eatBreakfast = { modifier: "+", name: "eatBreakfast", parameters: "bool cook, string meat bool with_egg", type: "void"};
        x.methods.push(eatBreakfast);
    }
    if (Math.round(Math.random()) == 1) {
        var takeShower = { modifier: "-", name: "takeShower", parameters: "", type: "date"};
        x.methods.push(takeShower);
    }
    if (Math.round(Math.random()) == 0) {
        var eatBreakfast = { modifier: "+", name: "eatLunch", parameters: "bool cook, string meat", type: "string"};
        x.methods.push(eatBreakfast);
    }
    if (Math.round(Math.random()) == 1) {
        var takeShower = { modifier: "-", name: "doHomework", parameters: "", type: "string"};
        x.methods.push(takeShower);
    }
});

arr.forEach(x => {
    // Set box height
    x.h = 30 + (x.attrs.length + (x.attrs.length - 1)) * 10 + 20 + (x.methods.length + (x.methods.length - 1)) * 10 + 20;

    // Set box width
    var fullList = [];
    for (var i = 0; i < x.attrs.length; i++){
        fullList.push(x.attrs[i].modifier + " " + x.attrs[i].name + ": " + x.attrs[i].type);
    }
    for (var i = 0; i < x.methods.length; i++){
        fullList.push(x.methods[i].modifier + " " + x.methods[i].name + "(" + x.methods[i].parameters + "): " + x.methods[i].type);
    }
    fullList.push(x.name);
    console.log(fullList);
    var maxWordLength = 0;
    for (var i = 0; i < fullList.length; i++) {
        if (fullList[i].length > maxWordLength) {
            maxWordLength = fullList[i].length;
        }
    }
    x.w = maxWordLength * 7.5;
});




// arr[0].x = -200;
// arr[5].x =  200;

setLocation(arr);
setLinks(arr);

new Vue({
  el: '#app',
  data: {
    rect: arr
  }
});