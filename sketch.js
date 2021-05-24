// Advent of Code 2017 Day 14
// https://adventofcode.com/2017/day/14
// Solution by @ednl https://github.com/ednl

const key = "hxtvlmkl-";  // my puzzle input
const disksize = 128;
const gridsize = 5;
const maxhue = 360;
const speedup = 5;

let disk;
let x = 0;
let y = 0;
let regions = 0;
let hue = 0;
let stack = [];
let divRegions;

// Convert value to bit string
function bin(val, len)
{
    let s = "";
    let bit = 1 << (len - 1);
    while (bit) {
        s += (val & bit) ? '1' : '0';
        bit >>= 1;
    }
    return s;
}

// Hashing function from AoC 2017 day 10
// https://adventofcode.com/2017/day/10
function knot(lenstr)
{
    const rounds = 64;
    const hlen = 256;
    let hash = new Array(hlen);
    for (let i = 0; i < hlen; ++i) {
        hash[i] = i;
    }
    let pos = 0;
    let skip = 0;
    lengths = new Array(lenstr.length);
    for (let i = 0; i < lenstr.length; ++i) {
      lengths[i] = lenstr.charCodeAt(i);
    }
    lengths = lengths.concat([17, 31, 73, 47, 23]);
    for (let loop = 0; loop < rounds; ++loop) {
        for (const len of lengths) {
            let i = pos;
            let j = pos + len - 1;
            while (i < j) {
                p = i % hlen;
                q = j % hlen;
                const tmp = hash[p];
                hash[p] = hash[q];
                hash[q] = tmp;
                i++;
                j--;
            }
            pos += len + skip;
            skip++;
        }
    }
    let dense = "";
    for (let i = 0; i < hlen; i += 16) {
        let x = 0;
        for (let j = 0; j < 16; ++j) {
          x ^= hash[i + j];
        }
        dense += bin(x, 8);
    }
    let a = new Array(dense.length);
    for (let i = 0; i < dense.length; ++i) {
        a[i] = dense[i] == '1' ? 1 : 0;
    }
    return a;
}

function setup()
{
    createCanvas(disksize * gridsize, disksize * gridsize);
    strokeWeight(1);

    let divTitle = createDiv('Advent of Code 2017 Day 14: Disk Defragmentation');
    let divBits = createDiv('Bits: 0');
    divRegions = createDiv('Regions: 0');
    let divLink = createDiv('<br /><a href="https://adventofcode.com/2017/day/14" target="_blank">puzzle</a> | <a href="https://github.com/ednl/defrag" target="_blank">code on github</a> | <a href="https://twitter.com/ednl" target="_blank">twitter</a>');
    divTitle.style('font', 'bold 22px Verdana');
    divBits.style('font', '20px Verdana');
    divRegions.style('font', '20px Verdana');
    divLink.style('font', '12px Verdana');

    // Advent of Code 2017 day 14 part 1
    disk = new Array(disksize);
    let bits = 0;
    for (let i = 0; i < disksize; ++i) {
        s = key + i;
        disk[i] = knot(s);
        for (let j = 0; j < disksize; ++j) {
            bits += disk[i][j];
        }
    }
    divBits.html('Part 1: bits on disk = ' + bits);
    console.log("Part 1: bits on disk = " + bits);

    // Grid
    stroke(0);
    noFill();
    for (let i = 0; i <= disksize; ++i) {
        const p = i * gridsize;
        line(0, p, disksize * gridsize, p);
        line(p, 0, p, disksize * gridsize);
    }

    // Pattern
    noStroke();
    fill(0);
    for (let i = 0; i < disksize; ++i) {
        const p = i * gridsize;
        for (let j = 0; j < disksize; ++j) {
            const q = j * gridsize;
            if (disk[i][j] == 1) {
                rect(q, p, gridsize, gridsize);
            }
        }
    }
    colorMode(HSB, maxhue, 100, 100);
}

// Advent of Code 2017 day 14 part 2
function draw()
{
    for (let loop = 0; loop < speedup; ++loop) {
        if (stack.length) {
            // Fill in the current region
            while (stack.length) {
                const coor = stack.pop();
                const i = coor[0];
                const j = coor[1];
                disk[i][j] = 0;
                rect(j * gridsize, i * gridsize, gridsize, gridsize);
                if (i > 0 && disk[i - 1][j] == 1) {
                    stack.push([i - 1, j]);
                }
                if (j < disksize - 1 && disk[i][j + 1] == 1) {
                    stack.push([i, j + 1]);
                }
                if (j > 0 && disk[i][j - 1] == 1) {
                    stack.push([i, j - 1]);
                }
                if (i < disksize - 1 && disk[i + 1][j] == 1) {
                    stack.push([i + 1, j]);
                }
            }
        } else if (y < disksize) {
            // Find the next region
            while (y < disksize && disk[y][x] != 1) {
              x++;
              if (x == disksize) {
                  x = 0;
                  y++;
              }
            }
            if (y < disksize && disk[y][x] == 1) {
                regions++;
                divRegions.html('Part 2: regions on disk = ' + regions);
                stack.push([y, x]);
                fill(hue, 100, 100);
                hue++;
                if (hue == maxhue) {
                    hue = 0;
                }
            }
        }
    }
    if (stack.length == 0 && y == disksize) {
        // Done
        console.log("Part 2: regions on disk = " + regions);
        noLoop();
    }
}
