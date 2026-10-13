# Graph Report - ats-pro-suite  (2026-10-05)

## Corpus Check
- 84 files · ~35,652 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 707 nodes · 1248 edges · 84 communities (27 shown, 53 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5fc70885`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- builder.$type.tsx
- devDependencies
- routeTree.gen.ts
- sidebar.tsx
- sheet.tsx
- compilerOptions
- pagination.tsx
- toggle-group.tsx
- server.ts
- components.json
- command.tsx
- menubar.tsx
- form.tsx
- carousel.tsx
- cmdk
- chart.tsx
- dropdown-menu.tsx
- drawer.tsx
- arie.functions.ts
- breadcrumb.tsx
- navigation-menu.tsx
- select.tsx
- badge.tsx
- cn
- utils.ts
- input-otp.tsx
- ATS Pro Suite
- alert.tsx
- dependencies
- clsx
- embla-carousel-react
- @clerk/tanstack-react-start
- @hookform/resolvers
- input-otp
- @radix-ui/react-accordion
- @radix-ui/react-alert-dialog
- @radix-ui/react-aspect-ratio
- @clerk/ui
- @radix-ui/react-collapsible
- @radix-ui/react-context-menu
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-hover-card
- @radix-ui/react-label
- jspdf
- @radix-ui/react-navigation-menu
- @radix-ui/react-popover
- @radix-ui/react-radio-group
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-slider
- @radix-ui/react-slot
- @radix-ui/react-switch
- @radix-ui/react-avatar
- @radix-ui/react-toggle
- @radix-ui/react-toggle-group
- react-day-picker
- lucide-react
- @radix-ui/react-checkbox
- react-dom
- react-resizable-panels
- tailwind-merge
- tailwindcss
- @tailwindcss/vite
- @tanstack/react-query
- @tanstack/react-router
- @tanstack/react-start
- @tanstack/router-plugin
- tw-animate-css
- vaul
- vite-tsconfig-paths
- zod
- vite.config.ts
- Routes
- rules/graphify.md
- workflows/graphify.md
- @radix-ui/react-progress
- react
- sonner

## God Nodes (most connected - your core abstractions)
1. `cn()` - 224 edges
2. `compilerOptions` - 22 edges
3. `getDatabase()` - 13 edges
4. `toMessage()` - 12 edges
5. `normalizeLegacyDoc()` - 11 edges
6. `normalizeDoc()` - 11 edges
7. `formatPeriod()` - 9 edges
8. `toPlainText()` - 9 edges
9. `buttonVariants` - 9 edges
10. `slugToType()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Tag()` --calls--> `cn()`  [EXTRACTED]
  src/components/app/primitives.tsx → src/lib/utils.ts
- `AlertDialogOverlay` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogContent` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (84 total, 53 thin omitted)

### Community 0 - "builder.$type.tsx"
Cohesion: 0.08
Nodes (45): blankAdditional(), blankCertification(), blankLanguage(), blankPersonal(), blankReference(), COMMON_ATTACHMENTS, DocumentEditor(), emptyDoc() (+37 more)

### Community 1 - "devDependencies"
Cohesion: 0.04
Nodes (47): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro (+39 more)

### Community 2 - "routeTree.gen.ts"
Cohesion: 0.06
Nodes (34): SiteFooter(), SiteHeader(), Toaster(), ToasterProps, isSlug(), getRouter(), Route, Route (+26 more)

### Community 3 - "sidebar.tsx"
Cohesion: 0.07
Nodes (32): Input, Separator, Sidebar, SidebarContent, SidebarContext, SidebarContextProps, SidebarFooter, SidebarGroup (+24 more)

### Community 4 - "sheet.tsx"
Cohesion: 0.25
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 5 - "compilerOptions"
Cohesion: 0.06
Nodes (31): DOM, DOM.Iterable, ES2022, eslint.config.js, src/**/*.ts, src/**/*.tsx, vite/client, vite.config.ts (+23 more)

### Community 6 - "pagination.tsx"
Cohesion: 0.12
Nodes (21): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+13 more)

### Community 7 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 8 - "server.ts"
Cohesion: 0.16
Nodes (13): consumeLastCapturedError(), describeError(), describeStatus(), originalConsoleError, safeStringify(), renderErrorPage(), fetch(), getServerEntry() (+5 more)

### Community 9 - "components.json"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 10 - "command.tsx"
Cohesion: 0.12
Nodes (14): Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut() (+6 more)

### Community 11 - "menubar.tsx"
Cohesion: 0.12
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 12 - "form.tsx"
Cohesion: 0.19
Nodes (12): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+4 more)

### Community 13 - "carousel.tsx"
Cohesion: 0.19
Nodes (13): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+5 more)

### Community 15 - "chart.tsx"
Cohesion: 0.25
Nodes (9): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, getPayloadConfigFromPayload(), THEMES (+1 more)

### Community 16 - "dropdown-menu.tsx"
Cohesion: 0.20
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 17 - "drawer.tsx"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 18 - "arie.functions.ts"
Cohesion: 0.06
Nodes (71): getBadge(), items, MobileGroup(), NavGroup(), Slug, buildContents(), cleanGeminiSchema(), DEFAULT_MODELS (+63 more)

### Community 19 - "breadcrumb.tsx"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 20 - "navigation-menu.tsx"
Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 21 - "select.tsx"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 22 - "badge.tsx"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 23 - "cn"
Cohesion: 0.09
Nodes (35): AccordionContent, AccordionItem, AccordionTrigger, Avatar, AvatarFallback, AvatarImage, Card, CardContent (+27 more)

### Community 24 - "utils.ts"
Cohesion: 0.10
Nodes (11): Checkbox, HoverCardContent, PopoverContent, Progress, ResizableHandle(), ResizablePanelGroup(), ScrollArea, ScrollBar (+3 more)

### Community 25 - "input-otp.tsx"
Cohesion: 0.40
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 27 - "alert.tsx"
Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 28 - "dependencies"
Cohesion: 0.13
Nodes (15): class-variance-authority, date-fns, dependencies, class-variance-authority, date-fns, @radix-ui/react-menubar, @radix-ui/react-tabs, @radix-ui/react-tooltip (+7 more)

## Knowledge Gaps
- **195 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 232 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `builder.$type.tsx`, `sidebar.tsx`, `sheet.tsx`, `pagination.tsx`, `toggle-group.tsx`, `command.tsx`, `menubar.tsx`, `form.tsx`, `carousel.tsx`, `chart.tsx`, `dropdown-menu.tsx`, `drawer.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `select.tsx`, `badge.tsx`, `utils.ts`, `input-otp.tsx`, `alert.tsx`?**
  _High betweenness centrality (0.326) - this node is a cross-community bridge._
- **Why does `SectionHeader()` connect `builder.$type.tsx` to `routeTree.gen.ts`, `cn`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `Panel()` connect `builder.$type.tsx` to `cn`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `builder.$type.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08469945355191257 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05647058823529412 - nodes in this community are weakly interconnected._