import { Routes } from '../../packages/frontend/src/constants/Routes';
import { PresetViewports } from './constants';

describe('Access Denied page', () => {
  PresetViewports.forEach((viewport) => {
    describe(`on ${viewport}`, () => {
      it('open Access Denied page and no back button is found', function () {
        cy.viewport(viewport);
        cy.visit(Routes.ACCESS_DENIED);
        cy.get('button').should('not.exist');
      });
    });
  });
});
