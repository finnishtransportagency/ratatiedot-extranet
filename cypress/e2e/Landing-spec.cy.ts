import { Routes } from '../../packages/frontend/src/constants/Routes';
import { PresetViewports } from './constants';

describe('Landing page', () => {
  const mobileAndTabletViewports = PresetViewports.slice(0, 2);
  const desktopViewport = PresetViewports[3];
  mobileAndTabletViewports.forEach((viewport) => {
    describe(`on ${viewport}`, () => {
      beforeEach(() => {
        cy.viewport(viewport);
        cy.visit(Routes.LANDING);
      });

      it('MuiAppBar exists', function () {
        cy.get('header.MuiPaper-root')
          .should('be.visible')
          .get('[area-label="open search"]')
          .should('be.visible')
          .get('[area-label="open drawer"]')
          .should('be.visible');
      });

      it('Drawer is not visible initially', () => {
        cy.get('div.MuiDrawer-root').should('not.be.visible');
      });

      it('clicks on Menu icon and Drawer appears', () => {
        cy.get('[area-label="open drawer"]')
          .click()
          .get('div.MuiDrawer-root')
          .should('exist')
          .invoke('css', 'width')
          .then((widthStr) => parseInt(widthStr))
          .should('be.gte', 375) // iphone x screen width
          .get('[area-label="close drawer"]')
          .should('be.visible');
      });

      it('Title Bar does not have search bar', () => {
        cy.get('div.MuiBox-root div.MuiToolbar-root').should('exist').get('div.MuiInputBase-root').should('not.exist');
      });
    });
  });

  describe(`on ${desktopViewport}`, () => {
    beforeEach(() => {
      cy.viewport(desktopViewport);
      cy.visit(Routes.LANDING);
    });

    it('MuiAppBar does not exist', function () {
      cy.get('header.MuiPaper-root').should('not.exist');
    });

    it('Drawer exists even when closed', () => {
      cy.get('div.MuiDrawer-root')
        .should('exist')
        .invoke('css', 'width')
        .then((widthStr) => parseInt(widthStr))
        .should('eq', 65)
        .get('[area-label="open drawer"]')
        .should('exist');
    });

    it('Menu texts are hidden when closed', () => {
      cy.get('ul.MuiList-root > li.MuiListItem-root')
        .should('exist')
        .get('div.MuiListItemIcon-root')
        .should('exist')
        .get('div.MuiListItemText-root')
        .should('not.be.visible');
    });

    it('Menu texts are hidden when drawer is closed', () => {
      cy.get('ul.MuiList-root > li.MuiListItem-root')
        .should('exist')
        .get('div.MuiListItemIcon-root')
        .should('exist')
        .get('div.MuiListItemText-root')
        .should('not.be.visible');
    });

    it('Toggle menu drawer', () => {
      cy.get('div[area-label="open drawer"]')
        .click()
        .then(() => {
          cy.get('div.MuiDrawer-root div.MuiPaper-root')
            .get('div.MuiListItemIcon-root')
            .should('exist')
            .get('div.MuiListItemText-root')
            .should('be.visible');
        });

      cy.get('div[area-label="close drawer"]')
        .click()
        .then(() => {
          cy.get('ul.MuiList-root > li.MuiListItem-root')
            .should('exist')
            .get('div.MuiListItemIcon-root')
            .should('exist')
            .get('div.MuiListItemText-root')
            .should('not.be.visible');
        });
    });

    it('Title Bar has search bar', () => {
      cy.get('div.MuiBox-root div.MuiToolbar-root')
        .should('exist')
        .get('div.MuiInputBase-root')
        .get('input')
        .type('Hello world!');
    });

    it('Opened drawer pushes content to the right', () => {
      let initialWidth = 0;
      cy.get('div.MuiBox-root div.MuiBox-root:last-child')
        .invoke('css', 'width')
        .then((widthStr) => {
          initialWidth = parseInt(widthStr);
        });
      cy.get('div[area-label="open drawer"]')
        .click()
        .then(() => {
          cy.get('div.MuiBox-root div.MuiBox-root:last-child')
            .invoke('css', 'width')
            .then((widthStr) => parseInt(widthStr))
            .should('be.lt', initialWidth);
        });
    });
  });
});
