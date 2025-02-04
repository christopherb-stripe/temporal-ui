/// <reference types="cypress" />

import workflowRunningFixture from '../fixtures/workflow-running.json';

const { workflowId, runId } =
  workflowRunningFixture.workflowExecutionInfo.execution;

describe.skip('Workflow Actions', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-descending');

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
    );
  });

  describe('Terminate', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      cy.wait('@settings-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu >> [data-cy="terminate-button"]').click();
      cy.get('#workflow-termination-reason').type('test');
      cy.get('[data-cy="confirm-modal-button"').click();

      cy.wait('@terminate-workflow-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-termination-success-toast').should('exist');
    });
  });

  describe('Cancel', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      cy.wait('@settings-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-actions-primary-button').click();
      cy.get('[data-cy="confirm-modal-button"]').click();

      cy.wait('@cancel-workflow-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');
    });
  });

  describe('Signal', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      cy.wait('@settings-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu >> [data-cy="signal-button"]').click();
      cy.get('#signal-name').type('sos');
      cy.get('div.cm-content').type('{{}{enter}"sos":true');
      cy.get('[data-cy="confirm-modal-button"').click();

      cy.wait('@signal-workflow-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-signal-success-toast').should('exist');
      cy.get('[data-cy="confirm-modal-button"').should('not.exist');
    });
  });

  describe('Write Actions Disabled', () => {
    it('the Cancel button is disabled if write actions are disabled', () => {
      cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
        fixture: 'settings.write-actions-disabled.json',
      }).as('settings-api');

      cy.wait('@settings-api');
      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('#workflow-actions-primary-button').should('be.disabled');
      cy.get('#workflow-actions-menu-button').should('be.disabled');
    });
  });
});
