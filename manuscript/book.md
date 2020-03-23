# Washing your code: Write once, read seven times

## Preface

The title of this book should be “What 23 years of programming have taught me about writing good code” or “What I tell folks during code reviews while trying to decipher their code,” but both are too long, so “Write once, read seven times” it is. We can even shorten it to WORST because everyone loves nonsensical acronyms.

“Write once, read seven times” is a variation of a famous Russian proverb “Measure seven times, cut once.” The idea is that we read code more often than we write it, so it makes more sense to optimize for the ease of reading than the ease of writing.

This book is going to be opinionated, but you don’t have to agree with everything I’m saying. That’s not the goal of the book. The goal is to show you one of the possible paths, mine, and inspire you to find your own. These techniques help me to write and review code every day, and I’ll be happy if you find some of them useful. Let me know how it goes.

The book is probably most useful for intermediate developers. If you’re a beginner, you’ll likely have plenty of other things to think about. If you have decades of experience, you can probably write a similar book yourself. Either way, I’d be happy to hear your feedback.

Most of the examples in this book are in JavaScript because that’s my primary language, but you can apply the ideas to any language. Sometimes you’ll see CSS and HTML because similar ideas can be applied there too.

I’ve taken most of the examples from real code, with only minor adaptation, mostly different names. I spend several hours every week reviewing other developers’ code, and that gives me enough experience to tell which patterns make the code more readable and which don’t.

And remember, there are no strict rules in programming, except that you should always use three-space indentation in your code.

## Acknowledgments

These folks helped me with the book in one way or another.

