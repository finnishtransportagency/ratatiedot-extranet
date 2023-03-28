# RATATIETO Frontend

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Running the app

In the root directory, you can run:

### `npm run dev-client`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Tests

> ❕ We are in process of building automated testing/CI-pipeline. For now all tests needs to be run manually.

Running e2e/component tests with Cypress.

1. Start local server

```
npm run dev
```

2. Open Cypress GUI

```
npm run cy:open
```

Cypress GUI app should open. Select tests you want to run.

Optionally you can open [cypress CLI](https://docs.cypress.io/guides/guides/command-line#How-to-run-commands) and run tests in commandline.

Cypress has really good guides explaining how to use the framework.
🔗 [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

3. Run tests in CLI

Recorded video is exported to videos folder.

```
npm run cy:run
```

### `npm test:client`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## Building

### `npm run build:frontend`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Accessibility

Using `eslint-plugin-jsx-a11y` library to catch accessibility issues early on.

It is highly recommended to install and run accessibility tests using axe (https://www.deque.com/axe/) browser extension.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://react.dev/).
