# UI Components Specification

---

## 1. File Explorer

Hierarchical tree view of files with change indicators.

### Node Types

```typescript
interface ExplorerNode {
  type: 'file' | 'folder' | 'discussion';
  fileName: string;
  fullDepotPath: string;
  isVisible: boolean;
  isMarked: boolean;            // User marked for attention
  isSelected: boolean;

  // For files
  changeType?: ChangeType;
  isAcquired?: boolean;         // Content downloaded
  artifactTags?: string[];
}

interface FileNode extends ExplorerNode {
  type: 'file';
  changeType: ChangeType;
  acquisitionState: AcquisitionState;
  iterationClarification?: string;  // "(Iteration X Only)"
}

interface FolderNode extends ExplorerNode {
  type: 'folder';
  children: ExplorerNode[];
  markStatus: 'none' | 'partial' | 'all';  // Aggregated from children
}

interface DiscussionNode extends ExplorerNode {
  type: 'discussion';
  isFixed: true;                // Always visible
}
```

### Change Types

```typescript
enum ChangeType {
  None = 'none',
  Add = 'add',
  Delete = 'delete',
  Edit = 'edit',
  Rename = 'rename',
  Move = 'move',
  RenameEdit = 'rename_edit',
  MoveEdit = 'move_edit'
}
```

### Acquisition States

```typescript
enum AcquisitionState {
  Unacquired = 'unacquired',
  Acquiring = 'acquiring',
  Acquired = 'acquired',
  Hashed = 'hashed',
  Error = 'error',
  Unknown = 'unknown'
}
```

### Filtering

```typescript
interface FileExplorerFilter {
  // Name filter
  fileNamePattern?: string;
  useRegex: boolean;

  // Tag filter
  artifactTags?: string[];

  // Change type filter
  showUnchangedIterationFiles: boolean;
  showUnchangedCompareFiles: boolean;
  showRenamedFiles: boolean;
}
```

### Navigation

```typescript
interface FileExplorerNavigation {
  // Get adjacent nodes (respecting filter)
  getNextNode(skipFiltered: boolean): ExplorerNode | null;
  getPreviousNode(skipFiltered: boolean): ExplorerNode | null;

  // Programmatic selection
  selectNode(node: ExplorerNode): Promise<void>;
}
```

### Actions

| Action | Description |
|--------|-------------|
| Mark/Unmark | Toggle marked state |
| Copy Path | Copy depot/local path |
| Copy File Name | Copy just the name |
| Open Containing Folder | Open in OS explorer |
| Compare External | Open in external diff tool |
| Open Left/Right | Open specific version |

---

## 3. Review Properties

Display dynamic review and iteration metadata.

### Property Model

```typescript
interface ReviewProperty {
  // Display
  caption: string;
  captionTooltip?: string;
  displayText: string;
  displayTextTooltip?: string;

  // Styling
  foregroundColor?: string;
  backgroundColor?: string;
  statusColor?: StatusColor;

  // Links
  displayTextLinkTarget?: string;   // URL for value
  captionHelpLinkTarget?: string;   // URL for help

  // Action button
  actionButtonCaption?: string;
  actionButtonTooltip?: string;
  shouldDisplayAction: boolean;
  shouldEnableAction: boolean;
  runActionAsync(): Promise<void>;

  // Metadata
  providerName: string;
  statusContext?: string;
}

enum StatusColor {
  Success = 'success',    // Green
  Warning = 'warning',    // Yellow
  Error = 'error',        // Red
  Pending = 'pending',    // Gray
  Custom = 'custom'
}
```

### Property Sources

Properties come from:
1. **Policies** - Build status, approver count, etc.
2. **Plugins** - Custom static analysis results
3. **Review metadata** - Title, description, work items

### Display Sections

```typescript
interface ReviewPropertiesPane {
  reviewProperties: ReviewProperty[];      // Review-level
  iterationProperties: ReviewProperty[];   // Iteration-level

  showReviewProperties: boolean;
  showIterationProperties: boolean;
  iterationPropertiesTitle: string;        // "Iteration N"
}
```

---

### Persisted per-user:
- Dashboard: account, filters, group expansion
- File Explorer: column widths, show/hide options
- Window: size, position, layout

---

## Keyboard Shortcuts

### Dashboard

| Key | Action |
|-----|--------|
| Enter | Open selected review |
| Delete | Remove subscription |
| Ctrl+C | Copy review link |

### File Explorer

| Key | Action |
|-----|--------|
| Up/Down | Navigate files |
| Enter | Open selected file |
| Space | Toggle marked |
| Ctrl+C | Copy path |

### Review Properties

| Key | Action |
|-----|--------|
| Enter | Activate link/button |
| Tab | Navigate between properties |