Thanks to [Manuel Bieh](https://twitter.com/ManuelBieh), [Inês Carvalho](https://imcarvalho.github.io/), [Evan Davis](https://github.com/evandavis), [Troy Giunipero](https://github.com/giuniperoo), Anita Kiss, [Giorgi Kotchlamazashvili](https://github.com/hertzg), [Andy Krings-Stern](https://github.com/ankri) [Veniamin Krol](https://vkrol.dev/), [Monica Lent](https://monicalent.com/), Diana Martinez, [Rostislav U](https://twitter.com/inooze), [Dan Uhl](https://github.com/danieluhl), [Juho Vepsäläinen](https://survivejs.com/), [Michel Weststrate](https://twitter.com/mweststrate), [Mark Wiltshire](https://github.com/mwiltshire).

## Avoid loops

Traditional loops, like `for` or `while`, are too low-level for common tasks. They are verbose and prone to [off-by-one errors](https://en.wikipedia.org/wiki/Off-by-one_error). You have to manage the index variable yourself, and I always make typos with `lenght`. They don’t have any particular semantic value beyond telling you that some operation is probably repeated.

### Replacing loops with array methods

Modern languages have better ways to express iterative operations, and [JavaScript has many useful methods](http://exploringjs.com/impatient-js/ch_arrays.html#methods-iteration-and-transformation-.find-.map-.filter-etc) to transform and iterate over arrays, like `.map()` or `.find()`.

For example, let’s convert an array of strings to `kebab-case` with a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
for (let i = 0; i < names.length; i++) {
  kebabNames.push(_.kebabCase(names[i]));
}
```

And with the `.map()` method instead of a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

We can shorten it even more if our callback function accepts only one argument: the value. Take [kebabCase from Lodash](https://lodash.com/docs#kebabCase) for example:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(_.kebabCase);
```

This wouldn’t work with functions that accept more than one argument because `.map()` also passes an array index as the second argument and a whole array as the third. Using `parseInt()`, a function that accepts the radix as its second argument, would likely lead to unexpected results:

```js
const inputs = ['1', '2', '3'];
inputs.map(parseInt); // -> [1, NaN, NaN]
inputs.map(value => parseInt(value)); // -> [1, 2, 3]
```

Here in the first example, `.map()` calls `parseInt()` with an array index as a radix, which gives an incorrect result. In the second example, we’re explicitly passing only the value to the `parseInt()`, so it uses the default radix of 10.

But this may be a bit less readable than the expanded version because we don’t see what exactly we’re passing to a function. ECMAScript 6’s arrow functions made callbacks shorter and less cluttered compared to the old anonymous function syntax:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(function(name) {
  return _.kebabCase(name);
});
```

Now, let’s find an element in an array with a `for` loop:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
let foundName;
for (let i = 0; i < names.length; i++) {
  if (names[i].startsWith('B')) {
    foundName = names[i];
    break;
  }
}
```

And now with the `.find()` method:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const foundName = names.find(name => name.startsWith('B'));
```

In both cases, I much prefer array methods when compared to `for` loops. They are shorter, and we’re not bloating the code with iteration mechanics.

### Implied semantics of array methods

Array methods aren’t just shorter and more readable; each method has its own clear semantic:

- `.map()` says we’re transforming an array into another array with the same number of elements;
- `.find()` says we’re _finding_ a single element in an array;
- `.some()` says we’re testing that the condition is true for _some_ elements of the array;
- `.every()` says we’re testing that the condition is true for _every_ element of the array.

Traditional loops don’t help with understanding what the code is doing until you read the whole thing.

We’re separating the “what” (our data) from the “how” (how to loop over it). More than that, with array methods we only need to worry about our data, which we’re passing in as a callback function.

When all simple cases are covered by array methods, every time you see a traditional loop, you know that something unusual is going on. And that’s good: less chances you’ll miss a bug during code review.

Also, don’t use generic array methods like `.map()` or `.forEach()` when more specialized array methods would work and don’t use `.forEach()` instead of `.map()` to transform an array.

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = [];
names.forEach(name => {
  kebabNames.push(_.kebabCase(name));
});
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

This is a more cryptic and less semantic implementation of `.map()`, so better use `.map()` directly like we did above:

```js
const names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
const kebabNames = names.map(name => _.kebabCase(name));
```

<!-- expect(kebabNames).toEqual(['bilbo-baggins', 'gandalf', 'gollum']) -->

This version is much easier to read because we know that the `.map()` method transforms an array by keeping the same number of items. And, unlike `.forEach()`, it doesn’t require a custom implementation or mutate an output array. In addition, the callback function is now pure: it merely transforms input arguments to the output value without any side effects.

We run into similar problems when we abuse array method semantics:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
let isExpectedType = false;
products.map(product => {
  isExpectedType = product.type === expectedType;
});
```

Here, the `.map()` method is used to _reduce_ an array to a single value by having a side effect instead of returning a new item value from the callback function.

It’s hard to say what this code is doing, and it feels like there’s a bug: it only cares about the last product in a list.

If it’s indeed a bug, and the intention was to check if _some_ of the products have the expected type, then the `.some()` array method would be the best choice:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType = products.some(
  product => product.type === expectedType
);
```

If the behavior of the original code was correct, then we actually don’t need to iterate at all. We can check the latest array item directly:

<!-- const products = [{type: 'pizza'}, {type: 'coffee'}], expectedType = 'pizza' -->

```js
const isExpectedType =
  products[products.length - 1].type === expectedType;
```

Both refactored versions make the intention of the code clearer and leave fewer doubts that the code is correct. We can probably make the `isExpectedType` variable name more explicit, especially in the second refactoring.

### Dealing with side effects

Side effects make code harder to understand because you can no longer treat a function as a black box: a function with side effects doesn’t just transform input to output but can affect the environment in unpredictable ways. Functions with side effects are also hard to test because you’ll need to recreate the environment before each test is run and verify it after.

All array methods mentioned in the previous section, except `.forEach()`, imply that they don’t have side effects and that only the return value is used. Introducing any side effects into these methods would make code easy to misread since readers won’t be expecting side effects.

`.forEach()` doesn’t return any value, and that’s the right choice for handling side effects when you really need them:

<!--
const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
const errors = ['dope', 'nope']
-->

```js
errors.forEach(error => {
  console.error(error);
});
```

<!--
expect(console.error.mock.calls).toEqual([['dope'], ['nope']])
spy.mockRestore()
-->

A `for of` loop is even better:

- it doesn’t have any of the problems of regular `for` loops, mentioned in the beginning of this chapter;
- we can avoid reassignments and mutations since we don’t have a return value;
- it has clear semantics of iteration over all array elements since we can’t manipulate the number of iterations, like in a regular `for` loop. (Well, almost, we can abort the loops with `break`.)

Let’s rewrite our example using a `for of` loop:

<!--
const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
const errors = ['dope', 'nope']
-->

```js
for (const error of errors) {
  console.error(error);
}
```

<!--
expect(console.error.mock.calls).toEqual([['dope'], ['nope']])
spy.mockRestore()
-->

### Sometimes loops aren’t so bad

Array methods aren’t always better than loops. For example, the `.reduce()` method often makes code less readable than a regular loop.

Let’s look at this code:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData = [];
if (props.item && props.item.details) {
  for (const client of props.item.details.clients) {
    for (const config of client.errorConfigurations) {
      tableData.push({
        errorMessage: config.error.message,
        errorLevel: config.error.level,
        usedIn: client.name
      });
    }
  }
}
```

My first reaction would be to rewrite it with `.reduce()` to _avoid loops_:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData =
  props.item &&
  props.item.details &&
  props.item.details.clients.reduce(
    (acc, client) => [
      ...acc,
      ...client.errorConfigurations.reduce(
        (inner, config) => [
          ...inner,
          {
            errorMessage: config.error.message,
            errorLevel: config.error.level,
            usedIn: client.name
          }
        ],
        []
      )
    ],
    []
  );
```

But is it really more readable?

After a cup of coffee and a chat with a colleague, I’ve ended up with a much cleaner approach:

<!--
const props = {
  item: {
    details: {
      clients: [{
        name: 'Pizza',
        errorConfigurations: [{
          error: {
            message: 'nope',
            level: 2
          }
        }]
      }]
    }
  }
}
-->

```js
const tableData =
  props.item &&
  props.item.details &&
  props.item.details.clients.reduce((acc, client) =>
    acc.concat(
      ...client.errorConfigurations.map(config => ({
        errorMessage: config.error.message,
        errorLevel: config.error.level,
        usedIn: client.name
      }))
    )
  );
```

If I was to review such code, I would be happy to pass both versions but would prefer the original with double `for` loops. _(Though `tableData` is a really bad variable name.)_

### Iterating over objects

There are [many ways to iterate over objects](https://stackoverflow.com/a/5737136/1973105) in JavaScript. I equally dislike them all, so it’s hard to choose the best one. Unfortunately, there’s no `.map()` for objects, though Lodash does have three methods for object iteration, so it’s a good option if you’re already using Lodash in your project.

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = _.mapValues(allNames, names =>
  names.map(name => _.kebabCase(name))
);
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

If you don’t need the result as an object, like in the example above, `Object.keys()`, `Object.values()` and `Object.entries()` are also good:

<!-- const spy = jest.spyOn(console, 'log').mockImplementation(() => {}) -->

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.keys(allNames).forEach(race =>
  console.log(race, '->', allNames[race])
);
```

<!--
expect(console.log.mock.calls).toEqual([['hobbits', '->', ['Bilbo', 'Frodo']], ['dwarfs', '->', ['Fili', 'Kili']]])
spy.mockRestore()
-->

Or:

<!-- const spy = jest.spyOn(console, 'log').mockImplementation(() => {}) -->

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
Object.entries(allNames).forEach(([race, value]) =>
  console.log(race, '->', value)
);
```

<!--
expect(console.log.mock.calls).toEqual([['hobbits', '->', ['Bilbo', 'Frodo']], ['dwarfs', '->', ['Fili', 'Kili']]])
spy.mockRestore()
-->

I don’t have a strong preference between them. `Object.entries()` has more verbose syntax, but if you use the value (`names` in the example above) more than once, the code would be cleaner than `Object.keys()`, where you’d have to write `allNames[race]` every time or cache this value into a variable at the beginning of the callback function.

If I stopped here, I’d be lying to you. Most of the articles about iteration over objects have examples with `console.log()`, but in reality you’d often want to convert an object to another data structure, like in the example with `_.mapValues()` above. And that’s where things start getting uglier.

Let’s rewrite our example using `.reduce()`:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = Object.entries(allNames).reduce(
  (newNames, [race, names]) => {
    newNames[race] = names.map(name => _.kebabCase(name));
    return newNames;
  },
  {}
);
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

With `.forEach()`:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = {};
Object.entries(allNames).forEach(([race, names]) => {
  kebabNames[race] = names.map(name => name.toLowerCase());
});
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

And with a loop:

```js
const allNames = {
  hobbits: ['Bilbo', 'Frodo'],
  dwarfs: ['Fili', 'Kili']
};
const kebabNames = {};
for (let [race, names] of Object.entries(allNames)) {
  kebabNames[race] = names.map(name => name.toLowerCase());
}
```

<!--
expect(kebabNames).toEqual({
  hobbits: ['bilbo', 'frodo'],
  dwarfs: ['fili', 'kili']
})
-->

And again `.reduce()` is the least readable option.

In later chapters I’ll urge you to avoid not only loops but also reassigning variables and mutation. Like loops, they _often_ lead to poor code readability, but _sometimes_ they are the best choice.

### But aren’t array methods slow?

You may think that using functions is slower than loops, and likely it is. But in reality it doesn’t matter unless you’re working with millions of items.

Modern JavaScript engines are very fast and optimized for popular code patterns. Back in the day, we used to write loops like this because checking the array length on every iteration was too slow:

```js
var names = ['Bilbo Baggins', 'Gandalf', 'Gollum'];
for (var i = 0, namesLength = names.length; i < namesLength; i++) {
  names[i] = _.kebabCase(names[i]);
}
```

It’s not slow anymore, though, and there are other examples where engines optimize for simpler code patterns and make manual optimization unnecessary.

Also, `.every()`, `.some()`, `.find()` and `.findIndex()` will short circuit, meaning they won’t iterate over more array elements than necessary.

In any case, you should measure performance to know what to optimize and see whether your changes really make code faster in all important browsers and environments.

---

Start thinking about:

- Replacing loops with array methods, like `.map()` or `.filter()`.
- Avoiding side effects in functions.

## Avoid conditions

Conditions make code harder to read and test. They add nesting and make lines of code longer, so you have to split them into several lines. Each condition increases the minimum number of test cases you need to write for a certain module or function.

### Unnecessary conditions

Many conditions are unnecessary or could be rewritten in a more readable way.

For example you may find code similar to this that returns a boolean value:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value !== NONE ? true : false;
const hasProducts = products.length > 0 ? true : false;
```

`value !== NONE` and `products.length > 0` already give us booleans, so we can avoid the ternary operator:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value !== NONE;
const hasProducts = products.length > 0;
```

And even when the initial value isn’t a boolean:

<!-- const NONE = null, value = NONE, products = [] -->

```js
const hasValue = value ? true : false;
const hasProducts = products.length ? true : false;
```

We still can avoid the condition by explicitly converting the value to a boolean:

<!-- const NONE = null, value = NONE -->

```js
const hasValue = Boolean(value);
```

In all cases code without a ternary is both shorter and easier to read.

There are more cases when a condition is unnecessary:

```diff
- const hasProducts = products && Array.isArray(products);
+ const hasProducts = Array.isArray(products);
```

`Array.isArray` returns `false` for any falsy value, no need to check for it separately.

And a more complex but great (and real!) example of unnecessary conditions:

```js
function IsNetscapeOnSolaris() {
  var agent = window.navigator.userAgent;
  if (
    agent.indexOf('Mozilla') != -1 &&
    agent.indexOf('compatible') == -1
  ) {
    if (agent.indexOf('SunOS') != -1) return true;
    else return false;
  } else {
    return false;
  }
}
```

The whole condition block could be replaced with a single expression:

```js
function IsNetscapeOnSolaris() {
  const { userAgent } = window.navigator;
  return (
    userAgent.includes('Mozilla') &&
    userAgent.includes('SunOS') &&
    !userAgent.includes('compatible')
  );
}
```

We’ve eliminated two levels of nesting and quite a lot of boilerplate code, so the actual condition is easier to understand.

### Processing arrays

It’s common to check an array’s length before running a loop over its items:

```js
function getProductsDropdownItems(response) {
  const products = response.products;
  if (products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
}
```

All loops and array functions, like `.map()` or `.filter()` work fine with empty arrays, so we can safely remove the check:

```js
function getProductsDropdownItems({ products }) {
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

Sometimes we have to use an existing API that returns an array only in some cases, so checking the length directly would fail and we need to check the type first:

```js
function getProductsDropdownItems({ products }) {
  if (Array.isArray(products) && products.length > 0) {
    return products.map(product => ({
      label: product.name,
      value: product.id
    }));
  }
  return [];
}
```

We can’t avoid the condition in this case but we can move it earlier and avoid a separate branch that handles the absence of an array. There are several ways to do it, depending on the possible data types.

If our data can be an array or `undefined`, we can use a default value for the function parameter:

```js
function getProductsDropdownItems(products = []) {
  return products.map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

Or a default value for the destructured property of an object:

```diff
- function getProductsDropdownItems(products = []) {
+ function getProductsDropdownItems({ products = [] }) {
```

It’s more tricky if our data can be an array or `null`, because defaults are only used when the value is strictly `undefined`, not just falsy. In this case we can use the `||` operator:

```js
function getProductsDropdownItems(products) {
  return (products || []).map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

We still have a condition but the overall code structure is simpler.

In all these examples we’re removing a separate branch and dealing with the absence of data by normalizing the input — converting it to an array — as early as possible, and then running a generic algorithm on normalized data.

Arrays are convenient because we don’t have to worry about how many items they contain: the same code will work with a hundred items, one item or even no items.

A similar technique works when the input is a single item or an array:

```js
function getProductsDropdownItems({ products }) {
  (Array.isArray(products) ? products : [products]).map(product => ({
    label: product.name,
    value: product.id
  }));
}
```

Here we’re wrapping a single item in an array, so we can use the same code to work with single items and arrays.

### Deduplicating an algorithm

Examples in the previous section are introducing an important technique: algorithm deduplication. Instead of having several branches of the main logic depending on the nature of the input, we have just one. But we’re normalizing the input before running the algorithm. This technique can be used in other places.

Imagine you have a article vote counter, similar to Medium, where you can vote multiple times:

<!--
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (!(url in counts)) {
        counts[url] = 0;
      }

      counts[url] += votes;
    },
    downvote(url) {
      counts[url] -= 1;
    }
  };
}
-->

```js
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/dogs-better-than-cats', 5);
articles.downvote('/cats-better-than-dogs');
articles.get('/dogs-better-than-cats');
// => 5
```

<!--
expect(articles.get('/cats-better-than-dogs')).toBe(0)
expect(articles.get('/dogs-better-than-cats')).toBe(5)
-->

A naïve way to implement the `upvote` method could be:

```js
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (url in counts) {
        counts[url] += votes;
      } else {
        counts[url] = votes;
      }
    }
  };
}
```

<!--
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/cats-better-than-dogs', 4);
expect(articles.get('/cats-better-than-dogs')).toBe(5)
-->

The problem here is that the main function logic, count increment, is implemented twice: for the case when we already have votes for that URL and when we’re voting for the first time. So every time you need to update this logic, you need to make changes in two places. You need to write two sets of very similar tests to make sure both branches work as expected, otherwise they’ll eventually diverge and you’ll have hard to debug issues.

Let’s make the main logic unconditional but prepare the state if necessary before running the logic:

```js
function counter() {
  const counts = {};
  return {
    get(url) {
      return counts[url];
    },
    upvote(url, votes = 1) {
      if (!(url in counts)) {
        counts[url] = 0;
      }

      counts[url] += votes;
    }
  };
}
```

<!--
const articles = counter();
articles.upvote('/cats-better-than-dogs');
articles.upvote('/cats-better-than-dogs', 4);
expect(articles.get('/cats-better-than-dogs')).toBe(5)
-->

Now we don’t have any logic duplication. We’re normalizing the data structure, so the generic algorithm could work with it.

I often see a similar issue when someone calls a function with different parameters:

<!-- const log = x => x, errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
if (errorMessage) {
  log(LOG_LEVEL.ERROR, errorMessage);
} else {
  log(LOG_LEVEL.ERROR, DEFAULT_ERROR_MESSAGE);
}
```

Let’s move a condition inside the function call:

<!-- const log = x => x, errorMessage = 'nope', LOG_LEVEL = {ERROR: 'error'}, DEFAULT_ERROR_MESSAGE = 'nooooope'  -->

```js
log(LOG_LEVEL.ERROR, errorMessage || DEFAULT_ERROR_MESSAGE);
```

We’ve removed all code duplication and the code is shorter and easier to read.

### Early return

Applying _guard clauses_, or _early returns_, is a great way to avoid nested conditions. A series of nested conditions, also known as the [arrow anti pattern](http://wiki.c2.com/?ArrowAntiPattern) or _dangerously deep nesting_, is often used for error handing:

```js
function postOrderStatus(orderId) {
  var idsArrayObj = getOrderIds();

  if (idsArrayObj != undefined) {
    if (idsArrayObj.length == undefined) {
      var tmpBottle = idsArrayObj;
      idsArrayObj = new Array(tmpBottle);
    }

    var fullRecordsArray = new Array();
    // 70 lines of code

    if (fullRecordsArray.length != 0) {
      // 40 lines of code
      return sendOrderStatus(fullRecordsArray);
    } else {
      return false;
    }
  } else {
    return false;
  }
}
```

There are 120 lines between the first condition and its `else` block. And the main return value is somewhere inside three levels of conditions.

Let’s untangle this spaghetti monster:

```js
function postOrderStatus(orderId) {
  let idsArrayObj = getOrderIds();
  if (idsArrayObj === undefined) {
    return false;
  }

  if (!Array.isArray(idsArrayObj)) {
    idsArrayObj = [idsArrayObj];
  }

  const fullRecordsArray = [];

  // 70 lines of code
  if (fullRecordsArray.length === 0) {
    return false;
  }

  // 40 lines of code
  return sendOrderStatus(fullRecordsArray);
}
```

This function is still long but it’s much easier to follow because of simpler code structure.

Now we have maximum one level of nesting inside the function and the main return value is at the very end without nesting. We’ve added two guard clauses to exit the function early when there’s no data to process.

I’m not really sure what the code inside the second condition does, but it looks like it is wrapping a single item in an array, like we did in the previous section.

_And no, I have no idea what `tmpBottle` means, nor why it was needed._

The next step here could be improving the `getOrderIds()` function’s API. It can return three different things: `undefined`, a single item, or an array. We have to deal with each separately, so we have two conditions at the very beginning of the function, and we’re reassigning the `idsArrayObj` variable (see [Avoid reassigning variables](#avoid-reassigning-variables) below).

By making the `getOrderIds()` function always return an array, and making sure that the code inside `// 70 lines of code` works with an empty array, we could remove both conditions:

```js
function postOrderStatus(orderId) {
  const orderIds = getOrderIds(); // Always an array

  const fullRecordsArray = [];

  // 70 lines of code
  if (fullRecordsArray.length === 0) {
    return false;
  }

  // 40 lines of code
  return sendOrderStatus(fullRecordsArray);
}
```

Now that’s a big improvement over the initial version. I’ve also renamed the `idsArrayObj` variable, because “array object” doesn’t make any sense to me.

The next step would be out of the scope of this chapter: the code inside `// 70 lines of code` mutates the `fullRecordsArray`, see [Avoid mutation](#avoid-mutation) below to learn why mutations aren’t good and how to avoid them.

### Repeated conditions

Repeated conditions can make code barely readable. Let’s have a look at this function that returns special offers for a product in our pet shops. We have two brands, Horns & Hooves and Paws & Tails, and they have unique special offers. For historical reasons we store them in the cache differently:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers' -->

```js
function getSpecialOffersArray(sku, isHornsAndHooves) {
  let specialOffersArray = isHornsAndHooves
    ? Session.get(SPECIAL_OFFERS_CACHE_KEY + '_' + sku)
    : Session.get(SPECIAL_OFFERS_CACHE_KEY);
  if (!specialOffersArray) {
    const hornsAndHoovesOffers = getHornsAndHoovesSpecialOffers();
    const pawsAndTailsOffers = getPawsAndTailsSpecialOffers();
    specialOffersArray = isHornsAndHooves
      ? hornsAndHoovesOffers
      : pawsAndTailsOffers;
    Session.set(
      isHornsAndHooves
        ? SPECIAL_OFFERS_CACHE_KEY + '_' + sku
        : SPECIAL_OFFERS_CACHE_KEY,
      specialOffersArray
    );
  }
  return specialOffersArray;
}
```

The `isHornsAndHooves` condition is repeated three times. Two of them to create the same session key. It’s hard to see what this function is doing: business logic is intertwined with low level session management code.

Let’s try to make it simpler:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers' -->

```js
function getSpecialOffersArray(sku, isHornsAndHooves) {
  const cacheKey = isHornsAndHooves
    ? `${SPECIAL_OFFERS_CACHE_KEY}_${sku}`
    : SPECIAL_OFFERS_CACHE_KEY;

  const cachedOffers = Session.get(cacheKey);
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = isHornsAndHooves
    ? getHornsAndHoovesSpecialOffers()
    : getPawsAndTailsSpecialOffers();

  Session.set(cacheKey, offers);

  return offers;
}
```

This is already more readable and it could be a good idea to stop here. But if I had some time I’d go further and extract cache management. Not because this function is too long or that it’s potentially reusable, but because cache management distracts me from the main purpose of the function and it’s too low level.

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers' -->

```js
const getSessionKey = (key, isHornsAndHooves, sku) =>
  isHornsAndHooves ? `${key}_${sku}` : key;

const sessionGet = (key, isHornsAndHooves, sku) =>
  Session.get(getSessionKey(key, isHornsAndHooves, sku));

const sessionSet = (key, sku, isHornsAndHooves, value) =>
  Session.set(getSessionKey(key, isHornsAndHooves, sku), value);

function getSpecialOffersArray(sku, isHornsAndHooves) {
  const cachedOffers = sessionGet(
    SPECIAL_OFFERS_CACHE_KEY,
    isHornsAndHooves,
    sku
  );
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = isHornsAndHooves
    ? getHornsAndHoovesSpecialOffers()
    : getPawsAndTailsSpecialOffers();

  sessionSet(SPECIAL_OFFERS_CACHE_KEY, isHornsAndHooves, sku, offers);

  return offers;
}
```

It may not look much better but I think it’s a bit easier to understand what’s happening in the main function. What annoys me here is `isHornsAndHooves`. I’d rather pass a brand name and keep all brand-specific information in tables:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers' -->

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSpecialOffersForBrand = brand =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: getHornsAndHoovesSpecialOffers,
    [BRANDS.PAWS_AND_TAILS]: getPawsAndTailsSpecialOffers
  }[brand]());

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  }[brand]);

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, sku, brand, value) =>
  Session.set(getSessionKey(key, brand, sku), value);

function getSpecialOffersArray(sku, brand) {
  const cachedOffers = sessionGet(
    SPECIAL_OFFERS_CACHE_KEY,
    brand,
    sku
  );
  if (cachedOffers) {
    return cachedOffers;
  }

  const offers = getSpecialOffersForBrand(brand);
  sessionSet(SPECIAL_OFFERS_CACHE_KEY, brand, sku, offers);
  return offers;
}
```

Now it’s clear that the only piece of business logic here is `getSpecialOffersForBrand`, and the rest is caching. If we’re using this pattern more than once I’d extract it into its own module, similar to the [memoize function](https://lodash.com/docs#memoize) from Lodash:

<!-- const SPECIAL_OFFERS_CACHE_KEY = 'offers' -->

```js
const BRANDS = {
  HORNS_AND_HOOVES: 'Horns & Hooves',
  PAWS_AND_TAILS: 'Paws & Tails'
};

const getSessionKey = (key, brand, sku) =>
  ({
    [BRANDS.HORNS_AND_HOOVES]: `${key}_${sku}`,
    [BRANDS.PAWS_AND_TAILS]: key
  }[brand]);

const sessionGet = (key, brand, sku) =>
  Session.get(getSessionKey(key, brand, sku));

const sessionSet = (key, brand, sku, value) =>
  Session.set(getSessionKey(key, brand, sku), value);

const withSessionCache = (key, fn) => (brand, sku, ...args) => {
  const cachedValue = sessionGet(key, brand, sku);
  if (cachedValue) {
    return cachedValue;
  }

  const value = fn(brand, sku, ...args);
  sessionSet(key, brand, sku, value);
  return value;
};

// --- 8< -- 8< ---

const getSpecialOffersArray = withSessionCache(
  SPECIAL_OFFERS_CACHE_KEY,
  brand =>
    ({
      [BRANDS.HORNS_AND_HOOVES]: getHornsAndHoovesSpecialOffers,
      [BRANDS.PAWS_AND_TAILS]: getPawsAndTailsSpecialOffers
    }[brand]())
);
```

We were able to separate all low level code and hide it in another module.

It may seem like I prefer small functions, or even very small functions, but that’s not the case. The main reason to extract code into separate functions here is a violation of the [single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle). The original function had too many responsibilities: getting special offers, generating cache keys, reading data from cache, storing data in cache. Each with two branches for our two brands.

### Tables or maps

One of my favorite techniques on improving _(read: avoiding)_ conditions is replacing them with tables or maps. With JavaScript you can create a table or a map using a plain object.

We’ve just done this as a part of our "special offers" refactoring example above. Let’s have a look at a simpler example now. This example may be a bit extreme, but I actually wrote this code 19 years ago:

<!-- let month = 'may' -->

<!-- prettier-ignore -->
```js
if (month == 'jan') month = 1;
if (month == 'feb') month = 2;
if (month == 'mar') month = 3;
if (month == 'apr') month = 4;
if (month == 'may') month = 5;
if (month == 'jun') month = 6;
if (month == 'jul') month = 7;
if (month == 'aug') month = 8;
if (month == 'sep') month = 9;
if (month == 'oct') month = 10;
if (month == 'nov') month = 11;
if (month == 'dec') month = 12;
```

Let’s replace the conditions with a table:

<!-- const monthName = 'may' -->

```js
const MONTH_NAME_TO_NUMBER = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dec: 12
};
const month = MONTH_NAME_TO_NUMBER[monthName];
```

There’s almost no boilerplate code around the data, it’s more readable and looks like a table. Notice also that there are no brackets in the original code: in most modern style guides brackets around condition bodies are required, and the body should be on its own line, so this snippet will be three times longer and even less readable.

Or a bit more realistic and common example:

<!-- const decision = {id: 2} -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton => {
  switch (decisionButton) {
    case DECISION_YES:
      return 'Yes';
    case DECISION_NO:
      return 'No';
    case DECISION_MAYBE:
      return 'Maybe';
  }
};

// And later it's used like this
<Button>{getButtonLabel(decision.id)}</Button>;
```

