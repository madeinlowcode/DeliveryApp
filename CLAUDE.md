# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 delivery application built with React 19, TypeScript 5, and Tailwind CSS 4. The project uses the App Router architecture and shadcn/ui components built on Radix UI primitives.

## Commands

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint the codebase
npm run lint
```

## Architecture

### Directory Structure

- `app/` - Next.js App Router pages and layouts
- `components/` - React components
  - `components/ui/` - shadcn/ui base components (Button, Input, Sidebar, etc.)
  - `components/` - Application-specific components (AppSidebar, NavMain, NavUser, etc.)
- `lib/` - Utility functions (`utils.ts` contains the `cn()` helper for Tailwind class merging)
- `public/` - Static assets

### UI Component Pattern

Components use shadcn/ui conventions:

- `class-variance-authority` (CVA) for variant-based styling
- `clsx` + `tailwind-merge` via `cn()` utility for conditional classes
- Radix UI primitives for accessibility
- `data-slot` attributes for component identification

### Styling

- Tailwind CSS 4 with CSS variables for theming
- Design tokens defined in `app/globals.css` using OKLCH color space
- Light/dark mode support via `.dark` class
- Font: Geist (sans) and Geist Mono loaded via `next/font`

### Path Aliases

- `@/*` maps to project root (configured in `tsconfig.json`)

## Mandatory Development Rules

**These rules from `.claude/rules/rules.md` MUST be followed:**

### MCP Tools

This project uses **Serena MCP** for code operations. Always prefer Serena's symbolic tools over standard file operations:

- Use `mcp__serena__find_symbol` for searching symbols/classes/functions
- Use `mcp__serena__get_symbols_overview` for file analysis
- Use `mcp__serena__find_referencing_symbols` for finding code references
- Use `mcp__serena__search_for_pattern` for pattern searching
- Use `mcp__serena__list_dir` for directory listing
- Use `mcp__serena__find_file` for file discovery

Only use standard tools (Read, Edit, Write, Glob, Grep) when Serena tools don't meet the need.

### Planning Protocol

Before any code modification, present an execution plan with:

- Objective, current analysis, dependency analysis
- Implementation steps, potential risks
- Files to be modified, success criteria, testing strategy
- **Always ask "May I proceed with this plan?" before implementing**

### Anchor Comments System

Use these comment prefixes for complex code:

```typescript
// AIDEV-NOTE: [concise description of purpose/context]
// AIDEV-TODO: [specific pending task]
// AIDEV-QUESTION: [doubt that needs clarification]
// AIDEV-PERF: [critical performance consideration]
// AIDEV-SECURITY: [important security aspect]
```

- Maximum 120 characters per line
- Never remove `AIDEV-*` comments without explicit instructions
- Search for existing anchors before modifying code

### Protected Files (Never modify without explicit permission)

- `.env`, `*.pem`, `config/secrets.*`
- `migrations/*`, `*.sql`
- `docker-compose.prod.yml`, `k8s/*.yaml`
- `openapi.yaml`, `*.proto`
- `.github/workflows/*`, `Jenkinsfile`

### Code Modification Rules

- Never edit code with dependencies without impact analysis
- Never remove code without consulting the developer first
- Map dependencies before any modification
- Maintain visual identity: preserve color palette, typography, spacing patterns
- Maintain structural integrity: separation of concerns, existing architectural patterns

### Git Commit Format

```bash
feat: description of change [AI]

# AI generated implementation details
# Human validated: specific validations performed
```
