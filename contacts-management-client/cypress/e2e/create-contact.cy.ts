describe('Contact Management E2E Flow with Authentication', () => {
  beforeEach(() => {
    // 1. Initial auth check returns 401 when unauthenticated
    cy.intercept('GET', '**/auth/manage/info', {
      statusCode: 401,
      body: { title: 'Unauthorized' },
    }).as('checkAuthUnauthenticated');

    // 2. Intercept Login endpoint
    cy.intercept('POST', '**/auth/login*', {
      statusCode: 200,
      body: {},
    }).as('loginRequest');

    // 3. Contacts list intercept
    cy.intercept('GET', '**/api/contacts*', {
      statusCode: 200,
      body: {
        items: [
          {
            id: '1',
            fullName: 'Jane Doe',
            age: 30,
            primaryPhoneNumber: '+123456789',
          },
        ],
        totalCount: 1,
        page: 1,
        pageSize: 5,
      },
    }).as('getContacts');
  });

  it('redirects unauthenticated users to login, signs in, and creates a contact', () => {
    // Attempt visiting root / contacts - authGuard should redirect to /login
    cy.visit('/contacts');
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account').should('be.visible');

    // Prepare authenticated response for checkAuth after successful login
    cy.intercept('GET', '**/auth/manage/info', {
      statusCode: 200,
      body: {
        email: 'user@example.com',
        isEmailConfirmed: true,
      },
    }).as('checkAuthAuthenticated');

    // Fill login credentials
    cy.get('input#email-address').type('user@example.com');
    cy.get('p-password#password input').type('Secret123!');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.wait('@checkAuthAuthenticated');

    // Successfully transitioned to protected contacts page
    cy.url().should('include', '/contacts');
    cy.wait('@getContacts');
    cy.contains('Contacts Directory').should('be.visible');
    cy.contains('Jane Doe').should('be.visible');

    // Open Form Dialog to create contact
    cy.contains('button', 'Add Contact').click();
    cy.get('input#firstName').should('be.visible');

    // Fill contact details
    cy.get('input#firstName').type('John');
    cy.get('input#surname').type('Smith');
    cy.get('input#address').type('123 Main Street');
    cy.get('input#iban').type('DE89370400440532013000');

    // Select Date of Birth and close calendar overlay
    cy.get('input#dateOfBirth').type('2000-01-01').type('{esc}');

    // Fill Phone details
    cy.get('input[placeholder*="Phone"]').first().type('+987654321');

    // Intercept POST contacts request
    cy.intercept('POST', '**/api/contacts', {
      statusCode: 201,
      body: {
        id: '2',
        firstName: 'John',
        surname: 'Smith',
        dateOfBirth: '2000-01-01',
        age: 26,
        address: '123 Main Street',
        iban: 'DE89370400440532013000',
        phoneNumbers: [{ id: 'p1', number: '+987654321', isPrimary: true }],
      },
    }).as('createContact');

    // Submit form
    cy.contains('button', 'Save Contact').click();
    cy.wait('@createContact');

    // Verify modal closes
    cy.get('.p-dialog').should('not.exist');
  });
});