Here we have a `switch` statement to return one of three button labels.

First, let’s replace the `switch` with a table:

<!-- const decision = {id: 2} -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const getButtonLabel = decisionButton =>
  ({
    [DECISION_YES]: 'Yes',
    [DECISION_NO]: 'No',
    [DECISION_MAYBE]: 'Maybe'
  }[decisionButton]);

// And later it's used like this
<Button>{getButtonLabel(decision.id)}</Button>;
```

The object syntax is a bit more lightweight and readable than the `switch` statement.

We can even make this code more idiomatic to React by converting our `getButtonLabel` function into a React component:

<!-- const decision = {id: 2} -->

```jsx
const DECISION_YES = 0;
const DECISION_NO = 1;
const DECISION_MAYBE = 2;

const ButtonLabel = ({ decision }) =>
  ({
    [DECISION_YES]: 'Yes',
    [DECISION_NO]: 'No',
    [DECISION_MAYBE]: 'Maybe'
  }[decision]);

// And later it can be used like this
<Button>
  <ButtonLabel decision={decision.id} />
</Button>;
```

Now both the implementation and the usage are simpler.

Another realistic and common example is form validation:

```jsx
function validate(values) {
  const errors = {};

  if (!values.name || (values.name && values.name.trim() === '')) {
    errors.name = 'Name is required';
  }

  if (values.name && values.name.length > 80) {
    errors.name = 'Maximum 80 characters allowed';
  }

  if (!values.address1) {
    errors.address1 = 'Address is required';
  }

  if (!values.email) {
    errors.mainContactEmail = 'Email is required';
  }

  if (!values.login || (values.login && values.login.trim() === '')) {
    errors.login = 'Login is required';
  }

  if (values.login && values.login.indexOf(' ') > 0) {
    errors.login = 'No spaces are allowed in login';
  }

  if (values.address1 && values.address1.length > 80) {
    errors.address1 = 'Maximum 80 characters allowed';
  }

  // 100 lines of code

  return errors;
}
```

This function is very long, with lots and lots of repetitive boilerplate code. It’s really hard to read and maintain. Sometimes validations for the same field aren’t grouped together.

But if we look closer, there are just three unique validations:

- a required field (in some cases leading and trailing whitespace is ignored, in some not — hard to tell whether it’s intentional or not);
- maximum length (always 80);
- no spaces allowed.

First, let’s extract all validations into their own functions so we can reuse them later:

```js
const hasStringValue = value => value && value.trim() !== '';
const hasLengthLessThanOrEqual = max => value =>
  !hasStringValue(value) || (value && value.length <= max);
const hasNoSpaces = value =>
  !hasStringValue(value) || (value && value.includes(' '));
```

I’ve assumed that different whitespace handling was a bug. I’ve also inverted all the conditions to validate the correct value, instead of an incorrect one, to make the code more readable.

Note that `hasLengthLessThanOrEqual` and `hasNoSpaces` only check the condition if the value is present, which would allow us to make optional fields. Also note that the `hasLengthLessThanOrEqual` function is customizable: we need to pass the maximum length: `hasLengthLessThanOrEqual(80)`.

Now we can define our validations table. There are two ways of doing this:

- using an object where keys represent form fields
- using an array

We’re going to use the second option because we want to have several validations with different error messages for some fields, for example a field can be required _and_ have maximum length:

<!--
const hasStringValue = value => value && value.trim() !== ''
const hasLengthLessThanOrEqual = max => value =>
  !hasStringValue(value) || (value && value.length <= max)
-->

```jsx
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
  {
    field: 'name',
    validation: hasLengthLessThanOrEqual(80),
    message: 'Maximum 80 characters allowed'
  }
  // All other fields
];
```

Now we need to iterate over this array and run validations for all fields:

<!--
const hasStringValue = value => value && value.trim() !== ''
const validations = [
  {
    field: 'name',
    validation: hasStringValue,
    message: 'Name is required'
  },
]
-->

```js
function validate(values, validations) {
  return validations.reduce(
    (errors, { field, validation, message }) => {
      if (!validation(values[field])) {
        errors[field] = message;
      }
      return errors;
    },
    {}
  );
}
```

One more time we’ve separated the “what” from the “how”: we have a readable and maintainable list of validations (“what”), a collection of reusable validation functions and a `validate` function to validate form values (“how”) that also can be reused.

_Tip: Using a third-party library, like [Yup](https://github.com/jquense/yup) or [Joi](https://github.com/hapijs/joi) will make code even shorter and save you from needing to write validation functions yourself._

You may feel that I have too many similar examples in this book, and you’re right. But I think such code is so common, and the readability and maintainability benefits of replacing conditions with tables are so huge, so it’s worth repeating. So here is one more example (the last one, I promise!):

<!-- const DATE_FORMAT_ISO = 'iso', DATE_FORMAT_DE = 'de', DATE_FORMAT_UK = 'uk', DATE_FORMAT_US = 'us' -->

```js
const getDateFormat = format => {
  const datePart = 'D';
  const monthPart = 'M';

  switch (format) {
    case DATE_FORMAT_ISO:
      return `${monthPart}-${datePart}`;
    case DATE_FORMAT_DE:
      return `${datePart}.${monthPart}`;
    case DATE_FORMAT_UK:
      return `${datePart}/${monthPart}`;
    case DATE_FORMAT_US:
    default:
      return `${monthPart}/${datePart}`;
  }
};
```

It’s just 15 lines of code, but I find this code difficult to read. I think that the `switch` is absolutely unnecessary, and the `datePart` and `monthPart` variables clutter the code so much that it’s almost unreadable.

<!-- const DATE_FORMAT_ISO = 'iso', DATE_FORMAT_DE = 'de', DATE_FORMAT_UK = 'uk', DATE_FORMAT_US = 'us' -->

```js
const DATE_FORMATS = {
  [DATE_FORMAT_ISO]: 'M-D',
  [DATE_FORMAT_DE]: 'D.M',
  [DATE_FORMAT_UK]: 'D/M',
  [DATE_FORMAT_US]: 'M/D',
  _default: 'M/D'
};

