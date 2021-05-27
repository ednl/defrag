// Advent of Code 2017 Day 14
// https://adventofcode.com/2017/day/14
// Solution by @ednl https://github.com/ednl

const KEY = "hxtvlmkl";  // my puzzle input
const DISKSIZE = 128;    // width and height of the grid
const GRIDSIZE = 6;      // pixel width and height of grid cells
const MAXHUE   = 360;    // hue cycle length
const SPEEDUP  = 5;      // how many regions per draw() loop (>= 1)

// Bit status values
const BIT_CLEAR = 0;     // do not engage, I repeat: do not engage
const BIT_TODO  = 1;     // it's a bit, that's all we know for now
const BIT_DOING = 2;     // on the stack for processing in current region
const BIT_DONE  = 3;     // colorised, all done

// Global variables for step-wise updating
let disk, row, col, regions, hue, stack, speedup, divBits, divRegions, inpKey;

function setkey()
{
    document.location = '?key=' + encodeURIComponent(inpKey.value()) + '&speedup=' + speedup;
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
                p = i++ % hlen;
                q = j-- % hlen;
                [hash[p], hash[q]] = [hash[q], hash[p]];  // swap shorthand
            }
            pos += len + skip;
            skip++;
        }
    }
    let a = new Array(16 * 8);  // room for 16 bytes of 8 bits = 128 bits
    let k = 0;
    for (let i = 0; i < hlen; i += 16) {
        let byte = 0;
        for (let j = 0; j < 16; ++j) {
            byte ^= hash[i + j];
        }
        let bit = 128;  // 8-bit conversion, start with MSB
        while (bit) {
            a[k++] = byte & bit ? BIT_TODO : BIT_CLEAR;  // array element is either 0 or 1
            bit >>= 1;
        }
    }
    return a;
}

// Advent of Code 2017 day 14 part 1
function part1(key)
{
    colorMode(RGB, 255);
    background(21, 32, 43);  // blueish dark
    strokeWeight(1);

    // Draw grid
    stroke(56, 68, 77);      // blueish grey
    noFill();
    for (let i = 0; i <= DISKSIZE; ++i) {
        const p = i * GRIDSIZE;
        line(0, p, DISKSIZE * GRIDSIZE, p);
        line(p, 0, p, DISKSIZE * GRIDSIZE);
    }

    // Calculate pattern
    disk = new Array(DISKSIZE);         // only rows; columns come from knot()
    let count_bits = 0;
    for (let i = 0; i < DISKSIZE; ++i) {
        disk[i] = knot(key + '-' + i);  // set disk row
        for (let j = 0; j < DISKSIZE; ++j) {
            count_bits += disk[i][j];   // assumes disk[][] is either 0 or 1
        }
    }

    // Updating while calculating each row not necessary because too quick
    // *and* not visible here anyway because there is no draw() looping
    divBits.html('Part 1: bits on disk = ' + count_bits);
    console.log('Part 1: bits on disk = ' + count_bits);

    // Draw pattern (separately from grid because different settings)
    noStroke();
    fill(56, 68, 77);
    for (let i = 0; i < DISKSIZE; ++i) {
        const p = i * GRIDSIZE;
        for (let j = 0; j < DISKSIZE; ++j) {
            const q = j * GRIDSIZE;
            if (disk[i][j] == 1) {
                rect(q, p, GRIDSIZE - 1, GRIDSIZE - 1);
            }
        }
    }

    colorMode(HSB, MAXHUE, 100, 100);
    col = row = 0;  // while looking for regions, currently at this bit
    regions = 0;    // count connected regions
    hue = 0;        // (slightly) different colour for every next region
    stack = [];     // branches in current region for later processing
}

