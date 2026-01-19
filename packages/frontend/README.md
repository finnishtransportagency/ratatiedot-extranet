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

### Running e2e/component tests with Cypress

1. Start local server

   ```shell
   npm run dev
   ```

2. Open Cypress GUI

   ```shell
   npm run cy:open
   ```

   Cypress GUI app should open. Select tests you want to run.

   Optionally you can open [cypress CLI](https://docs.cypress.io/guides/guides/command-line#How-to-run-commands) and run tests in commandline.

   Cypress has really good guides explaining how to use the framework.
   🔗 [Cypress Guides](https://docs.cypress.io/guides/overview/why-cypress)

3. Run tests in CLI

   Recorded video is exported to videos folder.

   ```shell
   npm run cy:run
   ```

### `npm run test:client`

Launches the test runner in the interactive watch mode.\
See the documentation about [running tests](https://vitest.dev/guide/cli) for more information.

## Building

### `npm run build:frontend`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Accessibility

Using `eslint-plugin-jsx-a11y` library to catch accessibility issues early on.

It is highly recommended to install and run accessibility tests using axe (<https://www.deque.com/axe/>) browser extension.

## Translation

i18next is used for translations. See their docs for more instructions at <https://www.i18next.com/>

For API error translation, see - [server README](../server/README.md#translation)

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://react.dev/).
