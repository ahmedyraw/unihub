describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearCookies();
  });

  describe('Registration', () => {
    it('should display registration form', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').should('be.visible');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('select[name="universityId"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('input[name="confirmPassword"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/register');
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="email"]').blur();
      cy.contains(/valid email/i).should('be.visible');
    });

    it('should validate password requirements', () => {
      cy.visit('/register');
      cy.get('input[name="password"]').type('weak');
      cy.get('input[name="password"]').blur();
      cy.get('ul li').should('contain', 'At least 8 characters');
    });

    it('should show error when passwords do not match', () => {
      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@university.edu');
      cy.get('select[name="universityId"]').select(1);
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('input[name="confirmPassword"]').type('Different@1234');
      cy.get('button[type="submit"]').click();
      cy.get('.alert-danger').should('contain', 'Passwords do not match');
    });

    it('should register successfully with valid data', () => {
      cy.intercept('POST', '**/api/auth/register', {
        statusCode: 200,
        body: {
          userId: 1,
          name: 'Test User',
          email: 'test@university.edu',
          role: 'STUDENT'
        },
        headers: {
          'Set-Cookie': 'auth_token=test-token; HttpOnly; Secure'
        }
      }).as('register');

      cy.visit('/register');
      cy.get('input[name="name"]').type('Test User');
      cy.get('input[name="email"]').type('test@university.edu');
      cy.get('select[name="universityId"]').select(1);
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('input[name="confirmPassword"]').type('Test@1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@register');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Login', () => {
    it('should display login form', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.get('button[type="submit"]').should('be.visible');
    });

    it('should show error with invalid credentials', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 401,
        body: { message: 'Invalid email or password' }
      }).as('loginFail');

      cy.visit('/login');
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpass');
      cy.get('button[type="submit"]').click();

      cy.wait('@loginFail');
      cy.get('.alert-danger').should('be.visible');
    });

    it('should login successfully with valid credentials', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 200,
        body: {
          userId: 1,
          name: 'Test User',
          email: 'test@university.edu',
          role: 'STUDENT'
        },
        headers: {
          'Set-Cookie': 'auth_token=test-token; HttpOnly; Secure'
        }
      }).as('login');

      cy.visit('/login');
      cy.get('input[name="email"]').type('test@university.edu');
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@login');
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limit errors', () => {
      cy.intercept('POST', '**/api/auth/login', {
        statusCode: 429,
        body: { error: 'Too many requests' }
      }).as('rateLimited');

      cy.visit('/login');
      cy.get('input[name="email"]').type('test@test.com');
      cy.get('input[name="password"]').type('Test@1234');
      cy.get('button[type="submit"]').click();

      cy.wait('@rateLimited');
      // Alert should be shown
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Too many requests');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when accessing protected route without auth', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
});
