import { Routes } from '../../packages/frontend/src/constants/Routes';
import { PresetViewports } from './constants';

describe('Access Denied page', () => {
  PresetViewports.forEach((viewport) => {
    describe(`on ${viewport}`, () => {
      it('should travel to Access Denied page from Home page and go back', function () {
        cy.viewport(viewport);
        // Temporary navigation
        cy.visit(Routes.HOME);
        cy.get(`a[href="${Routes.ACCESS_DENIED}"]`).click();
        cy.get('button').invoke('width').should('be.gte', 200);
        cy.get('button')
          .should('exist')
          .then(() => cy.get('button').click());
      });

      it('open Access Denied page and no back button is found', function () {
        cy.viewport(viewport);
        cy.visit(Routes.ACCESS_DENIED);
        cy.get('button').should('not.exist');
      });
    });
  });
});
