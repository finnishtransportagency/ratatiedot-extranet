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

## Creating Alfresco based views

Views containing file read and upload are likely based on Alfresco folder structure, verify to be sure.
For example piirustusarkisto corresponds to piirustusarkisto folder in Alfresco.

To create an Alfresco based view do the following.

- Create react component for the view
- Setup routing routes.tsx, Routes.ts and correct categorydata type in types.d.ts
- Include category in FinnishCategories.json

For dev:

- Create a category folder in an Alfresco dev environment
- Open developer console and create a new file or folder inside the category
- Copy alfresco id from http response workspace string
- Connect to dev database and create CategoryDataBase entry for the new category. NOTE creating a new rights group below. Copy the entry id
- Create an entry in categories.ts devCategories with dev database id and alfresco id

For prod:

- As above but do the operations on production Alfresco and database
- Create entry in prodCategories

### New rights group:

If the view requires a new access rights group, contact primary customer contact person.

- Give them the name for the rights group, for example ratatieto_kirjoitus_examplefolder
- They will make a request for creating a new rights group, this can take some time
- When the group is created add the rights group to the folder in Alfresco document view - Manage Rights

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://react.dev/).
