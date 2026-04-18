# 1. OBJECTIVE
Add a Miro-like whiteboard feature that allows users to upload and arrange multiple diagrams (images, mind maps, draw.io diagrams) on an infinite canvas. Whiteboards are created standalone (without NavigateChat) and rendered via a custom widget that supports multiple diagrams - unlike NavigateChat.com which only supports single diagrams.

# 2. CONTEXT SUMMARY
The current MCP server visualizes chat conversations as hierarchical mind maps and publishes them to NavigateChat API for rendering. NavigateChat doesn't support multiple diagrams on a single canvas yet, so we need our own storage and canvas rendering. The whiteboard feature will:
- Use local JSON file storage for whiteboards (no external dependencies)
- Support multiple diagram types: images (PNG/JPG/SVG), mind map JSON, draw.io XML
- Provide an infinite canvas with pan/zoom and drag-drop diagram positioning
- Generate shareable links that open the whiteboard widget

# 3. APPROACH OVERVIEW
- **Storage**: Local JSON file-based storage in a `data/` directory - each whiteboard is a JSON file containing metadata and an array of diagrams with positions
- **MCP Tools**: Add 6 new tools for whiteboard CRUD operations and diagram management
- **Widget**: Create a new whiteboard widget with an infinite canvas renderer supporting multiple diagram types and interactive positioning
- **Rendering**: The widget will use SVG-based infinite canvas with pan/zoom controls and drag-drop support

# 4. IMPLEMENTATION STEPS

## Step 1: Create data storage layer
- **Goal**: Establish local file-based storage for whiteboards
- **Method**: Create `src/storage.ts` with functions to read/write whiteboard JSON files in a `data/` directory
- **Reference**: New file `src/storage.ts`

## Step 2: Add whiteboard MCP tools
- **Goal**: Provide API for creating and managing whiteboards
- **Method**: Add 6 new tools to `src/index.ts`:
  - `create_whiteboard(name)` - creates new whiteboard, returns id and shareable link
  - `add_diagram_to_whiteboard(whiteboardId, diagram)` - adds diagram with type, content, position
  - `list_whiteboards()` - returns all whiteboards (id, name, createdAt, diagramCount)
  - `get_whiteboard(whiteboardId)` - returns full whiteboard with all diagrams and positions
  - `update_diagram_position(whiteboardId, diagramId, x, y, width, height)` - updates diagram position/size
  - `delete_whiteboard(whiteboardId)` - removes whiteboard and its data
- **Reference**: `src/index.ts`

## Step 3: Create whiteboard widget HTML
- **Goal**: Build an interactive infinite canvas widget
- **Method**: Create `src/whiteboard-widget.html` with:
  - SVG-based infinite canvas with pan (drag) and zoom (scroll wheel)
  - Support for rendering images, mind maps, and draw.io diagrams
  - Diagram selection and drag-drop positioning
  - Mini-map for navigation (optional)
- **Reference**: New file `src/whiteboard-widget.html`

## Step 4: Register whiteboard widget resource
- **Goal**: Make whiteboard widget accessible via MCP
- **Method**: Add `registerAppResource` for `ui://chat-visualizer/whiteboard.html` in `src/index.ts`
- **Reference**: `src/index.ts`

## Step 5: Update build script
- **Goal**: Include whiteboard widget in build output
- **Method**: Update `src/build-widget.js` to also process `whiteboard-widget.html`
- **Reference**: `src/build-widget.js`

# 5. TESTING AND VALIDATION
- Create a whiteboard using the new MCP tool
- Add multiple diagrams of different types (image URL, mind map JSON, draw.io XML)
- Verify the shareable link renders the whiteboard widget
- Test pan/zoom functionality on the canvas
- Verify diagrams can be dragged and repositioned
- Test updating diagram positions via MCP tools
- Verify listing and deleting whiteboards works correctly
- Success: User can create a whiteboard, add multiple diagrams, view/edit on interactive canvas, and share via link
