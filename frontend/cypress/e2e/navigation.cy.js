describe('Navigation Tests', () => {
  it('should navigate to all public pages', () => {
    cy.visit('/');
    
    cy.contains('Events').click();
    cy.url().should('include', '/events');
    
    cy.contains('Blogs').click();
    cy.url().should('include', '/blogs');
    
    cy.contains('Leaderboard').click();
    cy.url().should('include', '/leaderboard');
    
    cy.contains('Badges').click();
    cy.url().should('include', '/badges');
  });

  it('should show 404 page for invalid routes', () => {
    cy.visit('/invalid-route', { failOnStatusCode: false });
    cy.url().should('include', '/404');
  });

  it('should have working navbar links', () => {
    cy.visit('/');
    cy.get('.navbar-brand').should('be.visible');
    cy.get('.navbar-brand').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should toggle mobile menu', () => {
    cy.viewport('iphone-x');
    cy.visit('/');
    cy.get('.navbar-toggler').should('be.visible');
    cy.get('.navbar-toggler').click();
    cy.get('.navbar-collapse').should('have.class', 'show');
  });
});
