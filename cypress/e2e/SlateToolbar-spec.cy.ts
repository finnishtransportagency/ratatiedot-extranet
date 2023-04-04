import { Colors } from '../../packages/frontend/src/constants/Colors';

import { PresetViewports } from './constants';

describe('Slate Toobar', () => {
  PresetViewports.forEach((viewport) => {
    describe(`on ${viewport}`, () => {
      describe('User with read right', () => {
        beforeEach(() => {
          cy.intercept('GET', '**/api/database/user-right?category=hallintaraportit', {
            fixture: 'user-read-right.json',
          });
        });

        it('Home page: view mode', function () {
          cy.viewport(viewport);
          cy.visit('/');
          cy.get('button[aria-label="open edit"]').should('not.exist');
        });

        it('Hallintaraportit page: view mode', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('button[aria-label="open edit"]').should('not.exist');
        });
      });

      describe('User with write right', () => {
        beforeEach(() => {
          cy.intercept('GET', '**/api/database/user-right?category=hallintaraportit', {
            fixture: 'user-write-right.json',
          });
        });

        it('Home page: view mode', function () {
          cy.viewport(viewport);
          cy.visit('/');
          cy.get('[aria-label="open edit"]').should('not.exist');
        });

        it('Hallintaraportit page: write mode', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').should('exist');
        });

        it('Hallintaraportit page: click on edit mode and toolbar appears', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="toolbar"]').should('exist');
          cy.get('[aria-label="paragraph-two"]').should('exist');
          cy.get('[aria-label="paragraph-one"]').should('exist');
          cy.get('[aria-label="heading-two"]').should('exist');
          cy.get('[aria-label="bold"]').should('exist');
          cy.get('[aria-label="italic"]').should('exist');
          cy.get('[aria-label="underlined"]').should('exist');
          cy.get('[aria-label="numbered-list"]').should('exist');
          cy.get('[aria-label="bulleted-list"]').should('exist');
          cy.get('[aria-label="insert-link"]').should('exist');
          cy.get('[aria-label="color"]').should('exist');
          cy.get('[aria-label="info"]').should('exist');
          cy.get('[aria-label="warning"]').should('exist');
          cy.get('[aria-label="error"]').should('exist');
          cy.get('[aria-label="check"]').should('exist');
          cy.get('[aria-label="delete"]').should('exist');
          cy.get('[aria-label="close"]').should('exist');
        });

        it('Hallintaraportit page: editor doesnt show up without any notification selection', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[data-testid="slate-editor"] [contenteditable=false]').should('exist');
        });

        it('Hallintaraportit page: open info notification and type', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="info"]').click();
          const typedText = 'Info texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]').type(typedText).contains(typedText);
        });

        it('Hallintaraportit page: open warning notification and edit text format', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="warning"]').click();
          const typedText = 'Warning texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)

            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="bold"]').click();
          cy.get('[aria-label="italic"]').click();
          cy.get('[aria-label="heading-one"]').click();
        });

        it('Hallintaraportit page: open error notification type and color texts', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="error"]').click();
          const typedText = 'Error texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)
            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="color"]').click();
          cy.get('[aria-label="color-picker"]').should('be.visible');
          cy.get(`[aria-label="${Colors.darkgreen}"]`).click();
          cy.get('[aria-label="color"]').click();
          cy.get('[aria-label="color-picker"]').should('not.exist');
        });

        it('Hallintaraportit page: remove notification', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="info"]').click();
          const typedText = 'Info teksti';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)
            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="delete"]').click();
        });

        it('Hallintaraportit page: exit editor', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="open edit"]').click({ multiple: true, force: true });
          cy.get('[aria-label="close"]').click();
          cy.get('[aria-label="toolbar"]').should('not.exist');
        });
      });
    });
  });
});