const getDateFormat = format => {
  return DATE_FORMATS[format] || DATE_FORMATS._default;
};
```

The improved version isn’t much shorter, but now it’s easy to see all date formats. We’ve extracted the data to a short and readable object, and separated it from the code that accesses the right piece of this data.

### Nested ternaries

A ternary operator is a short one-line conditional operator. It’s very useful when you want to assign one of two values to a variable. Compare an `if` statement:

<!-- const caffeineLevel = 25, DRINK_COFFEE = 1, DRINK_WATER = 2 -->

```js
let drink;
if (caffeineLevel < 50) {
  drink = DRINK_COFFEE;
} else {
  drink = DRINK_WATER;
}
```

With a ternary:

<!-- const caffeineLevel = 25, DRINK_COFFEE = 1, DRINK_WATER = 2 -->

```js
const drink = caffeineLevel < 50 ? DRINK_COFFEE : DRINK_WATER;
```

But nested ternaries are different beasts: they usually make code hard to read and there’s almost always a better alternative:

<!-- prettier-ignore -->
```jsx
function Products({products, isError, isLoading}) {
  return isError
    ? <p>Error loading products</p>
      : isLoading
        ? <Loading />
        : products.length > 0
          ? <ul>{products.map(
              product => <li key={product.id}>{product.name}</li>
            )}</ul>
          : <p>No products found</p>
}
```

This is a rare case when Prettier makes code completely unreadable:

```jsx
function Products({ products, isError, isLoading }) {
  return isError ? (
    <p>Error loading products</p>
  ) : isLoading ? (
    <Loading />
  ) : products.length > 0 ? (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  ) : (
    <p>No products found</p>
  );
}
```

But maybe it’s intentional, and a sign that we should rewrite it.

In this example we’re rendering one of four UIs based on the status of loading operation:

- a spinner (loading);
- error message (failure);
- a list of products (success);
- messages that there’s no products (also success).

Let’s rewrite this code using the already familiar early return pattern:

```jsx
function Products({ products, isError, isLoading }) {
  if (isError) {
    return <p>Error loading products</p>;
  }

  if (isLoading) {
    return <Loading />;
  }

  if (products.length === 0) {
    return <p>No products found</p>;
  }

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

I think it’s much easier to follow now: all special cases are at the top of the function, and the happy path is at the end.

_We’ll come back to this example later in the [Make impossible states impossible](#make-impossible-states-impossible) chapter._

---

Start thinking about:

- Removing unnecessary conditions, like conveying an already boolean value to `true` or `false` manually.
- Normalizing the input data by converting absence of data to an array early to avoid branching and dealing with no data separately.
- Normalizing the state to avoid algorithm duplication.
- Caching repeated conditions in a variable.
- Replacing long groups of conditions with tables or maps.

## Avoid reassigning variables

Reassigning variables is like changing the past. When you see:

```js
let pizza = { toppings: ['salami', 'mozzarella'] };
```

You can’t be sure that your pizza will always have salami and mozzarella in it, because:

- the variable can be reassigned with a new value, even a value of another type;
- the value, if it’s an array or an object, can be mutated.

Knowing that both things are possible makes you think, every time you see `pizza` in the code, which value it has _now_. That’s a huge and unnecessary cognitive load that we should avoid.

And most of the time you can avoid both. Let’s start with reassigning and come back to mutation in the next chapter.

### Don’t reuse variables

Sometimes a variable is reused to store different values:

```js
function getProductsOnSale(category) {
  category = loadCategory(category);
  category = category.filter(product => product.onSale);
  return category;
}
```

Here the `category` variable is used to store a category ID, a list of products in a category, and a list of filtered products. This function isn’t completely hopeless because it’s short, but imagine more code between reassignments.

Also a new value is reassigned to a function argument, known as _function argument shadowing_. I think it’s no different from regular reassignment, so I’ll treat it the same way.

This case is the easiest to fix: we need to use separate variables for each value:

```js
function getProductsOnSale(categoryId) {
  const products = loadCategory(categoryId);
  return products.filter(product => product.onSale);
}
```

By doing this we’re making the lifespan of each variable shorter and choosing clearer names, so code is easier to understand and we’ll need to read less code to find out the current (and now the only) value of each variable.

### Incremental computations

Probably the most common use case for reassignment is incremental computations. Consider this example:

<!--
const ERROR_MESSAGES = {
  InconsistentWidthHeight: 'Inconsistent width and height',
  InvalidVideoFiles: 'Invalid video files',
  InvalidVideoURL: 'Invalid video URL',
  BlankTitle: 'Blank title',
  InvalidId: 'Invalid ID',
}
-->

<!-- prettier-ignore -->
```js
const validateVideo = (video) => {
  let errors = '';

  if (!validateHeightWidthConsistency(video.videoFiles))  {errors = errors + ERROR_MESSAGES.InconsistentWidthHeight;} // Must provide either both a height + width, or neither
  if (!validateVideoFileAndUrl(video.videoFiles))         {errors = errors + ERROR_MESSAGES.InvalidVideoFiles;}       // Must have ONE OF either a file or a URL
  if (!validateVideoURL(video.videoFiles))                {errors = errors + ERROR_MESSAGES.InvalidVideoURL;}         // Video URL must be a valid link
  if (!video[INPUT_TYPES.Title])                          {errors = errors + ERROR_MESSAGES.BlankTitle;}              // Title cannot be blank
  if (!video[INPUT_TYPES.Id].match(ID_PATTERN) !== false) {errors = errors + ERROR_MESSAGES.InvalidId;}               // ID must be alphanumeric

  return errors;
};
```

I’ve shortened the comments a bit, the original code had lines longer than 200 characters. If you have a very big screen, it looks like a pretty table, otherwise like an unreadable mess. Any autoformatting tool, like Prettier, will make an unreadable mess out of it too, so you shouldn’t rely on manual code formatting. It’s also really hard to maintain: if any “column” becomes longer than all existing “columns” after your changes, you have to adjust whitespace for all other “columns”.

Anyway, this code appends an error message to the `errors` string variable for every failed validation. But now it’s hard to see because the message formatting code is mangled with the validation code. This makes it hard to read and modify. To add another validation, you have to understand and copy the formatting code. Or to print errors as an HTML list, you have to change each line of this function.

Let’s separate validation and formatting:

<!--
const ERROR_MESSAGES = {
  InconsistentWidthHeight: 'Inconsistent width and height',
  InvalidVideoFiles: 'Invalid video files',
  InvalidVideoURL: 'Invalid video URL',
  BlankTitle: 'Blank title',
  InvalidId: 'Invalid ID',
}
-->

```js
const VIDEO_VALIDATIONS = [
  {
    // Must provide either both a height + width, or neither
    isValid: video =>
      validateHeightWidthConsistency(video.videoFiles),
    message: ERROR_MESSAGES.InconsistentWidthHeight
  },
  {
    // Must have ONE OF either a file or a URL
    isValid: video => validateVideoFileAndUrl(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoFiles
  },
  {
    // Video URL must be a valid link
    isValid: video => validateVideoURL(video.videoFiles),
    message: ERROR_MESSAGES.InvalidVideoURL
  },
  {
    // Title cannot be blank
    isValid: video => !!video[INPUT_TYPES.Title],
    message: ERROR_MESSAGES.BlankTitle
  },
  {
    // ID must be alphanumeric
    isValid: video =>
      video[INPUT_TYPES.Id].match(ID_PATTERN) !== null,
    message: ERROR_MESSAGES.InvalidId
  }
];

const validateVideo = video => {
  return VIDEO_VALIDATIONS.map(({ isValid, message }) =>
    isValid(video) ? undefined : message
  ).filter(Boolean);
};

const printVideoErrors = video => {
  console.log(validateVideo(video).join('\n'));
};
```

We’ve separated validations, validation logic and formatting. Flies separately, cutlets separately, as we say in Russia. Each piece of code has a single responsibility and a single reason to change. Validations now are defined declaratively and read like a table, not mixed with conditions and string concatenation. We’ve also changed negative conditions (_is invalid?_) to positive (_is valid?_). All this improves readability and maintainability of the code: it’s easier to see all validations and add new ones, because you don’t need to know implementation details of running validations or formatting.

And now it’s clear that the original code had a bug: there were no space between error messages.

Also now we can swap the formatting function and render errors as an HTML list, for example:

<!-- const FileUpload = () => null -->

```jsx
function VideoUploader() {
  const [video, setVideo] = React.useState();
  const errors = validateVideo(video);
  return (
    <>
      <FileUpload value={video} onChange={setVideo} />
      {errors.length > 0 && (
        <>
          <Text variation="error">Nooooo, upload failed:</Text>
          <ul>
            {errors.map(error => (
              <Text key={error} as="li" variation="error">
                {error}
              </Text>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
```

We can also test each validation separately. Have you noticed that I’ve changed `false` to `null` in the last validation? That’s because `match()` returns `null` when there’s no match, not `false`. The original validation always returns `true`.

I would even inline `ERROR_MESSAGES` constants unless they are reused somewhere else. They don’t really make code easier to read but they make it harder to change, because you have to make changes in two places.

```js
const VIDEO_VALIDATIONS = [
  {
    // Must provide either both a height + width, or neither
    isValid: video =>
      validateHeightWidthConsistency(video.videoFiles),
    message:
      'You should provide either both a height and a width, or neither'
  }
];
```

Now all the code you need to touch to add, remove or change validations is contained in the `VIDEO_VALIDATIONS` array. Keep the code, that’s likely to be changed at the same time, in the same place.

### Building complex objects

Another common reason to reassign variables is to build a complex object:

<!--
const format = x => x
const SORT_DESCENDING = 'desc', DATE_FORMAT = 'YYYY-MM-DD'
const dateRangeFrom = new Date(), dateRangeTo = new Date(), sortField = 'id'
const sortDirection = SORT_DESCENDING, query = ''
-->

```js
let queryValues = {
  sortBy: sortField,
  orderDesc: sortDirection === SORT_DESCENDING,
  words: query
};
if (dateRangeFrom && dateRangeTo) {
  queryValues = {
    ...queryValues,
    from: format(dateRangeFrom.setHours(0, 0, 0, 0), DATE_FORMAT),
    to: format(dateRangeTo.setHours(23, 59, 59), DATE_FORMAT)
  };
}
```

Here we’re adding `from` and `to` properties only when they aren’t empty.

The code would be clearer if we teach our backend to ignore empty values and build the whole object at once:

<!--
const format = x => x
const SORT_DESCENDING = 'desc', DATE_FORMAT = 'YYYY-MM-DD'
const dateRangeFrom = new Date(), dateRangeTo = new Date(), sortField = 'id'
const sortDirection = SORT_DESCENDING, query = ''
-->

```js
const hasDateRange = dateRangeFrom && dateRangeTo;
const queryValues = {
  sortBy: sortField,
  orderDesc: sortDirection === SORT_DESCENDING,
  words: query,
  from:
    hasDateRange &&
    format(dateRangeFrom.setHours(0, 0, 0, 0), DATE_FORMAT),
  to:
    hasDateRange &&
    format(dateRangeTo.setHours(23, 59, 59), DATE_FORMAT)
};
```

Now the query object always have the same shape, but some properties can be `undefined`. The code feels more declarative and it’s easier to understand what it’s doing — building an object, and see the final shape of this object.

### Avoid Pascal style variables

Some people like to define all variables at the beginning of a function. I call this _Pascal style_, because in Pascal you have to declare all variables at the beginning of a program or a function:

```pascal
function max(num1, num2: integer): integer;

var
  result: integer;

begin
  if (num1 > num2) then
    result := num1
  else
    result := num2;
  max := result;
end;
```

Some people use this style in languages where they don’t have to do it:

<!--
const submitOrder = jest.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
const deliveryMethod = DELIVERY_METHODS.PIGEON, products = [], address = '', firstName = '', lastName = ''
-->

```js
let isFreeDelivery;

// 50 lines of code

if (
  [
    DELIVERY_METHODS.PIGEON,
    DELIVERY_METHODS.TRAIN_CONDUCTOR
  ].includes(deliveryMethod)
) {
  isFreeDelivery = 1;
} else {
  isFreeDelivery = 0;
}

// 30 lines of code

submitOrder({
  products,
  address,
  firstName,
  lastName,
  deliveryMethod,
  isFreeDelivery
});
```

Long variable lifespan makes you scroll a lot to understand the current value of a variable. Possible reassignments make it even worse. If there are 50 lines between a variable declaration and its usage, then it can be reassigned in any of these 50 lines.

We can make code more readable by moving variable declarations as close to their usage as possible and by avoiding reassignments:

<!--
const submitOrder = jest.fn()
const DELIVERY_METHODS = {PIGEON: 'PIGEON', TRAIN_CONDUCTOR: 'TRAIN_CONDUCTOR'}
const deliveryMethod = DELIVERY_METHODS.PIGEON, products = [], address = '', firstName = '', lastName = ''
-->

```js
const isFreeDelivery = [
  DELIVERY_METHODS.PIGEON,
  DELIVERY_METHODS.TRAIN_CONDUCTOR
].includes(deliveryMethod);
submitOrder({
  products,
  address,
  firstName,
  lastName,
  deliveryMethod,
  isFreeDelivery: isFreeDelivery ? 1 : 0
});
```

We’ve shortened `isFreeDelivery` variable lifespan from 100 lines to just 10. Now it’s also clear that its value is the one we assign at the first line.

Don’t mix it with `PascalCase` though, this naming convention is still in use.

### Avoid temporary variables for function return values

When variable is used to keep a function result, often you can get rid of that variable:

```js
function areEventsValid(events) {
  let isValid = true;
  events.forEach(event => {
    if (event.fromDate > event.toDate) {
      isValid = false;
    }
  });
  return isValid;
}
```

Here we’re checking that _every_ event is valid, which would be more clear with the `.every()` array method:

```js
function areEventsValid(events) {
  return events.every(event => event.fromDate <= event.toDate);
}
```

We’ve also removed a temporary variable, avoided reassignment and made a condition positive (_is valid?_), instead of a negative (_is invalid?_). Positive conditions are usually easier to understand.

For local variables you can either use a ternary operator:

```js
const handleChangeEstimationHours = event => {
  let estimationHours = event.target.value;
  if (estimationHours === '' || estimationHours < 0) {
    estimationHours = 0;
  }
  return { estimationHours };
};
```

Like this:

```js
const handleChangeEstimationHours = ({ target: { value } }) => {
  const estimationHours = value !== '' && value >= 0 ? value : 0;
  return { estimationHours };
};
```

Or you can extract code to a function:

<!--
const getAllRejectionReasons = () => ([])
const isAdminUser = true, REJECTION_REASONS = {HAS_SWEAR_WORDS: 'HAS_SWEAR_WORDS'}
-->

```js
let rejectionReasons = getAllRejectionReasons();
if (isAdminUser) {
  rejectionReasons = rejectionReasons.filter(
    reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
  );
}
```

Like this:

<!--
const getAllRejectionReasons = () => ([])
const isAdminUser = true, REJECTION_REASONS = {HAS_SWEAR_WORDS: 'HAS_SWEAR_WORDS'}
-->

```js
const getRejectionReasons = isAdminUser => {
  const rejectionReasons = getAllRejectionReasons();
  if (isAdminUser) {
    return rejectionReasons.filter(
      reason => reason.value !== REJECTION_REASONS.HAS_SWEAR_WORDS
    );
  }
  return rejectionReasons;
};

// --- 8< -- 8< ---

const rejectionReasons = getRejectionReasons(isAdminUser);
```

This is less important. You may argue that moving code to a new function just because of a reassignment isn’t a great idea, and you may be right, so use your own judgement here.

### Indeterminate loops

Sometimes having a reassignment is quite okay. Indeterminate loops, the ones where we don’t know the number of iterations in advance, are a good case for reassignments.

Consider this example:

```js
function getStartOfWeek(selectedDay) {
  let startOfWeekDay = selectedDay;
  while (startOfWeekDay.getDay() !== WEEK_DAY_MONDAY) {
    startOfWeekDay = addDays(startOfWeekDay, -1);
  }
  return startOfWeekDay;
}
```

Here we’re finding the start of the current week by moving one day back in a `while` loop and checking if it’s already Monday or not.

Even if it’s possible to avoid a reassignment here, it will likely make code less readable. Feel free to try and let me know how it goes though.

Reassignments aren’t pure evil and exterminating them all won’t make your code better. They are more like signs: if you see a reassignment, ask yourself if rewriting the code without it would make it more readable. There’s no right or wrong answer, but if you do use a reassignment, isolate it in a small function, where it’s clear what the current value of a variable is.

### Help your brain with conventions

In all examples above I’m replacing `let` with `const` in variable declarations. This immediately tells the reader that the variable won’t be reassigned. And you can be sure, it won’t: the compiler will yell at you if you try. Every time you see `let` in the code, you know that this code is likely more complex and needs more brain power to understand.

Another useful convention is using `UPPER_CASE` names for constants. This tells the reader that this is more of a configuration value, than a result of some computation. Lifespan of such constants are usually large: often the whole module or even the whole codebase, so when you read the code you usually don’t see the constant definition, but you still can be sure that the value never changes. And using such a constant in a function doesn’t make the function not pure.

There’s an important difference between a variable defined with the `const` keyword and a true constant in JavaScript. The first only tells the compiler and the reader that the variable won’t be _reassigned_. The second describe the nature of the value as something global and static that never changes at runtime.

Both conventions reduce cognitive load a little bit and make code easier to understand.

Unfortunately JavaScript has no true constants, and _mutation_ is still possible even when you define a variable with the `const` keyword. We’ll talk about mutations in the next chapter.

---

Start thinking about:

- Using different variables with meaningful names instead of reusing the same variable for different purposes.
- Separating data from an algorithm to make code more readable and maintainable.
- Building a shape of a complex object in a single place instead of building it piece by piece.
- Declaring variables as close as possible to a place where they are used to reduce the lifespan of a variable and make it easier to understand which value a variable has.
- Extracting a piece of code to a small function to avoid a temporary variable and use a function return value instead.

## Avoid mutation

Mutations happen when we change a JavaScript object or array without creating a new variable or reassigning an existing one:

```js
const puppy = {
  name: 'Dessi',
  age: 9
};
puppy.age = 10;
```

Here we’re _mutating_ the original `puppy` object by changing its `age` property.

Mutations are often problematic. Consider this function:

```js
function printSortedArray(array) {
  array.sort();
  for (const item of array) {
    console.log(item);
  }
}
```

The problem here is that the `.sort()` array method mutates the array we’re passing into our function, likely not what we’d expect when calling a function named `printSortedArray`.

Some of the problems with mutation:

- Mutation may lead to unexpected and hard-to-debug issues, where data becomes incorrect somewhere, and you have no idea where it happens.
- Mutation makes code harder to understand: at any time, an array or object may have a different value, so we need to be very careful when reading the code.
- Mutation of function arguments makes the behavior of a function surprising.

_Immutability_ or _immutable data structures_, meaning that to change a value we have to create a new array or object, would solve this problem. Unfortunately, JavaScript doesn’t support immutability natively, and all solutions are more crutches than actual solutions. But even just _avoiding_ mutations in our code makes it easier to understand.

Also, don’t forget that `const` in JavaScript only prevents reassignments — not mutations. We’ve discussed reassignments in the previous chapter, [Avoid reassigning variables](#avoid-reassigning-variables).

### Avoid mutating operations

One of the most common use cases for mutation is updating an object:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

```js
function parseExample(content, lang, modifiers) {
  const example = {
    content,
    lang
  };

  if (modifiers) {
    if (hasStringModifiers(modifiers)) {
      example.settings = modifiers
        .split(' ')
        .reduce((obj, modifier) => {
          obj[modifier] = true;
          return obj;
        }, {});
    } else {
      try {
        example.settings = JSON.parse(modifiers);
      } catch (err) {
        return {
          error: `Cannot parse modifiers`
        };
      }
    }
  }

  return example;
}
```

<!--
expect(parseExample('pizza', 'js')).toEqual({content: 'pizza', lang: 'js'})
expect(parseExample('pizza', 'js', '{"foo": true}')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true}})
expect(parseExample('pizza', 'js', 'foo bar')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true, bar: true}})
-->

Here we’re creating an object with three fields, one of which, `settings`, is optional. And we’re doing it by mutating the initial `example` object when it should have an optional field.

I prefer to see the whole object shape in a single place instead of having to read the whole function to find all possible object shape variations. Usually it doesn’t matter whether a property has an `undefined` value or doesn’t exist at all. I haven’t seen many cases where it mattered for a good reason.

We also have a special error case here that returns an entirely different object with a lone `error` property. But it’s really a special case because none of the properties of two objects overlap, and it doesn’t make sense to merge them.

I use ternaries for simple cases, and extract code to a function for more complex cases. Here we have a good case for the latter because of a nested condition and a `try`/`catch` block.

Let’s refactor it:

<!-- const hasStringModifiers = m => m.match(/^[ \w]+$/) -->

```js
function getSettings(modifiers) {
  if (!modifiers) {
    return undefined;
  }

  if (hasStringModifiers(modifiers)) {
    return modifiers.split(' ').reduce((obj, modifier) => {
      obj[modifier] = true;
      return obj;
    }, {});
  }

  return JSON.parse(modifiers);
}

function parseExample(content, lang, modifiers) {
  try {
    return {
      content,
      lang,
      settings: getSettings(modifiers)
    };
  } catch (err) {
    return {
      error: `Cannot parse modifiers`
    };
  }
}
```

<!--
expect(parseExample('pizza', 'js')).toEqual({content: 'pizza', lang: 'js'})
expect(parseExample('pizza', 'js', '{"foo": true}')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true}})
expect(parseExample('pizza', 'js', 'foo bar')).toEqual({content: 'pizza', lang: 'js', settings: {foo: true, bar: true}})
-->

Now it’s easier to understand what the code does, and the possible shapes of the return object are clear. We’ve also removed all mutations and reduced nesting a little.

### Beware of the mutating array methods

