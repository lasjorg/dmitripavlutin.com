---
title: "Front-end Architecture: Stable and Volatile Dependencies"
description: "Designing correctly the dependencies is important for creating flexible Front-end applications. The first step is to identify and separate the stable and volatile dependencies."
published: "2020-08-25T12:00Z"
modified: "2020-08-25T12:00Z"
thumbnail: "./images/cover-7.png"
slug: frontend-architecture-stable-and-volatile-dependencies
tags: ['architecture', 'clean code', 'dependency']
recommended: ['7-architectural-attributes-of-a-reliable-react-component', 'the-art-of-writing-small-and-plain-functions']
type: post
commentsThreadId: frontend-architecture-stable-and-volatile-dependencies
---

Many components (of libraries like React, Vue, Angular) use functionality of utility libraries.  

Let's consider a React component that displays the number of words in the provided text:

```tsx{1,4}
import words from 'lodash.words';

function CountWords({ text }: { text: string }): JSX.Element {
  const count = words(text).length;
  return (
    <div className="words-count">{count}</div>
  );
}
```

The component `CountWords` uses the library `lodash.words` to count the number of words in the string `text`. 

`CountWords` component has a dependency on `lodash.words` library.  

The good part about components using depenencies is the code reuse: you simply import the necessary library and use it.  

However, your component might need diverse dependency implementations for various environments (client-side, server-side, testing environment). In such a case importing directly a concrete dependency is a bad practice.  

Designing correctly the dependencies is an important skill to architect Front-end applications. The first step to create a good design is to identify the *stable* and *volatile* dependencies, and treat them accordingly.  

```toc
```

## 1. Stable dependencies

Let's recall the example component `CountWords` from the introduction:  

```tsx{1}
import words from 'lodash.words';

function CountWords({ text }: { text: string }): JSX.Element {
  const count = words(text).length;
  return (
    <div className="words-count">{count}</div>
  );
}
```

Clearly `lodash.words` is a dependency of `CountWords` component.  

The component `CountWords` is going to use the same library `lodash.words` no matter the environment: be it on client-side, be it running on the server-side (if you implement Server-Side Rendering), or even when running unit tests of `Count words`.    

At the same time, `lodash.words` is a simple utility function: `const arrayOfWords = words(string)`. The signature of the function won't change much in the future.  

Because the dependent component always uses one dependency implementation, and the dependency won't change in the future &mdash; such dependency is considered *stable*.  

![Stable dependency](./images/diagram-stable-dependency-2.svg)

Examples of stable dependencies are the utility libraries like `lodash`, `ramda`.  

Moreover, the JavaScript language itself provides:

* Utility functions, like `Object.keys()`, `Array.from()`
* Methods on primitives and objects, like `string.slice()`, `array.includes()`, `object.toString()`

All the built-in functions that the language provides are also considered stable dependencies. You can use them safely and depend directly upon them.  

However, aside from stable dependencies, there are dependencies that may change under certain circumstances. Such *volatile* dependencies have to be separated from stable ones, and designed in a different manner to *avoid your components depend on volatile dependencies directly*.  

Let's see what volatile dependencies are in the next section.  

## 2. Volatile dependencies

Consider a Front-end application that supports also Server-Side Rendering. Your task is to implement user login functionality. 

When the user first loads the app a login form is displayed. If the user introduces the correct username and password (`"user"` and `"12345"`) in the login form and hits submit, then you create a cookie `loggedIn` with value `1`.  

As long as the user is logged in (the cookie `loggedIn` is set and has value `1`) display a message `'You are logged in'`. Otherwise, just display the login form.  

Having the app requirements setup, let's discuss potential ways of implementation.  

To determine whether `loggedIn` cookie is set-up, you have to consider the environment where the application runs. On client side you can the access the cookie from `document.cookie` property, while on server side you'd need to read the HTTP request header `cookie`.  

The cookie management is a *volatile dependency*, because the component choose the concrete dependency implementation by environment: client-side or server-side.  

### 2.1 A bad design example

The important thing about volatile dependencies is that your component should not directly depend upon them. Let's deliberately make this mistake:  

```tsx{1-2}
import cookieClient from 'libs/cookie-client';
import cookieServer from 'libs/cookie-server';

import LoginForm from 'Components/LoginForm';

export function Page(): JSX.Element {
  const cookieManagement = typeof window === 'undefined' 
    ? cookieServer : cookieClient;

  if (cookieManagement.get('loggedIn') === '1') {
    return <div>You are logged in</div>;
  } else {
    return <LoginForm />
  }
}
```

`Page` components depends directly on both `cookieClient` and `cookieServer` libraries. Then it selects the necessary implementation by checking whether the `window` global variable is setup to determine the client or server side.   

Let's distinguish why implementing the cookie management volatile dependency such way is a problem:

* *Too much dependencies.* The component `Page` depends directly on 2 libraries: `cookieClient` and `cookieServer`
* *Boilerplate code.* Every time you need the cookie management library, you have invoke the expression `typeof window === 'undefined'` to determine whether the app runs on client or server side, and choose the according cookie management implementation
* *Unnecessary code.* The client-side bundle is going to include the `cookieServer` library which isn't used on client side
* *Difficult testing.* The unit tests of `Page` component would require lots of mockups like setting `window` variable and mockup `document.cookie`

Making a better design to handle volatile dependencies requires a bit more work, but the outcome and improved design worth it.  

### 2.2 A better design example

First, let's define an interface `Cookie` that describes what methods a cookie library should implement:

```tsx
// Cookie.tsx

export interface Cookie {
  get(name: string): string | null;
  set(name: string, value: string): void;
}
```

Now let's define the React context that's going to hold a specific implementation of the cookie management library:

```tsx
// cookieContext.tsx

import { createContext } from 'react';
import { Cookie } from './Cookie';

export const cookieContext = createContext<Cookie>(null as Cookie);
```

`cookieContext` now injects the dependency into the `Page` component:

```tsx{3,8}
import { useContext } from 'react';

import { Cookie } from './Cookie';
import { cookieContext } from './cookieContext';
import { LoginForm } from 'Components/LoginForm';

export function Page(): JSX.Element {
  const cookie: Cookie = useContext(cookieContext);

  if (cookie.get('loggedIn') === '1') {
    return <div>You are logged in</div>;
  } else {
    return <LoginForm />
  }
}
```

The `Page` component now doesn't depend directly on neither `cookieClient`, nor `cookieServer` libraries. The only thing that `Page` component knows is about the `Cookie` interface, and nothing more.  

`Page` component doesn't care about what concrete implementation it gets: it's important the implementation to conform to `Cookie` interface.  

The concrete implementation of cookie management library is injected in the bootstrap scripts on both client and server sides.  

```tsx
// index.client.tsx
```

```tsx
// index.server.tsx
```

The benefits of correctly designing the injection of volatile dependencies gives:

* The component doesn't depend on the many possible implementations or changes of dependencies
* The component depends only upon on abstract interface that describes the dependency
* Because the component knows only about the interface, you can easily test such a component.  

## 3. Summary

The components of your Front-end application can use a multitude of 3-rd party libraries.  

Some of these libraries, like `lodash` or event the built-in JavaScript's utilities are *stable* dependencies, and your components
are free to depend directly on them.  

However, sometimes the component requires dependencies that may change either during runtime, either depenending on the environment, either other reason to change. These dependencies fall in the category of *volatile*.  

A good design makes the components not depend directly upon volatile dependency, but rather depend on a stable interface (by using the Dependency Inversion Principle) that describes the dependency, and then allows a dependency injection mechanism (like React context) to supply the concrete dependency implementation.  