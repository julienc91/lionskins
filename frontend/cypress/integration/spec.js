describe('Test footer links', () => {
  it('Redirect to about page', () => {
    cy.visit('/')
    cy.contains('About').click()
    cy.location('pathname').should('equal', '/about/')
  })

  it('Redirect to contact page', () => {
    cy.visit('/')
    cy.contains('Contact').click()
    cy.location('pathname').should('equal', '/contact/')
  })

  it('Redirect to FAQ page', () => {
    cy.visit('/')
    cy.contains('FAQ').click()
    cy.location('pathname').should('equal', '/faq/')
  })

  it('Redirect to Privacy Policy page', () => {
    cy.visit('/')
    cy.contains('Privacy Policy').click()
    cy.location('pathname').should('equal', '/privacy-policy/')
  })
})
