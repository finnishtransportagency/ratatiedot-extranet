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
          cy.get('button[aria-label="Avaa muokkausnäkymä"]').should('not.exist');
        });

        it('Hallintaraportit page: view mode', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('button[aria-label="Avaa muokkausnäkymä"]').should('not.exist');
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
          cy.get('[aria-label="Avaa muokkausnäkymä"]').should('not.exist');
        });

        it('Hallintaraportit page: write mode', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').should('exist');
        });

        it('Hallintaraportit page: click on edit mode and toolbar appears', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="työkalupalkki"]').should('exist');
          cy.get('[aria-label="kappale normaalilla tekstikoolla"]').should('exist');
          cy.get('[aria-label="kappale isommalla tekstikoolla"]').should('exist');
          cy.get('[aria-label="pienempi otsikko"]').should('exist');
          cy.get('[aria-label="lihavoitu"]').should('exist');
          cy.get('[aria-label="kursivoitu"]').should('exist');
          cy.get('[aria-label="alleviivattu"]').should('exist');
          cy.get('[aria-label="numeroitu lista"]').should('exist');
          cy.get('[aria-label="numeroimaton lista""]').should('exist');
          cy.get('[aria-label="Lisää linkki"]').should('exist');
          cy.get('[aria-label="väri"]').should('exist');
          cy.get('[aria-label="info"]').should('exist');
          cy.get('[aria-label="varoitus"]').should('exist');
          cy.get('[aria-label="virhe"]').should('exist');
          cy.get('[aria-label="oikein-merkki"]').should('exist');
          cy.get('[aria-label="Poista"]').should('exist');
          cy.get('[aria-label="Sulje"]').should('exist');
        });

        it('Hallintaraportit page: editor doesnt show up without any notification selection', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[data-testid="slate-editor"] [contenteditable=false]').should('exist');
        });

        it('Hallintaraportit page: open info notification and type', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="info"]').click();
          const typedText = 'Info texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]').type(typedText).contains(typedText);
        });

        it('Hallintaraportit page: open warning notification and edit text format', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="varoitus"]').click();
          const typedText = 'Warning texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)

            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="lihavoitu"]').click();
          cy.get('[aria-label="kursivoitu"]').click();
          cy.get('[aria-label="iso otsikko"]').click();
        });

        it('Hallintaraportit page: open error notification type and color texts', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="virhe"]').click();
          const typedText = 'Error texts';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)
            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="väri"]').click();
          cy.get('[aria-label="värivalitsin"]').should('be.visible');
          cy.get(`[aria-label="tummanvihreä"]`).click();
          cy.get('[aria-label="väri"]').click();
          cy.get('[aria-label="värivalitsin"]').should('not.exist');
        });

        it('Hallintaraportit page: remove notification', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="info"]').click();
          const typedText = 'Info teksti';
          cy.get('[data-testid="slate-editor"] [contenteditable=true]')
            .type(typedText)
            .type('{selectAll}')
            .contains(typedText);
          cy.get('[aria-label="Poista"]').click();
        });

        it('Hallintaraportit page: exit editor', function () {
          cy.viewport(viewport);
          cy.visit('/muut/hallintaraportit');
          cy.get('[aria-label="Avaa muokkausnäkymä"]').click({ multiple: true, force: true });
          cy.get('[aria-label="Sulje"]').click();
          cy.get('[aria-label="työkalupalkki"]').should('not.exist');
        });
      });
    });
  });
});