Not all methods in JavaScript return a new array or object. [Some methods mutate](https://doesitmutate.xyz/) the original value in place. For example, `push()` is one of the most commonly used.

Replacing imperative code, full of loops and conditions, with declarative code is one of my favorite refactorings. And one of the most common suggestions I give in code reviews.

Consider this code:

<!--
const ProductOptions = () => null
const product1 = {name: 'pizza', colors: [], sizes: []}
const product2 = {name: 'pizza', colors: [], sizes: []}
-->

```jsx
const generateOptionalRows = () => {
  const rows = [];

  if (product1.colors.length + product2.colors.length > 0) {
    rows.push({
      row: 'Colors',
      product1: <ProductOptions options={product1.colors} />,
      product2: <ProductOptions options={product2.colors} />
    });
  }

  if (product1.sizes.length + product2.sizes.length > 0) {
    rows.push({
      row: 'Sizes',
      product1: <ProductOptions options={product1.sizes} />,
      product2: <ProductOptions options={product2.sizes} />
    });
  }

  return rows;
};

const rows = [
  {
    row: 'Name',
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  ...generateOptionalRows()
];
```

Here we have two ways of defining table rows: a plain array with always visible rows, and a function that returns optional rows. The latter mutates the original array using the `.push()` method.

Array mutation itself isn’t the most significant issue of this code. However, code with mutations likely hides other issues — mutation is a good sign to look closer. Here the main problem is imperative array building and different ways for handling required and optional rows. Replacing imperative code with declarative and eliminating conditions often makes code more readable and maintainable.

Let’s merge all possible rows into a single declarative array:

<!--
const ProductOptions = () => null
const product1 = {name: 'pizza', colors: [], sizes: []}
const product2 = {name: 'pizza', colors: [], sizes: []}
-->

```jsx
const rows = [
  {
    row: 'Name',
    product1: <Text>{product1.name}</Text>,
    product2: <Text>{product2.name}</Text>
  },
  // More rows...
  {
    row: 'Colors',
    product1: <ProductOptions options={product1.colors} />,
    product2: <ProductOptions options={product2.colors} />,
    isVisible: (product1, product2) =>
      product1.colors.length + product2.colors.length > 0
  },
  {
    row: 'Sizes',
    product1: <ProductOptions options={product1.sizes} />,
    product2: <ProductOptions options={product2.sizes} />,
    isVisible: (product1, product2) =>
      product1.sizes.length + product2.sizes.length > 0
  }
];

const visibleRows = rows.filter(row => {
  if (typeof row.isVisible === 'function') {
    return row.isVisible(product1, product2);
  }
  return true;
});
```

Now we’re defining all rows in a single array. All rows are visible by default unless they have the `isVisible` function that returns `false`. We’ve improved code readability and maintainability:

- there’s only one way of defining rows;
- no need to check two places to see all available rows;
- no need to decide which method to use to add a new row;
- easier to make an existing row optional by adding `isVisible` function to it.

Here’s another example:

<!--
const options = {foo: 1}
const task = {parameters: {foo: {message: 'Foo'}, bar: {initial: 2}}}
-->

```js
const defaults = { ...options };
const prompts = [];
const parameters = Object.entries(task.parameters);

for (const [name, prompt] of parameters) {
  const hasInitial = typeof prompt.initial !== 'undefined';
  const hasDefault = typeof defaults[name] !== 'undefined';

  if (hasInitial && !hasDefault) {
    defaults[name] = prompt.initial;
  }

  prompts.push({ ...prompt, name, initial: defaults[name] });
}
```

<!--
expect(defaults).toEqual({foo: 1, bar: 2})
expect(prompts).toEqual([{name: 'foo', initial: 1, message: 'Foo'}, {name: 'bar', initial: 2}])
-->

At first sight, this code doesn’t look very bad: it converts an object into an array by pushing new items into the `prompts` array. But if we take a closer look, there’s another mutation inside a condition in the middle that mutates the `defaults` object. And this is a bigger problem because it’s easy to miss while reading the code.

The code is actually doing two loops: one to convert the `task.parameters` object to the `prompts` array, and another to update `defaults` with values from `task.parameters`. I’d split them to make it clear:

<!--
const options = {foo: 1}
const task = {parameters: {foo: {message: 'Foo'}, bar: {initial: 2}}}
-->

```js
const parameters = Object.entries(task.parameters);

const defaults = parameters.reduce(
  (acc, [name, prompt]) => ({
    ...acc,
    [name]:
      prompt.initial !== undefined ? prompt.initial : options[name]
  }),
  {}
);

const prompts = parameters.map(([name, prompt]) => ({
  ...prompt,
  name,
  initial: defaults[name]
}));
```

<!--
expect(defaults).toEqual({foo: 1, bar: 2})
expect(prompts).toEqual([{name: 'foo', initial: 1, message: 'Foo'}, {name: 'bar', initial: 2}])
-->

Other [mutating array methods](https://doesitmutate.xyz/) to watch out for are:

- [.copyWithin()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin)
- [.fill()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill)
- [.pop()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop)
- [.push()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push)
- [.reverse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse)
- [.shift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift)
- [.sort()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [.splice()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice)
- [.unshift()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift)

### Avoid mutation of function arguments

Objects or arrays that are passed to a function can be mutated inside that function, and this affects the original object:

```js
const mutate = object => {
  object.secret = 'Loves pizza';
};

const person = { name: 'Chuck Norris' };
mutate(person);
// -> { name: 'Chuck Norris', secret: 'Loves pizza' }
```

<!-- expect(person).toEqual({ name: 'Chuck Norris', secret: 'Loves pizza' }) -->

Here the `person` object is mutated inside the `mutate` function.

Function argument mutation can be intentional and accidental, and both are problematic:

- It’s harder to understand how a function works and how to use it because it doesn’t return a value but changes one of the incoming arguments.
- Accidental argument mutation is even worse because function consumers don’t expect it. And it can lead to hard-to-find bugs when a value that is mutated inside a function is later used somewhere else.

Consider this example:

```js
const addIfGreaterThanZero = (list, count, message) => {
  if (count > 0) {
    list.push({
      id: message,
      count
    });
  }
};

const getMessageProps = (
  adults,
  children,
  infants,
  youths,
  seniors
) => {
  const messageProps = [];
  addIfGreaterThanZero(messageProps, adults, 'ADULTS');
  addIfGreaterThanZero(messageProps, children, 'CHILDREN');
  addIfGreaterThanZero(messageProps, infants, 'INFANTS');
  addIfGreaterThanZero(messageProps, youths, 'YOUTHS');
  addIfGreaterThanZero(messageProps, seniors, 'SENIORS');
  return messageProps;
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

It converts a bunch of number variables to a `messageProps` array that groups people of different ages with their count:

```js
[
  {
    id: 'ADULTS',
    count: 7
  },
  {
    id: 'SENIORS',
    count: 2
  }
];
```

The problem with this code is that the `addIfGreaterThanZero` function mutates the array we’re passing to it. This is an example of an intentional mutation: it’s required for this function to work. However, it’s not the best API for what this function does.

We can change this function to return a new array instead:

```js
const addIfGreaterThanZero = (list, count, message) => {
  if (count > 0) {
    return [
      ...list,
      {
        id: message,
        count
      }
    ];
  }
  return list;
};
```

<!--
let array = [{count: 1, id: 'ADULTS'}]
array = addIfGreaterThanZero(array, 0, 'CHILDREN')
array = addIfGreaterThanZero(array, 2, 'YOUTHS')
expect(array).toEqual([{count: 1, id: 'ADULTS'}, {count: 2, id: 'YOUTHS'}])
-->

But I don’t think we need this function at all:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (
  adults,
  children,
  infants,
  youths,
  seniors
) => {
  return [adults, children, infants, youths, seniors]
    .map((count, index) => ({
      id: MESSAGE_IDS[index],
      count
    }))
    .filter(({ count }) => count > 0);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

Now it’s easier to understand what the code does. There’s no repetition, and the intent is clear: the `getMessageProps` function converts a list of values to an array of objects and removes “empty” items.

We can simplify it further:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (...counts) => {
  return counts
    .map((count, index) => ({
      id: MESSAGE_IDS[index],
      count
    }))
    .filter(({ count }) => count > 0);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

But this makes the function API less discoverable and can make editor autocomplete less useful. It also gives the wrong impression that the function accepts any number of arguments and that the count order is unimportant — the number and order of arguments were clear in the previous iteration.

We can also use `.reduce()` method instead of `.map()` / `.filter()` chaining:

```js
const MESSAGE_IDS = [
  'ADULTS',
  'CHILDREN',
  'INFANTS',
  'YOUTHS',
  'SENIORS'
];
const getMessageProps = (...counts) => {
  return counts.reduce((acc, count, index) => {
    if (count > 0) {
      acc.push({
        id: MESSAGE_IDS[index],
        count
      });
    }
    return acc;
  }, []);
};
```

<!--
expect(getMessageProps(1, 5, 0, 2, 0)).toEqual([
  {count: 1, id: 'ADULTS'}, {count: 5, id: 'CHILDREN'}, {count: 2, id: 'YOUTHS'}
])
-->

I’m not a huge fan of `.reduce()` because it often makes code harder to read and intent less clear. With `.map()` / `.filter()` chaining, it’s clear that we’re first converting an array to another array with the same number of items, and then removing array items we don’t need. With `.reduce()` it’s less obvious.

So I’d stop two steps ago with this refactoring.

Probably the only valid reason to mutate function arguments is performance optimization: when you work with a huge piece of data, and creating a new object or array would be too slow. But like with all performance optimizations: measure first to know whether you actually have a problem, and avoid premature optimization.

### Make mutations explicit if you have to use them

Sometimes we can’t avoid mutations, for example, because of an unfortunate language API that does mutation.

Array’s `.sort()` method is an infamous example of that:

```js
const counts = [6, 3, 2];
const puppies = counts.sort().map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

This example gives the impression that the `counts` array isn’t changing, and we’re just creating a new `puppies` array with the sorted array. But the `.sort()` method returns a sorted array _and_ mutates the original array at the same time. This kind of code is hazardous and can lead to hard-to-find bugs. Many developers don’t realize that the `.sort()` method is mutating because the code _seems_ to work fine.

It’s better to make the mutation explicit:

```js
const counts = [6, 3, 2];
const sortedCounts = [...counts].sort();
const puppies = sortedCounts.map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

Here we’re making a shallow copy of the `counts` array using the spread syntax and then sorting it, so the original array stays the same.

Another option is to wrap a mutating API into a new API that doesn’t mutate original values:

```js
function sort(array) {
  return [...counts].sort();
}

const counts = [6, 3, 2];
const puppies = sort(counts).map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

Or use a third-party library, like Lodash and its [`sortBy` function](https://lodash.com/docs#sortBy):

```js
const counts = [6, 3, 2];
const puppies = _.sortBy(counts).map(n => `${n} puppies`);
```

<!-- expect(puppies).toEqual(['2 puppies', '3 puppies', '6 puppies']) -->

### Updating objects

Modern JavaScript makes it easier to do immutable data updates thanks to [the spread syntax](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax). Before the spread syntax we had to write something like:

```js
const prev = { coffee: 1 };
const next = Object.assign({}, prev, { pizza: 42 });
// -> { coffee: 1, pizza: 42 }
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

Note the empty object as the first argument: it was necessary; otherwise, `Object.assign` would mutate the initial object: it considers the first argument as a target. It mutates the first argument and also returns it — this is a very unfortunate API.

Now we can write:

```js
const prev = { coffee: 1 };
const next = { ...prev, pizza: 42 };
```

<!-- expect(next).toEqual({coffee: 1, pizza: 42}) -->

This does the same thing but is less verbose, and no need to remember `Object.assign` quirks.

And before the [Object.assign](http://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign) in ECMAScript 2015, we didn’t even try to avoid mutations: it was too painful.

Redux has a great [page on immutable update patterns](https://redux.js.org/recipes/structuring-reducers/immutable-update-patterns): it describes patterns for updating arrays and objects without mutations, and it’s useful even if you don’t use Redux.

And still, spread syntax quickly gets incredibly verbose:

```js
function addDrink(meals, drink) {
  return {
    ...meals,
    lunch: {
      ...meals.lunch,
      drinks: [...meals.lunch.drinks, drink]
    }
  };
}
```

<!--
const next = addDrink({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea']}}, 'coffee');
expect(next).toEqual({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea', 'coffee']}})
-->

We need to spread each level of the object to change a nested value; otherwise, we’ll _overwrite_ the initial object with a new one:

```js
function addDrink(meals, drink) {
  return {
    ...meals,
    lunch: {
      drinks: [drink]
    }
  };
}
```

<!--
const next = addDrink({breakfast: 'none', lunch: {food: 'pasta', drinks: ['tea']}}, 'coffee');
expect(next).toEqual({breakfast: 'none', lunch: {drinks: ['coffee']}})
-->

Here we’re keeping only the first level of properties of the initial object: `lunch` and `drinks` will have only the new properties.

Also, spread and `Object.assign` only do shallow cloning: only the first level properties are copies, but all nested properties are references to the original object, meaning mutation of a nested property mutates the original object.

Keeping your objects as shallow as possible might be a good idea if you update them often.

While we’re waiting for JavaScipt [to get native immutability](https://github.com/tc39/proposal-record-tuple), there are two non-exclusive ways we can make our lives easier today:

- prevent mutations;
- simplify object updates.

**Preventing mutations** is good because it’s so easy to miss them during code reviews, and then spend many hours debugging weird issues.

One way to prevent mutations is to use a linter. ESLint has several plugins that try to do just that, and we’ll discuss them in the [Tooling](#tooling) chapter.

[eslint-plugin-better-mutation](https://github.com/sloops77/eslint-plugin-better-mutation) disallows any mutations, except for local variables in functions. This is a great idea because it prevents bugs caused by the mutation of shared objects but allows you to use mutations locally. Unfortunately, it breaks even in simple cases, such as a mutation occurring inside `.forEach()`.

Another way to prevent mutations is to mark all objects and arrays as read-only in TypeScript or Flow.

For example, using the `readonly` modifier in TypeScript:

```ts
interface Point {
  readonly x: number;
  readonly y: number;
}
```

Or using the `Readonly` utility type:

```ts
type Point = Readonly<{
  readonly x: number;
  readonly y: number;
}>;
```

And similar for arrays:

```ts
function sort(array: readonly any[]) {
  return [...counts].sort();
}
```

Note that both `readonly` modifier and `Readonly` utility type are shallow, so we need to add them to all nested objects too.

[eslint-plugin-functional](https://github.com/jonaskello/eslint-plugin-functional) has a rule to require read-only types everywhere, which may be more convenient than remembering to do that yourself. Unfortunately, it only supports `readonly` modifier but not `Readonly` utility type.

I think it’s a good idea, because there’s no runtime cost, though it makes type definitions more verbose.

I’d prefer [an option in TypeScript](https://github.com/microsoft/TypeScript/issues/32758) to make all types read-only by default with a way to opt out.

Similar to making objects read-only on the type level, we can make them read-only at runtime with `Object.freeze`. `Object.freeze` is also shallow, so we’d have to use a library like [deep-freeze](https://github.com/substack/deep-freeze) to ensure that nested objects are also frozen, and we might want to have freezing only in development since it can otherwise slow our app down.

I don’t think freezing is worth it on its own unless it is part of another library.

**Simplifying object updates** is another option that we can combine with mutation prevention.

The most popular way to simplify object updates is to use the [Immutable.js](https://immutable-js.github.io/immutable-js/) library:

```js
import { Map } from 'immutable';
const map1 = Map({ food: 'pizza', drink: 'coffee' });
const map2 = map1.set('drink', 'vodka');
// -> Map({ food: 'pizza', drink: 'vodka' })
```

I’m not a big fan of it because it has completely custom API that one has to learn. Also, converting arrays and objects from plain JavaScript to Immutable.js and back every time we need to work with any native JavaScript API or almost any third-party API, is annoying and feels like Immutable.js creates more problems than it solves.

Another option is [Immer](https://immerjs.github.io/immer/), which allows you to use any mutating operations on a _draft_ version of an object, without affecting the original object in any way. Immer intercepts each operation, and creates a new object:

```js
import produce from 'immer';
const map1 = { food: 'pizza', drink: 'coffee' };
const map2 = produce(map1, draftState => {
  draftState.drink = 'vodka';
});
// -> { food: 'pizza', drink: 'vodka' }
```

And Immer will freeze the resulting object in development.

### Even mutation is not so bad sometimes

In rare cases, imperative code with mutations isn’t so bad, and rewriting it in a declarative way without mutations doesn’t make it better.

Consider this example:

<!-- // TODO import adddays from date-fns? -->

```js
const getDateRange = (startDate, endDate) => {
  const dateArray = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    dateArray.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }
  return dateArray;
};
```

<!-- // TODO -->

Here we’re making an array of dates to fill a given date range.

I don’t have good ideas on how to rewrite this code without an imperative loop, reassignment, and mutation. And here we can live with this:

- all “bad” things are isolated in a small function;
- the function has a meaningful name;
- the code is clear enough;
- the function is pure: it doesn’t have any internal state and avoids mutating its arguments.

It’s better to have simple and clear code with mutations than complex and messy code without them. But if you do use mutations, it’s wise to isolate them to a small function with a meaningful name and clear API.

---

Start thinking about:

- Rewriting imperative code with mutations in a pure declarative way to improve its readability.
- Keeping the complete object shape in a single place; when you create a new object, make its shape as clear as possible.
- Deduplicating logic and separating “what” from “how.”
- Avoiding mutation of function arguments to prevent hard-to-find bugs.
- Using `.map()` / `.filter()` chaining instead of `.reduce()`.
- Making mutations explicit if you have to use them.
- Preventing mutations in your code using a linter or read-only types.

## Avoid comments

Comments are often used to explain poorly written code. People think that their code isn’t clear enough, so they add comments to explain it. And they are usually right: the code isn’t clear. But instead of adding comments, they should rewrite code to make it simpler and more readable.

There’s a popular technique of avoiding comment: when you want to explain a block of code, move this code to its own function instead. For example:

```js
// TODO
```

Can be rewritten as:

```js
// TODO
```

And while it make a lot of sense to extract complex calculations and conditions, used inside an already long line of code:

```php
// TODO: this example is from reafactoring course
if (($platform->toUpperCase()->indexOf("MAC") > -1) &&
     ($browser->toUpperCase()->indexOf("IE") > -1) &&
      $this->wasInitialized() && $this->resize > 0)
{
  // do something
}
// ->
$isMacOs = $platform->toUpperCase()->indexOf("MAC") > -1;
$isIE = $browser->toUpperCase()->indexOf("IE")  > -1;
$wasResized = $this->resize > 0;

if ($isMacOs && $isIE && $this->wasInitialized() && $wasResized) {
  // do something
}
// ->
// use functions instead of variables
```

I don’t think that splitting a linear algorithm, even a long one, into several functions and then calling them one after another, makes code more readable. Jumping between functions is harder than scrolling, and if you have to look into functions’ implementations to understand the code, then the abstraction wasn’t the right one.

Comments are useful to answer _why_ code is written in a certain way. If it’s fixing a bug, a ticket number will be useful. If there’s an obvious simpler alternative solution, a comment should explain why this solution doesn’t work in this case. Such comments will save you from accidental “refactoring” that makes code easier but removes some necessary functionality.

High level comments, explaining how code works, are useful too. If you’re implementing an algorithm, explained somewhere else, link to that place.

And any hack should be explained in a `HACK` or `FIXME` comment.

`TODO` comments are _okay_ too, if you add a ticket number when something will be done. Otherwise they are just dreams that will likely never come true.

But there are several kinds of comments that you should never write.

First are comments explaining _how_ code works:

```js
// This will make sure that your code runs
// in the strict mode in the browser
'use strict';
```

```js
// Fade timeout = 2 seconds
const FADE_TIMEOUT_MS = 2000;
```

If you think someone on your team may not know some of the language features you’re using, it’s better to help them learn these features than clutter the code with comments that will distract everyone else.

Next are _fake_ comments: they pretend to explain a some decision, but actually they don’t explain anything.

```js
// Design decision
// This is for biz requirements
// Non-standard background color needed for design
// Designer's choice
// Using non-standard color to match design
```

I see a lot of them in one-off design _changes?_. For example, a comment will say that there was a _design requirement_ to use a non-standard color but it won’t explain why it was required and why none of the standard color worked in that case.

```scss
.shareButton {
  color: #bada55; // Using non-standard color to match design
}
```

_Requirement_ is a very tricky and dangerous word. Often what’s treated as a requirement is just a lack of education and collaboration between developers, designers and project managers. If you don’t know why something is required, ask, and you may be surprised by the answer.

There may be no _requirement_ at all and you can use a standard color:

```scss
.shareButton {
  color: $text-color--link;
}
```

Or there may be a real reason to use a non-standard color, that you may put into a comment:

```scss
$color--facebook: #3b5998; // Facebook brand color
.shareButton {
  color: $color--facebook;
}
```

In any case it’s your responsibility to ask _why_ as many times as necessary.

<!-- textlint-disable -->

## Simplify, simplify, simplify

<!-- textlint-enable -->

- Avoid verbose and unnecessary code

<!-- test-skip -->

```js
data.discontinued ? data.discontinued === 1 : false;
```

<!-- test-skip -->

```js
if (
  reasonType === REASON_TYPES.REPLACEMENT &&
  conditionCheck === REASON_TYPES.RETURN
) {
  return true;
} else {
  return false;
}
```

<!-- test-skip -->

```js
if (itemInfo && itemInfo.isAutoReplaceable === true) {
  return true;
}

return false;
```

<!-- test-skip -->

```js
const result = '...';
return result;
```

<!-- test-skip -->

```js
const result = handleUpdateResponse(response.status);
this.setState(result);
```

<!-- test-skip -->

```js
function render() {
  let p = this.props;
  return <BaseComponent {...p}></BaseComponent>;
}
```

## Naming is hard

### Negative booleans

Consider this code:

```js
function validateInputs(values) {
  let noErrorsFound = true;
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
    noErrorsFound = false;
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
    noErrorsFound = false;
  }

  if (!noErrorsFound) {
    this.set('error_message', errorMessages);
  }

  return noErrorsFound;
}
```

I can say a lot about this code but let’s focus on this line first:

<!-- test-skip -->

```js
if (!noErrorsFound) {
```

This double negation, “if not no errors found…”, makes it harder to read than necessary. And in most cases you can avoid it.

Let’s make the `noErrorsFound` variable positive:

```js
function validateInputs(values) {
  let errorsFound = false;
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
    errorsFound = true;
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
    errorsFound = true;
  }

  if (errorsFound) {
    this.set('error_message', errorMessages);
  }

  return !errorsFound;
}
```

Positive names and positive conditions are usually easier to read then negative ones.

Hopefully by this time you’ve noticed that we don’t need this `errorsFound` variable at all: its value can alway be derived from `errorMessages`:

```js
function validateInputs(values) {
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
  }

  if (errorMessages.length > 0) {
    this.set('error_message', errorMessages);
    return false;
  }

  return true;
}
```

I’d also split this method into two to isolate side effects and make this code more testable, then remove the condition around `this.set('error_message', errorMessages)`, setting an empty object when there are no errors seems safe enough:

```js
function getErrorMessages(values) {
  const errorMessages = [];

  if (!values.firstName) {
    errorMessages.push('First name is required');
  }
  if (!values.lastName) {
    errorMessages.push('Last name is required');
  }

  return errorMessages;
}

function validateInputs(values) {
  const errorMessages = getErrorMessages(values);
  this.set('error_message', errorMessages);

  return errorMessages.length == 0;
}
```

TODO:

<!-- const $ = () => ({toggleClass: () => {}, attr: () => {}}), data = [], bookID = 'book' -->

```js
const noData = data.length === 0;
$(`#${bookID}_download`).toggleClass('hidden-node', noData);
$(`#${bookID}_retry`).attr('disabled', !noData);
```

### Prefixes, suffixes and abbreviations

TODO: data, list, util, etc. in names

TODO: Don’t go too far with naming conventions — Hungarian notation

TODO: Avoid abbreviations: accepted in smaller scope when the bigger scope has a full name: it’s okay to use `op` inside `filterPurchageOrders` function

TODO: The smaller the scope of a variable the better

TODO: The bigger the scope of a variable the longer should be the name (with a very small scope the name is a bit less important because the code is short and easy to understand)

TODO: Use destructuring to avoid inventing a new variable name: function parameters, result of function call

TODO: Shorten variable life by grouping code that’s using this variable together

TODO: Avoid slang or words that have simpler alternative, non-native English speakers will thank you. https://github.com/facebook/react/issues/3951

Types (like Flow or TypeScript) helps to see when names don’t represent the data correctly:

```ts
type Order = {
  id: number;
  title: string;
};

type State = {
  filteredOrder: Order[];
  selectedOrder: number[];
};
```

Looking at the types it’s clear that both names should be plural (they keep arrays) and the second one only contains order IDs but not whole order objects:

<!-- type Order = { id: number, title: string } -->

```ts
type State = {
  filteredOrders: Order[];
  selectedOrderIds: number[];
};
```

TODO: `util` and `utils` (what about them?): keep each function in it’s own file

> Aside: Make a util directory and keep different utilities in different files. A single util file will always grow until it is too big and yet too hard to split apart. Using a single util file is unhygienic.

### Beware of imprecise names

Imprecise or incorrect names are worse than magic numbers. With magic numbers you can make a correct guess but with incorrect names you have no chances to understand the code.

Consider this example:

```js
// Constant used to correct a Date object's time to reflect a UTC timezone
const TIMEZONE_CORRECTION = 60000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * TIMEZONE_CORRECTION
  );
