/**
 * Unit tests for GitHub Actions Workflows
 * Validates workflow YAML structure, required fields, and security best practices
 * Uses regex parsing to avoid requiring additional yaml parser dependencies
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const WORKFLOWS_DIR = join(process.cwd(), '.github', 'workflows')

describe('.github/workflows', () => {
  describe('codeql.yml', () => {
    let workflowContent: string

    beforeAll(() => {
      const filePath = join(WORKFLOWS_DIR, 'codeql.yml')
      workflowContent = readFileSync(filePath, 'utf-8')
    })

    it('should exist and be readable', () => {
      expect(workflowContent).toBeDefined()
      expect(workflowContent.length).toBeGreaterThan(0)
    })

    it('should have a descriptive name', () => {
      expect(workflowContent).toMatch(/^name:\s*["']?CodeQL Advanced["']?/m)
    })

    it('should trigger on push to main branch', () => {
      expect(workflowContent).toMatch(/on:/m)
      expect(workflowContent).toMatch(/push:/m)
      expect(workflowContent).toMatch(/branches:[sS]*["']main["']/m)
    })

    it('should trigger on pull requests to main branch', () => {
      expect(workflowContent).toMatch(/pull_request:/m)
      expect(workflowContent).toMatch(/branches:[sS]*["']main["']/m)
    })

    it('should have a scheduled run with valid cron syntax', () => {
      expect(workflowContent).toMatch(/schedule:/m)
      expect(workflowContent).toMatch(/cron:\s*['"](\S+\s+){4}\S+['"]/m)
    })

    it('should define jobs', () => {
      expect(workflowContent).toMatch(/^jobs:/m)
    })

    it('should have analyze job', () => {
      expect(workflowContent).toMatch(/^\s+analyze:/m)
    })

    it('should specify runner for analyze job', () => {
      expect(workflowContent).toMatch(/runs-on:/m)
    })

    it('should have required security permissions', () => {
      expect(workflowContent).toMatch(/permissions:/m)
      expect(workflowContent).toMatch(/security-events:\s*write/m)
      expect(workflowContent).toMatch(/packages:\s*read/m)
      expect(workflowContent).toMatch(/actions:\s*read/m)
      expect(workflowContent).toMatch(/contents:\s*read/m)
    })

    it('should have strategy matrix configuration', () => {
      expect(workflowContent).toMatch(/strategy:/m)
      expect(workflowContent).toMatch(/matrix:/m)
      expect(workflowContent).toMatch(/fail-fast:\s*false/m)
    })

    it('should include required languages in matrix', () => {
      expect(workflowContent).toMatch(/language:\s*actions/m)
      expect(workflowContent).toMatch(/language:\s*javascript-typescript/m)
    })

    it('should specify build mode for languages', () => {
      expect(workflowContent).toMatch(/build-mode:/m)
    })

    it('should checkout repository as a step', () => {
      expect(workflowContent).toMatch(/- name:\s*Checkout repository/m)
      expect(workflowContent).toMatch(/uses:\s*actions\/checkout@v\d+/m)
    })

    it('should initialize CodeQL', () => {
      expect(workflowContent).toMatch(/- name:\s*Initialize CodeQL/m)
      expect(workflowContent).toMatch(/uses:\s*github\/codeql-action\/init@v\d+/m)
    })

    it('should perform CodeQL analysis', () => {
      expect(workflowContent).toMatch(/- name:\s*Perform CodeQL Analysis/m)
      expect(workflowContent).toMatch(/uses:\s*github\/codeql-action\/analyze@v\d+/m)
    })

    it('should use pinned action versions (not @main or @master)', () => {
      const actionMatches = workflowContent.match(/uses:\s*[^\s@]+@([^\s]+)/g)
      expect(actionMatches).toBeTruthy()
      actionMatches?.forEach(match => {
        expect(match).not.toMatch(/@main/)
        expect(match).not.toMatch(/@master/)
        expect(match).toMatch(/@v\d+/)
      })
    })

    it('should have conditional step for manual build mode', () => {
      expect(workflowContent).toMatch(/- name:\s*Run manual build steps/m)
      expect(workflowContent).toMatch(/if:.*manual/m)
    })

    it('should pass language and build mode to CodeQL with matrix variables', () => {
      expect(workflowContent).toMatch(/languages:\s*\$\{\{\s*matrix\.language\s*\}\}/m)
      expect(workflowContent).toMatch(/build-mode:\s*\$\{\{\s*matrix\.build-mode\s*\}\}/m)
    })

    it('should categorize analysis results by language', () => {
      expect(workflowContent).toMatch(/category:.*matrix\.language/m)
    })

    it('should not expose secrets in script blocks', () => {
      const scriptBlocks = workflowContent.match(/run:\s*\|[\s\S]*?(?=\n\s*-|\n\w|\z)/g)
      if (scriptBlocks) {
        scriptBlocks.forEach(block => {
          expect(block.toLowerCase()).not.toMatch(/echo.*\$\{\{.*secrets/i)
        })
      }
    })
  })

  describe('devskim.yml', () => {
    let workflowContent: string

    beforeAll(() => {
      const filePath = join(WORKFLOWS_DIR, 'devskim.yml')
      workflowContent = readFileSync(filePath, 'utf-8')
    })

    it('should exist and be readable', () => {
      expect(workflowContent).toBeDefined()
      expect(workflowContent.length).toBeGreaterThan(0)
    })

    it('should have a descriptive name', () => {
      expect(workflowContent).toMatch(/^name:\s*["']?DevSkim["']?/m)
    })

    it('should trigger on push to main branch', () => {
      expect(workflowContent).toMatch(/on:/m)
      expect(workflowContent).toMatch(/push:/m)
      expect(workflowContent).toMatch(/branches:[sS]*["']main["']/m)
    })

    it('should trigger on pull requests to main branch', () => {
      expect(workflowContent).toMatch(/pull_request:/m)
      expect(workflowContent).toMatch(/branches:[sS]*["']main["']/m)
    })

    it('should have a scheduled run', () => {
      expect(workflowContent).toMatch(/schedule:/m)
      expect(workflowContent).toMatch(/cron:\s*['"](\S+\s+){4}\S+['"]/m)
    })

    it('should define lint job', () => {
      expect(workflowContent).toMatch(/^jobs:/m)
      expect(workflowContent).toMatch(/^\s+lint:/m)
    })

    it('should have descriptive job name', () => {
      expect(workflowContent).toMatch(/lint:[\s\S]*?name:\s*DevSkim/m)
    })

    it('should run on ubuntu-latest', () => {
      expect(workflowContent).toMatch(/runs-on:\s*ubuntu-latest/m)
    })

    it('should have security permissions', () => {
      expect(workflowContent).toMatch(/permissions:/m)
      expect(workflowContent).toMatch(/actions:\s*read/m)
      expect(workflowContent).toMatch(/contents:\s*read/m)
      expect(workflowContent).toMatch(/security-events:\s*write/m)
    })

    it('should checkout code', () => {
      expect(workflowContent).toMatch(/- name:\s*Checkout code/m)
      expect(workflowContent).toMatch(/uses:\s*actions\/checkout@v\d+/m)
    })

    it('should run DevSkim scanner', () => {
      expect(workflowContent).toMatch(/- name:\s*Run DevSkim scanner/m)
      expect(workflowContent).toMatch(/uses:\s*microsoft\/DevSkim-Action@v\d+/m)
    })

    it('should upload results to GitHub Security tab', () => {
      expect(workflowContent).toMatch(/- name:.*Upload.*DevSkim.*results/m)
      expect(workflowContent).toMatch(/uses:\s*github\/codeql-action\/upload-sarif@v\d+/m)
      expect(workflowContent).toMatch(/sarif_file:\s*devskim-results\.sarif/m)
    })

    it('should use pinned action versions', () => {
      const actionMatches = workflowContent.match(/uses:\s*[^\s@]+@([^\s]+)/g)
      expect(actionMatches).toBeTruthy()
      actionMatches?.forEach(match => {
        expect(match).not.toMatch(/@main/)
        expect(match).not.toMatch(/@master/)
        expect(match).toMatch(/@v\d+/)
      })
    })

    it('should not have overly permissive write access to contents', () => {
      expect(workflowContent).not.toMatch(/contents:\s*write/m)
    })
  })

  describe('label.yml', () => {
    let workflowContent: string

    beforeAll(() => {
      const filePath = join(WORKFLOWS_DIR, 'label.yml')
      workflowContent = readFileSync(filePath, 'utf-8')
    })

    it('should exist and be readable', () => {
      expect(workflowContent).toBeDefined()
      expect(workflowContent.length).toBeGreaterThan(0)
    })

    it('should have a descriptive name', () => {
      expect(workflowContent).toMatch(/^name:\s*["']?Labeler["']?/m)
    })

    it('should trigger on pull_request_target for security', () => {
      expect(workflowContent).toMatch(/on:\s*\[?\s*pull_request_target/m)
    })

    it('should define label job', () => {
      expect(workflowContent).toMatch(/^jobs:/m)
      expect(workflowContent).toMatch(/^\s+label:/m)
    })

    it('should run on ubuntu-latest', () => {
      expect(workflowContent).toMatch(/runs-on:\s*ubuntu-latest/m)
    })

    it('should have appropriate permissions', () => {
      expect(workflowContent).toMatch(/permissions:/m)
      expect(workflowContent).toMatch(/contents:\s*read/m)
      expect(workflowContent).toMatch(/pull-requests:\s*write/m)
    })

    it('should use actions/labeler', () => {
      expect(workflowContent).toMatch(/uses:\s*actions\/labeler@v\d+/m)
    })

    it('should provide GitHub token to labeler', () => {
      expect(workflowContent).toMatch(/repo-token:.*secrets\.GITHUB_TOKEN/m)
    })

    it('should use pinned action version', () => {
      const actionMatches = workflowContent.match(/uses:\s*[^\s@]+@([^\s]+)/g)
      expect(actionMatches).toBeTruthy()
      actionMatches?.forEach(match => {
        expect(match).not.toMatch(/@main/)
        expect(match).not.toMatch(/@master/)
        expect(match).toMatch(/@v\d+/)
      })
    })

    it('should not have write access to contents (least privilege)', () => {
      // The labeler only needs read access to contents
      const contentPermission = workflowContent.match(/contents:\s*(\w+)/m)
      if (contentPermission) {
        expect(contentPermission[1]).toBe('read')
      }
    })
  })

  describe('All Workflows - General Security Checks', () => {
    const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

    workflowFiles.forEach(filename => {
      describe(filename, () => {
        let workflowContent: string

        beforeAll(() => {
          const filePath = join(WORKFLOWS_DIR, filename)
          workflowContent = readFileSync(filePath, 'utf-8')
        })

        it('should not use untrusted checkout refs', () => {
          // Should not checkout PR head ref directly without validation
          expect(workflowContent).not.toMatch(/ref:.*github\.event\.pull_request\.head\.sha/m)
          expect(workflowContent).not.toMatch(/ref:.*github\.event\.pull_request\.head\.ref/m)
        })

        it('should use versioned actions (not @main or @master)', () => {
          const actionMatches = workflowContent.match(/uses:\s*[^\s@]+@([^\s]+)/g)
          if (actionMatches) {
            actionMatches.forEach(match => {
              expect(match).not.toMatch(/@main\b/)
              expect(match).not.toMatch(/@master\b/)
            })
          }
        })

        it('should not expose secrets in script blocks', () => {
          const lines = workflowContent.split('\n')
          lines.forEach(line => {
            if (line.includes('run:') || line.includes('echo')) {
              expect(line.toLowerCase()).not.toMatch(/echo.*\$\{\{.*secrets/i)
              expect(line.toLowerCase()).not.toMatch(/echo\s+\$secrets/i)
            }
          })
        })

        it('should have proper job definitions', () => {
          expect(workflowContent).toMatch(/^jobs:/m)
          expect(workflowContent).toMatch(/^\s+\w+:/m)
        })

        it('should have steps in each job', () => {
          expect(workflowContent).toMatch(/steps:/m)
        })

        it('should specify runner for each job', () => {
          expect(workflowContent).toMatch(/runs-on:/m)
        })

        it('should use kebab-case or lowercase for job IDs', () => {
          const jobMatches = workflowContent.match(/^  ([a-z][a-z0-9-]*):/gm)
          expect(jobMatches).toBeTruthy()
          jobMatches?.forEach(match => {
            const jobId = match.replace(/^\s+|:\s*$/g, '')
            expect(jobId).toMatch(/^[a-z][a-z0-9-]*$/)
          })
        })

        it('should have descriptive step names where defined', () => {
          const stepNames = workflowContent.match(/- name:\s*([^\n]+)/g)
          if (stepNames) {
            stepNames.forEach(match => {
              const name = match.replace(/- name:\s*/, '').trim()
              expect(name.length).toBeGreaterThan(4)
            })
          }
        })

        it('should not contain TODO or FIXME comments in production workflow', () => {
          expect(workflowContent.toLowerCase()).not.toMatch(/todo:/i)
          expect(workflowContent.toLowerCase()).not.toMatch(/fixme:/i)
        })
      })
    })
  })

  describe('Workflow File Integrity', () => {
    it('should have all expected workflow files present', () => {
      const expectedFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      expectedFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        expect(existsSync(filePath)).toBe(true)
      })
    })

    it('should not have the deprecated azure-webapps-node.yml', () => {
      const deprecatedFile = join(WORKFLOWS_DIR, 'azure-webapps-node.yml')
      expect(existsSync(deprecatedFile)).toBe(false)
    })

    it('should have non-empty workflow files', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        expect(content.trim().length).toBeGreaterThan(0)
        // Should have basic YAML structure
        expect(content).toMatch(/name:/m)
        expect(content).toMatch(/on:/m)
        expect(content).toMatch(/jobs:/m)
      })
    })

    it('should have valid YAML structure indicators', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // Basic YAML validation - no tabs, proper indentation indicators
        expect(content).not.toMatch(/\t/)
        expect(content).toMatch(/^name:/m)
        expect(content).toMatch(/^on:/m)
        expect(content).toMatch(/^jobs:/m)
      })
    })
  })

  describe('Workflow Naming Conventions', () => {
    it('should use consistent naming patterns across workflows', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // Workflow names should be capitalized and descriptive
        const nameMatch = content.match(/^name:\s*["']?([^"'\n]+)["']?/m)
        if (nameMatch) {
          const name = nameMatch[1].trim()
          expect(name.length).toBeGreaterThan(3)
          // Should start with capital letter
          expect(name[0]).toMatch(/[A-Z]/)
        }
      })
    })
  })

  describe('Action Version Consistency', () => {
    it('should use consistent checkout action version across workflows', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']
      const checkoutVersions = new Set<string>()

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        const matches = content.match(/actions\/checkout@(v\d+)/g)
        if (matches) {
          matches.forEach(match => {
            const version = match.split('@')[1]
            checkoutVersions.add(version)
          })
        }
      })

      // All workflows should use the same checkout version
      expect(checkoutVersions.size).toBeLessThanOrEqual(1)
    })

    it('should use major version tags (v4 not v4.0.0)', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        const actionMatches = content.match(/uses:\s*[^\s@]+@(v\d+\.\d+\.\d+)/g)
        // Should not use full semver, prefer major version only
        expect(actionMatches).toBeFalsy()
      })
    })
  })

  describe('Trigger Configuration', () => {
    it('should have appropriate branch filters for push/PR triggers', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // Should have push trigger with branch filter
        if (content.includes('push:')) {
          expect(content).toMatch(/branches:[sS]*["']main["']/m)
        }

        // Should have PR trigger with branch filter
        if (content.includes('pull_request:')) {
          expect(content).toMatch(/branches:[sS]*["']main["']/m)
        }
      })
    })

    it('should use pull_request_target for untrusted PR context (labeler)', () => {
      const filePath = join(WORKFLOWS_DIR, 'label.yml')
      const content = readFileSync(filePath, 'utf-8')

      // Labeler uses pull_request_target for security
      expect(content).toMatch(/on:\s*\[?\s*pull_request_target/m)
    })

    it('should have schedule with valid cron expressions for security scans', () => {
      const scheduledWorkflows = ['codeql.yml', 'devskim.yml']

      scheduledWorkflows.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        expect(content).toMatch(/schedule:/m)
        expect(content).toMatch(/cron:\s*['"](\S+\s+){4}\S+['"]/m)

        // Validate cron has 5 fields
        const cronMatch = content.match(/cron:\s*['"]([^'"]+)['"]/m)
        if (cronMatch) {
          const cronFields = cronMatch[1].split(/\s+/)
          expect(cronFields.length).toBe(5)
        }
      })
    })
  })

  describe('Security Best Practices', () => {
    it('should not use dynamic action references', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // Should not use variables in action versions
        expect(content).not.toMatch(/uses:.*@\$\{\{/m)
      })
    })

    it('should use specific permissions (not broad write access)', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml', 'label.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // Should define permissions explicitly
        expect(content).toMatch(/permissions:/m)

        // Should not have broad write-all or admin permissions
        expect(content).not.toMatch(/permissions:\s*write-all/m)
      })
    })

    it('should not run on forks without explicit configuration', () => {
      const workflowFiles = ['codeql.yml', 'devskim.yml']

      workflowFiles.forEach(filename => {
        const filePath = join(WORKFLOWS_DIR, filename)
        const content = readFileSync(filePath, 'utf-8')

        // For workflows with push triggers, they should have branch filters
        if (content.includes('push:')) {
          expect(content).toMatch(/branches:/m)
        }
      })
    })
  })
})