describe('accueil Bugpedia', () => {
  it('affiche le titre', () => {
    cy.visit('/');
    cy.contains('Bugpedia');
  });
});
