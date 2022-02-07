# async-service-helper


Maintain state of a class that needs to asynchronously start and stop.

I've often found myself re-implementing logic for services that asynchronously start and stop and I need to manage state and wait for them to start before calling other methods, and I always make mistakes with race conditions. This helper class adds some basic state management for starting and stopping asynchronously that follows these rules:

*   You can call start() and stop() multiple times, but the service will end in
    the state of the last call (e.g. if the last call was to `stop()` then it
    will end up stopped)
*   Calling `start()` when the service is "stopped" calls the `_start()` method
    and resolves when it completes.
*   Calling `start()` when the service is "starting" (e.g. `start()` has been
    called but has not completed) will not call `_start()` again, but will
    resolve once the service has started
*   Calling `start()` when the service is "started" will resolve immediately
    and do nothing.
*   If `_start()` or `_stop()` throw, then the service is left in an
    unrecoverable "error" state.
*   Calling `start()` or `stop()` when the service is in "error" state will
    throw with the error from the error state

To wait for the service to be in the "started" state from other methods, use
`await this.started()`. Note that if the services is "stopping" or "stopped"
then this will await (e.g. queue) until next start.

Logic for calling `stop()` and `stopped()` follows the inverse of `start()` and `started()`.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

```
npm install async-service-helper
```

## Usage

```js
const AsyncService = require('async-service-helper')

class MyService extends AsyncService {
  async _start() {
    await new Promise(res => setTimeout(res, 100))
  }
  async _stop() {
    await new Promise(res => setTimeout(res, 100))
  }
  async doAfterStart() {
    await this.started()
    // Guaranteed that _start() has resolved and _stop() has not been called
  }
}

const service = new MyService()
service.start() // no need to await, because we have a guard in doAfterStart()
doAfterStart().then(() => {})
```

## API

### \_start()

Override this method in your implementing class. Must return a Promise.

### \_stop()

Override this method in your implementing class. Must return a Promise.

### start()

Start service. If the service is starting or started, will resolve when the
service is started, and will not call `_start()` more than once. If the
service is in the process of stopping, will wait until it stops before
starting and will not call `_stop()` more than once. Any parameters are passed through to `_start()`.

Returns **[Promise][35]\<void>** Resolves when service is started

### stop()

Stop the service.

Returns **[Promise][35]\<void>** Resolves when service is stopped

### started()

Will resolve when the service is in started state. E.g. to ensure an async
method only runs when the service is in "started" state, use:

```js
await this.started()
```

Will reject if the service is in "error" state.

Note: If the service is in "stopping" or "stopped" state this will queue
until the next time the service starts. If this is not desirable behaviour,
check `this.#state.value` first

Returns **[Promise][35]\<void>**

### stopped()

Will resolve when the service is in stopped state. Less useful than
`started()` E.g. to ensure an async method only runs when the service is in
"stopped" state, use:

```js
await this.stopped()
```

Will reject if the service is in "error" state.

Note: If the service is in "starting" or "started" state this will queue
until the next time the service stops. If this is not desirable behaviour,
check `this.#state.value` first

Returns **[Promise][35]\<void>**

### addStateListener(listener)

Attach a listener function to changes of state. `listener` will be calls with the current service state (see below)

### removeStateListener(listener)

Remove a listener to changes of state.

## Maintainers

[@gmaclennan](https://github.com/gmaclennan)

## Contributing

PRs accepted.

Small note: If editing the README, please conform to the [standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## License

MIT © 2022 Gregor MacLennan
