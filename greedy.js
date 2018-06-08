const fs = require('fs');

/*
  Greedy Strategy
  0. Go through our items and filter out any items whose size > knapsack's capacity
  1. 'Score' each item by determining its value/weight ratio
  2. Sort the items array by each item's ratio such that the items with the best ratio
  are at the top of the array of items
  3. Grab items off the top of the items array until we reach our knapsack's full capacity
*/
// Iterative Approach
function knapsackIterative(items, capacity) {
  const cache = Array(items.length);

  for (let i = 0; i < items.length; i++) {
    cache[i] = Array(capacity + 1).fill(null);
  }

  // seed the cache with some initial values
  for (let i = 0; i <= capacity; i++) {
    cache[0][i] = {
      size: 0,
      value: 0,
      chosen: []
    };
  }

  // Loop through all the items in our items array
  for (let i = 1; i < items.length; i++) {
    // Loop through all the capacities
    for (let j = 0; j <= capacity; j++) {
      if (items[i].size > j) {
        // if the item is too large, use the previous value
        cache[i][j] = cache[i-1][j];
      } else {
        // Item fits
        const r0 = cache[i-1][j];
        const r1 = Object.assign({}, cache[i-1][j - items[i].size]);

        r1.value += items[i].value;

        if (r0.value > r1.value) {
          cache[i][j] = r0;
        } else {
          r1.size += items[i].size;
          r1.chosen = r1.chosen.concat(items[i].index);
          cache[i][j] = r1;
        }
      }
    }
  }

  return cache[cache.length-1][capacity];
}


function memoizedKnapsack(items, capacity) {
  // console.log(items.length, capacity);
  // initalize cache (in this, it will be a matrix)
  const cache = Array(items.length).fill(Array(capacity + 1).fill(null));

  // add the second dimension
  // for (let i = 0; i < items.length; i++) {
  //   cache[i] = Array(capacity + 1).fill(null);
  // }

  function recurseMemo(i, capacityLeft) {
    if (i === -1) {
      return {
        value: 0,
        size: 0,
        chosen: [],
      };
    }

    let value = cache[i][capacityLeft];

    if (!value) {
      value = recurseNaive(i, capacityLeft);
      cache[i][capacityLeft] = Object.assign({}, value);    // make a copy
    }

    return value;
  }

  function recurseNaive(i, capacityLeft) {
    if (i === -1) {
      return {
        value: 0,
        size: 0,
        chosen: [],
      };
    }
    // check to see if the item fits
    else if (items[i].size > capacityLeft) {
      return recurseMemo(i - 1, capacityLeft);
    }
    // Item fits, but might not be worth as much as items in there already
    // But is it worth taking? Does it positively affect our value?
    else {
      // The value we get from not taking the item
      const r0 = recurseMemo(i - 1, capacityLeft);
      const r1 = recurseMemo(i - 1, capacityLeft - items[i].size)

      r1.value += items[i].value;

      if (r0.value > r1.value) {
        return r0;
      } else {
        r1.size += items[i].size;
        r1.chosen = r1.chosen.concat(items[i].index);
        return r1;
      }
    }
  }
  return recurseMemo(items.length - 1, capacity);
}


/* Naive Recursive Approach */
function naiveKnapsack(items, capacity) {
  function recurse(i, size) {
    // base case
    if (i === -1) {
      return {
        value: 0,
        size: 0,
        chosen: [],
      };
    }

    // check to see if the item fits
    else if (items[i].size > size) {
      return recurse(i - 1, size);
    }
    // Item fits, but might not be worth as much as items in there already
    else {
      const r0 = recurse(i - 1, size);
      const r1 = recurse(i - 1, size - items[i].size);

      r1.value += items[i].value;

      if (r0.value > r1.value) {
        return r0;
      } else {
        r1.size += items[i].size;
        r1.chosen = r1.chosen.concat(i+1);
        return r1;
      }
    }
  }
  return recurse(items.length - 1, capacity);
}


const greedyAlgo = (f, c) => {
  f = f.sort((a, b) => (b.value / b.size) - (a.value / a.size));
  let items = [];
  for (let i = 0; i < f.length; i++) {
    if (f[i].size < c) {
      c -= f[i].size;
      items.push(f[i]);
    }
  }
  return items;
}

const argv = process.argv.slice(2);

if (argv.length != 2) {
  console.error("usage: filename capacity");
  process.exit(1);
}

const filename = argv[0];
const capacity = parseInt(argv[1]);

// Read the file
const filedata = fs.readFileSync(filename, "utf8");
// Split the filedata on each new line
const lines = filedata.trim().split(/[\r\n]+/g);

// Process the lines
const items = [];

for (let l of lines) {
  const [index, size, value] = l.split(" ").map(n => parseInt(n));
  items.push({
    index: index,
    size: size,
    value: value,
  });
}
console.log(naiveKnapsack(items, capacity));
