<script lang="ts">
  import { page } from '$app/stores';
  import { eventFilterSort, expandAllEvents } from '$lib/stores/event-view';
  import { eventHistory } from '$lib/stores/events';
  import { refresh } from '$lib/stores/workflow-run';

  import EventSummaryTable from '$lib/components/event/event-summary-table.svelte';
  import EventSummaryRow from '$lib/components/event/event-summary-row.svelte';
  import EventEmptyRow from './event-empty-row.svelte';
  import { groupEvents } from '$lib/models/event-groups';
  import Pagination from '$lib/holocene/pagination.svelte';

  export let events: CommonHistoryEvent[];
  export let compact = false;

  function handleExpandChange(event: CustomEvent) {
    $expandAllEvents = event.detail.expanded;
  }

  const getEvents = (
    items: CommonHistoryEvent[],
    category: string,
  ): IterableEvent[] => {
    if (category) {
      const filteredItems = items.filter((i) => i.category === category);
      return compact ? groupEvents(filteredItems) : filteredItems;
    }
    return compact ? groupEvents(items) : items;
  };

  $: category = $page.url.searchParams.get('category');
  $: intialEvents =
    $eventFilterSort === 'descending' && !compact
      ? $eventHistory?.end
      : $eventHistory?.start;
  $: currentEvents = events.length ? events : intialEvents;
  $: initialItem = currentEvents?.[0];
  $: items = getEvents(currentEvents, category);
  $: updating = currentEvents.length && !events.length;
</script>

{#key [$eventFilterSort, category, $refresh]}
  <Pagination
    floatId="event-view-toggle"
    {items}
    {updating}
    let:visibleItems
    let:activeRowIndex
    let:setActiveRowIndex
  >
    <EventSummaryTable {updating} {compact} on:expandAll={handleExpandChange}>
      {#each visibleItems as event, index (`${event.id}-${event.timestamp}`)}
        <EventSummaryRow
          {event}
          {compact}
          {visibleItems}
          expandAll={$expandAllEvents === 'true'}
          {initialItem}
          active={activeRowIndex === index}
          onRowClick={() => setActiveRowIndex(index)}
        />
      {:else}
        <EventEmptyRow />
      {/each}
    </EventSummaryTable>
  </Pagination>
{/key}
