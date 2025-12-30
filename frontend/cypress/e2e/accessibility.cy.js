describe('Accessibility Tests', () => {
  it('should have no accessibility violations on home page', () => {
    cy.visit('/');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should have no accessibility violations on login page', () => {
    cy.visit('/login');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('should be keyboard navigable', () => {
    cy.visit('/');
    cy.get('body').tab();
    cy.focused().should('have.attr', 'href');
  });

  it('should have proper ARIA labels', () => {
    cy.visit('/');
    cy.get('[role="navigation"]').should('exist');
    cy.get('button').each(($btn) => {
      cy.wrap($btn).should('have.attr', 'aria-label').or('have.text');
    });
  });

  it('should have proper heading hierarchy', () => {
    cy.visit('/');
    cy.get('h1').should('exist');
  });

  it('should have alt text for images', () => {
    cy.visit('/');
    cy.get('img').each(($img) => {
      cy.wrap($img).should('have.attr', 'alt');
    });
  });
});
