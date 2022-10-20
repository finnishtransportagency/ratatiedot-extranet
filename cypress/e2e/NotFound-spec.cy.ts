import { Routes } from '../../packages/frontend/src/constants/Routes';
import { PresetViewports } from './constants';

describe('Not Found page', () => {
  PresetViewports.forEach((viewport) => {
    describe(`on ${viewport}`, () => {
      it('should visit if no other paths matched', function () {
        cy.viewport(viewport);
        cy.visit('/not-found');
        cy.get(`a[href="${Routes.LANDING}"]`)
          .should('exist')
          .then(() => cy.get('a').click());
      });
    });
  });
});
