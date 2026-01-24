#!/usr/bin/env python3
"""Reformat TODO.md with consistent markdown formatting."""

import re
import sys

def reformat_file(input_path, output_path):
    with open(input_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    output = []
    i = 0
    
    while i < len(lines):
        line = lines[i]
        
        # Skip empty lines at start
        if not line.strip() and not output:
            i += 1
            continue
        
        # Fix task headers (TASK-ID — Title (Priority))
        if re.match(r'^[A-Z]+-[A-Z]+-\d+', line) or re.match(r'^[A-Z]+-\d+', line):
            if line.startswith('##'):
                output.append(line)
            else:
                output.append(f'### {line}')
            i += 1
            continue
        
        # Fix section headers (AS — Agent Sessions)
        if re.match(r'^[A-Z]+ — ', line):
            if not line.startswith('##'):
                output.append(f'## {line}')
            else:
                output.append(line)
            i += 1
            continue
        
        # Fix "Expected Files", "Connected Files", "Checklist", "Acceptance Criteria", "Verification"
        if line.strip() in ['Expected Files', 'Connected Files', 'Checklist', 'Acceptance Criteria', 'Verification', 'Code Snippet', 'Context', 'Dependencies']:
            if not line.startswith('**'):
                output.append(f'**{line.strip()}:**')
            else:
                output.append(line)
            i += 1
            continue
        
        # Fix code blocks - look for code snippets
        if line.strip() == '**Code Snippet:**':
            output.append(line)
            i += 1
            # Look for the code block
            if i < len(lines) and lines[i].strip() == '':
                i += 1
            if i < len(lines) and lines[i].strip().startswith('```'):
                output.append(lines[i])
                i += 1
                # Collect code until closing ```
                while i < len(lines) and not lines[i].strip().startswith('```'):
                    # Fix template strings
                    code_line = lines[i]
                    # Fix template strings like ${var} to `...${var}...`
                    if '${' in code_line and not code_line.strip().startswith('`'):
                        # Check if it's already in a template literal
                        if not (code_line.rstrip().endswith('`') or code_line.rstrip().endswith('`;')):
                            # Find template strings and wrap them
                            code_line = re.sub(r'(["\'])([^"\']*)\$\{([^}]+)\}([^"\']*)\1', r'\1\2`${}\3`\4\1', code_line)
                            # Fix common patterns
                            code_line = re.sub(r'([^`])\$\{([^}]+)\}([^`])', r'\1`${}\2`\3', code_line)
                    output.append(code_line)
                    i += 1
                if i < len(lines):
                    output.append(lines[i])
                    i += 1
            continue
        
        # Fix bullet points - convert • to -
        if line.strip().startswith('•'):
            line = line.replace('•', '-', 1)
            # Ensure proper spacing
            if not line.startswith('- '):
                line = line.replace('-', '- ', 1)
            output.append(line)
            i += 1
            continue
        
        # Fix code blocks that aren't properly closed
        if '```' in line and line.count('```') == 1:
            output.append(line)
            i += 1
            # Collect until we find closing ```
            while i < len(lines) and '```' not in lines[i]:
                code_line = lines[i]
                # Fix indentation in code
                if code_line.strip() and not code_line.startswith('  ') and not code_line.startswith('\t'):
                    # Don't fix if it's already indented or is a comment
                    if not code_line.strip().startswith('//') and not code_line.strip().startswith('#'):
                        # Only fix if it looks like code (has common patterns)
                        if any(x in code_line for x in ['export', 'function', 'const', 'let', 'var', 'return', 'if', 'for', 'while', 'await', 'async']):
                            code_line = '  ' + code_line
                output.append(code_line)
                i += 1
            if i < len(lines):
                output.append(lines[i])
                i += 1
            continue
        
        # Fix template strings in code (outside code blocks - shouldn't happen but just in case)
        if '${' in line and '`' not in line:
            # This is likely a mistake, but we'll leave it
            pass
        
        # Default: just add the line
        output.append(line)
        i += 1
    
    # Post-process: fix common issues
    result = '\n'.join(output)
    
    # Fix template strings in code blocks
    result = re.sub(r'([^`])\$\{([^}]+)\}([^`])', r'\1`${}\2`\3', result)
    
    # Fix missing closing code fences
    code_blocks = re.finditer(r'```typescript\n(.*?)(?=\n```|\Z)', result, re.DOTALL)
    for match in list(code_blocks):
        code_content = match.group(1)
        # Fix template strings in code
        fixed_code = re.sub(r'([^`"\'])\$\{([^}]+)\}([^`"\'])', r'\1`${}\2`\3', code_content)
        if fixed_code != code_content:
            result = result.replace(match.group(0), f'```typescript\n{fixed_code}')
    
    # Ensure proper spacing around sections
    result = re.sub(r'\n{3,}', '\n\n', result)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(result)

if __name__ == '__main__':
    reformat_file('TODO.md', 'TODO.md.formatted')
