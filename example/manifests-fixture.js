// example/manifests-fixture.js
//
// ⚠️ MIRROR — NOT CANON. Verbatim copy of the intake-triager per-state
// manifest content as of commit 3161c1a
// (intake-triager/src/substrate/manifests/index.js). Carried here ONLY so
// Pattern-in-Motion Component #6 can render against real content in the
// /example harness. For #6 validation only — canon lives in the host
// (intake-triager). Do not edit here to change meaning; update the host and
// re-mirror.
//
// All seven states are present, including `at_the_table` (the implicit-idle
// state), so loadManifest resolves the idle-state narrative that #6 renders.

export const manifests = Object.freeze({
  at_the_table: Object.freeze({
    restaurant_label: 'Contemplating order',
    technology_label: 'Composing your message',
    animation_asset: null,
    plain_english: "You're at the table, deciding what to order.",
    in_code: 'Input area focused; no request in flight',
    just_finished: '← Just finished: Stock the Pantry',
    up_next:
      "Next: Take the order — your order travels to the Pass to enter the Kitchen's queue.",
  }),

  take_the_order: Object.freeze({
    restaurant_label: 'Take the order',
    technology_label: 'Send the request',
    animation_asset: null,
    plain_english:
      'The Runner carries your order through the hand-off window to the Pass. Behind the scenes, your typed message becomes an HTTP request traveling to the backend.',
    in_code: 'POST /converse over HTTPS to the Pass',
    just_finished: '← Just finished: Contemplating order',
    up_next:
      'Next: Brief the Chef — the Expediter prepares a briefing so the Chef has everything needed for this order.',
  }),

  brief_the_chef: Object.freeze({
    restaurant_label: 'Brief the Chef',
    technology_label: 'Assemble the prompt',
    animation_asset: null,
    plain_english:
      "The Expediter loads the conversation's history from the Pantry, assembles the briefing, and hands it to the Chef. The backend reads prior messages from the database, builds the full prompt context, and sends it to the LLM provider's API.",
    in_code:
      'Load history; assemble system + history + user; POST to LLM messages endpoint',
    just_finished: '← Just finished: Take the order',
    up_next:
      'Next: Plate the dish — the Chef composes one plated output carrying everything the order needs.',
  }),

  plate_the_dish: Object.freeze({
    restaurant_label: 'Plate the dish',
    technology_label: 'Run inference',
    animation_asset: null,
    plain_english:
      "Complying with the Kitchen's rules and limits, the Chef composes one plated dish carrying everything the order needs. The LLM runs inference within token caps and behavior rules set in the system prompt, then returns a single response containing both the visible reply and the embedded markers.",
    in_code:
      'LLM inference (token-capped; rule-bound by system prompt); response returns assistant message + HTML-comment markers',
    just_finished: '← Just finished: Brief the Chef',
    up_next:
      'Next: Read the ticket — the Expediter reads what arrived and sorts what to serve.',
  }),

  read_the_ticket: Object.freeze({
    restaurant_label: 'Read the ticket',
    technology_label: 'Extract the markers',
    animation_asset: null,
    plain_english:
      "The Expediter reads the ticket the Chef sent out, sorting what to serve to your table from what the Kitchen needs to act on. The backend regex-matches the HTML-comment markers, parses each ticket's JSON payload, and strips the markers from the display text.",
    in_code:
      'Regex-scan response; JSON.parse each marker payload; strip markers from display text',
    just_finished: '← Just finished: Plate the dish',
    up_next:
      'Next: Serve the Patron — the Runner carries the plated prose to your table.',
  }),

  serve_by_type: Object.freeze({
    restaurant_label: 'Serve the Patron',
    technology_label: 'Render the response',
    animation_asset: null,
    plain_english:
      'The Runner carries the plated prose from the Pass to your table — served fast, before any paperwork is filed. The backend returns the cleaned response over HTTPS and the browser renders it in your chat thread.',
    in_code:
      'HTTP 200 response to client; front end renders assistant message to DOM',
    just_finished: '← Just finished: Read the ticket',
    up_next:
      'Next: Stock the Pantry — the Kitchen logs the order and acts on each ticket.',
  }),

  stock_the_pantry: Object.freeze({
    restaurant_label: 'Stock the Pantry',
    technology_label: 'Persist the conversation',
    animation_asset: null,
    plain_english:
      'Out of your view, the Kitchen logs the completed order into the Pantry and acts on each ticket — adding to the history that will brief the Chef on the next order, and fulfilling every action this order produced. The backend writes the user and assistant messages to the database, then dispatches each ticket to its handler.',
    in_code:
      'INSERT user message; INSERT assistant message; dispatch each ticket to its handler',
    just_finished: '← Just finished: Serve the Patron',
    up_next: 'Next: Contemplating order — the table awaits the next order.',
  }),
});