```

Even a comment doesn’t help to understand what this code does.

What’s actually happening here is `getTime()` returns milliseconds and `getTimezoneOffset()` returns minutes, so we need to convert minutes to milliseconds by multiplying minutes by the number of milliseconds in one minute. 60000 is exactly this number.

Let’s correct the name:

```js
const MILLISECONDS_IN_MINUTE = 60000;
const getUTCDateTime = datetime =>
  new Date(
    datetime.getTime() -
      datetime.getTimezoneOffset() * MILLISECONDS_IN_MINUTE
  );
```

Now it’s much easer to understand the code.

## Constants

There are many good reasons to use constants and some good reasons not to use them.

### Making magic numbers less magic

By introducing a constant instead of a magic number we give it a meaningful name. Consider this example:

```js
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / 3600);
```

Most likely you’ll guess that 3600 is the number of seconds in an hour, but the actual number is less important than what this code does, and we can make this clear by moving the magic number to a const:

```js
const SECONDS_IN_AN_HOUR = 3600;
const getHoursSinceLastChange = timestamp =>
  Math.round(timestamp / SECONDS_IN_AN_HOUR);
```

I like to include a unit in a name if it’s not obvious otherwise:

```js
const FADE_TIMEOUT_MS = 2000;
```

Another perfect example where constants makes code more readable is days of week:

```
<Calendar disabledDaysOfWeek={[1, 6]} />
```

Is 6 Saturday, Sunday or Monday? Are we counting from 0 or 1? Does week start on Monday or Sunday?

Defining constants for these values makes it clear:

```
const WEEKDAY_MONDAY = 1;
const WEEKDAY_SATURDAY = 6;
// …
<Calendar disabledDaysOfWeek={[WEEKDAY_MONDAY, WEEKDAY_SATURDAY]} />
```

Code reuse is another good reason to introduce constants but you need to wait for the moment when the code is actually reused.

### Not all numbers are magic

Sometimes people replace absolutely all literal values with constants, ideally stored in a separate module:

```js
const ID_COLUMN_WIDTH = 40;
const TITLE_COLUMN_WIDTH = 120;
const TYPE_COLUMN_WIDTH = 60;
const DATE_ADDED_COLUMN_WIDTH = 50;
const CITY_COLUMN_WIDTH = 80;
const COUNTRY_COLUMN_WIDTH = 90;
const USER_COLUMN_WIDTH = 70;
const STATUS_COLUMN_WIDTH = 50;
const columns = [
  {
    header: 'ID',
    accessor: 'id',
    width: ID_COLUMN_WIDTH
  }
  // …
];
```

But not every value is magic, some values are just values. Here it’s clear that the value is the width of the ID column, and a constant doesn’t add any information that’s not in the code already, but makes the code harder to read: you need to go to the constant definition to see the actual value.

Often code reads perfectly even without constants:

<!-- const Modal = () => <></>; -->

```jsx
<Modal title="Out of cheese error" minWidth="50vw" />
```

Here it’s clear that the minimum width of a modal is 50vw. Adding a constant won’t make this code any clearer:

<!-- const Modal = () => <></>; -->

```jsx
const MODAL_MIN_WIDTH = '50vw';
// ...
<Modal title="Out of cheese error" minWidth={MODAL_MIN_WIDTH} />;
```

I’d avoid such constants unless the values are reused.

Sometimes such constants are even misleading:

```js
const ID_COLUMN_WIDTH = 40;
const columns = [
  {
    header: 'ID',
    accessor: 'id',
    minWidth: ID_COLUMN_WIDTH
  }
];
```

Here the name is not precise: instead of minimum width it only has width.

Often 0 and 1 aren’t magic and code with them is easier to understand than with constant that will inevitably have awkward names:

```js
const DAYS_TO_ADD_IN_TO_FIELD = 1;
const SECONDS_TO_REMOVE_IN_TO_FIELD = -1;
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), DAYS_TO_ADD_IN_TO_FIELD);
  return addSeconds(nextDay, SECONDS_TO_REMOVE_IN_TO_FIELD);
};
```

This function returns the last second of a day. And here 1 and -1 really mean “next” and “previous”. They are also an essential part of an algorithm, not configuration. It doesn’t make sense to change 1 to 2, because it will break the function. Constants make the code longer and don’t help with understanding it. Let’s remove them:

```js
const getEndOfDayFromDate = date => {
  const nextDay = addDays(startOfDay(date), 1);
  return addSeconds(nextDay, -1);
};
```

Now the code is short and clear, with enough information to understand it.

---

Start thinking about:

- Is a literal value, like a number or a string, is unclear and needs a name?
- Is value of a literal unclear and we can use a constant?
- Is knowing the value itself is less important to understanding the code than knowing the name?
- Is a value reused multiple times?

## Don’t surprise me

TODO: Principle of least surprise. Think what kind of comments your code reviewer might have. Improve code or add comments

Surprising behavior:

- Incorrect semantic: `.map()` with side effects
- Mutating function arguments
- Function that’s doing more than the name says (or not doing what the name says)

Surprising behavior:

<!-- const dogs = [], cats = [] -->

```js
function doMischief(props) {
  // 100 lines of code
  props.cats.push('labrador');
  // 100 lines of code
}

doMischief({ dogs, cats });
```

## Separate “what” and “how”

Declarative code describes the result and imperative explains how to achieve it.

TODO: Example

Declarative is often easier to read and there are many examples of refactoring imperative code to more declarative in this book.

I call this process _separating “what” and “how”_. The benefits are:

- improved readability and maintainability;
- we change “what” much more often than “how”;
- often “how” is generic and can be reused, or even imported from a third-party library.

For example, a form validation (see “Avoid conditions” for the code) could be split into:

- a list of validations for a particular form;
- a collection of validation functions (like `isEmail`);
- a function that validates form values using a list of validations.

TODO: The last two things are pretty generic.

## Don’t waste energy (= save energy for important things)

TODO: Merge with “The rest doesn’t matter”

- tabs vs spaces
- opinionated formatting (https://blog.sapegin.me/all/prettier/)
- implicit returns
- arrow functions

In all these examples I prefer the second variation. But I don’t waste time asking folks to change their code in code reviews, when they use the first variation or some other way of writing the same code.

In most cases there’s zero code readability improvement. The code is just different, none of the variations are better than the other. And even the consistency argument isn’t good enough, unless you can automate code replacement completely transparent for the developer. Otherwise the cost of maintaining the convention is too high.

## Cargo cult programming

[Cargo cult programming](https://en.wikipedia.org/wiki/Cargo_cult_programming) is when developers use some technique because they’ve seen it works somewhere else, or they’ve been told it’s the right way of doing things.

Some examples of cargo cult programming:

- A developer copies a decade-old answer from Stack Overflow with fallbacks for old browsers which they don’t need to support anymore.
- A team applies old “best practices” even if the initial problem they were solving is no longer relevant.
- A developer applies a team “standard” to a case that should be an exception, and inadvertently makes the code worse, not better.

Code isn’t black and white: nothing is always bad (except global variables) or always good (except automation). We’re not working at an assembly line, and we should understand why we write each line of code.

### Never write functions longer than…

If you google “how long should be my functions”, you’ll find a lot of answers: all kinds of random numbers, like [half-a-dozen](https://martinfowler.com/bliki/FunctionLength.html), 10, 25 or 60.

Some developers will brag that all their functions are only one or two lines long. Some developers will say that you must create a new function every time you want to write a comment or add an empty line.

I think it’s a wrong problem to solve and the size itself is rarely a problem. However, long functions often hide real issues, like too many responsibilities or deep nesting.

### Always comment your code

TODO

See the “Avoid comments” chapter for more details.

### Always use constants for magic numbers

Using constants instead of magic numbers is a great practice, but not all numbers are magic. Often developer make code less readable by following this principle without thinking and converting all literal values, number and strings, to constants.

See the “Constants” chapter for more details.

### Never repeat yourself

Don’t repeat yourself (DRY) principle is probably the most overrated idea in software development. See the “Let abstractions grow” section for more details.

<!-- textlint-disable -->

### Never say never

<!-- textlint-enable -->

Never listen when someone says you should never do that or always do this, without any exceptions. Answer to most software development questions is “it depends”, and such generalizations often do more harm than good.

A few more examples:

- _Never_ put state and markup in one component (_always_ use container / presenter pattern).

## Don’t be clever

Clever code is a kind of code you may see in job interview questions or language quizzes. When they expect you to know how a language feature, you maybe have never seen before, works. My answer to all these questions is “it won’t pass code review”.

### Dark patterns of JavaScript

Let’s look at some examples. Try to cover an answer and guess what these code snippets do. And count how many you’ve guessed right.

Example 1:

<!-- const percent = 5 -->

```js
const percentString = percent.toString().concat('%');
```

This code only adds the `%` sing to a number, and should be rewritten as:

<!-- const percent = 5 -->

```js
const percentString = `${percent}%`;
```

Example 2:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (~url.indexOf('id')) {}
```

