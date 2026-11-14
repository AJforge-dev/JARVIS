import fs from 'fs';
import path from 'path';
import os from 'os';

export interface JarvisSkill {
  id: string;
  name: string;
  icon: string;
  type: 'BUILTIN' | 'INSTALLED';
  description: string;
  markdownContent?: string;
  filePath?: string;
}

const defaultSkills: JarvisSkill[] = [
  {
    id: 'create-document',
    name: 'create-document',
    icon: '📄',
    type: 'BUILTIN',
    description: 'Produce a real artifact the user can open · slide decks (.pptx / .pdf), memos, drafts, reports, outlines. Routes through file_operation(write) for source files and shell_exec for binary rendering. Use whenever the prompt is "create a deck / draft a memo / write a report / make slides / generate a doc / make a powerpoint".'
  },
  {
    id: 'deep-research',
    name: 'deep-research',
    icon: '⌕',
    type: 'BUILTIN',
    description: 'Multi-angle research with parallel sub-agents. Use when the user wants "deep research", "thorough analysis", "investigate", or asks an open-ended question that benefits from 3+ independent search angles synthesised together.'
  },
  {
    id: 'find-on-mac',
    name: 'find-on-mac',
    icon: '⌕',
    type: 'BUILTIN',
    description: 'Find files on your Mac by name or content (Spotlight). Use when the user asks "where\'s my X file", "find files about Y", or similar.'
  },
  {
    id: 'investor_outreach',
    name: 'investor_outreach',
    icon: '⚡',
    type: 'INSTALLED',
    description: 'Build and work a list of investors, syndicates, or angels — research fund/fit/warm-path per row, then draft the outreach ask. Use when the user wants to "build an investor list", "find angels for my round", "research VCs", "who should I raise from", or "reach out to investors".'
  },
  {
    id: 'morning-brief',
    name: 'morning-brief',
    icon: '📋',
    type: 'BUILTIN',
    description: 'Compose a 60-second morning brief for you covering schedule, weather, and one prompt for the day.'
  },
  {
    id: 'open-in-browser',
    name: 'open-in-browser',
    icon: '⚡',
    type: 'BUILTIN',
    description: 'Open a URL in your default browser. Use when the user says "open X", "show me X website", or asks for something that\'s clearly a navigation request.'
  },
  {
    id: 'read-pdf',
    name: 'read-pdf',
    icon: '📄',
    type: 'BUILTIN',
    description: 'Extract text from a local PDF and answer questions about it. Use when the user references a .pdf file on their Mac.'
  },
  {
    id: 'research-via-browser',
    name: 'research-via-browser',
    icon: '⌕',
    type: 'BUILTIN',
    description: 'Fall-through research when web_search is rate-limited or returns nothing. Opens a real browser via Stagehand, types the query into Google/DuckDuckGo, extracts the top results, and follows the most relevant link. Use this whenever web_search fails with "rate limit", "anomaly", or "no results", or when the user asks for live data the search backends can\'t reach.'
  },
  {
    id: 'screenshot',
    name: 'screenshot',
    icon: '⚡',
    type: 'BUILTIN',
    description: 'Take a screenshot of the screen or a specific window. Use when the user asks for a screen capture or wants to share what\'s on screen.'
  },
  {
    id: 'standup-brief',
    name: 'standup-brief',
    icon: '📋',
    type: 'BUILTIN',
    description: 'Compose a 30-second standup brief from your open GitHub PRs and assigned issues. Requires the GitHub connection.'
  },
  {
    id: 'summarize-url',
    name: 'summarize-url',
    icon: '⚡',
    type: 'BUILTIN',
    description: 'Fetch a webpage or article and return key takeaways. Use when the user pastes a link or asks "what\'s this page about?".'
  },
  {
    id: 'tell-jokes',
    name: 'tell-jokes',
    icon: '⚡',
    type: 'BUILTIN',
    description: 'Tell a genuinely funny joke by pulling from a curated joke API (not the model\'s own weak jokes). Use when the user asks for a joke, says they\'re bored, wants cheering up, or asks for something funny. Supports dad jokes, programming/pun/spooky/Christmas categories.'
  },
  {
    id: 'web-research',
    name: 'web-research',
    icon: '⌕',
    type: 'BUILTIN',
    description: 'Search the web for current info and synthesize an answer. Use for news, prices, schedules, weather, anything time-sensitive that needs fresh data.'
  },
  {
    id: 'gepeto',
    name: 'gepeto',
    icon: '⚡',
    type: 'INSTALLED',
    description: 'Guide for building 1-click launchers and building apps with launchers built-in using Pinokio'
  },
  {
    id: 'pinokio',
    name: 'pinokio',
    icon: '⚡',
    type: 'INSTALLED',
    description: 'Discover, launch, and use apps and tools for the current task.'
  }
];

