

function draw()
{
  let cvs = document.querySelector('#cvs');
  let ctx = cvs.getContext('2d');

  ctx.clearRect(0, 0, cvs.width, cvs.height);
  ctx.strokeStyle = 'red';

  ctx.save();
  ctx.translate(cvs.width/2, cvs.height/2);

  ctx.beginPath();
  for (var i = 0; i < arr.length; i++)
  {
    let o = arr[i];

    // draw lines
    for (var j = 0; j < o.l.length; j++)
    {
      let t = o.l[j];
      ctx.moveTo(o.x, o.y);
      ctx.lineTo(t.x, t.y);

      // arrow
      let theta = Math.atan2(o.y-t.y, o.x-t.x);
      ctx.lineTo(
        t.x + 12 * Math.cos(theta - Math.PI/6),
        t.y + 12 * Math.sin(theta - Math.PI/6)
      );
      ctx.lineTo(
        t.x + 12 * Math.cos(theta + Math.PI/6),
        t.y + 12 * Math.sin(theta + Math.PI/6)
      );
      ctx.lineTo(t.x, t.y);
    }

    // draw box
    let rx = o.x - o.w/2;
    let ry = o.y - o.h/2;

    ctx.fillStyle = 'rgba(200,255,220,.1)';
    ctx.fillRect(rx, ry, o.w, o.h);
    ctx.rect    (rx, ry, o.w, o.h);

    // draw text
    ctx.fillStyle = 'red';
    ctx.fillText(o.n, rx, ry);

  }
  ctx.stroke();
  ctx.restore();
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
  arr.sort((a, b) => Math.sign(b.l.length - a.l.length));

  let d = {};
  for (var i = 0; i < arr.length; i++)
  {
    let cur = arr[i];
    proc(cur, d);
  }

  console.log(d);
}

let _r = 200;
let _t = 0;
function proc(c, d)
{
  if (d[c.n]) return;
  d[c.n] = c;

  c.x =  Math.sin(_t) * _r;
  c.y = -Math.cos(_t) * _r;

  _t += (2 * Math.PI / 8) ;

  console.log(c.n, c);
  c.l.forEach(x => proc(x, d));
}

let cvs = document.querySelector('#cvs');
cvs.width  = 800;
cvs.height = 600;
cvs.style.border = '1px solid blue';

let arr = [];
for (var i = 0; i < 8; i++)
{
  let w = 80 + getRandomSize1();
  let h = 50 + getRandomSize2();

  arr.push({ x:0, y:0, w:w, h:h, l:[], n:`C${i}`});
}

arr[0].l.push(arr[1]);
arr[0].l.push(arr[2]);
arr[0].l.push(arr[3]);

arr[1].l.push(arr[4]);

arr[5].l.push(arr[6]);
arr[5].l.push(arr[7]);
arr[5].l.push(arr[0]);

setLocation(arr);

draw();