The `~` is called the _bitwise NOT_ operator. It’s useful effect here is that it returns a falsy value only when the `.indexOf()` returns `-1`. This code should be rewritten as:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (url.indexOf('id') !== -1) {}
```

Or better:

<!-- const url = 'index.html?id=5' -->

<!-- prettier-ignore -->
```js
if (url.includes('id')) {}
```

Example 3:

<!-- prettier-ignore -->
```js
~~3.14
```

Another dark use of the bitwise NOT operator to discard a fractional portion of a number. Use `Math.floor()` instead:

<!-- prettier-ignore -->
```js
Math.floor(3.14)
```

Example 4:

<!-- const dogs = [], cats = [] -->

<!-- prettier-ignore -->
```js
if (dogs.length + cats.length > 0) {}
```

This one is easy when you spend some time with it, but better make this code obvious:

<!-- const dogs = [], cats = [] -->

<!-- prettier-ignore -->
```js
if (dogs.length > 0 && cats.length > 0) {}
```

Example 5:

```js
const header = 'filename="pizza.rar"';
const filename = header.split('filename=')[1].slice(1, -1);
```

This one took me a lot of time to understand. Imagine we have a portion of a URL, like `filename="pizza"`. First, we split the string by `=` and take the second part, `"pizza"`. Then we slice the first and the last characters to get `pizza`.

I’d probably use a regular expression here:

<!-- prettier-ignore -->
```js
const header = 'filename="pizza.rar"'
const filename = header.match(/filename="(.*?)"/)[1]
```

Or the `URLSearchParams` API if I had access to it:

<!-- prettier-ignore -->
```js
const header = 'filename="pizza.rar"'
const filename = new URLSearchParams(header)
  .get('filename')
  .replace(/^"|"$/g, '')
```

_These quotes are weird though. Normally you don’t need quotes around URL params, so talking to your backend developer could be a good idea._

Example 6:

<!-- const condition = true -->

```js
const obj = {
  ...(condition && { value: 42 })
};
```

Adding a property to an object when the `condition` is true, don’t do anything otherwise. The intention is more obvious when we explicitly define object to destructure, and don’t rely on destructuring of falsy values:

<!-- const condition = true -->

```js
const obj = {
  ...(condition ? { value: 42 } : {})
};
```

I usually prefer when object don’t change their shapes, so I’d move the condition inside the `value` field:

<!-- const condition = true -->

```js
const obj = {
  value: condition ? 42 : undefined
};
```

So, what’s your score? I think mine would be around 3/6.

### Gray areas

Some patterns are on the border of cleverness.

For examples, using `Boolean` to filter out falsy array items:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(Boolean)
// -> ["Not", "enough", "cheese."]
```

I think this pattern is acceptable, and, though you need to learn it once, it’s better than the alternative:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => !!item)
// -> ["Not", "enough", "cheese."]
```

But you should keep in mind that both variations filter out _falsy_ values, so if zeroes or empty strings are important to you, you’ll need to explicitly filter for `undefined` or `null`:

<!-- prettier-ignore -->
```js
['Not', null, 'enough', 0, 'cheese.'].filter(item => item != null)
// -> ["Not", "enough", 0, "cheese."]
```

<!-- textlint-disable -->

## Divide and conquer, or merge and relax

<!-- textlint-enable -->

TODO: https://kentcdodds.com/blog/moist-programming

TODO: It’s hard to come up with a good API. It’s hard to come up with a good generic API if you only consider a single use case.

TODO: Sometimes you have to roll back an abstraction. When you start adding conditions and options (?), ask yourself: is it still a variation of the same thing or a new thing that should be separated? Adding too many conditions and options to make your code flexible can make the API hard to use.

TODO: Hide complexity

TODO: To DRY or to DUMP (DUMP for tests)

There are several you may want to split code into several modules:

- size
- complexity
- responsibilities
- change frequency
- code reuse

### Let abstractions grow

We, developers, hate to do the same work twice. _Don’t repeat yourself_ (DRY) is our mantra. But when you have two or three similar pieces of code, it may be still too early to introduce an abstraction, no matter how tempting it is.

Leave with the pain of code duplication, maybe it’s not so bad in the end, and the code is actually not exactly the same. Some level of code duplication is healthy and allows you to iterate and evolve code faster.

It’s hard to manage shared code in large projects with many teams. New requirements for one team may not work for another team and break their code, or you end up with unmaintainable spaghetti monster with dozens of conditions.

Imagine your team is adding a comment form: a name, an email, a message and a submit button. Then another team needs a feedback form, so they find your component and try to reuse it. Then your team also wants an email field, but they don’t know that some other team uses the component, so they add a required email field, and break the feature for the other team users. Then the other teams needs a phone number field, but they know that your team is using the component without it, so they add an option to show a phone number field. A year later two teams hate each other for breaking their code, and a component is full of conditions and impossible to maintain. Both teams would save a lot of time and have healthier relationships by maintaining separate components.

[Duplication is cheaper](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) and healthier than the wrong abstraction.

I think the higher level of the code, the longer you should wait with abstracting it. Low level utility abstractions are much more obvious than business logic.

TODO: Don’t let people depend on your code

### Separate code that changes often

_Code reuse_ isn’t the only and not the most important reason to extract code into a separate module.

_Code length_ is often [used as a metric](https://softwareengineering.stackexchange.com/questions/27798/what-should-be-the-maximum-length-of-a-function) when you should split a module or a function into two, but size alone doesn’t make code hard to read or maintain.

In my experience the most useful reasons to split code are _change frequency_ and _change reason_.

Let’s start from _change frequency_. Business logic is changing much more often than utility code. It makes sense to keep code, that changes often, separately from the code that is mostly static.

The comment form from the previous section is an example of the former, a function that converts `camelCase` to `kebab-case` is an example of the latter. The comment form is likely to change and diverge with time when new business requirements arrive, the conversion function is unlikely to change at all and it’s safe to reuse in many places.

The opposite is also true: if you often have to change several modules or functions at the same time, it may be better to merge them into a single module or a function. [Ducks convention](https://github.com/erikras/ducks-modular-redux) for Redux is a great example of that.

_Change reason_ is also known as the [Single responsibility principle](https://en.wikipedia.org/wiki/Single_responsibility_principle): “every module, class, or function should have responsibility over a single part of the functionality provided by the software, and that responsibility should be entirely encapsulated by the class”.

Imagine, you’re making a nice looking table with editable fields. You think you’ll never need this table design again, so you decide to keep the whole table in a single module.

Next sprint you have a task to add another column to the table, so you copy the code of an existing table and change a few lines there. Next sprint you have a task to change a design of a table.

Now your module has at least two _reasons to change_, or _responsibilities_:

- new business requirements, like a new table column;
- design changes, like replacing borders with striped row backgrounds.

This makes the module harder to understand and harder to change: to do a change in any of the responsibilities you need to read and modify more code. This makes it harder and slower to iterate on both, business logic and design.

Extraction of a generic table as a separate module solves this problem. Now to add another column to a table, you only need to understand and modify one of the two modules. You don’t need to know anything about the generic table module, except its public API.

This also makes code easier to delete when the requirements change. (TODO: why?)

Even code reuse can be a valid reason to separate code here: if you use some design pattern on one page, you’ll likely need it on another page soon.

### Flexibility vs. rigidity

TODO: Balance between flexibility and consistency. It’s nice to have a global Button component but if it’s too flexible and you have 10 variations, it will be hard to choose the right one. If it’s too strict, developers will create their own buttons

<!-- test-skip -->

```js
// my_feature_util.js
const noop = () => {};
// ...
export const Utility = {
  noop
  // ...
};

// MyComponent.js
// ...
MyComponent.defaultProps = {
  onClick: Utility.noop()
};
```

Wrong abstraction, incorrect name:

<!-- test-skip -->

```js
function filterEmptyString(dep) {
  return Boolean(dep.trim());
}
generate(
  req ? req.split(',').filter(filterEmptyString) : [],
  dep,
  base,
  fn
);
```

## Don’t make me think

TODO: Pass an object instead of multiple positional arguments to a function (more than two)

TODO: Magic numbers -> consts

TODO: Consts should include units

> Long Parameter List More than three or four parameters for a method.

### Make differences in code obvious

When I see two lines of tricky code that look the same, I assume they are actually different but I don’t see the difference yet. Otherwise, a programmer would create a variable for repeated pieces instead of copypasting them.

For example, we have a code that generates test IDs for two different tools we use on our project, Enzyme and Codeception:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const props = {
  'data-enzyme-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null,
  'data-codeception-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type-Col-2')
-->

Now it’s really hard to see if there’s any difference in these two lines of code. Remember these pictures where you have to find 10 differences? That’s what such code does for the reader.

Generally I’m bit sceptical about extreme dont-repeat-yourselfing the code, but this is a good case for it:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const testId = columnName
  ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
  : null;
const props = {
  'data-enzyme-id': testId,
  'data-codeception-id': testId
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type-Col-2')
-->

Now there’s no doubt that the code for both test IDs is really the same.

Sometimes code that looks almost the same is slightly different:

<!-- const dispatch = () => {}, changeIsWordDocumentExportSuccessful = () => {} -->

```js
function handleSomething(documentId) {
  if (documentId) {
    dispatch(changeIsWordDocumentExportSuccessful(true));
    return;
  }
  dispatch(changeIsWordDocumentExportSuccessful(false));
}
```

The only difference here is the parameter we pass to our function with a very long name. We could move the condition inside the function call:

<!-- const dispatch = () => {}, changeIsWordDocumentExportSuccessful = () => {} -->

```js
function handleSomething(documentId) {
  dispatch(changeIsWordDocumentExportSuccessful(!!documentId));
}
```

Now we don’t have any similar code and the whole piece is shorter and easier to understand.

Let’s look at a more tricky example. Imagine we use different naming conventions for different testing tools:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const props = {
  'data-enzyme-id': columnName
    ? `${type}-${toTitleCase(columnName)}-${rowIndex}`
    : null,
  'data-codeception-id': columnName
    ? `${type}_${toTitleCase(columnName)}_${rowIndex}`
    : null
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

The difference between these two lines of code is hard to notice, and you can never be sure that the name separator is the only difference here.

Likely, if you have such a requirement on your project, there are many places with very similar code. One way to improve it is to create a function, that generates test IDs for each tool:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const joinEnzymeId = (...parts) => parts.join('-');
const joinCodeceptionId = (...parts) => parts.join('_');
const props = {
  'data-enzyme-id': columnName
    ? joinEnzymeId(type, toTitleCase(columnName), rowIndex)
    : null,
  'data-codeception-id': columnName
    ? joinCodeceptionId(type, toTitleCase(columnName), rowIndex)
    : null
};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

This is already much better but still not ideal: there may be difference in parameters we pass to our generator functions. Let’s fix this too:

<!-- const type = 'type', columnName = 'col', rowIndex = 2, toTitleCase = x => _.startCase(_.toLower(x)) -->

```js
const joinEnzymeId = (...parts) => parts.join('-');
const joinCodeceptionId = (...parts) => parts.join('_');
const getTestIdProps = (...parts) => ({
  'data-enzyme-id': joinEnzymeId(...parts),
  'data-codeception-id': joinCodeceptionId(...parts)
});
const props = columnName
  ? getTestIdProps(type, toTitleCase(columnName), rowIndex)
  : {};