export class SkillsManager {
  private static instance: SkillsManager;
  private skillsDir: string;

  private constructor() {
    this.skillsDir = path.join(os.homedir(), '.jarvis', 'workspace', 'SKILLS');
    if (!fs.existsSync(this.skillsDir)) {
      try {
        fs.mkdirSync(this.skillsDir, { recursive: true });
        this.writeDefaultSkillFiles();
      } catch (e) {}
    }
  }

  public static getInstance(): SkillsManager {
    if (!SkillsManager.instance) {
      SkillsManager.instance = new SkillsManager();
    }
    return SkillsManager.instance;
  }

  private writeDefaultSkillFiles(): void {
    defaultSkills.forEach((skill) => {
      const filePath = path.join(this.skillsDir, `${skill.id}.md`);
      if (!fs.existsSync(filePath)) {
        const content = `---
name: ${skill.name}
type: ${skill.type}
icon: ${skill.icon}
---

${skill.description}
`;
        fs.writeFileSync(filePath, content, 'utf-8');
      }
    });
  }

  public getSkills(): JarvisSkill[] {
    const list: JarvisSkill[] = [];

    if (fs.existsSync(this.skillsDir)) {
      const files = fs.readdirSync(this.skillsDir).filter(f => f.endsWith('.md'));
      for (const file of files) {
        try {
          const filePath = path.join(this.skillsDir, file);
          const raw = fs.readFileSync(filePath, 'utf-8');
          const id = file.replace(/\.md$/, '');

          let name = id;
          let icon = '⚡';
          let type: 'BUILTIN' | 'INSTALLED' = 'BUILTIN';
          let description = raw;

          if (raw.startsWith('---')) {
            const parts = raw.split('---');
            if (parts.length >= 3) {
              const frontmatter = parts[1];
              description = parts.slice(2).join('---').trim();

              const nameMatch = frontmatter.match(/name:\s*(.+)/);
              if (nameMatch) name = nameMatch[1].trim();

              const typeMatch = frontmatter.match(/type:\s*(.+)/);
              if (typeMatch) type = typeMatch[1].trim().toUpperCase() as any;

              const iconMatch = frontmatter.match(/icon:\s*(.+)/);
              if (iconMatch) icon = iconMatch[1].trim();
            }
          }

          list.push({
            id,
            name,
            icon,
            type,
            description,
            filePath,
            markdownContent: raw
          });
        } catch (e) {
          console.error(`Error reading skill file ${file}:`, e);
        }
      }
    }

    if (list.length === 0) {
      return defaultSkills;
    }

    return list;
  }

  public saveSkill(id: string, name: string, description: string, icon: string = '⚡', type: 'BUILTIN' | 'INSTALLED' = 'INSTALLED'): void {
    const filePath = path.join(this.skillsDir, `${id}.md`);
    const content = `---
name: ${name}
type: ${type}
icon: ${icon}
---

${description}
`;
    fs.writeFileSync(filePath, content, 'utf-8');
  }

  public deleteSkill(id: string): void {
    const filePath = path.join(this.skillsDir, `${id}.md`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
