var canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var ctx = canvas.getContext("2d");

/*
function setCookie(cname, cvalue, exdays) {
	exdays = exdays || 365 * 5;
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}

function delCookie(cname) {
	document.cookie = cname + "=;expires=Wed; 01 Jan 1970";
}
*/


var mouse = {
	x: null,
	y: null,
	tx: null,
	ty: null,
	setTile: 1,
	tile: function() {return tile[mouse.tx][mouse.ty]},
	l: false,
	m: false,
	r: false
};

window.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener("resize", 
	function() {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
);

window.addEventListener("mousemove", 
	function(event) {
		if (mouse.r || (mouse.l && keys[16])) {
			scrn.x += L(mouse.x - event.x);
			scrn.y += L(mouse.y - event.y);
		}
		mouse.x = event.x;
		mouse.y = event.y;
		if (!keys[16]) {
			mouse.tx = Math.floor(scrn.localMouseX());
			mouse.ty = Math.floor(scrn.localMouseY());
		}
		if (mouse.l && !keys[16]) setTile(mouse.setTile, mouse.tx, mouse.ty);
	}
);

window.addEventListener("mousedown", 
	function(event) {
		switch(event.button) {
			case 0:
				mouse.l = true;
				if (!keys[16]) setTile(mouse.setTile, mouse.tx, mouse.ty);
				break;
			case 1:
				mouse.m = true;
				break;
			case 2:
				mouse.r = true;
				break;
		}
	}
);

window.addEventListener("mouseup", 
	function(event) {
		switch(event.button) {
			case 0:
				mouse.l = false;
				break;
			case 1:
				mouse.m = false;
				break;
			case 2:
				mouse.r = false;
				break;
		}
	}
);

window.addEventListener("wheel",
	function(event) {
		scrn.z *= 1 + event.deltaY / 1000;
		scrn.x -= (scrn.localMouseX() - scrn.x) * event.deltaY / 1000;
		scrn.y -= (scrn.localMouseY() - scrn.y) * event.deltaY / 1000;
	}
);

window.addEventListener("keydown", 
	function(event) {
		keys[event.which || event.keyCode] = true;
		switch (event.keyCode) {
			case 13:
				if (event.shiftKey) {			// save		shift + enter
					var copy = document.createElement("TEXTAREA");
					copy.readOnly = true;
					copy.style.display = "none";
					copy.value = packageTileData();
					document.body.appendChild(copy);
					copy.focus();
					copy.select();
					document.execCommand("copy");
					document.body.removeChild(copy);
				} else if (event.altKey) {		// load		alt + enter
					setupBoard(prompt("Enter save data: "));
				}
			case 32:
				mouse.setTile = 0;
				break;
			case 37:
				if (keys[16] && mouse.tx > 0) {
					mouse.tx--;
					if (mouse.tile().id === 0) setTile(1, mouse.tx, mouse.ty);
					if (mouse.tile().id === 1) mouse.tile().e = true;
					if (tile[mouse.tx+1][mouse.ty].id === 1) tile[mouse.tx+1][mouse.ty].w = true;
				}
				break;
			case 38:
				if (keys[16] && mouse.ty > 0) {
					mouse.ty--;
					if (mouse.tile().id === 0) setTile(1, mouse.tx, mouse.ty);
					if (mouse.tile().id === 1) mouse.tile().s = true;
					if (tile[mouse.tx][mouse.ty+1].id === 1) tile[mouse.tx][mouse.ty+1].n = true;
				}
				break;
			case 39:
				if (keys[16] && mouse.tx < size-1) {
					mouse.tx++;
					if (mouse.tile().id === 0) setTile(1, mouse.tx, mouse.ty);
					if (mouse.tile().id === 1) mouse.tile().w = true;
					if (tile[mouse.tx-1][mouse.ty].id === 1) tile[mouse.tx-1][mouse.ty].e = true;
				}
				break;
			case 40:
				if (keys[16] && mouse.ty < size-1) {
					mouse.ty++;
					if (mouse.tile().id === 0) setTile(1, mouse.tx, mouse.ty);
					if (mouse.tile().id === 1) mouse.tile().n = true;
					if (tile[mouse.tx][mouse.ty-1].id === 1) tile[mouse.tx][mouse.ty-1].s = true;
				}
				break;
			
		}
		if (event.keyCode >= 48 && event.keyCode <= 57) {
			mouse.setTile = event.keyCode - 48;
		} else if (mouse.tile().id === 1 || mouse.tile().id === 2 || mouse.tile().id === 4) {
			if (event.keyCode === 65) {
				if (mouse.tile().w) {
					mouse.tile().w = false;
				} else {
					mouse.tile().w = true;
				}
				if (mouse.tx > 0) if (tile[mouse.tx-1][mouse.ty].id === 1 && mouse.tile().id === 1) tile[mouse.tx-1][mouse.ty].e = mouse.tile().w;
			} else if (event.keyCode === 68) {
				if (mouse.tile().e) {
					mouse.tile().e = false;
				} else {
					mouse.tile().e = true;
				}
				if (mouse.tx < size-1) if (tile[mouse.tx+1][mouse.ty].id === 1 && mouse.tile().id === 1) tile[mouse.tx+1][mouse.ty].w = mouse.tile().e;
			} else if (event.keyCode === 83) {
				if (mouse.tile().s) {
					mouse.tile().s = false;
				} else {
					mouse.tile().s = true;
				}
				if (mouse.ty < size-1) if (tile[mouse.tx][mouse.ty+1].id === 1 && mouse.tile().id === 1) tile[mouse.tx][mouse.ty+1].n = mouse.tile().s;
			} else if (event.keyCode === 87) {
				if (mouse.tile().n) {
					mouse.tile().n = false;
				} else {
					mouse.tile().n = true;
				}
				if (mouse.ty > 0) if (tile[mouse.tx][mouse.ty-1].id === 1 && mouse.tile().id === 1) tile[mouse.tx][mouse.ty-1].s = mouse.tile().n;
			}
			
		}
	}
);

window.addEventListener("keyup",
	function(event) {
		keys[event.which || event.keyCode] = false;
	}
);

var keys = [];
for (var x = 0; x < 256; x++) { keys[x] = false; }

// --------------------------------------------------------

// --------------------------------------------------------



function setTile(tileId, x, y) {
	if (x >= 0 && x < size && y >= 0 && y < size && tileId !== tile[x][y].id) {
		switch (tileId) {
			case 1:
				tile[x][y] = {id: 1, n: false, e: false, s: false, w: false, on: 0};
				if (x > 0)      if (tile[x-1][y].e) tile[x][y].w = true;
				if (x < size-1) if (tile[x+1][y].w) tile[x][y].e = true;
				if (y > 0)      if (tile[x][y-1].s) tile[x][y].n = true;
				if (y < size-1) if (tile[x][y+1].n) tile[x][y].s = true;
				break;
			case 2:
				tile[x][y] = {id: 2, n: false, e: false, s: false, w: false, on: 16};
				break;
			case 3:
				tile[x][y] = {id: 3, n: true, e: true, s: true, w: true, on: 0, on2: 0};
				if (x > 0)      if (tile[x-1][y].id === 1) tile[x-1][y].e = true;
				if (x < size-1) if (tile[x+1][y].id === 1) tile[x+1][y].w = true;
				if (y > 0)      if (tile[x][y-1].id === 1) tile[x][y-1].s = true;
				if (y < size-1) if (tile[x][y+1].id === 1) tile[x][y+1].n = true;
				break;
			case 4:
				tile[x][y] = {id: 4, n: false, e: false, s: false, w: false, on: 0};
				break;
			default:
				tile[x][y] = {id: 0, on: 0};
		}
	}
};

function drawTile(data, x, y) {
	var p = {x: Cx(x), y: Cy(y)};
	var z = C(1);
	if (data.on) var scolor = color.on;
		else var scolor = color.off;
	if (data.on2) var scolor2 = color.on;
		else var scolor2 = color.off;
	switch (data.id) {
	case 1:
		ctx.fillStyle = scolor;
		ctx.fillRect(p.x + z*3/8, p.y + z*3/8, z*2/8, z*2/8);
		if (tile[x][y].n) ctx.fillRect(p.x + z*3/8, p.y, z*2/8, z*4/8);
		if (tile[x][y].e) ctx.fillRect(p.x + z*4/8, p.y + z*3/8, z*4/8, z*2/8);
		if (tile[x][y].s) ctx.fillRect(p.x + z*3/8, p.y + z*4/8, z*2/8, z*4/8);
		if (tile[x][y].w) ctx.fillRect(p.x, p.y + z*3/8, z*4/8, z*2/8);
		break;
	case 2:
		ctx.fillStyle = scolor;
		ctx.beginPath();
		ctx.moveTo(p.x + z*4/8, p.y);
		ctx.lineTo(p.x + z, p.y + z*4/8);
		ctx.lineTo(p.x + z*4/8, p.y + z);
		ctx.lineTo(p.x, p.y + z*4/8);
		ctx.fill();

		ctx.fillRect(p.x + z*3/8, p.y, z*2/8, z*1/8);
		ctx.fillRect(p.x, p.y + z*3/8, z*1/8, z*2/8);
		ctx.fillRect(p.x + z*3/8, p.y + z*7/8, z*2/8, z*1/8);
		ctx.fillRect(p.x + z*7/8, p.y + z*3/8, z*1/8, z*2/8);

		ctx.fillStyle = color.background;
		ctx.beginPath();
		ctx.moveTo(p.x + z*4/8, p.y + z*2/8);
		ctx.lineTo(p.x + z*6/8, p.y + z*4/8);
		ctx.lineTo(p.x + z*4/8, p.y + z*6/8);
		ctx.lineTo(p.x + z*2/8, p.y + z*4/8);
		ctx.fill();

		ctx.fillStyle = color.extra;
		ctx.beginPath();
		if (tile[x][y].n) {
			ctx.moveTo(p.x + z*2/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*4/8, p.y);
		} else {
			ctx.moveTo(p.x + z*2/8, p.y);
			ctx.lineTo(p.x + z*6/8, p.y);
			ctx.lineTo(p.x + z*4/8, p.y + z*2/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].e) {
			ctx.moveTo(p.x + z*6/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*6/8);
			ctx.lineTo(p.x + z, p.y + z*4/8);
		} else {
			ctx.moveTo(p.x + z, p.y + z*2/8);
			ctx.lineTo(p.x + z, p.y + z*6/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*4/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].s) {
			ctx.moveTo(p.x + z*6/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*4/8, p.y + z);
		} else {
			ctx.moveTo(p.x + z*6/8, p.y + z);
			ctx.lineTo(p.x + z*2/8, p.y + z);
			ctx.lineTo(p.x + z*4/8, p.y + z*6/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].w) {
			ctx.moveTo(p.x + z*2/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*2/8);
			ctx.lineTo(p.x, p.y + z*4/8);
		} else {
			ctx.moveTo(p.x, p.y + z*6/8);
			ctx.lineTo(p.x, p.y + z*2/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*4/8);
		}
		ctx.fill();
		break;
	case 3:
		ctx.fillStyle = scolor2;
		ctx.fillRect(p.x + z*3/8, p.y, z*2/8, z);
		ctx.fillStyle = color.extra;
		ctx.beginPath();
		ctx.arc(p.x + z*4/8, p.y + z*4/8, z*2.2360679775/8, 0, Math.PI*2);
		ctx.fill();
		ctx.fillStyle = scolor;
		ctx.fillRect(p.x, p.y + z*3/8, z, z*2/8);
		break;
	case 4:
		ctx.fillStyle = scolor;
		/*
		ctx.beginPath();
		ctx.moveTo(p.x + z*4/8, p.y + z*1/8);
		ctx.lineTo(p.x + z*7/8, p.y + z*4/8);
		ctx.lineTo(p.x + z*4/8, p.y + z*7/8);
		ctx.lineTo(p.x + z*1/8, p.y + z*4/8);
		ctx.fill();
		*/

		ctx.fillRect(p.x + z*3/8, p.y, z*2/8, z);
		ctx.fillRect(p.x, p.y + z*3/8, z, z*2/8);

		ctx.fillStyle = color.extra;
		ctx.beginPath();
		if (tile[x][y].n) {
			ctx.moveTo(p.x + z*2/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*4/8, p.y);
		} else {
			ctx.moveTo(p.x + z*2/8, p.y);
			ctx.lineTo(p.x + z*6/8, p.y);
			ctx.lineTo(p.x + z*4/8, p.y + z*2/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].e) {
			ctx.moveTo(p.x + z*6/8, p.y + z*2/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*6/8);
			ctx.lineTo(p.x + z, p.y + z*4/8);
		} else {
			ctx.moveTo(p.x + z, p.y + z*2/8);
			ctx.lineTo(p.x + z, p.y + z*6/8);
			ctx.lineTo(p.x + z*6/8, p.y + z*4/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].s) {
			ctx.moveTo(p.x + z*6/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*4/8, p.y + z);
		} else {
			ctx.moveTo(p.x + z*6/8, p.y + z);
			ctx.lineTo(p.x + z*2/8, p.y + z);
			ctx.lineTo(p.x + z*4/8, p.y + z*6/8);
		}
		ctx.fill();

		ctx.beginPath();
		if (tile[x][y].w) {
			ctx.moveTo(p.x + z*2/8, p.y + z*6/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*2/8);
			ctx.lineTo(p.x, p.y + z*4/8);
		} else {
			ctx.moveTo(p.x, p.y + z*6/8);
			ctx.lineTo(p.x, p.y + z*2/8);
			ctx.lineTo(p.x + z*2/8, p.y + z*4/8);
		}
		ctx.fill();
		break;
	}
};

function powerUpdate() {
	for (var x = 0; x < size; x++) {
		for (var y = 0; y < size; y++) {
			switch (tile[x][y].id) {
			case 1:
				var state = {n: 0, e: 0, s: 0, w: 0};
				if (x > 0 && tile[x][y].w) if (tile[x-1][y].e) state.w = tile[x-1][y].on;
				if (x < size-1 && tile[x][y].e) if (tile[x+1][y].w) state.e = tile[x+1][y].on;
				if (y > 0 && tile[x][y].n) if (tile[x][y-1].s) if (tile[x][y-1].id === 3) {
					state.n = tile[x][y-1].on2;
				} else {
					state.n = tile[x][y-1].on;
				}
				if (y < size-1 && tile[x][y].s) if (tile[x][y+1].n) if (tile[x][y+1].id === 3) {
					state.s = tile[x][y+1].on2;
				} else {
					state.s = tile[x][y+1].on;
				}
				var max = 0;
				for (var q in state) {
					if (state[q] > max) max = state[q];
				}
				tile[x][y].on = Math.max(max - 1, 0);
				break;
			case 2:
				tile[x][y].on = maxPower;
				if (x > 0 && !tile[x][y].w) if (tile[x-1][y].e && tile[x-1][y].on) tile[x][y].on = 0;
				if (x < size-1 && !tile[x][y].e) if (tile[x+1][y].w && tile[x+1][y].on) tile[x][y].on = 0;
				if (y > 0 && !tile[x][y].n) if (tile[x][y-1].s) if (tile[x][y-1].id === 3) {
					if (tile[x][y-1].on2) tile[x][y].on = 0;
				} else {
					if (tile[x][y-1].on) tile[x][y].on = 0;
				}
				if (y < size-1 && !tile[x][y].s) if (tile[x][y+1].n) if (tile[x][y+1].id === 3) {
					if (tile[x][y+1].on2) tile[x][y].on = 0;
				} else {
					if (tile[x][y+1].on) tile[x][y].on = 0;
				}
				break;
			case 3:
					var state1 = {e: 0, w: 0};
					var state2 = {n: 0, s: 0};
					if (x > 0) if (tile[x-1][y].e) state1.w = tile[x-1][y].on;
					if (x < size-1) if (tile[x+1][y].w) state1.e = tile[x+1][y].on;
					if (y > 0) if (tile[x][y-1].s) if (tile[x][y-1].id === 3) {
						state2.n = tile[x][y-1].on2;
					} else {
						state2.n = tile[x][y-1].on;
					}
					if (y < size-1) if (tile[x][y+1].n) if (tile[x][y+1].id === 3) {
						state2.s = tile[x][y+1].on2;
					} else {
						state2.s = tile[x][y+1].on;
					}
					var max1 = 0;
					for (var q in state1) {
						if (state1[q] > max1) max1 = state1[q];
					}
					var max2 = 0;
					for (var q in state2) {
						if (state2[q] > max2) max2 = state2[q];
					}
					tile[x][y].on = Math.max(max1 - 1, 0);
					tile[x][y].on2 = Math.max(max2 - 1, 0);
				break;
			case 4:
				tile[x][y].on = 0;
				if (x > 0 && !tile[x][y].w) if (tile[x-1][y].e && tile[x-1][y].on) tile[x][y].on = maxPower;
				if (x < size-1 && !tile[x][y].e) if (tile[x+1][y].w && tile[x+1][y].on) tile[x][y].on = maxPower;
				if (y > 0 && !tile[x][y].n) if (tile[x][y-1].s) if (tile[x][y-1].id === 3) {
					if (tile[x][y-1].on2) tile[x][y].on = maxPower;
				} else {
					if (tile[x][y-1].on) tile[x][y].on = maxPower;
				}
				if (y < size-1 && !tile[x][y].s) if (tile[x][y+1].n) if (tile[x][y+1].id === 3) {
					if (tile[x][y+1].on2) tile[x][y].on = maxPower;
				} else {
					if (tile[x][y+1].on) tile[x][y].on = maxPower;
				}
				break;
			}
		}
	}
};

function setupBoard(data) {
	tile = [];
	data = data || "S64";
	data = data.split("|");
	if (data[0].startsWith("S")) size = parseInt(data.shift().slice(1));
	else {
		size = 64;
		throw "Couldn't detect map size, setting to 64";
	}
	var c = 0;
	var endOf0 = 0;
	for (var x = 0; x < size; x++) {
		tile[x] = [];
		for (var y = 0; y < size; y++) {
			if (data.length === 0) {
				endOf0 = size * size + 1;
			}
			if (endOf0 > c) {
				tile[x][y] = {id: 0, on: 0};
			} else {
				if (data.length === 0) {
					endOf0 = size * size + 1;
				} else if (data[0].startsWith("0x")) {
					endOf0 = c + parseInt(data.shift().slice(2));
					tile[x][y] = {id: 0, on: 0};
				} else {
					var thisTile = data.shift().split(",");
					tile[x][y] = {
						id: parseInt(thisTile[0]),
						on: parseInt(thisTile[2])
					};
					var directions = thisTile[1].split("");
					if (directions[0] === "0") tile[x][y].n = false; else tile[x][y].n = true;
					if (directions[1] === "0") tile[x][y].e = false; else tile[x][y].e = true;
					if (directions[2] === "0") tile[x][y].s = false; else tile[x][y].s = true;
					if (directions[3] === "0") tile[x][y].w = false; else tile[x][y].w = true;
					if (tile[x][y].id === 3) tile[x][y].on2 = parseInt(thisTile[3]) || 0;
				}
			}
			c++;
		}
	}
};

function packageTileData() {
	var data = "S" + size;
	var count = 0;
	for (var x = 0; x < size; x++) {
		for (var y = 0; y < size; y++) {
			if (tile[x][y].id === 0) {
				count++;
			} else {
				if (count !== 0) {
					data += "|0x" + count;
					count = 0;
				}
				data += "|" + tile[x][y].id + ",";
				if (tile[x][y].n) data += "1"; else data += "0";
				if (tile[x][y].e) data += "1"; else data += "0";
				if (tile[x][y].s) data += "1"; else data += "0";
				if (tile[x][y].w) data += "1"; else data += "0";
				data += "," + tile[x][y].on;
				if (tile[x][y].id === 3) data += "," + tile[x][y].on2;
			}
		}
	}
	return data;
};



var size = 64;
var maxPower = 16;
var speed = 1;
var tile;

var scrn = {
	x: size / 2,
	y: size / 2,
	z: 8,
	localMouseX: function() {return this.Lx(mouse.x);},
	localMouseY: function() {return this.Ly(mouse.y);},
	Cx: function (x) {return (x - this.x) * Math.min(canvas.width, canvas.height) / 2 / this.z + canvas.width / 2;},
	Cy: function (y) {return (y - this.y) * Math.min(canvas.width, canvas.height) / 2 / this.z + canvas.height / 2;},
	C: function (s) {return s * Math.min(canvas.width, canvas.height) / 2 / this.z;},
	Lx: function (x) {return (x * 2 - canvas.width) * this.z / Math.min(canvas.width, canvas.height) + this.x;},
	Ly: function (y) {return (y * 2 - canvas.height) * this.z / Math.min(canvas.width, canvas.height) + this.y;},
	L: function (s) {return s * 2 * this.z / Math.min(canvas.width, canvas.height);}
};
function Cx(b) {return scrn.Cx(b);};
function Cy(b) {return scrn.Cy(b);};
function C(b) {return scrn.C(b);};
function Lx(b) {return scrn.Lx(b);};
function Ly(b) {return scrn.Ly(b);};
function L(b) {return scrn.L(b);};


var color = {
	off: "#000000",
	on: "#4fbf4f",
	extra: "#4f4f4f",
	background: "#dfdfdf",
	border: "#9f9f9f",
	cursor: "rgba(127, 127, 255, 0.2)"
};



var count = 0;
function draw() {
	requestAnimationFrame(draw);
	
	count++;
	if (count >= speed) {
		powerUpdate();
		count = 0;
	}

	ctx.fillStyle = color.border;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = color.background;
	ctx.fillRect(Math.max(0, Cx(0)), Math.max(0, Cy(0)), Math.min(canvas.width, Cx(size)) - Math.max(0, Cx(0)), Math.min(canvas.width, Cy(size)) - Math.max(0, Cy(0)));
	for (var x = Math.floor(Lx(0)); x <= Math.floor(Lx(canvas.width)); x++) {
		for (var y = Math.floor(Ly(0)); y <= Math.floor(Ly(canvas.height)); y++) {
			if (x >= 0 && x < size && y >= 0 && y < size) {
				drawTile(tile[x][y], x, y);
			}
		}
	}
	if (mouse.tx >= 0 && mouse.tx < size && mouse.ty >= 0 && mouse.ty < size && !mouse.r) {
		ctx.fillStyle = color.cursor;
		var point = scrn.C({x: mouse.tx, y: mouse.ty});
		ctx.fillRect(Cx(mouse.tx), Cy(mouse.ty), scrn.C(1), scrn.C(1));
	}
}

setupBoard();
draw();