```

<!--
expect(props).toHaveProperty('data-enzyme-id', 'type-Col-2')
expect(props).toHaveProperty('data-codeception-id', 'type_Col_2')
-->

This is an extreme case of using small functions and I generally try to avoid splitting code that far, but I think in this case it works well, assuming that there are already many places in the project where you can use the `getTestIdProps` function.

In all cases where you have a condition that makes code slightly different, ask yourself: is this condition really necessary? If the answer is “yes”, then ask yourself again. Often there’s no _real_ reason to have these conditions. Like why do we even need to add test IDs for different tools separately? If you dig deep enough you may be surprised to find out that nobody knows the answer, or that the initial reason is no longer relevant.

## Too many conventions

Conventions are great, because they make code more consistent and reduce cognitive load when you read code. But the more conventions you have, the harder it is to maintain them.

Ask yourself, where a particular convention really make code more readable or reduce number of bugs. If yes, automate it. If you can’t automate, ask yourself again: will cost of maintaining a convention lower than benefits of having it.

Code reviewers will have to remember all the conventions, and make sure developers follow them in their code. This will distract them from finding actually important issues in the code.

## Make impossible states impossible

In UI programming, or _especially_ in UI programming we often use boolean flags to represent the current state of the UI or its parts: is data loading? is submit button disabled? has action failed?

Often we end up with multiple booleans: one for each condition. Consider this typical data fetching handling in a React component:

```jsx
function Tweets() {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [tweets, setTweets] = useState([]);

  const handleLoadTweets = () => {
    setLoading(true);
    getTweets()
      .then(tweets => {
        setTweets(tweets);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setTweets([]);
        setLoading(false);
        setError(true);
      });
  };

  if (isLoading) {
    return 'Loading…';
  }

  if (isError) {
    return 'Something went wrong!';
  }

  if (tweets.length === 0) {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  return (
    <ul>
      {tweets.map(({ id, username, html }) => (
        <li key={id}>
          {html} by {username}
        </li>
      ))}
    </ul>
  );
}
```

We have two booleans here: _is loading_ and _has errors_. If we look closer how the code uses them, we’ll notice that only one boolean is `true` at any time in a component’s lifecycle. It’s hard to see now and it’s easy to make a mistake and correctly handle all possible state changes, so your component may end up in an _impossible state_, like `isLoading && isError`, and the only way to fix that would be reloading the page. This is exactly why switching off and on electronic devices often fixes weird issues.

We can replace several _exclusive_ boolean flags, meaning only one is `true` at a time, with a single enum variable:

```jsx
const STATUSES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

function Tweets() {
  const [status, setStatus] = useState(STATUSES.IDLE);
  const [tweets, setTweets] = useState([]);

  const handleLoadTweets = () => {
    setStatus(STATUSES.LOADING);
    getTweets()
      .then(tweets => {
        setTweets(tweets);
        setStatus(STATUSES.SUCCESS);
      })
      .catch(() => {
        setTweets([]);
        setStatus(STATUSES.ERROR);
      });
  };

  if (status === STATUSES.LOADING) {
    return 'Loading…';
  }

  if (status === STATUSES.ERROR) {
    return 'Something went wrong!';
  }

  if (status === STATUSES.IDLE) {
    return <button onClick={handleLoadTweets}>Load tweets</button>;
  }

  if (tweets.length === 0) {
    return 'No tweets found';
  }

  return (
    <ul>
      {tweets.map(({ id, username, html }) => (
        <li key={id}>
          {html} by {username}
        </li>
      ))}
    </ul>
  );
}
```

The code is now much easier to understand: we know that the component can be in a single state at any time. We’ve also fixed a bug in the initial implementation: the result with no tweets was treated as no result and the component was showing the “Load tweets” button again.

This is a very simple [finite-state machine](https://gedd.ski/post/state-machines-in-react/). State machines are useful to make logic of your code clear and prevent bugs.

Proper state machines have events that handle transitions between states, guards that define which transitions are allowed and side effects.

TODO

TODO: types

TODO: <Button primary secondary>

## (Boy) scout rule

The (boy) scout rule states that you should leave the campground cleaner than you found it. For example, if someone else has left garbage, you should take it with you.

Same in programming. For example, you’re done with your task, you’re running the linter before committing your changes, and you realize that there are some warnings but not in the lines you’ve written or even have changed. If it’s not a lot of work and won’t make the diff too big, fix them.

TODO: Postpone and plan big improvements

The opposite to the boy scout rule is [the broken windows theory](https://en.wikipedia.org/wiki/Broken_windows_theory). It states that an environment with visible signs of crime or disorder, like an unfixed broken window, encourages more crime and disorder. And that “fixing” these minor crimes creates an environment that prevents more serious crime.

Same in programming. Minor “crimes” here could be leaving lint warning unfixed, leaving debug code or commented out code, general unfinishedness or untidiness of code. This creates an environment when nobody cares, because one new lint warning won’t make code with 100 warnings significantly worse, but code with zero warning will.

## Greppable code

- don’t concatenate identifiers

## Size isn’t important

- Short functions are overrated
- Long functions and long files isn’t a problem
- In UI state or custom styles are great reasons to create new components

> Generally, any method longer than ten lines should make you start asking questions.

Often big functions and big modules have other problems, but just size is never an issue. There are many valid cases when you’d want to extract a piece of code into its own function, like code reuse state isolation, separation of data from an algorithm, separation of concerns, different levels of abstraction, reducing number of local variables, and so on.

Opposite is often true: if several functions or modules are often changed together, merge them into one function or module. For example, markup and styles of an HTML component are often changed together and keeping them in separate files is inconvenient. CSS in JS where both, styles and markup, are in the same file is a great solution for this problem. It clearly doesn’t make modules smaller.

TODO: Example of styled-components

TODO: Splitting tax: passing bunch of parameters and objects between functions.

TODO: Props drilling in React?

## Don’t try to predict the future

Requirements are constantly changing, the business is constantly trying to make more money. Sometimes by improving user experience and making the app better, sometimes by exploiting _human psychology?_ and making app worse. In both cases we need to change the code. People have invented agile software development to deal with that: it’s better to develop software in small iterations than to spend month on writing detailed specs and then implementing them.

But developers often try to think too far in the future: “_they_ will want to add pagination to product list, let’s add support now to save time later.” But then _they_ want infinite scrolling and you end up removing most of your pagination code.

It’s called Premature abstraction or premature generalisation (speculative generality?). It feels like you’re saving time for future self by making your code more generic, but that’s what will often prevent you from implementing real future requirements easily. You end up writing and maintaining code that will never be used or code that you’ll remove before it’s used even once.

Focus on finding the simplest solution for the current requirements. It will be easier to review and test now, and to adapt to new requirements in the future.

Write code that’s easy to delete. Isolate different features from each other, isolate UI from business logic. Make UI easy to change and move around.

TODO: YAGNI and KISS

## Refactoring is inevitable

- Don’t be attached to your code
- Don’t rewrite everything (unless you have good tests)
- Second system syndrome (?)
- Write code that is easy to delete
- Disposable software
- Required refactoring before doing a task and general refactoring unrelated to any particular task

Bigger refactoring projects may be hard to sell to your boss. Look for signs: too many bugs in some part of code, growing code spagettiness because of many changes in the same place. These are the places worth improving.

Try to avoid rewriting everything at once.

## Not invented here syndrome

- Know when to use third party code
- Lodash
- Micromodules

## Code style

I used to be very strict about [code style](https://blog.sapegin.me/all/prettier/). I thought my code style was better than others, but later I’ve realized that it was just different. And it wasn’t the most popular, so anyone else’s code looked wrong to me.

For example, after reading the [The Programmers’ Stone](https://www.datapacrat.com/Opinion/Reciprocality/r0/index.html) I put braces like this for a long time:

<!-- const food = 'pizza', alert = () => {} -->

<!-- prettier-ignore -->
```js
if (food === 'pizza')
{
  alert('Pizza ;-)');
}
else
{
  alert('Not pizza ;-(');
}
```

Or I had two spaces in front of inline comments to better separate them from code:

<!-- prettier-ignore -->
```js
const volume = 200;  // ml
```

So if any other developer touched my code, they would immediately make it inconsistent, because unlikely they would follow _my code style_ — so uncommon it was. And code review would be a nightmare if I wanted to enforce _my code style_.

### Not all code styles are good

I wasn’t entirely wrong though: not every code style makes code easy to read and maintain.

For example, this way of defining arrays make is harder to move or add new items:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie'
];
```

That’s because you’ll have to change two lines every time you want to do something at the end of an array. It also clutters the diff for the same reason:

```diff
const dogs = [
  'dachshund',
  'saluki',
-  'sheltie'
+  'sheltie',
+  'whippet'
];
```

[Trailing, or dangling, commas](https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8) solve both problems without making code any harder to write or read:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
];
```

Now we need to change only one line:

```diff
const dogs = [
  'dachshund',
  'saluki',
  'sheltie',
+  'whippet',
];
```

### Obsolete code styles

Sometimes developers follow a particular code style even if the initial reasoning behind it is no longer relevant.

Like using leading commas in arrays and objects when JavaScript didn’t support trailing commas:

<!-- prettier-ignore -->
```js
const dogs = [
  'dachshund'
, 'saluki'
, 'sheltie'
];
```

The goal of this style was the same as of trailing commas in the previous section — to make adding new items easier and diffs more readable, but there are no reasons to use this anymore: Internet Explorer 8 was the last browser that didn’t support trailing commas. And now we transpile code with tools like Babel anyway, and Babel can and does remove trailing commas.

Another example is [Yoda conditions](https://en.wikipedia.org/wiki/Yoda_conditions), a style where you put a literal on the left side of a condition:

<!-- const meaning = 0 -->

<!-- prettier-ignore -->
```js
if (42 === meaning) {
}
```

It’s too easy to type `=` instead of `==` in languages like C and make an assignment instead o a comparison:

<!-- let meaning = 0 -->

<!-- prettier-ignore -->
```js
// Compare meaning with 42
if (meaning == 42) {
}

// Assign 42 to meaning
if (meaning = 42) {
}
```

This is much less relevant in JavaScript where the strict equality (`===`, values and types must be equal) is the preferred style and on most projects a linter will complain if you try to use the loose equality (`==`, only values must be equal). It’s really hard to miss two equal signs when typing `===`. So normal order or conditions is fine and easier to read:

<!-- const meaning = 0 -->

```js
if (meaning === 42) {
}
```

### Nonsensical code styles

Some code styles don’t solve any particular problem, but have high maintenance cost.

Like aligning object values or right-hands of assignments horizontally to make them look “pretty”:

<!-- prettier-ignore -->
```js
var fs        = require('fs')
  , reamde   = require('reamde')
  , examples = reamde(fs.readFileSync('./README.md', 'utf-8'))
  ;
```

<!-- expect(examples).toEqual('./README.md') -->

That’s enormous amount of work and luckily code formatters will remove all the artisanal handcrafted spaces and make code look equally good without requiring any work from a developer:

```js
var fs = require('fs'),
  reamde = require('reamde'),
  examples = reamde(fs.readFileSync('./README.md', 'utf-8'));
```

<!-- expect(examples).toEqual('./README.md') -->

### The rest doesn’t matter

There are so many ways to write code. For example you could use function arguments like this:

```js
function ingredientToString(options) {
  return `${options.name} (${options.quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString(options) {
  const { name, quantity } = options;
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

Or like this:

```js
function ingredientToString({ name, quantity }) {
  return `${name} (${quantity})`;
}
```

<!-- expect(ingredientToString({name: 'Pizza', quantity: 6})).toBe('Pizza (6)') -->

I prefer the last one for the reasons I explain in the _Naming is hard_ chapter, but I wouldn’t ask another developer to change their code just because they use another option: they are all fine.

A few more examples below. Named or namespaced imports:

```js
import React, { Component } from 'react';
class Lunch extends Component {}
```

Or:

```js
import React from 'react';
class Lunch extends React.Component {}
```

Old-style functions or arrow functions, explicit return or implicit return:

```js
function getDropdownOptions(options) {
  return options.map(option => option.value);
}
```

Or:

```js
const getDropdownOptions = options =>
  options.map(option => option.value);
```

Or the same with default export:

```js
const Button = props => <button className="Button" {...props} />;
export default Button;
```

Or:

```js
export default function Button(props) {
  return <button className="Button" {...props} />;
}
```

I can probably write a whole book of such examples.

In all the examples above I prefer the last variation but I’d never ask someone to change their code during code review if they use another variation. Next time you review someone else’s code and want to ask them to change a piece of code, ask yourself: does it really make code more readable and maintainable or just makes it look more familiar to me. If it’s the latter, please don’t write that comment.

### How to choose the right code style

Choose [the most popular code style](https://blog.sapegin.me/all/javascript-code-styles/), unless a deviation significantly improves readability or maintainability of the code.

Automate as much as possible. [Prettier](https://prettier.io/) formats code with almost zero config, which saves enormous amount of time while you write code, read someone else’s code or discuss code style in your team.

The last point is especially important: developers could waste days arguing where to put spaces in the code, which doesn’t matter at all, but everyone has an opinion on it.

## Code is evil

The goal of programmer’s work isn’t writing code but solving your client’s problems, whether it’s your employer or yourself. Code is by-product, a necessary evil.

The less code we write, the better. Less code means easier testing, easier maintenance, faster app, less bytes to download… A perfect solution doesn’t include any new code or even removes some existing code. Perfect is the enemy of good and we’ll have to write some code — they wouldn’t have called us programmers otherwise — but we should try to write as little code as possible, and don’t consider writing code as a goal in itself.

## Tooling

Most of this book is about **conventions**. For example, don’t mutate your code, and the next programmer will have less troubles understanding it, and you’ll avoid some nasty bugs. This is a convention, meaning we’re agreeing to do something but there’s no way to enforce it. Developers are still free to mutate any value accidentally or due to evil intent.

Conventions are good because they are easy to implement: document your decision and make the team aware of it. Conventions are not good because they are just words, and there’s nothing to enforce the convention, except more works, like code review comments.

The are tools to enforce some of the conventions and help up keep the codebase healthy.

### Linters

TODO: intro

TODO: useful rules / ESLint

TODO: useufl ESLint plugins and their rules

TODO: linters can be infuriating / list of harmful rules

### Other tools

TODO: Prettier

TODO: lint-staged

## Resources

### Books

- [The Art of Readable Code](https://www.amazon.com/gp/product/0596802293/?tag=artesapesphot-20) by Dustin Boswell
- [Clean Code: A Handbook of Agile Software Craftsmanship](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882/?tag=artesapesphot-20) by Robert C. Martin
- [Code Complete: A Practical Handbook of Software Construction](https://www.amazon.com/Code-Complete-Practical-Handbook-Construction/dp/0735619670/?tag=artesapesphot-20) by Steve McConnell

### Articles

- [AHA programming](https://kentcdodds.com/blog/aha-programming) by Kent C. Dodds
- [Array reduce vs chaining vs for loop](https://kentcdodds.com/blog/array-reduce-vs-chaining-vs-for-loop) by Kent C. Dodds
- [Code Health: Reduce Nesting, Reduce Complexity](https://testing.googleblog.com/2017/06/code-health-reduce-nesting-reduce.html?m=1) by Elliott Karpilovsky
- [Code Health: To Comment or Not to Comment?](https://testing.googleblog.com/2017/07/code-health-to-comment-or-not-to-comment.html?m=1) by Dori Reuveni and Kevin Bourrillion
- [Everything is a Component](https://medium.com/@level_out/everything-is-a-component-cf9f469ad981) by Luke Hedger
- [Is High Quality Software Worth the Cost?](https://martinfowler.com/articles/is-quality-worth-cost.html) by Martin Fowler
- [John Carmack on Inlined Code](http://number-none.com/blow/blog/programming/2014/09/26/carmack-on-inlined-code.html)
- [Learning Code Readability](https://medium.com/@egonelbre/learning-code-readability-a80e311d3a20) by Egon Elbre
- [Making Wrong Code Look Wrong](https://www.joelonsoftware.com/2005/05/11/making-wrong-code-look-wrong/) by Joel Spolsky
- [On the changing notion of code readability](http://firstclassthoughts.co.uk/Articles/Readability/TheChangingNotionOfReadability.html) by Kasper B. Graversen
- [Psychology of Code Readability](https://medium.com/@egonelbre/psychology-of-code-readability-d23b1ff1258a) by Egon Elbre
- [Small Functions considered Harmful](https://medium.com/@copyconstruct/small-functions-considered-harmful-91035d316c29) by Cindy Sridharan
- [The “Bug-O” Notation](https://overreacted.io/the-bug-o-notation/) by Dan Abramov
- [The Law of Leaky Abstractions](https://www.joelonsoftware.com/2002/11/11/the-law-of-leaky-abstractions/) by Joel Spolsky
- [The wrong abstraction](https://www.sandimetz.com/blog/2016/1/20/the-wrong-abstraction) by Sandi Metz
- [Too DRY — The Grep Test](http://jamie-wong.com/2013/07/12/grep-test/) by Jamie Wong
- [Why the Boy Scout Rule Is Insufficient](https://www.codewithjason.com/boy-scout-rule-insufficient/) by Jason Swett
- [Write code that is easy to delete, not easy to extend](https://programmingisterrible.com/post/139222674273/write-code-that-is-easy-to-delete-not-easy-to)
- [Writing system software: code comments](http://antirez.com/news/124)

### Talks

- [Building resilient frontend architecture](https://www.youtube.com/watch?v=brMZLmZ1HR0) by Monica Lent, React Finland 2019
- [Beyond PEP 8: Best practices for beautiful intelligible code](https://www.youtube.com/watch?v=wf-BqAjZb8M) by Raymond Hettinger, PyCon 2015

## Conclusion

All topics, covered in this book, aren’t hard rules but ideas for possible improvements. When I say _avoid conditions, mutation, reassignments or something else_, I don’t mean _never use them_, more like _are you sure there’s no better solution?_

There are valid use cases for all programming techniques, maybe even `goto`, who knows. The only certain thing is that the answer to any programming related question is _it depends_. No matter how many upvotes on Stack Overflow has a solution, it may be not the best choice for your case.

So the goal of this book isn’t to teach you how to write good code, but to teach you to notice certain patterns, or code smells, that can _often_ (not _always_) be improved.

Treating such patterns or code smells as hard rules is the road to hell.

TODO: checklist