// Advent of Code 2017 day 14 part 2, single step
// Returns whether part 2 is done (true/false)
function part2_step()
{
    // First clear the whole stack = fill in one region with DFS algorithm
    if (stack.length) {
        while (stack.length) {
            // Get top cell from the stack (LIFO buffer)
            const {row: i, col: j} = stack.pop();  // destructuring assignment for objects
            disk[i][j] = BIT_DONE;
            rect(j * GRIDSIZE, i * GRIDSIZE, GRIDSIZE - 1, GRIDSIZE - 1);
            // Check surrounding cells
            if (i > 0 && disk[i - 1][j] == BIT_TODO) {
                stack.push({row: i - 1, col: j});
                disk[i - 1][j] = BIT_DOING;
            }
            if (j < DISKSIZE - 1 && disk[i][j + 1] == BIT_TODO) {
                stack.push({row: i, col: j + 1});
                disk[i][j + 1] = BIT_DOING;
            }
            if (j > 0 && disk[i][j - 1] == BIT_TODO) {
                stack.push({row: i, col: j - 1});
                disk[i][j - 1] = BIT_DOING;
            }
            if (i < DISKSIZE - 1 && disk[i + 1][j] == BIT_TODO) {
                stack.push({row: i + 1, col: j});
                disk[i + 1][j] = BIT_DOING;
            }
        }
    }

    // Then try to find next separate region
    if (row < DISKSIZE) {
        while (row < DISKSIZE && disk[row][col] != BIT_TODO) {
            if (++col == DISKSIZE) {
                col = 0;
                row++;
            }
        }
        if (row < DISKSIZE && disk[row][col] == BIT_TODO) {
            // Next region found, give update
            regions++;
            divRegions.html('Part 2: connected regions = ' + regions);
            stack.push({row, col});  // object literal shorthand
            disk[row][col] = BIT_DOING;
            fill(hue, 100, 100);
            if (++hue == MAXHUE) {
                hue = 0;
            }
            return true;  // there is more to do
        }
    }

    // Nothing more to do
    console.log('Part 2: connected regions = ' + regions);
    noLoop();
    return false;
}

function setup()
{
    // Try getting key from URL query param, or else use default
    const params = new URLSearchParams(document.location.search.substring(1));
    const key = params.get('key') ?? KEY;  // ES2020 nullish coalescing operator
    speedup = parseInt(params.get('speedup') ?? SPEEDUP);
    if (isNaN(speedup)) {
        speedup = SPEEDUP;
    } else if (speedup < 1) {
        speedup = 1;
    } else if (speedup > 1000) {
        speedup = 1000;
    }

    // Create page elements
    createCanvas(DISKSIZE * GRIDSIZE, DISKSIZE * GRIDSIZE);
    const divTitle = createDiv('Advent of Code 2017 Day 14: Disk Defragmentation');
    divBits = createDiv('Part 1: bits on disk = 0');
    divRegions = createDiv('Part 2: connected regions = 0');
    const divKey = createDiv('Key: ');
    inpKey = createInput(key);
    inpKey.id('inpKeyId');
    inpKey.parent(divKey);
    const btnKey = createButton('Go');
    btnKey.parent(divKey);
    const divLink = createDiv(
        '<br />Links: <a href="https://adventofcode.com/2017/day/14" target="_blank">puzzle</a>'
        + ' | <a href="https://github.com/ednl/defrag/blob/main/sketch.js" target="_blank">code</a>'
        + ' | <a href="https://ednl.github.io/" target="_blank">github</a>'
        + ' | <a href="https://twitter.com/ednl" target="_blank">twitter</a>');

    // Style page elements
    divTitle.style('font', 'bold 20px Verdana');
    divTitle.style('color', '#fff');
    divBits.style('font', '20px Verdana');
    divRegions.style('font', '20px Verdana');
    divKey.style('font', '20px Verdana');
    inpKey.style('font', '13px "Cascadia Code", monospace');
    inpKey.size(200);
    divLink.style('font', '14px Verdana');

    // Input events
    btnKey.mousePressed(setkey);
    document.getElementById('inpKeyId').addEventListener('keyup', function(event) {
        if (event.defaultPrevented) {
            return;
        }
        const key = event.key || event.keyCode;
        if (key === "Enter" || key === 13) {
            setkey();
        }
    });

    // Fill the grid
    part1(key);
}

function draw()
{
    let loop = speedup;
    while (loop-- && part2_step())
        ;
}
