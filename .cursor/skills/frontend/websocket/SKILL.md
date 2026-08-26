---
name: websocket
description: "Use this skill when any task involves real-time WebSocket communication 
between the frontend and server. Covers connection lifecycle management and real-time 
event handling. Use for tasks like: initializing a WebSocket connection, implementing 
reconnection logic, cleaning up connections on unmount, processing incoming server 
events, and dispatching outgoing messages. NOT for REST API calls or data fetching 
(api-integration), server-sent events without a full WebSocket connection, or managing 
state derived from WebSocket data (react-state-management)."
allowed-tools: Read, Write, Edit
model: claude-sonnet-4-20250514
---

# WebSocket Communication

## Sub-Skill Selection

Read the task and load the relevant reference file — do not load all references.

| Task involves | Reference to load |
|---|---|
| Opening connection, reconnection strategy, cleanup on unmount | references/connection-patterns.md |
| Handling incoming events, sending messages, event type mapping | references/events-patterns.md |

## When Multiple Apply
If building a WebSocket feature from scratch, load in this order:
1. references/connection-patterns.md (establish connection first)
2. references/events-patterns.md (wire events once connection exists)

## Decision & Troubleshooting References
Load these only when needed:
- references/connection-decisions.md
- references/connection-examples.md
- references/connection-troubleshooting.md
- references/events-decisions.md
- references/events-examples.md
- references/events-troubleshooting.md
