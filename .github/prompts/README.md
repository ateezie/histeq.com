# AI Agent Prompts & Instructions

This directory contains AI agent-specific context files and prompts for the Historic Equity Inc. WordPress redesign project.

## Agent Configuration Files

### GitHub Copilot
- **File**: `/.github/copilot-instructions.md`
- **Purpose**: GitHub Copilot context and coding guidelines
- **Auto-updated**: Yes (via `.specify` framework)

### Claude Code
- **File**: `/CLAUDE.md`
- **Purpose**: Claude Code workflow and Archon integration
- **Auto-updated**: Yes (via `.specify` framework)

### Gemini CLI
- **File**: `/GEMINI.md` *(planned)*
- **Purpose**: Google Gemini CLI context for large codebase analysis
- **Auto-updated**: Yes (via `.specify` framework)

### Cursor IDE
- **File**: `/.cursor/rules/specify-rules.mdc` *(planned)*
- **Purpose**: Cursor IDE-specific rules and context
- **Auto-updated**: Yes (via `.specify` framework)

## Multi-Agent Development Approach

This project supports multiple AI development environments working in coordination:

1. **Claude Code**: Primary development agent with Archon task management
2. **GitHub Copilot**: Code completion and suggestion in GitHub workflows
3. **Gemini CLI**: Large codebase analysis and architectural insights
4. **Cursor IDE**: IDE-integrated development assistance

## Automatic Context Updates

The `.specify` framework automatically updates agent context files when new features are planned:

```bash
# Update all agent files
.specify/scripts/bash/update-agent-context.sh

# Update specific agent
.specify/scripts/bash/update-agent-context.sh claude
.specify/scripts/bash/update-agent-context.sh copilot
```

## Context Consistency

All agent files maintain consistent information about:
- Active technologies and frameworks
- Recent feature additions
- Project structure and conventions
- Quality standards and guidelines
- Business context and requirements

## Usage Guidelines

### For Developers
- Keep agent files updated when adding new technologies
- Follow the patterns established in each agent's instructions
- Use the appropriate agent for different development tasks

### For AI Agents
- Always check current task status before implementing features
- Follow established coding conventions and patterns
- Maintain brand compliance and quality standards
- Coordinate with project management systems (Archon MCP)

## File Maintenance

Agent instruction files are automatically maintained by the `.specify` framework but can be manually edited for:
- Project-specific guidelines
- Custom development patterns
- Business context updates
- Quality standard adjustments

**Last updated**: 2025-09-17