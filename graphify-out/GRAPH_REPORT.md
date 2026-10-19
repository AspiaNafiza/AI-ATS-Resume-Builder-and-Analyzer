# Graph Report - ats-pro-suite (2026-10-05)

## Corpus Check

- 84 files · ~38,219 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary

- 726 nodes · 1267 edges · 83 communities (27 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness

- Built from commit: `75bdf1a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)

- builder.$type.tsx
- devDependencies
- routeTree.gen.ts
- sidebar.tsx
- table.tsx
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
- ai-gateway.server.ts
- card.tsx
- arie.functions.ts
- breadcrumb.tsx
- navigation-menu.tsx
- tabs.tsx
- badge.tsx
- cn
- utils.ts
- ATS Pro Suite 📄✨
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
7. `ATS Pro Suite 📄✨` - 10 edges
8. `formatPeriod()` - 9 edges
9. `toPlainText()` - 9 edges
10. `buttonVariants` - 9 edges

## Surprising Connections (you probably didn't know these)

- `Tag()` --calls--> `cn()` [EXTRACTED]
  src/components/app/primitives.tsx → src/lib/utils.ts
- `AlertDialogOverlay` --calls--> `cn()` [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogContent` --calls--> `cn()` [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogHeader()` --calls--> `cn()` [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()` [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts

## Import Cycles

- None detected.

## Communities (83 total, 52 thin omitted)

### Community 0 - "builder.$type.tsx"

Cohesion: 0.08
Nodes (51): blankAdditional(), blankCertification(), blankLanguage(), blankPersonal(), blankReference(), COMMON_ATTACHMENTS, DocumentEditor(), emptyDoc() (+43 more)

### Community 1 - "devDependencies"

Cohesion: 0.04
Nodes (47): eslint, eslint-config-prettier, @eslint/js, eslint-plugin-prettier, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, nitro (+39 more)

### Community 2 - "routeTree.gen.ts"

Cohesion: 0.06
Nodes (31): SiteFooter(), SiteHeader(), Toaster(), ToasterProps, getRouter(), Route, Route, analyzers (+23 more)

### Community 3 - "sidebar.tsx"

Cohesion: 0.06
Nodes (40): Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+32 more)

### Community 4 - "table.tsx"

Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 5 - "compilerOptions"

Cohesion: 0.06
Nodes (31): DOM, DOM.Iterable, ES2022, eslint.config.js, src/**/\*.ts, src/**/*.tsx, vite/client, vite.config.ts (+23 more)

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

### Community 16 - "ai-gateway.server.ts"

Cohesion: 0.31
Nodes (7): buildContents(), cleanGeminiSchema(), DEFAULT_MODELS, GatewayError, generateJson(), JsonSchema, ResponsesInput

### Community 17 - "card.tsx"

Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 18 - "arie.functions.ts"

Cohesion: 0.07
Nodes (61): getBadge(), items, MobileGroup(), NavGroup(), Slug, analyzeDocument, buildDocument, deleteMyDocument (+53 more)

### Community 19 - "breadcrumb.tsx"

Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 20 - "navigation-menu.tsx"

Cohesion: 0.29
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 21 - "tabs.tsx"

Cohesion: 0.50
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 22 - "badge.tsx"

Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

### Community 23 - "cn"

Cohesion: 0.08
Nodes (40): AccordionContent, AccordionItem, AccordionTrigger, Avatar, AvatarFallback, AvatarImage, ContextMenuCheckboxItem, ContextMenuContent (+32 more)

### Community 24 - "utils.ts"

Cohesion: 0.08
Nodes (15): Checkbox, HoverCardContent, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, PopoverContent, Progress (+7 more)

### Community 26 - "ATS Pro Suite 📄✨"

Cohesion: 0.09
Nodes (21): 1. 📄 ATS Resume Builder, 2. 🎓 ATS CV Builder (Academic & Professional), 3. ✉️ Standalone Cover Letter Builder, 4. 🔍 ATS Document Analyzer & Auditor, 5. 🔒 Privacy-First Architecture, 🛡️ Architecture & Rules, ATS Pro Suite 📄✨, 📜 Available Scripts (+13 more)

### Community 27 - "alert.tsx"

Cohesion: 0.50
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 28 - "dependencies"

Cohesion: 0.13
Nodes (15): class-variance-authority, date-fns, dependencies, class-variance-authority, date-fns, @radix-ui/react-menubar, @radix-ui/react-tabs, @radix-ui/react-tooltip (+7 more)

## Knowledge Gaps

- **212 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `css` (+207 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 249 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions

_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `builder.$type.tsx`, `sidebar.tsx`, `table.tsx`, `pagination.tsx`, `toggle-group.tsx`, `command.tsx`, `menubar.tsx`, `form.tsx`, `carousel.tsx`, `chart.tsx`, `card.tsx`, `breadcrumb.tsx`, `navigation-menu.tsx`, `tabs.tsx`, `badge.tsx`, `utils.ts`, `alert.tsx`?**
  _High betweenness centrality (0.309) - this node is a cross-community bridge._
- **Why does `SectionHeader()` connect `builder.$type.tsx` to `routeTree.gen.ts`, `cn`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `Panel()` connect `builder.$type.tsx` to `cn`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _212 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `builder.$type.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07507914970601538 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.041666666666666664 - nodes in this community are weakly interconnected._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05851063829787234 - nodes in this community are weakly interconnected._
